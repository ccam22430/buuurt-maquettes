# Conditional geographic extension review

## Decision and calibration

COM-PUB-SPON-003 is the only active review baseline. The [founder's latest decision](https://github.com/ccam22430/buuurt-maquettes/issues/17#issuecomment-7238951841) approves immediate selection after an explicitly requested automatic extension. Manual approval continues to leave the new district unselected.

[Calibration matrix](calibration.csv) compares all 80 combinations at 10 minutes for 110 districts and each reference shop. It also reports the simpler 500 m + 50 addresses rule, absolute and relative counts, and BAG coverage. A blank median means fewer than half of the sampled road metres could be reached on the modelled graph. A blank address metric means the acquisition box cannot establish full district coverage.

| Dolores district | Median | Reachable roads | Road share | Reachable addresses | Review at 10% / 500 m / 50 |
| --- | ---: | ---: | ---: | ---: | --- |
| Landlust | 10:06 | 13,355 m | 47.60% | 4,824 | Automatic after submission |
| Centrale Markt | 10:47 | 3,671 m | 45.28% | 622 | Insufficient quality, manual |
| Erasmuspark | 8:35 | 9,036 m | 98.71% | 3,052 | Already yellow |
| Van Galenbuurt | 6:40 | 6,685 m | 100.00% | 3,195 | Already yellow |
| Chassébuurt | 3:30 | 5,342 m | 99.99% | 2,933 | Already green |

| Thresholds | Dolores additional automatic candidates | Jan Evertsenstraat additional automatic candidates |
| --- | ---: | ---: |
| 5% / 250 m / 25 | 8 | 9 |
| 10% / 500 m / 50 | 8 | 7 |
| 15% / 500 m / 50 | 7 | 7 |
| 20% / 750 m / 75 | 4 | 7 |
| 25% / 1,000 m / 100 | 3 | 7 |
| 500 m / 50, without percentage floor | 8 | 9 |

For review, retain **10% / 500 m / 50** with a **90% address-to-network attachment quality floor**. The two absolute thresholds protect against marginal road crossings and sparse residential service. The relative threshold catches cases such as the pilot’s De Weteringschans (7.92%, 1,389 m, 261 addresses) and Museumkwartier (6.52%, 2,096 m, 109 addresses) where a meaningful absolute count still represents a small share of a district displayed at full extent. Conversely, narrowly increasing the percentage excludes Dolores’s Slotervaart-Noord (10.50%, 2,777 m, 412 addresses) at 15%. A partial district with substantial residential reach should ultimately be reviewed against actual journey samples and QR distribution. No thresholds are proposed as definitive on the strength of two references.

Centrale Markt has 1,088/1,245 address points attached (87.39%). Burgwallen-Nieuwe Zijde has eligible roads near canals but attaches only 2,146/3,099 points. This makes both manual cases and illustrates why the system cannot infer full neighbourhood service from a route line alone. At the reference thresholds, 53 districts for Dolores and 51 for Jan Evertsenstraat have insufficient evidence, including districts outside the local BAG acquisition box.

## Sources and method

- [Municipal Amsterdam boundaries](https://maps.amsterdam.nl/gebiedsindeling/) (CC0), same wijk IDs and geometry as the existing map.
- [PDOK Kadaster TOP10NL](https://api.pdok.nl/brt/top10nl/ogc/v1?f=html&lang=en) (CC BY 4.0), identical road snapshot and SHA-256 as the current map. The weighted-median bands are not recalculated or recoloured by this feature until an explicit request is approved.
- [PDOK BAG WFS](https://www.pdok.nl/ogc-webservices/-/article/basisregistratie-adressen-en-gebouwen-ba-1), [government open data licence CC0](https://data.overheid.nl/dataset/basisregistratie-adressen-en-gebouwen--bag-). Retrieved on 28 November 2026 in 1 km tiles within EPSG:28992 bounding box 115000,481000,127000,492000. Uses active residential-use occupation objects as a proxy for addresses, deduplicated by postal code, street, number, letter and suffix. No individual residential points or identifiers are published.

Reuses the existing Dijkstra graph, topology and estimated cycling speeds. Assigns each roughly 20 m sampled usable road segment to its midpoint wijk. Uses the nearest graph node for each residential point only within 30 m, with a 5 km/h connector cost. It does not skip to a farther road when the nearest connection is unreachable. Cumulative minute bins retain the distribution at the exact integer thresholds supported by Super Admin. The numerator is floored in metres before the comparison. The gate also requires district coverage by the acquisition box, a valid road snapshot hash and 90% of BAG points attached. Address counts do not represent population. Endpoint topology, route direction, temporary closures, and pedestrian approaches to doors have limitations. A short off-network connector may still cross an unmapped barrier. No field routes were timed. Restrict real activation to field-validated and service-validated data.

Rebuild with the existing TOP10NL road export and Python with Shapely and pyproj:

```sh
python scripts/fetch-amsterdam-residences.py /tmp/amsterdam-residences.json
python scripts/build-amsterdam-extension-evidence.py /tmp/roads.json /tmp/amsterdam-residences.json
node scripts/calibrate-amsterdam-extension.cjs > diagnostics/geo-auto-extension/calibration.csv
```

## Review implementation

The existing Super Admin saves experimental thresholds with the geographic configuration audit history and previews gray districts at the current time threshold. Submission records the thresholds, metrics, dataset version and origin. Approval grants a revocable demo shop-level right. Removing a selection leaves that right in place. Any administrative refusal or revocation for the shop and district inhibits future automatic approval and routes the next submission to manual review. Previously purchased campaigns retain their geographic snapshot. The authorized district enters Budget through the existing selection filter and capacity engine. No commercial parameters or inventory rules are changed.

All rights and evidence are evaluated in the static review browser. Production requires authenticated users and administrator roles, canonical geographic inputs on the server, a transactional request and grant, and durable audit storage. No production release or payment is part of this review.

## Verification

28 Node tests passed. Chromium passed on desktop and mobile with iPhone dimensions and touch emulation. The browser scenario verified both confirmation actions, refreshed the receipt, switched FR/NL/EN, preserved another territory, reselected the authorized district, reached Budget with both territories, returned and retained the selection, verified Centrale Markt still required a decision, and changed the percentage to see the Super Admin preview recalculate. Separate model tests verify the revoke/reapply block and validation when the evidence is missing or marginal. There was no physical phone or field cycling test.
