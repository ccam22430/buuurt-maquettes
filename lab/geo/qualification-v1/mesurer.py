"""Measure published places against a local GraphHopper graph and official CBS shapes."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import ProxyHandler, build_opener

from osgeo import ogr

MODES = ("foot", "bike")
HERE = Path(__file__).resolve().parent
PROVIDER = "https://download.geofabrik.de/europe/netherlands/noord-holland.html"
CBS_TOURISM = "https://api.pdok.nl/cbs/wijken-en-buurten-2025/ogc/v1/collections/buurten/items?bbox=4.798,52.465,4.838,52.482&limit=100&f=json"
LOCAL = build_opener(ProxyHandler({}))


def distance(a, b):
    lng_a, lat_a = map(radians, a)
    lng_b, lat_b = map(radians, b)
    h = sin((lat_a - lat_b) / 2) ** 2 + cos(lat_a) * cos(lat_b) * sin((lng_a - lng_b) / 2) ** 2
    return 2 * 6371008.8 * asin(sqrt(min(1, h)))


def coords(place):
    return place["lon"], place["lat"]


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def polygons(path):
    data = json.loads(path.read_text())
    if any(link["rel"] == "next" for link in data.get("links", [])):
        raise ValueError("Pagination CBS incomplète")
    return [
        (f["properties"]["buurtcode"], f["properties"]["buurtnaam"],
         ogr.CreateGeometryFromJson(json.dumps(f["geometry"])))
        for f in data["features"]
    ]


def territory(place, shapes):
    point = ogr.Geometry(ogr.wkbPoint)
    point.AddPoint_2D(*coords(place))
    hits = [(code, name) for code, name, shape in shapes if shape.Contains(point)]
    if len(hits) != 1:
        raise ValueError(f"Attribution CBS non univoque : {place['label']}")
    return dict(place, code=hits[0][0], territory=hits[0][1])


def get_json(path):
    with LOCAL.open("http://127.0.0.1:8989" + path, timeout=20) as response:
        return json.load(response)


def measure(start, end, mode):
    line_m = distance(coords(start), coords(end))
    road_access = f"{mode}_road_access"
    query = [("profile", mode), ("points_encoded", "false"), ("instructions", "false"),
             ("details", "road_environment"), ("details", road_access)]
    for place in (start, end):
        query.append(("point", f"{place['lat']},{place['lon']}"))
    try:
        path = get_json("/route?" + urlencode(query))["paths"][0]
        geometry = path["points"]["coordinates"]
        snaps = path["snapped_waypoints"]["coordinates"]
        snap_m = [round(distance(coords(location), point), 2)
                  for location, point in zip((start, end), snaps, strict=True)]
        if len(geometry) < 2 or max(snap_m) > 60:
            raise ValueError("Accrochage au réseau supérieur à 60 m ou géométrie vide")
        if path["distance"] <= 0 or path["time"] <= 0 or path["distance"] + sum(snap_m) + 2 < line_m:
            raise ValueError("Longueur ou durée incohérente")
        if any(str(value).casefold() in {"private", "no"} for _, _, value in path["details"][road_access]):
            raise ValueError("Segment privé ou interdit dans le trajet")
        return {"status": "measured", "direct_m": round(line_m, 2), "route_m": round(path["distance"], 2),
                "seconds": round(path["time"] / 1000, 2), "snap_m": snap_m,
                "details": path["details"], "geometry": geometry}
    except (URLError, ValueError, KeyError, IndexError) as error:
        # Keep the other direction/mode and locations usable when one route is unavailable.
        if isinstance(error, HTTPError):
            error = f"HTTP {error.code}: {json.load(error).get('message', '')}"
        return {"status": "unavailable", "direct_m": round(line_m, 2), "reason": str(error)}


def main():
    p = argparse.ArgumentParser()
    for argument in ("osm", "jar", "tourism", "output"):
        p.add_argument(argument, type=Path)
    args = p.parse_args()
    cfg = HERE / "graphhopper.yml"
    ref = HERE.parent / "reference"
    data = {"urbain": ref / "amsterdam-2025.geojson", "rural": ref / "graft-2025.geojson",
            "touristique": args.tourism}
    # The two archived extracts are inside this ZIP in the branch.
    import tempfile
    import zipfile
    info = get_json("/info")
    assert {p["name"] for p in info["profiles"]} == set(MODES), info
    info.pop("bbox", None)
    payload = {"measured_at": datetime.now(timezone.utc).isoformat(),
               "source": {"network": PROVIDER, "license": "ODbL 1.0", "copyright": "© OpenStreetMap contributors",
                          "osm_sha256": sha256(args.osm), "engine_sha256": sha256(args.jar),
                          "engine_config_sha256": sha256(cfg), "engine": info,
                          "tourism_cbs_source": CBS_TOURISM, "tourism_cbs_sha256": sha256(args.tourism)},
               "contexts": {}}
    with tempfile.TemporaryDirectory() as folder, zipfile.ZipFile(ref / "contours-officiels.zip") as archive:
        for context, places in json.loads((HERE / "lieux.json").read_text()).items():
            src = data[context]
            if context != "touristique":
                src = Path(archive.extract(src.name, folder))
            boundaries = polygons(src)
            origin = territory(places["origin"], boundaries)
            targets = []
            for place in places["targets"]:
                place = territory(place, boundaries)
                targets.append(dict(place, routes={mode: measure(place, origin, mode) for mode in MODES}))
            payload["contexts"][context] = {"origin": origin, "targets": targets}
    args.output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
