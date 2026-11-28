# Amsterdam municipal seam review

This comparison keeps the fifteen Amsterdam boroughs and the original CBS municipality polygons on separate layers. The proposed municipal remainder subtracts the Amsterdam archive union from the CBS municipality. It keeps every outlying source part and adds no geometry. The amber layer shows portions of CBS Amsterdam left unassigned by that operation. It makes no claim about the administrative ownership of these gaps.

The comparison marks portions of the municipal Amsterdam boundary lying inside the original candidate footprints. These segments identify inspection targets along the overlap. They do not constitute approved edges in the distribution graph. The comparison creates neither snapped borders nor proximity-based edges. It measures positive-length intersections of the original boundaries independently from these inspection targets.

## Source and reproduction

- Municipal Amsterdam 2009 borough archive under CC0 1.0. See [geographic reference](../../../revue/GEO-REFERENCE.md).
- [CBS administrative divisions via PDOK](https://data.overheid.nl/dataset/83996-cbs-gebiedsindelingen-1995---2015), CC BY 4.0. The 2009 and 2010 WFS capability documents expose only `gemeente_gegeneraliseerd` and municipality label points. The [separate historical OGC API](https://api.pdok.nl/cbs/wijken-en-buurten-historisch/ogc/v1/collections) starts in 2012. The downloadable [CBS/Kadaster 2010 edition](https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/geografische-data/wijk-en-buurtkaart-2010) is full resolution and permits redistribution with CBS and Kadaster attribution. Cloud returned HTTP 403 for the ZIP. The [alternative CBS index](https://geodata.cbs.nl/files/Wijkenbuurtkaart/) has no 2010 archive listed. The full-resolution file was not used. The generalised 2009 and 2010 PDOK exports differ by 200,532.35 m² for Amsterdam, 30,467.91 m² for Amstelveen and 25,670.14 m² for Diemen in symmetric-difference area.
- [CBS Bestand Bodemgebruik 2010 via PDOK](https://data.overheid.nl/dataset/81148-bestand-bodemgebruik-2010), CC BY 4.0. Summer 2010 observations serve only to split lengths and areas into land, water and unclassified coverage. This is distinct from choosing the municipal vintage. Water takes precedence at the common boundaries of the two land-use classes.

Use the 2009 municipal WFS export documented in the geographic reference. Export the 2010 land-use WFS at `https://service.pdok.nl/cbs/bestand-bodemgebruik-2010/wfs/v1_0` with `service=WFS`, `version=2.0.0`, `request=GetFeature`, `typeNames=bestandbodemgebruik:bestand_bodemgebruik_2010`, `outputFormat=application/json`, `srsName=EPSG:28992`, and `bbox=109000,476000,134000,498000,EPSG:28992`. Page with `startIndex` and `count`. The audited export contains 5,510 unique IDs, matching the WFS hits query. Preserve the CRS field when combining pages.

Run `python scripts/build-amsterdam-seam-review.py AMSTERDAM.zip MUNICIPAL_2009.json LAND_USE_2010.json review.geojson` with the Shapely and pyproj versions documented by the borough generator. The tool prints an RD metrics report and exports the comparison in WGS84. To view the template, serve `index.html`, the generated `review.geojson` and the Leaflet 1.9.4 distribution from one directory.

The existing campaign map and package workflow use the approved Amsterdam topology. The comparison remains outside the review-library package until the seam and unresolved land coverage qualify.

## RD results

| Geometry measured | Land (m²) | Water (m²) |
| --- | ---: | ---: |
| Amstelveen overlap | 27,779.53 | 11,835.42 |
| Diemen overlap | 22,101.66 | 29,408.04 |
| Unassigned extent within CBS Amsterdam | 351,240.18 | 382,083.75 |

| Candidate | Amsterdam borough | Provisional land (m) | Provisional water (m) |
| --- | --- | ---: | ---: |
| Amstelveen | Oost-Watergraafsmeer | 0.00 | 441.41 |
| Amstelveen | Zuideramstel | 2,265.24 | 1,503.33 |
| Diemen | Oost-Watergraafsmeer | 1,246.17 | 15.58 |
| Diemen | Zeeburg | 25.25 | 2,301.34 |
| Diemen | Zuidoost | 2,720.51 | 792.87 |

Each pair has zero exact original boundary length. In particular, the proposed Amstelveen–Oost-Watergraafsmeer segment lies entirely on water according to the land-use snapshot. Hydrographic intersections give evidence for review. They alone cannot certify a common administrative border. The full [machine-readable results](measurements.json) include unclassified coverage.
