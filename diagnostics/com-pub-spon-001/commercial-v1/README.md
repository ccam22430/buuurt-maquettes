# Commercial coverage v1

Sources are the original CC0 [municipal Amsterdam archive](https://data.overheid.nl/dataset/5l2csm77flzgya), the [CBS 2009 administrative divisions via PDOK](https://data.overheid.nl/dataset/83996-cbs-gebiedsindelingen-1995---2015) and [CBS Bestand Bodemgebruik 2010](https://data.overheid.nl/dataset/81148-bestand-bodemgebruik-2010) (both CC BY 4.0). The original municipal Amsterdam display geometries remain in `revue/data/amsterdam-stadsdelen-2009.geojson`. The unchanged PDOK municipality response in Dutch RD is archived alongside this document. The file includes the surrounding WFS results used to identify the twelve municipalities that touch or overlap the historical Amsterdam outer line. The CBS 2025 data remains in place for statistical workflows.

## Transformation

1. Build the outer coverage from the union of the historical boroughs, CBS Amsterdam and twelve surrounding CBS municipalities. Include enclosed holes in the coverage. Exterior land outside the footprint lies outside this review.
2. Node the source boundaries in EPSG:28992 at 0.10 m grid resolution and polygonize them. Assign overlapping faces first to the historical boroughs in stable source-ID order and then to the surrounding municipalities. Assign an uncovered enclosed face to the owner with the longest shared edge, using the same order to break ties. This produces commercial adjustments rather than administrative boundaries.
3. Merge faces per territory. Generation fails if a territory is empty or invalid, a pair shares positive area, or the partition differs in area from the declared coverage. Build reciprocal adjacency from the resulting positive-length common boundaries, including boundaries along waterways. Convert coordinates to WGS84 for display only.
4. Clip the source water polygons to the coverage. Keep polygon parts and simplify the display overlay at 2 m with topology preservation. The water overlay is non-interactive and separate from the sales territory graph.

## Reproduction and topology results

Use the same municipal archive and municipality WFS export as the geographic reference. Export the land-use WFS documented under `seam-review`, filtering `bodemgebruik=Water` inside EPSG:28992 envelope `97000 469000 139000 505000`. Merge 3,086 distinct features using the WFS hits total, retaining the original CRS. Run `python scripts/build-amsterdam-commercial.py AMSTERDAM.zip municipalities-cbs-2009-rd.json WATER.json` with Shapely 2.2.0 and pyproj 3.7.2.

The generator verified 27 valid territories, zero uncovered area and zero pairwise overlap in RD. It derived 64 undirected shared boundaries. The declared coverage is 759.453 km² and contains 93.179 km² of source water before display simplification. The largest historical borough symmetric difference is 0.220 km². Dolores remains in Oud-West. De Baarsjes, Westerpark, Centrum and Oud-Zuid are still preselected. Amstelveen and Diemen are selectable outside the first two rings.

## Browser and regression checks

Nine geography tests passed. Chromium desktop at 1364 × 950 and a simulated mobile viewport at 390 × 844 displayed the 27 territories and the blue water layer. The two modes used identical territory paths at the same camera. Both checks exercised zoom, drag, recenter, fullscreen and Escape. The run deselected De Baarsjes, selected and deselected Amstelveen and Diemen, selected both again, and verified that the resulting list reached the unchanged price options and survived returning to the map. The grey territory dialog remained functional.

At the initial mobile framing, six distinct names were visible, including Oud-West and all four recommended areas. Screenshots: [mobile](mobile.jpg), [desktop](desktop.jpg), [mobile with streets](mobile-streets.jpg), [desktop with streets](desktop-streets.jpg).
