"""Build clipped accessibility bands from the TOP10NL bicycle graph in Rijksdriehoek."""
import hashlib
import json
import math
import runpy
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
import shapely as sh
from pyproj import Transformer

bike = runpy.run_path(str(Path(__file__).with_name("build-amsterdam-bike-times.py")))
root = bike["ROOT"]
back = Transformer.from_crs(28992, 4326, always_xy=True).transform
roads = Path(sys.argv[1]).read_bytes()
times = json.loads((root / "amsterdam-bike-times.json").read_text())
digest = hashlib.sha256(roads).hexdigest()
if digest != times["sourceSha256"]:
    raise ValueError("Incorrect network snapshot")
districts = json.loads((root / "amsterdam-levels-wijken.geojson").read_text())["features"]
polygons = [sh.make_valid(sh.transform(sh.geometry.shape(f["geometry"]), bike["PROJECT"], interleaved=False)) for f in districts]
points, edges, samples = bike["road_graph"](json.loads(roads), polygons)
tree = sh.STRtree(sh.points(points))
extent = sh.total_bounds(polygons)
cell = 80
xs, ys = [np.arange(math.floor(a/cell)*cell, b, cell) for a,b in zip(extent[:2],extent[2:])]
x, y = [v.reshape(-1) for v in np.meshgrid(xs, ys)]
coords = sh.points(x + cell/2, y + cell/2)
nodes, distances = tree.query_nearest(coords, max_distance=65, return_distance=True, all_matches=False)
profiles = {}
for name, profile in times["profiles"].items():
    lat, lon = profile["center"]
    origin = sh.Point(bike["PROJECT"](lon, lat))
    origin_node = int(tree.nearest(origin))
    routed = bike["shortest"](origin_node, edges, origin.distance(sh.Point(points[origin_node])) / (5 / 3.6))
    minutes = defaultdict(list)
    for (index, node), distance in zip(nodes.T, distances):
        seconds = routed.get(int(node), math.inf) + distance / (5 / 3.6)
        if seconds <= 1200:
            minutes[max(1,math.ceil(seconds / 60))].append(index)
    layers = []
    sample_rows = {}
    for minute, indexes in sorted(minutes.items()):
        index = np.array(indexes)
        patch = sh.coverage_union_all(sh.box(x[index], y[index], x[index]+cell, y[index]+cell))
        for i in sh.STRtree(polygons).query(patch, predicate="intersects"):
            clip = sh.intersection(patch, polygons[i])
            parts = [p for p in sh.get_parts(clip) if p.geom_type in ("Polygon", "MultiPolygon")]
            if not parts:
                continue
            geometry = sh.transform(sh.union_all(parts), back, interleaved=False)
            district = districts[i]["id"]
            area = round(clip.area)
            layers.append([district, minute, area, sh.geometry.mapping(geometry)])
    for i, feature in enumerate(districts):
        observations = sorted(samples[i], key=lambda row: tuple(points[row[0]]))
        if not observations:
            continue
        # Stable street points, shared by all advertiser profiles. Partner inventory is simulated.
        for index in range(24):
            node, _ = observations[min(len(observations)-1, index * len(observations) // 24)]
            seconds = routed.get(node)
            sample_rows.setdefault(feature["id"], []).append({
                "id": str(node), "seconds": round(seconds, 3) if seconds is not None else None,
                "coordinate": list(back(*points[node]))
            })
    profiles[name] = {"layers": layers, "networkSamples": sample_rows}
    print(name, len(layers))
result = {"version": "top10nl-grid80-v1", "networkSha256": digest, "profiles": profiles}
def encoded(value):
    if isinstance(value, float):
        return round(value, 6)
    if isinstance(value, (tuple,list)):
        return [encoded(v) for v in value]
    if isinstance(value, dict):
        return {key:encoded(v) for key,v in value.items()}
    return value
for name, profile in profiles.items():
    (root / ("amsterdam-network-zones-" + name + ".json")).write_text(
        json.dumps(encoded({"version": result["version"], "networkSha256": digest, **profile}), separators=(",", ":")) + "\n")
