"""Prepare the review-only municipal and major water layers from official GeoJSON."""
import json
import sys
from pathlib import Path

from pyproj import Transformer
import numpy as np
from shapely import transform
from shapely.geometry import box, mapping, shape

root = Path(__file__).resolve().parents[1] / "revue" / "data"

unproject = Transformer.from_crs(28992, 4326, always_xy=True).transform
names = set("""Aalsmeer|Almere|Amstelveen|Amsterdam|Beverwijk|De Ronde Venen|Diemen|Edam-Volendam|
Gooise Meren|Haarlem|Haarlemmermeer|Heemskerk|Heemstede|Landsmeer|Oostzaan|Ouder-Amstel|
Purmerend|Stichtse Vecht|Uitgeest|Uithoorn|Velsen|Waterland|Wijdemeren|Wormerland|Zaanstad""".replace("\n", "").split("|"))
municipalities = []
for feature in json.loads(Path(sys.argv[1]).read_text())["features"]:
    props = feature["properties"]
    if props["naam"] not in names:
        continue
    geometry = shape(feature["geometry"])
    point = geometry.representative_point()
    geometry = transform(geometry, lambda coordinates: np.round(coordinates, 7))
    municipalities.append({"type": "Feature", "id": props["identificatie"], "geometry": mapping(geometry),
                           "properties": {"name": props["naam"], "label": [point.y, point.x]}})
if {f["properties"]["name"] for f in municipalities} != names:
    raise ValueError("Check the official municipality extract")

waters = json.loads(Path(sys.argv[2]).read_text())["features"]
major = []
for feature in waters:
    geometry = shape(feature["geometry"]).intersection(box(97000, 469000, 139000, 505000))
    if geometry.is_empty or geometry.area < 150000:
        continue
    geometry = transform(geometry.simplify(4, preserve_topology=True), unproject, interleaved=False)
    geometry = transform(geometry, lambda coordinates: np.round(coordinates, 7))
    major.append({"type": "Feature", "geometry": mapping(geometry), "properties": {}})
context = {"municipalities": {"type": "FeatureCollection", "features": municipalities},
           "water": {"type": "FeatureCollection", "features": major}}
(root / "amsterdam-map-context.json").write_text(json.dumps(context, separators=(",", ":")) + "\n")
print(len(municipalities), len(major))
