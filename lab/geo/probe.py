"""Qualify the two GEO-V1 field cases (python3 with GDAL/GEOS bindings)."""
import hashlib
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import urlopen

from osgeo import ogr

PDOK = "https://api.pdok.nl"
MUNICIPAL = "https://api.data.amsterdam.nl/v1/wfs/gebieden/"
RD = "http://www.opengis.net/def/crs/EPSG/0/28992"
CRS84 = "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
BAG = f"{PDOK}/bzk/locatieserver/search/v3_1/free"
CASES = {
    "amsterdam": ("Jan Evertsenstraat 55-H, 1057BN Amsterdam", "4.83,52.35,4.89,52.39"),
    "graft": ("Raadhuisstraat 24, 1484EN Graft", "4.73,52.49,4.94,52.64"),
}


def url(base, **parameters):
    return base + "?" + urlencode(parameters)


def fetch(target, expected_crs=None):
    with urlopen(target, timeout=24) as response:
        if expected_crs:
            assert response.headers.get("Content-Crs") == f"<{expected_crs}>", target
        return json.load(response)


def pages(target, code, expected_crs=None):
    seen, features = set(), {}
    first = urlsplit(target)
    while target:
        current = urlsplit(target)
        assert (current.scheme, current.netloc, current.path) == (
            first.scheme, first.netloc, first.path
        ), target
        assert target not in seen and len(seen) < 30, "Incomplete pagination"
        seen.add(target)
        response = fetch(target, expected_crs)
        assert response["numberReturned"] == len(response["features"]), target
        for feature in response["features"]:
            key = feature["properties"][code]
            assert key and key not in features, key
            features[key] = feature
        next_page = next((link["href"] for link in response["links"] if link["rel"] == "next"), None)
        target = urljoin(target, next_page) if next_page else None
    assert features
    return features, len(seen)


def verify_geometry(feature):
    shape = ogr.CreateGeometryFromJson(json.dumps(feature["geometry"]))
    assert shape and shape.GetGeometryName() in ("POLYGON", "MULTIPOLYGON")
    assert not shape.IsEmpty() and shape.IsValid(), feature["id"]
    return shape


def get_address(address):
    endpoint = url(BAG, q=address, fq="type:adres", rows=5)
    matches = [
        row for row in fetch(endpoint)["response"]["docs"]
        if row["type"] == "adres" and row["weergavenaam"].casefold() == address.casefold()
    ]
    assert len(matches) == 1, (address, matches)
    record = matches[0]
    fields = ("weergavenaam", "nummeraanduiding_id", "centroide_rd", "centroide_ll")
    assert re.fullmatch(r"\d{16}", record["nummeraanduiding_id"])
    return {field: record[field] for field in fields}


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
    return hashlib.sha256(path.read_bytes()).hexdigest()


def qualify(out, case, year, level, profile):
    _, bbox = CASES[case]
    kind = "bu" if level == "buurten" else "wk"
    stem = "buurt" if kind == "bu" else "wijk"
    code, name = (stem + "code", stem + "naam") if year == 2025 else (kind + "_code", kind + "_naam")
    endpoint = f"{PDOK}/cbs/wijken-en-buurten-{year}/ogc/v1/collections/{level}/items"
    rd_url = url(endpoint, bbox=bbox, limit=100, crs=RD, f="json")
    rd, count_pages = pages(rd_url, code, RD)
    ll_url = url(endpoint, bbox=bbox, limit=100, f="json")
    ll, ll_pages = pages(ll_url, code, CRS84)
    assert rd.keys() == ll.keys(), (case, year, level, len(rd), len(ll))

    point = ogr.CreateGeometryFromWkt(profile["centroide_rd"])
    geoms = {key: verify_geometry(feature) for key, feature in rd.items()}
    home = [key for key, geometry in geoms.items() if geometry.Contains(point)]
    assert len(home) == 1, home
    home = home[0]
    home_envelope = geoms[home].GetEnvelope()
    boundaries = {key: geom.Boundary() for key, geom in geoms.items()}
    neighbors = []
    point_only = []
    for key, boundary in boundaries.items():
        if key == home or not geoms[home].Intersects(geoms[key]):
            continue
        shared = boundaries[home].Intersection(boundary)
        length = sum(part.Length() for part in shared if part.GetDimension() == 1) if shared.GetGeometryName() == "GEOMETRYCOLLECTION" else (shared.Length() if shared.GetDimension() == 1 else 0)
        if length > 0:
            neighbors.append([key, rd[key]["properties"][name], round(length, 3)])
        elif not shared.IsEmpty():
            point_only.append(key)
    # Ensure the initial window entirely encloses the home polygon, so every
    # polygon touching it is among the fully paginated bbox candidates.
    geographic_home = verify_geometry(ll[home]).GetEnvelope()
    west, south, east, north = map(float, bbox.split(","))
    assert west < geographic_home[0] <= geographic_home[1] < east
    assert south < geographic_home[2] <= geographic_home[3] < north
    assert neighbors
    result = dict(case=case, year=year, level=level, url=ll_url, metric_url=rd_url,
                  pages=ll_pages, metric_pages=count_pages, count=len(ll), home=[home, rd[home]["properties"][name]],
                  neighbors=sorted(neighbors), point_only=sorted(point_only))
    if year == 2025 and level == "buurten":
        keep = (code, name, "wijkcode", "gemeentecode", "jaar")
        collection = []
        for key, feature in sorted(ll.items()):
            assert re.fullmatch(r"BU[A-Z0-9]{8}", key), key
            assert feature["properties"][name] and str(feature["properties"]["jaar"]) == str(year)
            verify_geometry(feature)
            collection.append(dict(type="Feature", id=key, properties={
                field: feature["properties"][field] for field in keep
            }, geometry=feature["geometry"]))
        result["geojson_sha256"] = write_json(out / f"{case}-2025.geojson", dict(type="FeatureCollection", features=collection))
        # Keep the official RD API (not a round-trip projection) for browser replay.
        write_json(out / f"{case}-rd.json", list(rd.values()))
        result["metric_envelope"] = home_envelope
    return result


def municipal(out):
    bbox = CASES["amsterdam"][1]
    endpoint = url(MUNICIPAL, service="WFS", version="2.0.0", request="GetFeature",
                   typeNames="app:buurten", outputFormat="geojson",
                   srsName="urn:ogc:def:crs:OGC::CRS84",
                   bbox=bbox + ",urn:ogc:def:crs:OGC::CRS84", count=100)
    records, count_pages = pages(endpoint, "identificatie")
    fields = ("identificatie", "naam", "code", "cbs_code", "begin_geldigheid", "eind_geldigheid")
    active = []
    for record in records.values():
        properties = record["properties"]
        verify_geometry(record)
        active.append(dict(type="Feature", id=properties["identificatie"], geometry=record["geometry"],
                           properties={field: properties[field] for field in fields}))
    destination = out / "amsterdam-municipal.geojson"
    sha = write_json(destination, dict(type="FeatureCollection", features=active))
    return dict(url=endpoint, count=len(active), pages=count_pages, sha256=sha)


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        local = pool.submit(municipal, out)
        addresses = {case: pool.submit(get_address, definition[0]) for case, definition in CASES.items()}
        profiles = {case: future.result() for case, future in addresses.items()}
        tasks = [
            pool.submit(qualify, out, case, year, level, profile)
            for case, profile in profiles.items()
            for year, level in ((2025, "buurten"), (2026, "buurten"), (2025, "wijken"))
        ]
        reference = [task.result() for task in tasks]
        city = local.result()
    write_json(out / "qualification.json", dict(at=datetime.now(timezone.utc).isoformat(),
               addresses=profiles, cbs=reference, municipality=city))


if __name__ == "__main__":
    main()
