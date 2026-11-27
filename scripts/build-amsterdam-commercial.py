"""Build the Amsterdam commercial coverage and its adjacency graph in Dutch RD."""

import argparse
import json
from importlib import import_module
from itertools import combinations
from pathlib import Path

from pyproj import Transformer
from shapely import coverage_union_all, from_wkt, get_parts, polygonize, set_precision, transform, union_all
from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.ops import polylabel
from shapely.strtree import STRtree

historical = import_module("build-amsterdam-historic")
GRID = 0.1
DATASET = "amsterdam-commercial-v1"
RD = "urn:ogc:def:crs:EPSG::28992"
CITIES = {
    "GM0305": "Abcoude", "GM0362": "Amstelveen", "GM0384": "Diemen",
    "GM0393": "Spaarnwoude", "GM0394": "Haarlemmermeer", "GM0415": "Landsmeer",
    "GM0424": "Muiden", "GM0431": "Oostzaan", "GM0437": "Ouder-Amstel",
    "GM0457": "Weesp", "GM0479": "Zaanstad", "GM0852": "Waterland",
}
LOCALITIES = {"GM0394": ["Badhoevedorp", "Zwanenburg"], "GM0437": ["Duivendrecht"]}
PROJECT = Transformer.from_crs(28992, 4326, always_xy=True).transform


def read_rd(path):
    collection = json.loads(path.read_text(encoding="utf-8"))
    if collection["crs"]["properties"]["name"] != RD:
        raise ValueError("Expected EPSG:28992")
    return collection["features"]


def polygon_faces(sources, extent):
    lines = union_all([extent.boundary, *(geometry.boundary for geometry in sources)], grid_size=GRID)
    faces = list(get_parts(polygonize(get_parts(lines))))
    return [face for face in faces if extent.covers(face.representative_point())]


def partition(sources, extent):
    faces = polygon_faces(sources, extent)
    tree = STRtree(sources)
    owners = {}
    missing = []
    for index, face in enumerate(faces):
        candidates = tree.query(face.representative_point(), predicate="within")
        if len(candidates):
            owners[index] = int(min(candidates))
        else:
            missing.append(index)

    face_tree = STRtree(faces)
    while missing:
        deferred = []
        for index in missing:
            lengths = {}
            face = faces[index]
            for other in face_tree.query(face, predicate="intersects"):
                if other in owners:
                    length = face.boundary.intersection(faces[other].boundary).length
                    owner = owners[other]
                    lengths[owner] = lengths.get(owner, 0) + length
            best = max(lengths, key=lambda owner: (lengths[owner], -owner), default=None)
            if best is None or lengths[best] == 0:
                deferred.append(index)
            else:
                owners[index] = best
        if len(deferred) == len(missing):
            raise ValueError("An enclosed gap has no shared edge with any territory")
        missing = deferred

    grouped = [[] for _ in sources]
    for face_index, owner in owners.items():
        grouped[owner].append(faces[face_index])
    return [coverage_union_all(group) for group in grouped]


def geojson(geometry):
    return mapping(transform(geometry, PROJECT, interleaved=False))


def build(archive, municipalities, water):
    rows = sorted(historical.read_snapshot(archive), key=lambda row: row["identificatie"])
    if len(rows) != 15 or {row["naam"] for row in rows} != historical.EXPECTED:
        raise ValueError("Expected exactly the fifteen historical boroughs")
    by_city = {}
    for feature in municipalities:
        properties = feature["properties"]
        code = properties["statcode"]
        if properties["jrstatcode"] != "2009" + code:
            raise ValueError("Expected 2009 municipal data")
        by_city[code] = shape(feature["geometry"])
    ids = [*("AMS2009-" + row["identificatie"] for row in rows), *CITIES]
    names = [*(row["naam"].replace("/", "-") for row in rows), *CITIES.values()]
    originals = [*(from_wkt(row["geometrie"]) for row in rows), *(by_city[code] for code in CITIES)]
    sources = [set_precision(geometry, GRID) for geometry in originals]
    footprint = union_all([*sources, set_precision(by_city["GM0363"], GRID)], grid_size=GRID)
    # The selected municipalities define the exterior. Fill enclosed holes, including water
    # (drawn on a separate layer), so every location inside has exactly one territory.
    extent = union_all([Polygon(part.exterior) for part in get_parts(footprint)], grid_size=GRID)
    polygons = partition(sources, extent)
    if any(geometry.is_empty or not geometry.is_valid for geometry in polygons):
        raise ValueError("Each commercial territory must be nonempty and valid")
    coverage = union_all(polygons, grid_size=GRID)
    if coverage.symmetric_difference(extent, grid_size=GRID).area > 0:
        raise ValueError("Commercial coverage does not match its declared extent")

    neighbors = {code: [] for code in ids}
    shared = []
    for (a, first), (b, second) in combinations(zip(ids, polygons), 2):
        if first.intersection(second).area > 0:
            raise ValueError(f"Double attribution: {a} / {b}")
        edge = first.boundary.intersection(second.boundary)
        if edge.length > 0:
            neighbors[a].append(b)
            neighbors[b].append(a)
            shared.append([a, b, round(edge.length, 3)])

    features = []
    for code, name, polygon in zip(ids, names, polygons, strict=True):
        main = max(get_parts(polygon), key=lambda part: part.area)
        point = polylabel(main, tolerance=2)
        longitude, latitude = PROJECT(point.x, point.y)
        edge_longitude, _ = PROJECT(point.x + point.distance(main.boundary), point.y)
        features.append({"type": "Feature", "id": code, "geometry": geojson(polygon),
                         "properties": {"buurtnaam": name, "localities": LOCALITIES.get(code, []),
                                        "label": [latitude, longitude],
                                        "clearance": edge_longitude - longitude}})
    water_shapes = [shape(feature["geometry"]) for feature in water]
    water_geometry = union_all(water_shapes, grid_size=GRID).intersection(extent, grid_size=GRID)
    water_display = MultiPolygon([part for part in get_parts(water_geometry)
                                  if part.geom_type == "Polygon"]).simplify(2, preserve_topology=True)
    if water_display.is_empty or not water_display.is_valid:
        raise ValueError("Invalid water display geometry")
    stats = {"territories": len(ids), "sharedBoundaries": len(shared),
             "extentSquareMetres": round(extent.area, 2), "waterSquareMetres": round(water_geometry.area, 2),
             "maxBoroughChangeSquareMetres": round(max(a.symmetric_difference(b).area
                                                       for a, b in zip(originals[:15], polygons[:15])), 2)}
    return {
        ".geojson": {"type": "FeatureCollection", "features": features},
        "-water.geojson": {"type": "Feature", "geometry": geojson(water_display), "properties": {}},
        "-neighbors.json": {"neighbors": neighbors, "sharedBoundaryMetres": shared},
    }, stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for field in ("archive", "municipalities", "water"):
        parser.add_argument(field, type=Path)
    args = parser.parse_args()
    data, stats = build(args.archive, read_rd(args.municipalities), read_rd(args.water))
    for suffix, obj in data.items():
        (historical.OUTPUT / (DATASET + suffix)).write_text(
            json.dumps(obj, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(stats, indent=2))
