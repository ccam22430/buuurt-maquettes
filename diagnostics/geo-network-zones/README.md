# Bicycle accessibility and sponsored extensions

COM-PUB-SPON-003 remains the review entry point. The earlier automatic percentage/metres/address rules are archived. A new request is pending until reviewed by Super Admin. Previous grants without an explicit cycling threshold remain in request history and are not converted into orange permissions. Existing purchased records retain their snapshots.

## Feasibility and sources

- Amsterdam's official wijk/gebied files (CC0 1.0) remain exactly as in COM-PUB-SPON-003. Their boundaries are independent of the time overlay. [Municipal source](https://maps.amsterdam.nl/gebiedsindeling/)
- The selected source is the existing TOP10NL Kadaster/PDOK road-centreline export (CC BY 4.0). The build checks the road snapshot SHA-256 against the existing bike model. This option has no hosted dependency and retains comparability with the previous route estimates. [TOP10NL](https://api.pdok.nl/brt/top10nl/ogc/v1?f=html&lang=en)
- BAG is useful to validate origin addresses but does not describe routable cycling edges. OpenStreetMap can add directional restrictions, access tags and useful crossing detail (ODbL 1.0, with attribution and share-alike obligations for derived databases). Self-hosted Valhalla or openrouteservice can provide more detailed bicycle routing and cost contours, at the cost of building, validating and updating a routing service. No external routing or inference bill is introduced in the prototype. [OpenStreetMap licence](https://www.openstreetmap.org/copyright) · [Valhalla](https://github.com/valhalla/valhalla) · [openrouteservice](https://github.com/GIScience/openrouteservice)

## Geometry and comparison

Dijkstra uses the existing bicycle edge topology, excluding ferries and unsupported road usages. Edge speeds are 14–17 km/h by usage. A 5 km/h approach cost applies to a nearby network connection. The visual accessibility layer assigns an 80 m cell to its shortest reachable minute band using the nearest graph node within 65 m of the cell centre, then intersects the disjoint cells with the exact official administrative polygons in EPSG:28992. Minutes round up for display binning. Unassigned cells remain grey and can reflect missing routing evidence as well as distance. The grid can bridge narrow barriers on screen. The network model is bidirectional, omits turn penalties, temporary closures and some one-way rules, and does not establish field-verified times.

```sh
PYTHONPATH=/path/to/python-dependencies python scripts/build-amsterdam-network-zones.py /path/to/existing-roads.json
```

Dolores, area in km², rounded. The original whole-district classification is in the second column. From 10 to 15 minutes, these areas only turn orange under a matching authorization.

| Wijk | Old band / median | 0–5 min | >5–10 min | >10–15 min | >15–20 min |
| --- | --- | ---: | ---: | ---: | ---: |
| Landlust | Grey / 10:06 | 0 | 0.476 | 0.591 | 0 |
| Centrale Markt | Grey / 10:47 | 0 | 0.206 | 0.314 | 0 |
| Erasmuspark | Yellow / 8:35 | 0 | 0.310 | 0.025 | 0 |
| Van Galenbuurt | Yellow / 6:40 | 0.003 | 0.291 | 0 | 0 |
| Chassébuurt | Green / 3:30 | 0.276 | <0.001 | 0 | 0 |
| Hoofdweg e.o. | Green / 4:20 | 0.286 | 0.134 | 0 | 0 |
| All Amsterdam | — | 2.374 | 9.203 | 15.360 | 19.206 |

Jan Evertsenstraat, same method: 2.394 / 8.877 / 15.379 / 18.248 km² across the four intervals. Its Landlust distribution is 0.218 / 0.843 / 0.006 / 0 km² and Centrale Markt 0.019 / 0.407 / 0.094 / 0 km². The smaller change from 15 to 20 minutes within specific nearby districts does not imply the global extension is small. Rural performance remains unmeasured. A sparse or disconnected network produces more unassigned cells, so the same grid cannot be used to infer service capacity in rural areas.

## Decision, delivery, capacity and price

The optional orange authorization uses the maximum applicable active threshold. A targeted grant applies only to the named wijk, a global grant to the advertiser, and neither alters the free or standard limits. The review supports durable, ad-only and dated authorization, with audit and revocation. Its administrator map previews additional modelled surface. Actual partner counts and reliably observed inventory for those surfaces are unavailable. The marketing advice and 50% default are experimental. No automatic decision and no paid AI are used.

The delivery classification function takes a route duration from the advertiser to the scanned partner's known position together with its official wijk. Nothing uses the resident GPS or polygon fill for actual eligibility. Published partner inventory is simulated using stable sample points on the real network, not actual partner businesses or visits. The flow assigns a sample opportunity a physical ID stable across advertisers and consumes its daily inventory once. Free and unavailable opportunities never enter the paid reservation. Legacy whole-wijk orders are conservatively deducted from each eligible subdivision where precise attribution is unavailable. Legacy cross-district shared estimates are excluded from the subdivided inventory. The existing margin, same-shop quota, locking and reservation check apply. Implementing this in the live feed still requires an authenticated routing adapter, official partner coordinates, a durable shared inventory and the existing QR priority policy at delivery time.

Recommended mixed quote for review: apply the existing volume curve once to the total and a percentage surcharge to only the orange share of that base, rounded to the cent. This preserves degressivity across both categories, and is easier to explain than two independent price curves with two volume minimums. A second option is two separately priced volumes, which can overcharge a small orange component and change minimums. The prototype uses an explicit orange volume slider and checks availability per category before binding the quote. At 1,200 displays with 400 orange and 50% uplift, 30 EUR becomes 35 EUR. Fully orange references are 22.50, 45 and 75 EUR. Price, per-category quantities, eligible territories, and authorization version are snapshotted. Confirm the proposed multiplier, mixed price method, and customer advice before production. No fiscal rules were changed.

## Verification

The Node suite covers exact time boundaries, real mixed coverage, multiple grants and revocation, stable inventory, separate category reservation, price and historical behaviour. Chromium exercised COM-PUB-SPON-003 on desktop and iPhone emulation, including the green notice, viewing the two administrative levels, fullscreen, zoom and recenter, selecting yellow and orange separately, a manual request, targeted and global preview, approval, Budget and return, revocation, and FR/NL/EN. Leaflet was loaded from its pinned CDN dependency by the browser harness. No physical phone, field cycling run or production feed was used.
