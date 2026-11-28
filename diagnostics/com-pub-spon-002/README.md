# COM-PUB-SPON-002 · Amsterdam two-level experiment

The experiment has a separate page, library entry and draft namespace. It uses the same publishing flow and the same package page and commercial values. The fixture has an independent draft.

## Official snapshot

The source is the [Amsterdam municipal division map](https://maps.amsterdam.nl/gebiedsindeling/) and its [municipal dataset catalogue](https://data.overheid.nl/dataset/5l2csm77flzgya), CC0. The municipal history ZIP supplies `GBD_ggw_gebied_ActueelEnHistorie.csv` and `GBD_wijk_ActueelEnHistorie.csv`. Export `scripts/build-amsterdam-levels.py ARCHIVE.zip` with Shapely and pyproj. It selects the records active on 1 January 2026 and preserves all polygon vertices, transforming RD (EPSG:28992) to WGS84 for Leaflet. Shared boundary edges are measured in RD. The inputs contained no overlap above 0.01 m² at either level.

The official foreign key validates 108 out of 110 wijk assignments. Coenhaven/Minervahaven and Havens-West belong to Westpoort and have no gebied in the archive. They appear under a clearly marked unassigned heading and retain their official individual outlines. The source outlines of Noord-West and Oud-Noord each differ by 1,389,680.64 m² from the union of their assigned wijken. The other 23 gebieds matched their child union to measurement precision. This experiment preserves the official geometry and relationship independently. The higher-level checkbox always controls the assigned eligible wijk IDs.

## Selection and proximity

The only persisted geographic selections are unique wijk IDs. The home wijk is implicit. No additional wijk starts selected. Standard bulk selection applies the wijk-level rule independently of the area recommendation and excludes grey wijken. Grey areas and wijken use the existing explanatory dialog and optional extension request. An individually selected grey wijk remains in the parent state and can be cleared with the parent. The geographic colours never follow checkbox state.

The default point is the official Dolores BAG position. It falls in Van Lennepbuurt and the official gebied named Oud-West, De Baarsjes. A separate fictitious fixture lies in Helmersbuurt, 18.67 m from Overtoomse Sluis in RD. For this point Overtoomse Sluis and Jordaan are first-ring wijken, while Centrum-West and Centrum-Oost are first-ring gebieden. Several De Baarsjes wijken are in the second ring. The selection does not infer that every wijk in a first-ring gebied is eligible. Distance from the marker to each boundary orders features within the same band, without introducing an eligibility threshold or an AI claim.

## Next integration checks

The dataset interface separates levels, stable IDs, optional parent relationships and geometry-based adjacency. A Dutch municipality can supply a single level, an official hierarchy or no compatible lower-level units. Nationwide rollout needs a source and hierarchy policy per municipality, plus product approval of each published policy. The present build has Amsterdam input paths only. Before production, validate the two northern discrepancies and the grey-area policy with product and geographic owners and connect any real eligibility or capacity services through an explicit rule interface.

## Review results · 2026-11-28

Twelve Node tests cover the existing geography and the experimental source linkage, both reference points, bulk selection, partial states and deduplication. Chromium review at 390 × 844, 768 × 1024 and 1364 × 950 covered opening the experimental library link, FR/NL/EN, 25/110 map layers, default empty selection, list and map selection, mixed parent, switching and language persistence, zoom and pan, recenter and fullscreen, package navigation and return, isolated fictional fixture, and a simulated GeoJSON HTTP 503. The narrower layouts stack the map and list. The desktop layout shows both side by side. These checks do not include physical mobile hardware.

Screenshots: [mobile](levels-mobile.jpg), [tablet](levels-tablet.jpg), [desktop](levels-desktop.jpg), and [desktop wijken](levels-wijken-desktop.jpg).
