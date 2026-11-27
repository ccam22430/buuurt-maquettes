"""Build the standalone test page with the already qualified CBS snapshots."""
import json
from pathlib import Path
from zipfile import ZipFile

here = Path(__file__).resolve().parent
ref = here.parent / "reference"
qualification = json.loads((ref / "qualification.json").read_text())


def polygons(feature):
    shape = feature["geometry"]
    return shape["coordinates"] if shape["type"] == "MultiPolygon" else [shape["coordinates"]]


def build_maps():
    result = {}
    with ZipFile(ref / "contours-officiels.zip") as archive:
        for row in qualification["cbs"]:
            if row["year"] != 2025 or row["level"] != "buurten":
                continue
            case = row["case"]
            address = qualification["addresses"][case]
            lon, lat = map(float, address["centroide_ll"][6:-1].split())
            home = row["home"][0]
            neighbors = [item[0] for item in row["neighbors"]]
            all_features = json.loads(archive.read(f"{case}-2025.geojson"))["features"]
            by_code = {item["properties"]["buurtcode"]: item for item in all_features}
            selected = [by_code[code] for code in [home, *neighbors]]
            geometry = [p for f in selected for p in polygons(f)]
            points = [point for p in geometry for ring in p for point in ring]
            xs, ys = zip(*points)
            west, east, south, north = min(xs), max(xs), min(ys), max(ys)
            # Approximate the display ratio for the latitude, leaving boundaries untouched in the archive.
            scale = min(600 / ((east - west) * .61), 365 / (north - south))

            def project(point):
                x, y = point
                return [round(320 + (x - (west + east) / 2) * .61 * scale, 2),
                        round(205 - (y - (south + north) / 2) * scale, 2)]

            blocked = row["point_only"][:3]
            if not blocked:
                from math import hypot
                distances = []
                for feature in all_features:
                    code = feature["properties"]["buurtcode"]
                    if code in [home, *neighbors]:
                        continue
                    distance = min(hypot((p[0] - lon) * .61, p[1] - lat)
                                   for poly in polygons(feature) for p in poly[0])
                    distances.append((distance, code))
                blocked = [code for _, code in sorted(distances)[:3]]

            districts = []
            for code in [*blocked, home, *neighbors]:
                feature = by_code[code]
                path = " ".join("M" + "L".join(",".join(map(str, project(p))) for p in ring) + "Z"
                                for poly in polygons(feature) for ring in poly)
                districts.append({"code": code, "name": feature["properties"]["buurtnaam"], "path": path})
            result[case] = {"home": home, "neighbors": neighbors, "districts": districts,
                            "point": project((lon, lat)), "address": address["weergavenaam"],
                            "bag": address["nummeraanduiding_id"]}
    return result


if __name__ == "__main__":
    template = (here / "page.html").read_text()
    maps = json.dumps(build_maps(), ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    source = (here / "essai.js").read_text()
    page = template.replace("/*__CBS__*/", maps).replace("/*__BENCH__*/", source)
    (here / "buuurt-v1-essai.html").write_text(page)
