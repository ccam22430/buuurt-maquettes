# COM-PUB-SPON-003 map context

The peripheral map is a presentation layer only. Its municipality and water features are non-interactive and are never passed to the targeting model, selection list, extension system or Budget. Amsterdam's official wijk/gebied sources and geodesic portion geometry are unchanged. The outer map uses the complete municipality of Amsterdam, including Weesp.

- Municipal geometry: [Kadaster / PDOK BRK Bestuurlijke Gebieden](https://api.pdok.nl/kadaster/brk-bestuurlijke-gebieden/ogc/v1/collections/gemeentegebied), CC BY 4.0. Extract retrieved on 28 November 2026, filtered to 25 municipalities around Amsterdam and encoded at 7 decimal places. The filter keeps whole municipality geometries.
- Hydrography: [CBS Bestand Bodemgebruik 2010](https://data.overheid.nl/dataset/81148-bestand-bodemgebruik-2010), CC BY 4.0. Reuses the qualified regional water extract, keeps mapped bodies over 0.15 km², and simplifies the display layer at 4 m with topology preservation. Water renders below paid and free portions so the distribution colors remain legible.

At zoom below 11.75 the map shows municipality names instead of local labels. From 11.75 to below 13 it shows the gebied level. From 13 onward the existing manual area/wijk switch is available. At 13.5 and above the merchant sees selection circles where they fit without overlapping another circle or map control. Only their visibility changes when zooming. Selected IDs, portion colors and coordinates are independent of the background and zoom.

Rebuild using `scripts/build-amsterdam-map-context.py` with the [municipality export](https://api.pdok.nl/kadaster/brk-bestuurlijke-gebieden/ogc/v1/collections/gemeentegebied/items?bbox=4.35,52.12,5.35,52.65&limit=100&f=json) and the existing EPSG:28992 CBS water extract documented in [the municipal review](../com-pub-spon-001/commercial-v1/README.md). The build needs NumPy, Shapely and pyproj.

Verification: all 37 Node tests passed. Chromium desktop and iPhone emulation verified automatic detail changes, visible municipal labels and water, non-interactive context, hidden/restored selection circles, retained selection on zoom/recenter and the Budget round trip.
