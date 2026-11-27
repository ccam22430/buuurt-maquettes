# BUUURT geographic reference

**Dolores Del Dia Vintage & Modern**, Jan Pieter Heijestraat 91, 1053 GM Amsterdam, Netherlands, is the primary reference for future mockups, demos and geographic review. The public shop is shown as a demonstration reference without customer or partner affiliation. Existing approved mockups remain historical reference material. Jan Evertsenstraat 55-H is a secondary geographic fixture (`demo=amsterdam`), and Graft remains the rural fixture (`demo=graft`).

| Field | Verified value |
| --- | --- |
| BAG address identifier | 0363200000412904 |
| BAG longitude, latitude (WGS84) | 4.86340111, 52.36395892 |
| BAG coordinate (EPSG:28992) | 119322, 486359 |
| Buurt | Borgerbuurt (BU0363ES02) |
| Wijk | Van Lennepbuurt (WK0363ES) |
| Stadsdeel | West, municipality of Amsterdam |

The marker is anchored at the official BAG address point. This is the registered address location and does not describe a surveyed storefront entrance. Sources: [BAG via PDOK Locatieserver](https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=Jan%20Pieter%20Heijestraat%2091%201053GM%20Amsterdam&fq=type%3Aadres&rows=1), [Data Amsterdam address record](https://data.amsterdam.nl/adressen/0363200000412904), [municipal West area document](https://assets.amsterdam.nl/publish/pages/1049691/gebiedsgerichte_opgaven_sociaal_2025-2030.pdf), [CBS/Kadaster neighbourhoods via PDOK](https://api.pdok.nl/cbs/wijken-en-buurten-2025/ogc/v1/collections/buurten), [Kadaster BRT basemap](https://www.pdok.nl/introductie/-/article/basisregistratie-topografie-brt-achtergrondkaart).

## Territorial classification

The reviewed CBS 2025 snapshot contains 152 complete neighbourhood geometries in the Amsterdam coverage window. A live RD calculation independently identified the same home and five positive-length common borders. Borgerbuurt and its direct neighbours fit entirely inside that coverage window, so the neighbours used for the second-ring calculation are covered by the query. Point-only contact remains excluded.

| Yellow and preselected in review | CBS code | Shared boundary |
| --- | --- | ---: |
| Bellamybuurt-Zuid | BU0363EP02 | 598.417 m |
| Lootsbuurt | BU0363ES01 | 207.758 m |
| Da Costabuurt-Zuid | BU0363ES03 | 205.707 m |
| Cremerbuurt-Oost | BU0363EU01 | 214.821 m |
| WG-terrein | BU0363EU02 | 390.043 m |

Green is Borgerbuurt. The ten pink second-ring districts are Marnixbuurt-Zuid, Van Brakelkwartier, De Wester Quartier, Bellamybuurt-Noord, Da Costabuurt-Noord, Paramariboplein e.o., Cremerbuurt-West, Helmersbuurt-Oost, Vondelparkbuurt-Midden and Vondelparkbuurt-Oost. The other 136 neighbourhoods in the snapshot are grey. Selection remains a review state, independent of the geographic colours and delivery authorisation.

## Compare the maps

Open [COM-PUB-SPON-001](com-pub-spon-001.html?lang=fr) from the library. Choose **Carte avec rues** to add the official BRT street basemap or open the [street view directly](com-pub-spon-001.html?lang=fr&reference=streets). Both modes draw the same municipal 2009 geometry and BAG marker through a single Leaflet map. Switching preserves the camera, marker and selection. The street view changes stroke contrast and fill opacity to make the street names readable.

## Amsterdam historical territories · 2009-01-01

The [municipal archive](https://benk.data.amsterdam.nl/public/gebieden/Gebieden_CSV_ActueelEnHistorie.zip) contains the fifteen published territories, including Westpoort, valid at 1 January 2009. Select rows where `beginGeldigheid <= 2009-01-01 < eindGeldigheid`. The [national data catalogue](https://data.overheid.nl/dataset/5l2csm77flzgya) lists the historical CSV distribution under CC0 1.0. The source spelling Geuzenveld/Slotermeer is retained in the metadata and displayed as Geuzenveld-Slotermeer.

Regenerate with `python scripts/build-amsterdam-historic.py ARCHIVE.zip` (Shapely and pyproj). The generator checks validity and containment in Dutch RD (EPSG:28992), transforms all geometry vertices to WGS84 for the map and records the source archive hash. Five pairs overlap in the original data. They remain as supplied. The companion graph records the overlap areas and shared boundary lengths independently. Adjacency requires a shared boundary of positive length in RD. Westerpark and Noord overlap but share no line, so that pair does not count as adjacent.

Dolores lies in Oud-West. The map preselects De Baarsjes (1,732.727 m shared), Westerpark (653.970 m), Centrum (1,446.368 m) and Oud-Zuid (2,431.717 m). The second ring contains Bos en Lommer, Noord, Oost-Watergraafsmeer, Slotervaart, Westpoort, Zeeburg and Zuideramstel. Geuzenveld-Slotermeer, Osdorp and Zuidoost are grey.

The CBS 2025 Amsterdam files remain available for internal GEO-IA work and continue to have regression coverage. The review stores Amsterdam drafts under a dataset-specific scope. Both map modes and the package screen consume the same historical identifiers.

## Proposed extension around Amsterdam

Use one selectable geometry per territory. Keep the fifteen existing Amsterdam IDs. Start with Amstelveen and Diemen. Represent Duivendrecht under Ouder-Amstel and Badhoevedorp and Zwanenburg under Haarlemmermeer while evaluating official locality boundaries. Locate all three in the labels or search alongside Landsmeer and Oostzaan. If locality polygons become selectable, partition their parent municipality into the localities and a named remainder so coverage is continuous and selections cannot double-count. Treat municipalities as geographic units and apply the same shared-boundary rule across their borders. Keep the water mask separate from the selectable geometry and graph. PDOK TOP10NL `waterdeel_vlak` is a candidate for current water display, with its own visible vintage.

The [PDOK CBS 2009 WFS](https://www.pdok.nl/ogc-webservices/-/article/cbs-gebiedsindelingen-1995-2015) serves 2009 municipalities as `gebiedsindelingen:gemeente_gegeneraliseerd`. The [CBS release](https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/geografische-data/wijk-en-buurtkaart-2009) explains the generalisation and allows republication with CBS and Kadaster attribution. Compared in EPSG:28992 against the union of the fifteen municipal boroughs, the WFS layer contains these discrepancies:

| Candidate | Overlap with Amsterdam municipal archive (m²) | Exact shared boundary (m) |
| --- | ---: | ---: |
| Amstelveen | 39,615 | 0 |
| Diemen | 51,510 | 0 |
| Ouder-Amstel | 56,526 | 0 |
| Haarlemmermeer | 41,043 | 0 |
| Landsmeer | 34,664 | 0 |
| Oostzaan | 21,544 | 0 |

There are also overlaps with Abcoude, Haarlemmerliede en Spaarnwoude, Muiden, Weesp, Zaanstad and Waterland. All twelve candidates have zero exact shared boundary with the municipal Amsterdam union. The Amsterdam municipal union includes 22.998 km² outside the CBS Amsterdam polygon. Conversely, 0.733 km² of the CBS Amsterdam polygon is uncovered by the municipal union and the other CBS municipal polygons in the sample. These figures measure disagreement, without assigning the entire difference to land or water. Check seams and uncovered land against full-resolution data before creating adjacency or assigning colours. In particular, current boundaries incorporate subsequent changes, including Weesp joining Amsterdam in 2022 and Haarlemmerliede en Spaarnwoude merging into Haarlemmermeer in 2019.

Reproduce the comparison by downloading WFS `GetFeature` with `version=2.0.0`, `typeNames=gebiedsindelingen:gemeente_gegeneraliseerd`, `outputFormat=application/json`, `srsName=EPSG:28992`, and `bbox=104000,468000,138000,505000,EPSG:28992`. Run `python scripts/check-amsterdam-municipal-seams.py MUNICIPAL_ARCHIVE.zip WFS_RESPONSE.json`. The bounding box selects entire features. The script rejects mismatched CRS or reference years. The [full-resolution CBS 2010 archive](https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/geografische-data/wijk-en-buurtkaart-2010) is a fallback to compare after checking all intervening changes. The first choice is a full-resolution 2009 Kadaster vector extract with redistribution terms.

For a qualified dataset, add source and vintage metadata and stable feature IDs in configuration, then regenerate the graph and the map from the geometry. The existing runtime already classifies features by IDs and positive-length edges. No municipality-specific code is needed for each added feature.

The seam review in `diagnostics/com-pub-spon-001/seam-review` records the source and rights checks and the measured land/water splits. Its diagnostic overlay preserves both source sets, shows overlaps and unassigned areas, and marks candidate contacts for further evidence. It does not feed the selection graph.

## BUUURT commercial Amsterdam and surroundings · v1

The current Amsterdam map uses `amsterdam-commercial-v1`, a derived coverage of 27 selectable territories. It retains the fifteen historical Amsterdam names and IDs and adds Amstelveen, Diemen and ten neighbouring municipal territories based on the CBS 2009 edition. Duivendrecht is listed with Ouder-Amstel. Badhoevedorp and Zwanenburg are listed with Haarlemmermeer. These localities share their parent territory's selection. Spaarnwoude is the shorter display name for the 2009 Haarlemmerliede en Spaarnwoude footprint.

The source geometries remain separate from the output. The generation and audit details are in `diagnostics/com-pub-spon-001/commercial-v1`. The blue water layer uses CBS land use surveyed in summer 2010. The optional streets mode still uses the official BRT layer at the same camera. Blue water is a visual overlay and has no additional territory ID. The graph uses positive-length common edges in the commercial partition across municipalities and boroughs alike.
