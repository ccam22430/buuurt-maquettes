"""Export same-date official Amsterdam gebieden and wijken from the municipal ZIP."""
import csv
import io
import json
import sys
from itertools import combinations
from pathlib import Path
from zipfile import ZipFile

from pyproj import Transformer
from shapely import from_wkt, get_parts, transform, union_all
from shapely.geometry import Point, mapping
from shapely.ops import polylabel

DATE = "2026-01-01"
ROOT = Path(__file__).resolve().parents[1] / "revue" / "data"
PROJECT = Transformer.from_crs(28992, 4326, always_xy=True).transform


def rows(archive, kind):
    with archive.open(f"CSV_ActueelEnHistorie/GBD_{kind}_ActueelEnHistorie.csv") as handle:
        records = csv.DictReader(io.TextIOWrapper(handle, encoding="utf-8-sig"), delimiter=";")
        return sorted((r for r in records if r["beginGeldigheid"] <= DATE
                       and (not r["eindGeldigheid"] or DATE < r["eindGeldigheid"])),
                      key=lambda r: r["identificatie"])


def export(records, areas=None):
    by_id = {r["identificatie"]: from_wkt(r["geometrie"]) for r in records}
    if len(by_id) != len(records) or not all(p.is_valid and not p.is_empty for p in by_id.values()):
        raise ValueError("Duplicate ID or invalid official geometry")
    neighbors = {code: [] for code in by_id}
    overlaps = []
    for (a, first), (b, second) in combinations(by_id.items(), 2):
        if first.boundary.intersection(second.boundary).length > 0:
            neighbors[a].append(b)
            neighbors[b].append(a)
        area = first.intersection(second).area
        if area > 0.01:
            overlaps.append([a, b, round(area, 3)])
    features = []
    for row in records:
        code = row["identificatie"]
        polygon = by_id[code]
        point = polylabel(max(get_parts(polygon), key=lambda part: part.area), tolerance=2)
        x, y = PROJECT(point.x, point.y)
        props = {"buurtnaam": row["naam"], "label": [y, x], "code": row["code"]}
        if areas is not None:
            parent = row["ligtIn:GBD.GGW.identificatie"]
            if parent and parent not in areas:
                raise ValueError(f"Missing official parent for {code}")
            props["parent"] = parent or None
        features.append({"type": "Feature", "id": code, "properties": props,
                         "geometry": mapping(transform(polygon, PROJECT, interleaved=False))})
    return {"type": "FeatureCollection", "features": features, "neighbors": neighbors,
            "snapshot": DATE}, by_id, overlaps


def write(name, data):
    (ROOT / f"amsterdam-levels-{name}.geojson").write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


if __name__ == "__main__":
    csv.field_size_limit(2_000_000)
    with ZipFile(sys.argv[1]) as archive:
        area_rows, wijk_rows = rows(archive, "ggw_gebied"), rows(archive, "wijk")
    if (len(area_rows), len(wijk_rows)) != (25, 110):
        raise ValueError("Unexpected Amsterdam level counts")
    areas, area_geometry, area_overlaps = export(area_rows)
    wijken, wijk_geometry, wijk_overlaps = export(wijk_rows, area_geometry)
    parent_deltas = {}
    for area in areas["features"]:
        members = [wijk_geometry[w["id"]] for w in wijken["features"] if w["properties"]["parent"] == area["id"]]
        if not members:
            raise ValueError("Official area without any wijken")
        parent_deltas[area["properties"]["buurtnaam"]] = round(
            area_geometry[area["id"]].symmetric_difference(union_all(members)).area, 2)
    print("Area / union of officially assigned wijken (m²):", parent_deltas)
    print("Original overlaps (m²):", area_overlaps, wijk_overlaps)
    labels = {w["properties"]["buurtnaam"]: w["id"] for w in wijken["features"]}
    first = wijk_geometry[labels["Helmersbuurt"]]
    second = wijk_geometry[labels["Overtoomse Sluis"]]
    edge = max(get_parts(first.boundary.intersection(second.boundary)), key=lambda part: part.length)
    midpoint = edge.interpolate(.5, normalized=True)
    candidates = [Point(midpoint.x + dx, midpoint.y + dy) for dx, dy in [(20, 0), (-20, 0), (0, 20), (0, -20)]]
    fixture = next(p for p in candidates if first.contains(p) and second.distance(p) <= 25)
    x, y = PROJECT(fixture.x, fixture.y)
    wijken["borderFixture"] = [y, x]
    print("Fictional Helmersbuurt fixture:", wijken["borderFixture"], "metres to Overtoomse Sluis:", second.distance(fixture))
    write("areas", areas)
    write("wijken", wijken)
