"""Fetch the public TOP10NL road centerlines used by the Amsterdam bike review."""
import argparse
import concurrent.futures
import json
import subprocess
from pathlib import Path

BASE = "https://api.pdok.nl/brt/top10nl/ogc/v1/collections/wegdeel_hartlijn/items"
TILES = [(x / 1000, y / 1000, (x + 35) / 1000, (y + 30) / 1000)
         for x in range(4710, 5130, 35) for y in range(52275, 52455, 30)]


def fetch(tile):
    url = BASE + "?bbox=" + ",".join(map(str, tile)) + "&limit=1000&f=json"
    features = []
    while url:
        page = json.loads(subprocess.check_output(["curl", "-fsSL", "--retry", "2", "--max-time", "35", url]))
        features.extend(page["features"])
        url = next((link["href"] for link in page["links"] if link["rel"] == "next"), None)
    return features


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    by_id = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for features in pool.map(fetch, TILES):
            by_id.update((str(feature["id"]), feature) for feature in features)
    args.output.write_text(json.dumps(list(by_id.values()), separators=(",", ":")), encoding="utf-8")
    print(len(by_id))
