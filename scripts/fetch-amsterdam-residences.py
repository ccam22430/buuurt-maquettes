"""Fetch active residential BAG address points in EPSG:28992 for offline aggregation."""
import argparse
import concurrent.futures
import json
import subprocess
from pathlib import Path
from urllib.parse import urlencode

ENDPOINT = "https://service.pdok.nl/lv/bag/wfs/v2_0"
BOUNDS = [115000, 481000, 127000, 492000]
FIELDS = "geom,identificatie,gebruiksdoel,status,openbare_ruimte,huisnummer,huisletter,toevoeging,postcode"
ACTIVE = {"Verblijfsobject in gebruik", "Verblijfsobject in gebruik (niet ingemeten)"}


def fetch(tile):
    start, result = 0, {}
    while True:
        params = dict(service="WFS", version="2.0.0", request="GetFeature", typeNames="bag:verblijfsobject",
                      bbox=",".join(map(str, [*tile, "EPSG:28992"])), outputFormat="application/json",
                      count=1000, startIndex=start, sortBy="identificatie", propertyName=FIELDS)
        page = json.loads(subprocess.check_output(["curl", "-fsSL", "--retry", "2", "--max-time", "40",
                                                   ENDPOINT + "?" + urlencode(params)]))
        features = page["features"]
        for feature in features:
            p = feature["properties"]
            uses = p["gebruiksdoel"]
            if "woonfunctie" in ([part.strip() for part in uses.split(",")] if isinstance(uses, str) else uses or []) and p["status"] in ACTIVE:
                address = [p[key] for key in ("postcode", "openbare_ruimte", "huisnummer", "huisletter", "toevoeging")]
                result[p["identificatie"]] = [address, feature["geometry"]["coordinates"]]
        if len(features) < 1000:
            return result
        start += len(features)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    x0, y0, x1, y1 = BOUNDS
    tiles = [(x, y, min(x + 1000, x1), min(y + 1000, y1))
             for x in range(x0, x1, 1000) for y in range(y0, y1, 1000)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        result = {}
        for rows in pool.map(fetch, tiles):
            result.update(rows)
    addresses = {}
    for key in sorted(result):
        address, point = result[key]
        if address[0] and address[1] and address[2]:
            addresses.setdefault(tuple(str(value or "").strip().upper() for value in address), point)
    args.output.write_text(json.dumps({"bounds": BOUNDS, "addresses": list(addresses.values())}, separators=(",", ":")))
    print(len(addresses))
