"""Build a display-only contour layer from the versioned TOP10NL routing graph."""
import hashlib
import json
import math
import runpy
import sys
from pathlib import Path

import contourpy
import numpy as np
import shapely as sh
from pyproj import Transformer
from scipy.spatial import cKDTree
from shapely.geometry import Polygon, mapping, shape

bike = runpy.run_path(str(Path(__file__).with_name("build-amsterdam-bike-times.py")))
root = bike["ROOT"]
display = Transformer.from_crs(28992, 4326, always_xy=True).transform
roads = Path(sys.argv[1]).read_bytes()
times = json.loads((root / "amsterdam-bike-times.json").read_text())
digest = hashlib.sha256(roads).hexdigest()
if digest != times["sourceSha256"]:
    raise ValueError("Incorrect network snapshot")


def project(geometry):
    return sh.make_valid(sh.transform(shape(geometry), bike["PROJECT"], interleaved=False))


districts = json.loads((root / "amsterdam-levels-wijken.geojson").read_text())["features"]
polygons = [project(feature["geometry"]) for feature in districts]
district_tree = sh.STRtree(polygons)
water = project(json.loads((root / "amsterdam-commercial-v1-water.geojson").read_text())["geometry"])
land = [sh.difference(polygon, water) for polygon in polygons]
points, edges, _ = bike["road_graph"](json.loads(roads), polygons)
tree = cKDTree(points)
extent = sh.total_bounds(polygons)
spacing = 20
xs, ys = [np.arange(math.floor(a / spacing) * spacing, b + spacing, spacing)
          for a, b in zip(extent[:2], extent[2:])]
grid = np.stack(np.meshgrid(xs, ys), axis=-1)
distances, nodes = tree.query(grid)
approach = distances / (5 / 3.6)


def polygon_parts(geometry):
    if geometry.is_empty:
        return
    if geometry.geom_type == "Polygon":
        yield geometry
    elif geometry.geom_type in {"MultiPolygon", "GeometryCollection"}:
        for part in geometry.geoms:
            yield from polygon_parts(part)


for name, profile in times["profiles"].items():
    lat, lon = profile["center"]
    origin_distance, start = tree.query(bike["PROJECT"](lon, lat))
    routed = bike["shortest"](int(start), edges, origin_distance / (5 / 3.6))
    travel = np.full(len(points), np.inf)
    for i, seconds in routed.items():
        travel[i] = seconds
    seconds = travel[nodes] + approach
    layers = []
    # A contour must satisfy both routing time and proximity to the mapped network.
    for minute in range(1, 21):
        score = np.minimum(minute * 60 - seconds, (65 - distances) / (5 / 3.6))
        score = np.maximum(score, -60)
        contour = contourpy.contour_generator(x=xs, y=ys, z=score, fill_type="OuterOffset")
        vertices, rings = contour.filled(0, 1201)
        pieces = [Polygon(group[offsets[0]:offsets[1]],
                          [group[a:b] for a, b in zip(offsets[1:-1], offsets[2:])])
                  for group, offsets in zip(vertices, rings)]
        if not pieces:
            continue
        surface = sh.simplify(sh.union_all(sh.make_valid(pieces)), 2, preserve_topology=True)
        for i in sorted(district_tree.query(surface, predicate="intersects")):
            parts = list(polygon_parts(sh.intersection(surface, land[i])))
            if not parts:
                continue
            geometry = sh.transform(sh.union_all(parts), display, interleaved=False)
            # Match viewport precision without modifying the official boundary files.
            geometry = sh.transform(geometry, lambda xy: np.round(xy, 7))
            layers.append([districts[i]["id"], minute, mapping(geometry)])
    artifact = {"networkSha256": digest, "layers": layers}
    (root / f"amsterdam-isochrone-display-{name}.json").write_text(json.dumps(artifact, separators=(",", ":")) + "\n")
    print(name, len(layers))
