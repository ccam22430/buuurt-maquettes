# COM-PUB-SPON-001 review and acceptance evidence

## Scope

The 27 November CCFD addendum and [issue 11](https://github.com/ccam22430/buuurt-maquettes/issues/11) define the four map colours, boundary-only display, review flow, and grey-neighbourhood dialog. This review page reuses the existing official header and logo, Nunito theme, Leaflet 1.9.4, and the GEO-06 Amsterdam pilot. The returning links preserve the incoming announcement context. In the static library, the draft and extension reasons use per-tab session storage. The review summary stops before confirmation. The browser never grants delivery permissions or sends requests to administrators.

GEO-06 and GEO-07 in [buuurt-V1](https://github.com/ccam22430/buuurt-V1/tree/fe13569dfabc1f020b60e4564a82266a10b69a40/app/sponsor) provide the demo profile and direct-neighbour test rights. The V1 module remains a separate server-based experiment with fictitious inventory, an OFF/ON switch, and revocable fixture rights. The HTML library has no connected administrator, merchant identity, live capacity, or GEO-IA service. Its sponsored route is for review. The V1 OFF/ON contract remains an acceptance item for application integration. Zone colours encode geographic bands. The selected set records geographic intent, including pink and grey neighbourhoods. The five yellow defaults reflect existing test permissions. The grey explanation reports the measured geographic band and the absence of an actual GEO-IA assessment, without attributing the decision to activity, capacity, or coverage.

## Geographic evidence

- Pilot BAG point 0363200000145991, Jan Evertsenstraat 55-H, Amsterdam. WGS84 position [52.3707909, 4.8556261] and RD point (118798, 487123), reused from [the GEO laboratory qualification](https://github.com/ccam22430/buuurt-maquettes/blob/1380c234074dbcf01a87a004757c8b0c6bf7d89d/lab/geo/reference/qualification.json).
- CBS/Kadaster 2025 neighbourhoods via [PDOK](https://api.pdok.nl/cbs/wijken-en-buurten-2025/ogc/v1/collections/buurten/items), CC BY 4.0. Query bbox 4.83,52.35,4.89,52.39 with both pages in CRS84 and EPSG:28992. All 152 CRS84 geometries match the archived GEO laboratory coordinates exactly by CBS code. Local data changes are limited to identification and label/classification metadata. The dataset is scoped to the pilot window.
- RD point containment identifies Balboaplein e.o. (BU0363EM02). The GEO laboratory rule measures positive shared boundary length in EPSG:28992, excluding point-only contacts. The exact five lengths agree with GEO-02/GEO-03 and their codes agree with GEO-06. The algorithm reapplies that rule to each yellow neighbour for the second ring, then removes the home and direct neighbours. The GeoJSON records each tested positive length and the input archive hash.
- Counts by band are 1 green, 5 yellow, 9 pink, 137 grey. No tile layer is defined or rendered. A Leaflet vector marker identifies the shop position.

| Direct neighbour | CBS code | Common boundary |
| --- | --- | ---: |
| Jan Maijenbuurt | BU0363EK03 | 242.716 m |
| John Franklinbuurt | BU0363EK04 | 202.456 m |
| Orteliusbuurt-Midden | BU0363EM01 | 406.255 m |
| Columbusplein e.o. | BU0363EM04 | 412.079 m |
| Filips van Almondekwartier | BU0363EN01 | 301.200 m |

## Executed checks

| Area | Result |
| --- | --- |
| Data and internet | Official PDOK 2025 endpoint returned HTTP 200. Both paginated coordinate systems were read. IDs and all 152 geometries were verified against the laboratory archive. |
| Desktop Chromium | 152 polygon paths and one shop marker in the DOM, zero tile elements. Five selected yellow neighbourhoods on first load. Successful click and toggle on a visible map checkbox. |
| Map controls | Zoom-out reduced the visible label count after animation, recenter and full-screen toggle succeeded. Mobile-width frame also exercised zoom-in and recenter. |
| Draft and language | French and English change in place with selection intact, Dutch rendering at 390 px. A deselected area persisted, duration of 14 days reached the summary, and a grey-neighbourhood extension reason was recovered after reload. |
| Entry and back | Free option still opened its confirmation. Sponsored option opened this page from COM-PUB-002. Back returned to the same publication language and carried the photo context. |
| Brand and layout | Browser captures show the reused logo, circled navigation/notification controls, language globe, and pink theme. 390 px frame measured 375 px layout width with vertical scrollbar and no horizontal overflow. |
| Technical checks | JS syntax and Git whitespace checks passed. Three existing GEO-06 inventory tests passed in the separate V1 fixture. |

The mobile capture is desktop Chromium in a 390 × 844 embedded viewport. It verifies responsive rendering. The browser tests used synthetic review inputs. Native Safari iOS and Chrome Android, two-finger zoom, orientation changes, wheel and drag coverage, and broader cross-library regression remain open. GEO-IA recommendations, live authorisation and capacity, administrative workflow, and an authenticated end-to-end announcement flow require application integration and their own acceptance checks.

Chromium launched directly from the shell was blocked by the managed sandbox helper. The managed Chrome desktop rendered the review with browser protections enabled. During implementation, the first rendering failed because vector layers were added before Leaflet had initialised its view. Initialising the view first resolved the error. Accessibility testing identified checkbox decoration leaking into accessible names. Explicit names fixed the checkbox locator and preserved the official neighbourhood name for assistive technology.

## Review and publication handoff

1. Check out the PR branch and run `python -m http.server 8765` from the repository root.
2. Open `http://127.0.0.1:8765/revue/index.html`, then open **Paramétrage sponsorisé**. Open `/revue/com-pub-spon-001.html` directly to review the default Dutch version.
3. Compare [desktop](desktop.jpg) and [mobile](mobile.jpg), deselect a yellow zone, zoom or pan, then change language. Open a grey zone, save a test reason, and reopen it after reloading in the same tab.
4. From COM-PUB-002, verify both publication choices. In sponsored review, verify budget, territory, duration, and recap. Test touch on Safari iOS and Chrome Android before accepting mobile behaviour.
5. Obtain founder validation before merging to the branch used by the visual library. After the authorised merge, check the library link and GeoJSON on its normal host. Keep application rollout subject to separate V1 authorisation, capacity, and GEO-IA integration and acceptance.
