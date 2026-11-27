"""Export the municipal Amsterdam snapshot (Shapely 2.2.0, pyproj 3.7.2)."""

import csv
import hashlib
import io
import itertools
import json
import sys
from pathlib import Path
from zipfile import ZipFile

from pyproj import Transformer
from shapely import from_wkt
from shapely.geometry import Point, mapping
from shapely.ops import polylabel, transform

DATE = "2009-01-01"
EXPECTED = {
    "Oud-West", "De Baarsjes", "Bos en Lommer", "Westerpark", "Centrum",
    "Oud-Zuid", "Noord", "Zeeburg", "Oost-Watergraafsmeer", "Zuideramstel",
    "Slotervaart", "Osdorp", "Geuzenveld/Slotermeer", "Zuidoost", "Westpoort",
}
CATALOGUE = "https://data.overheid.nl/dataset/5l2csm77flzgya"
ARCHIVE = "https://benk.data.amsterdam.nl/public/gebieden/Gebieden_CSV_ActueelEnHistorie.zip"
OUTPUT = Path(__file__).resolve().parents[1] / "revue" / "data"
FILENAME = "amsterdam-stadsdelen-2009"


def read_snapshot(archive):
    csv.field_size_limit(2_000_000)
    with ZipFile(archive) as source:
        member, = [name for name in source.namelist()
                   if name.endswith("/GBD_stadsdeel_ActueelEnHistorie.csv")]
        with io.TextIOWrapper(source.open(member), encoding="utf-8-sig") as data:
            return [row for row in csv.DictReader(data, delimiter=";")
                    if row["ligtIn:BRK.GME.naam"] == "Amsterdam"
                    and row["beginGeldigheid"] <= DATE
                    and (not row["eindGeldigheid"] or DATE < row["eindGeldigheid"])]


def write_json(suffix, data):
    (OUTPUT / (FILENAME + suffix)).write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )


def build(archive):
    rows = sorted(read_snapshot(archive), key=lambda row: row["identificatie"])
    if len(rows) != 15 or {row["naam"] for row in rows} != EXPECTED:
        raise ValueError("The municipal snapshot does not match the 15 required territories")

    # Namespace the municipal identifiers so they cannot be mistaken for current CBS codes.
    by_id = {"AMS2009-" + row["identificatie"]: row for row in rows}
    polygons = {code: from_wkt(row["geometrie"]) for code, row in by_id.items()}
    if len(polygons) != 15 or any(
        polygon.geom_type not in {"Polygon", "MultiPolygon"} or polygon.is_empty or not polygon.is_valid
        for polygon in polygons.values()
    ):
        raise ValueError("The snapshot contains duplicate IDs or invalid geometry")
    home, = [code for code, polygon in polygons.items() if polygon.contains(Point(119322, 486359))]
    if by_id[home]["naam"] != "Oud-West":
        raise ValueError("Dolores BAG point does not fall in Oud-West")

    neighbors = {code: [] for code in polygons}
    lengths = []
    overlaps = []
    for (a, first), (b, second) in itertools.combinations(polygons.items(), 2):
        common = first.boundary.intersection(second.boundary).length
        area = first.intersection(second).area
        if common > 0:
            neighbors[a].append(b)
            neighbors[b].append(a)
            lengths.append([a, b, round(common, 6)])
        if area > 0:
            overlaps.append([a, b, round(area, 6)])
    if {by_id[code]["naam"] for code in neighbors[home]} != {
        "De Baarsjes", "Westerpark", "Centrum", "Oud-Zuid"
    }:
        raise ValueError("Unexpected direct neighbours for Dolores")

    to_wgs84 = Transformer.from_crs(28992, 4326, always_xy=True).transform
    features = []
    for code, polygon in polygons.items():
        row = by_id[code]
        geometry = transform(to_wgs84, polygon)
        if not geometry.is_valid:
            raise ValueError(f"Invalid projected geometry for {code}")
        main = max(geometry.geoms, key=lambda part: part.area) if geometry.geom_type == "MultiPolygon" else geometry
        label = polylabel(main, tolerance=0.000005)
        features.append({
            "type": "Feature",
            "id": code,
            "properties": {
                "buurtnaam": row["naam"].replace("/", "-"),
                "officialName": row["naam"],
                "municipalCode": row["code"],
                "validFrom": row["beginGeldigheid"],
                "validUntil": row["eindGeldigheid"],
                "documentDate": row["documentdatum"],
                "label": [label.y, label.x],
                "clearance": label.distance(main.boundary),
            },
            "geometry": mapping(geometry),
        })

    write_json(".geojson", {
        "type": "FeatureCollection", "features": features,
        "provenance": {"date": DATE, "source": ARCHIVE, "catalogue": CATALOGUE,
                       "license": "CC0-1.0", "archiveSha256": hashlib.sha256(archive.read_bytes()).hexdigest()},
    })
    write_json("-neighbors.json", {
        "neighbors": neighbors, "sharedBoundaryMetres": lengths, "overlapSquareMetres": overlaps
    })


if __name__ == "__main__":
    build(Path(sys.argv[1]))
