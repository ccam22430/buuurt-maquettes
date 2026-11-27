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

Open [COM-PUB-SPON-001](com-pub-spon-001.html?lang=fr) from the library. Choose **Carte avec rues** to add the official BRT street basemap or open the [street view directly](com-pub-spon-001.html?lang=fr&reference=streets). Both modes draw the same CBS geometry and BAG marker through a single Leaflet map. Switching preserves the camera, marker and selection. The street view changes stroke contrast and fill opacity to make the street names readable.
