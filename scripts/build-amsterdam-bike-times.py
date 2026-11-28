"""Generate estimated bicycle time thresholds from PDOK TOP10NL road centerlines."""
import argparse
import hashlib
import heapq
import json
import math
from collections import defaultdict
from pathlib import Path

from pyproj import Transformer
from shapely import Point, STRtree, transform
from shapely.geometry import shape

ROOT = Path(__file__).resolve().parents[1] / "revue" / "data"
PROJECT = Transformer.from_crs(4326, 28992, always_xy=True).transform
FIXTURES = {
    "dolores": [52.36395892, 4.86340111],
    "pilot": [52.3707909, 4.8556261],
    "canal": [52.38137, 4.88973],
    "junction": [52.36355, 4.87975],
}
# Speeds in km/h. Undefined access classes are excluded instead of assuming access.
SPEEDS = {"fietsers": 17, "fietsers, bromfietsers": 17, "fietsers, voetgangers": 14, "gemengd verkeer": 15,
          "fietsers en voetgangers": 14}
ROAD_TYPES = {"straat", "lokale weg", "regionale weg", "fietspad", "overig", "onbekend",
              "hoofdweg", "verbindingsweg", "overige weg"}


def road_graph(roads, neighborhoods):
    tree = STRtree(neighborhoods)
    points = []
    by_endpoint = {}
    edges = defaultdict(list)
    samples = defaultdict(list)

    def node(xy, endpoint):
        key = tuple(round(value, 2) for value in xy)
        if endpoint and key in by_endpoint:
            return by_endpoint[key]
        idx = len(points)
        points.append(xy)
        if endpoint:
            by_endpoint[key] = idx
        return idx

    for road in roads:
        props = road["properties"]
        way = props["typeweg"]
        usage = props["hoofdverkeersgebruik"]
        speed = SPEEDS.get(usage, 17 if way == "fietspad" and usage not in {"voetgangers", "snelverkeer"} else None)
        if (not speed or way not in ROAD_TYPES or props["status"] != "in gebruik"
                or props["typeinfrastructuur"] in {"veerdienst", "veerverbinding"}):
            continue
        geometry = transform(shape(road["geometry"]), PROJECT, interleaved=False)
        lines = list(geometry.geoms) if geometry.geom_type == "MultiLineString" else [geometry]
        for line in lines:
            if line.length <= 0:
                continue
            parts = math.ceil(line.length / 20)
            start = node(line.coords[0][:2], True)
            for index in range(parts):
                length = line.length / parts
                middle = line.interpolate((index + .5) * length)
                end_point = line.interpolate((index + 1) * length)
                middle_id = node((middle.x, middle.y), False)
                end = node((end_point.x, end_point.y), index == parts - 1)
                cost = length / (speed / 3.6) / 2
                for a, b in [(start, middle_id), (middle_id, end)]:
                    edges[a].append((b, cost))
                    edges[b].append((a, cost))
                matches = tree.query(middle, predicate="within")
                if len(matches) == 1:
                    samples[int(matches[0])].append((middle_id, length))
                start = end
    return points, edges, samples


def shortest(start, edges, initial):
    best = {start: initial}
    queue = [(initial, start)]
    while queue:
        elapsed, current = heapq.heappop(queue)
        if elapsed != best[current]:
            continue
        for other, cost in edges[current]:
            candidate = elapsed + cost
            if candidate < best.get(other, math.inf):
                best[other] = candidate
                heapq.heappush(queue, (candidate, other))
    return best


def estimate(roads, neighborhoods, fixtures):
    polygons = [transform(shape(f["geometry"]), PROJECT, interleaved=False) for f in neighborhoods]
    points, edges, samples = road_graph(roads, polygons)
    if not points:
        raise ValueError("No cyclable network was loaded")
    tree = STRtree([Point(point) for point in points])
    profiles = {}
    for name, center in fixtures.items():
        origin = Point(PROJECT(center[1], center[0]))
        start = int(tree.nearest(origin))
        connector = origin.distance(Point(points[start]))
        if connector > 70:
            raise ValueError(f"Test point {name} is {connector:.1f} m from the network")
        times = shortest(start, edges, connector / (5 / 3.6))
        output = {}
        for index, feature in enumerate(neighborhoods):
            observations = samples[index]
            total = sum(length for _, length in observations)
            covered = 0.0
            median = None
            for node_id, length in sorted(observations, key=lambda s: times.get(s[0], math.inf)):
                if node_id not in times:
                    break
                covered += length
                if covered >= total / 2:
                    median = round(times[node_id])
                    break
            output[feature["id"]] = {"seconds": median, "sampleMetres": round(total)}
        profiles[name] = {"center": center, "snapMetres": round(connector, 1), "wijken": output}
        print(name, "snap", round(connector, 1), "reachable nodes", len(times),
              "wijk bands", [sum(row["seconds"] is not None and row["seconds"] <= seconds
                                for row in output.values()) for seconds in [300, 600]])
    print("Roads", len(roads), "graph nodes", len(points), "sampled wijken", len(samples))
    return profiles


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("roads", type=Path)
    args = parser.parse_args()
    wijken = json.loads((ROOT / "amsterdam-levels-wijken.geojson").read_text())
    profiles = estimate(json.loads(args.roads.read_text()), wijken["features"],
                        {**FIXTURES, "border": wijken["borderFixture"]})
    data = {"version": "top10nl-bike-v1", "sourceSha256": hashlib.sha256(args.roads.read_bytes()).hexdigest(),
            "method": "weighted median of sampled road length", "profiles": profiles}
    (ROOT / "amsterdam-bike-times.json").write_text(json.dumps(data, separators=(",", ":")) + "\n")
