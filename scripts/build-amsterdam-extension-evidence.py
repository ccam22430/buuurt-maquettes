"""Build aggregate-only extension evidence from the existing TOP10NL graph and BAG points."""
import argparse
import hashlib
import json
import math
import runpy
from collections import defaultdict
from pathlib import Path

from shapely import Point, STRtree, box, transform
from shapely.geometry import shape

bike = runpy.run_path(str(Path(__file__).with_name("build-amsterdam-bike-times.py")))
ROOT = bike["ROOT"]
PROJECT = bike["PROJECT"]


def histogram(observations, times, scale):
    buckets = defaultdict(float)
    for node, weight, approach in observations:
        seconds = times.get(node, math.inf) + approach
        if seconds <= 1200:
            buckets[max(1, math.ceil(seconds / 60))] += weight
    return [math.floor(sum(buckets.get(m, 0) for m in range(1, threshold + 1)) * scale)
            for threshold in range(1, 21)]


def main(roads_path, residences_path):
    roads_bytes = roads_path.read_bytes()
    residences_bytes = residences_path.read_bytes()
    road_hash = hashlib.sha256(roads_bytes).hexdigest()
    address_hash = hashlib.sha256(residences_bytes).hexdigest()
    existing = json.loads((ROOT / "amsterdam-bike-times.json").read_text())
    if road_hash != existing["sourceSha256"]:
        raise ValueError("Evidence must use the same road snapshot as COM-PUB-SPON-003")
    districts = json.loads((ROOT / "amsterdam-levels-wijken.geojson").read_text())["features"]
    polygons = [transform(shape(f["geometry"]), PROJECT, interleaved=False) for f in districts]
    district_tree = STRtree(polygons)
    points, edges, samples = bike["road_graph"](json.loads(roads_bytes), polygons)
    graph_points = [Point(xy) for xy in points]
    graph_tree = STRtree(graph_points)
    addresses = json.loads(residences_bytes)
    coverage = box(*addresses["bounds"])
    counters = defaultdict(int)
    residences = defaultdict(list)
    # Cache shared building entrances. Only use the closest node, even when disconnected.
    connections = {}
    for xy in addresses["addresses"]:
        key = tuple(xy)
        if key not in connections:
            point = Point(xy)
            matches = district_tree.query(point, predicate="within")
            if len(matches) != 1:
                connections[key] = None
            else:
                node = int(graph_tree.nearest(point))
                connections[key] = (int(matches[0]), node, point.distance(graph_points[node]))
        connection = connections[key]
        if connection:
            district, node, distance = connection
            counters[district] += 1
            if distance <= 30:
                residences[district].append((node, 1, distance / (5 / 3.6)))
    profiles = {}
    for profile in ("dolores", "pilot"):
        latitude, longitude = existing["profiles"][profile]["center"]
        origin = Point(PROJECT(longitude, latitude))
        start = int(graph_tree.nearest(origin))
        times = bike["shortest"](start, edges, origin.distance(graph_points[start]) / (5 / 3.6))
        rows = {}
        for index, feature in enumerate(districts):
            roads = [(node, length, 0) for node, length in samples[index]]
            total = sum(length for _, length, _ in roads)
            rows[feature["id"]] = {
                "roadMetres": round(total, 3), "road": histogram(roads, times, 1),
                "residential": histogram(residences[index], times, 1),
                "residentialTotal": counters[index], "residentialSnapped": len(residences[index]),
                "addressCoverage": coverage.covers(polygons[index]),
            }
        profiles[profile] = rows
    result = {"version": "top10nl-bag-v1-" + address_hash[:12], "networkSha256": road_hash,
              "bagSnapshotSha256": address_hash, "profiles": profiles}
    (ROOT / "amsterdam-extension-evidence.json").write_text(json.dumps(result, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("roads", type=Path)
    parser.add_argument("residences", type=Path)
    args = parser.parse_args()
    main(args.roads, args.residences)
