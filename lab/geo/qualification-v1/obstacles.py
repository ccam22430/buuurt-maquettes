"""Cross-check measured water crossings against official Kadaster BGT features."""
import json
from datetime import datetime, timezone
from pathlib import Path
from sys import argv
from urllib.parse import urlencode, urlsplit
from urllib.request import urlopen

from osgeo import ogr, osr

BASE = "https://api.pdok.nl/kadaster/bgt/ogc/v1/collections/"
RD, LL = osr.SpatialReference(), osr.SpatialReference()
RD.ImportFromEPSG(28992)
LL.ImportFromEPSG(4326)
LL.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
PROJECT = osr.CoordinateTransformation(LL, RD)


def line(points):
    geometry = ogr.Geometry(ogr.wkbLineString)
    for point in points:
        geometry.AddPoint_2D(*point[:2])
    geometry.Transform(PROJECT)
    return geometry


def features(layer, bbox):
    url = BASE + layer + "/items?" + urlencode({"bbox": ",".join(map(str, bbox)), "limit": 100, "f": "json"})
    first, seen, records = url, set(), []
    while url:
        assert urlsplit(url).netloc == "api.pdok.nl" and url not in seen and len(seen) < 12
        seen.add(url)
        with urlopen(url, timeout=20) as response:
            data = json.load(response)
        records.extend(feature for feature in data["features"]
                       if (feature["properties"]["status"] == "bestaand"
                           and not feature["properties"]["eind_registratie"]
                           and not feature["properties"]["termination_date"]))
        url = next((link["href"] for link in data["links"] if link["rel"] == "next"), None)
    return first, len(seen), records


def intersections(path, records):
    hits = []
    for feature in records:
        geometry = ogr.CreateGeometryFromJson(json.dumps(feature["geometry"]))
        geometry.Transform(PROJECT)
        if geometry.IsValid() and geometry.Intersects(path):
            length = geometry.Intersection(path).Length()
            if length > 0.25:
                hits.append({"id": feature["id"], "bgt_id": feature["properties"]["lokaal_id"],
                             "m": round(length, 2)})
    return sorted(hits, key=lambda row: row["id"])


def audit(section, label):
    start = next(point for point in section["targets"] if point["label"] == label)
    finish = section["origin"]
    direct = [(point["lon"], point["lat"]) for point in (start, finish)]
    paths = {mode: route for mode, route in start["routes"].items() if route["status"] == "measured"}
    points = direct + [point for route in paths.values() for point in route["geometry"]]
    xs, ys = zip(*points)
    bbox = [min(xs) - 0.001, min(ys) - 0.001, max(xs) + 0.001, max(ys) + 0.001]
    water_url, water_pages, water = features("waterdeel", bbox)
    bridge_url, bridge_pages, bridges = features("overbruggingsdeel", bbox)
    result = {"target": label, "water_source": water_url, "water_pages": water_pages,
              "bridge_source": bridge_url, "bridge_pages": bridge_pages,
              "straight_water": intersections(line(direct), water), "paths": {}}
    for mode, route in paths.items():
        result["paths"][mode] = {
            "water": intersections(line(route["geometry"]), water),
            "bridge": intersections(line(route["geometry"]), bridges),
            "osm_bridge": any(str(value).lower() == "bridge" for _, _, value in route["details"]["road_environment"])
        }
    return result


if __name__ == "__main__":
    osr.UseExceptions()
    routes = json.loads(Path(argv[1]).read_text())["contexts"]
    result = {context: audit(routes[context], label) for context, label in
              (("urbain", "Erasmusgracht"), ("rural", "Bibliotheek De Rijp"))}
    for record in result.values():
        assert record["straight_water"], record
        assert len(record["paths"]) == 2
        assert all(row["osm_bridge"] and row["bridge"] for row in record["paths"].values())
    snapshot = {"checked_at": datetime.now(timezone.utc).isoformat(), "license": "CC0 1.0", "cases": result}
    Path(argv[2]).write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")
