"""Generate CBS 2025 topology and Graft review data (Shapely 2.2.0)."""
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

from shapely import STRtree
from shapely.geometry import shape
from shapely.ops import polylabel

SOURCE = 'https://api.pdok.nl/cbs/wijken-en-buurten-2025/ogc/v1/collections/buurten/items'
OUTPUT = Path(__file__).resolve().parent.parent / 'revue' / 'data'
WINDOWS = {'amsterdam': '4.83,52.35,4.89,52.39', 'graft': '4.73,52.49,4.94,52.64'}


def features(bbox, crs=None):
    params = dict(bbox=bbox, limit=100, f='json')
    if crs:
        params['crs'] = crs
    url = SOURCE + '?' + urlencode(params)
    records = {}
    while url:
        with urlopen(url, timeout=30) as response:
            page = json.load(response)
        records.update((f['properties']['buurtcode'], f) for f in page['features'])
        url = next((link['href'] for link in page['links'] if link['rel'] == 'next'), None)
    return records


def write(name, data):
    (OUTPUT / name).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')


def build(region, bbox):
    metric = features(bbox, 'http://www.opengis.net/def/crs/EPSG/0/28992')
    official = features(bbox)
    assert metric.keys() == official.keys()
    codes = sorted(metric)
    polygons = [shape(metric[code]['geometry']) for code in codes]
    assert all(polygon.is_valid and not polygon.is_empty for polygon in polygons)
    boundaries = [polygon.boundary for polygon in polygons]
    tree = STRtree(boundaries)
    graph = {
        code: [codes[j] for j in sorted(tree.query(boundaries[i], predicate='intersects'))
               if i != j and boundaries[i].intersection(boundaries[j]).length > 0]
        for i, code in enumerate(codes)
    }
    write(f'{region}-cbs-2025-neighbors.json', dict(source=SOURCE, bbox=bbox, neighbors=graph))
    if region == 'amsterdam':
        existing = json.loads((OUTPUT / 'amsterdam-cbs-2025.geojson').read_text())
        assert {f['id']: f['geometry'] for f in existing['features']} == {
            code: feature['geometry'] for code, feature in official.items()}
        return
    result = []
    for code in codes:
        feature = official[code]
        geom = shape(feature['geometry'])
        largest = max(geom.geoms, key=lambda part: part.area)
        anchor = polylabel(largest, tolerance=0.000005)
        result.append(dict(type='Feature', id=code, geometry=feature['geometry'],
                           properties=dict(buurtnaam=feature['properties']['buurtnaam'],
                                           label=[anchor.y, anchor.x],
                                           clearance=anchor.distance(largest.boundary))))
    write(f'{region}-cbs-2025.geojson', dict(type='FeatureCollection', features=result))


if __name__ == '__main__':
    for name, window in WINDOWS.items():
        build(name, window)
