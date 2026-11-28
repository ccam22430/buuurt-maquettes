"""Measure candidate municipal seams against the frozen Amsterdam snapshot in RD."""

import argparse
import json
from pathlib import Path

from shapely import from_wkt, union_all
from shapely.geometry import shape

from importlib import import_module

read_snapshot = import_module("build-amsterdam-historic").read_snapshot


def audit(archive, candidates):
    if candidates.get("crs", {}).get("properties", {}).get("name") != "urn:ogc:def:crs:EPSG::28992":
        raise ValueError("The candidate data must explicitly use Dutch RD (EPSG:28992)")

    boroughs = [from_wkt(row["geometrie"]) for row in read_snapshot(archive)]
    city = union_all(boroughs)
    municipalities = {}
    for feature in candidates["features"]:
        properties = feature["properties"]
        if properties["jrstatcode"] != "2009" + properties["statcode"]:
            raise ValueError("The candidate data contains a different reference year")
        geometry = shape(feature["geometry"])
        code = properties["statcode"]
        if code in municipalities or geometry.is_empty or not geometry.is_valid:
            raise ValueError(f"Invalid geometry or duplicate municipality: {code}")
        municipalities[code] = (properties["statnaam"], geometry)

    _, cbs_city = municipalities.pop("GM0363")
    outside_city = union_all([geometry for _, geometry in municipalities.values()])
    seams = []
    for code, (name, geometry) in sorted(municipalities.items()):
        seams.append({
            "id": code,
            "name": name,
            "distanceMetres": round(city.distance(geometry), 3),
            "overlapSquareMetres": round(city.intersection(geometry).area, 3),
            "sharedBoundaryMetres": round(city.boundary.intersection(geometry.boundary).length, 3),
        })
    return {
        "municipalOnlySquareMetres": round(city.difference(cbs_city).area, 3),
        "cbsOnlySquareMetres": round(cbs_city.difference(city).area, 3),
        "uncoveredInCbsAmsterdamSquareMetres": round(cbs_city.difference(city.union(outside_city)).area, 3),
        "municipalSeams": seams,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("candidates", type=Path)
    args = parser.parse_args()
    result = audit(args.archive, json.loads(args.candidates.read_text(encoding="utf-8")))
    print(json.dumps(result, indent=2, ensure_ascii=False))
