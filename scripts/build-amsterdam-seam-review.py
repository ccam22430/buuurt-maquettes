"""Build a private comparison layer in RD without changing the source files."""

import argparse
import json
from importlib import import_module
from pathlib import Path

from pyproj import Transformer
from shapely import from_wkt, transform, union_all
from shapely.geometry import mapping, shape

read_snapshot = import_module("build-amsterdam-historic").read_snapshot
RD = "urn:ogc:def:crs:EPSG::28992"
TO_WGS84 = Transformer.from_crs(28992, 4326, always_xy=True)
TARGETS = {"GM0362", "GM0384"}


def load_rd(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data["crs"]["properties"]["name"] != RD:
        raise ValueError("Expected EPSG:28992")
    return data["features"]


def build(archive, municipal, land_use):
    boroughs = [(row["naam"], from_wkt(row["geometrie"])) for row in read_snapshot(archive)]
    city = union_all([geometry for _, geometry in boroughs])
    features = []

    def add(kind, name, geometry):
        if not geometry.is_empty:
            features.append({
                "type": "Feature",
                "geometry": mapping(transform(geometry, TO_WGS84.transform, interleaved=False)),
                "properties": {"kind": kind, "name": name},
            })

    for name, geometry in boroughs:
        add("Amsterdam 2009", name, geometry)

    shapes = {}
    for feature in municipal:
        props = feature["properties"]
        if props["jrstatcode"] != "2009" + props["statcode"]:
            raise ValueError("Expected CBS 2009")
        shapes[props["statcode"]] = (props["statnaam"], shape(feature["geometry"]))
    if not TARGETS <= shapes.keys():
        raise ValueError("Amstelveen and Diemen must both be present")

    water = union_all([shape(f["geometry"]) for f in land_use
                       if 70 <= f["properties"]["bg2010a"] < 90])
    land = union_all([shape(f["geometry"]) for f in land_use
                      if 0 <= f["properties"]["bg2010a"] < 70])

    coverage = land.union(water)

    def land_water(geometry, measure):
        wet = geometry.intersection(water)
        dry = geometry.intersection(land).difference(water)
        unknown = geometry.difference(coverage)
        return {key: round(getattr(part, measure), 2)
                for key, part in [("land", dry), ("water", wet), ("unclassified", unknown)]}

    other_municipalities = union_all([geometry for code, (_, geometry) in shapes.items()
                                     if code != "GM0363"])
    gaps = shapes["GM0363"][1].difference(city.union(other_municipalities))
    report = {"gapsSquareMetres": land_water(gaps, "area"), "candidates": {}}
    add("Unassigned CBS Amsterdam", "CBS Amsterdam outside the municipal archive", gaps)
    add("2010 water", "CBS Bestand Bodemgebruik 2010", water.intersection(city.union(
        union_all([gaps, *(shapes[code][1] for code in TARGETS)]))))

    for code in sorted(TARGETS):
        name, original = shapes[code]
        remainder = original.difference(city)
        overlap = original.intersection(city)
        if not remainder.is_valid or remainder.intersection(city).area > 1e-6:
            raise ValueError(f"Invalid proposed partition for {name}")
        if abs(remainder.area + overlap.area - original.area) > 1e-5:
            raise ValueError(f"Area conservation failed for {name}")
        add("CBS 2009 originals", name, original)
        add("Review remainder", name, remainder)
        add("Original overlap", name, overlap)
        contacts = []
        for borough_name, borough in boroughs:
            municipal_edge = borough.boundary.intersection(city.boundary)
            exact = municipal_edge.intersection(original.boundary)
            # The preserved municipal edge inside the candidate footprint is review evidence.
            # No proximity threshold, snap or synthetic edge is used.
            provisional = municipal_edge.intersection(original).difference(exact)
            if exact.length or provisional.length:
                add("Provisional contact", f"{borough_name} / {name}", provisional)
                contacts.append({
                    "borough": borough_name,
                    "exactMetres": land_water(exact, "length"),
                    "provisionalMetres": land_water(provisional, "length"),
                })
        report["candidates"][name] = {
            "originalOverlapSquareMetres": land_water(overlap, "area"),
            "contacts": contacts,
        }
    return {"type": "FeatureCollection", "features": features}, report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for field in ("archive", "municipal", "land_use", "output"):
        parser.add_argument(field, type=Path)
    args = parser.parse_args()
    layer, report = build(args.archive, load_rd(args.municipal), load_rd(args.land_use))
    args.output.write_text(json.dumps(layer, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
