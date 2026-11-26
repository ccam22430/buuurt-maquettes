import json
from urllib.request import urlopen
from urllib.parse import urlencode

BASE = 'https://api.pdok.nl/cbs/wijkenbuurten/2025/ogc/v1/collections/wijken/items'
def fetch(url):
    with urlopen(url, timeout=30) as response:
        return json.load(response)

def main():
    address = fetch('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?' + urlencode({'q':'Jan Evertsenstraat 55 Amsterdam','fq':'type:adres','rows':5}))
    docs = address['response']['docs']
    assert docs, 'No address candidates'
    print('Address candidates:', [(d.get('weergavenaam'), d.get('centroide_ll')) for d in docs])
    data = fetch(BASE + '?' + urlencode({'bbox':'4.78,52.32,4.94,52.42','limit':100,'f':'json'}))
    features = data['features']
    assert features, 'No official features'
    assert all(f['geometry']['type'] in ('Polygon','MultiPolygon') for f in features)
    print('First page:', len(features), 'features; properties:', list(features[0]['properties']))
    print('Pagination:', [l.get('href') for l in data.get('links',[]) if l.get('rel')=='next'])
    print('Connectivity verified only; not a geographic or browser acceptance test.')

if __name__ == '__main__':
    main()
