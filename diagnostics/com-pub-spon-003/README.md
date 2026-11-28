# BUUURT bicycle targeting · experimental review

This review adds two library entries. COM-PUB-SPON-003 selects individually eligible wijken. ADM-GEO-003 lets a demo administrator preview and save global thresholds. The previous merchant prototypes remain available. Package prices, impression volumes, duration, commercial copy and the free/sponsored publishing decision remain the existing ones.

## Mapping and data license

The two Amsterdam boundaries are the same municipal CC0 1.0 geometry files already qualified in the [two-level review](../com-pub-spon-002/README.md). There are 110 wijken and 25 gebieden as of 1 January 2026. The wijk is the only selection unit. Gebieden draw a separate, transparent outline layer at the current camera. It never changes bands or selection. The list follows official parent IDs, including the existing Westpoort unassigned heading.

The [Kadaster TOP10NL service](https://api.pdok.nl/brt/top10nl/ogc/v1?f=html&lang=en) is free and CC BY 4.0. It supplied 79,136 road centerlines in the Amsterdam extraction on 28 November 2026. The browser only receives the 110 summary values per fixture, not the raw network. Run `python scripts/fetch-amsterdam-bike-network.py roads.json` and `python scripts/build-amsterdam-bike-times.py roads.json` with curl, Shapely 2.2 and pyproj 3.7.2. The result records the exact input digest. The live PDOK service can change independently across downloads. To reproduce the same vintage, preserve the input export identified by that digest.

## Method

- Build a graph in EPSG:28992 from explicitly bicycle or mixed-traffic centerlines on whitelisted road types. Exclude fast traffic, pedestrian-only roads, ferries and inactive links. Join matching authoritative endpoints at centimetre precision. Interior geometrical crossings alone do not establish a connection. Bridges and tunnels are usable through their represented connections.
- Use modeled speeds of 17 km/h for bicycle links, 15 km/h for mixed traffic and 14 km/h for shared bicycle and pedestrian links. Split each link into intervals at most 20 m long and use their midpoints as road-length-weighted samples. Add a short walking connector from each exact reference point to its nearest graph node. Dijkstra computes travel costs through the graph.
- For each official wijk, use the threshold at which at least half of its sampled road length is reachable. Unreachable samples count in the denominator. Insufficient coverage is classified as grey. This is a length-weighted approximation to intersecting a time catchment with the neighborhood network. A corner crossing alone cannot qualify a wijk.
- At default settings, up to 5 minutes is green and included in the local free area. More than 5 and up to 10 minutes is yellow and initially unchecked. Beyond 10 minutes is grey and uses the geographic extension request. The selected IDs do not affect the colors. Green coverage is implicit and the package list receives only explicitly selected yellow extensions.

Routing estimates are not field-verified journey times. TOP10NL does not provide complete cycling turn, access and one-way rules. The graph uses bidirectional edges and does not model waiting, temporary closures, traffic signals or ferry schedules. OpenStreetMap/Geofabrik and BRouter were considered. The corresponding external endpoints returned network-policy errors from Cloud. A production routing service can use periodically refreshed direction-aware routing with an access profile and fixture-based validation. The Wijk sampling policy can be applied independently of the municipality's available grouping levels.

## Fixtures and configuration

Dolores and Jan Evertsenstraat use the previously approved address coordinates. The Helmersbuurt boundary point, the Brouwersgracht point and the junction case are explicitly fictional. The Helmersbuurt fixture includes both Helmersbuurt and Overtoomse Sluis in green. Jan Evertsenstraat has green wijken in Bos en Lommer and Oud-West, De Baarsjes. At the junction point both Oud-West, De Baarsjes and Centrum-Oost contain all three bands. The canal fixture is routed through the same graph as the other fixtures.

The administrator draft updates only the preview. An explicit Save writes the settings and records demo actor ID, timestamp, global scope, and before/after values. Cancel restores the active settings. Reset previews 5/10 minutes and needs Save. Sliders use whole minutes between 1 and 20 and keep the local limit strictly below the standard limit. The settings resolver supports shop, then city, then global overrides. Only global editing is exposed.

This static review uses a simulated administrator session and same-browser storage. It has no trusted identity provider, shared administrator configuration, or tamper-resistant audit log. A real release needs authenticated administrator checks and history writes on the server. Confirming the demo package freezes the selected wijk IDs, network version and evaluated bands for that campaign in local storage. Viewing the saved campaign is read-only and later threshold changes affect subsequent draft campaigns. Real campaigns need transactional server snapshots and authorization checks, without introducing a migration that recalculates engaged campaigns.

## Verification

Sixteen Node tests passed across the existing geography, previous two-level experiment and bicycle configuration. The official GeoJSON files have no diff. Chromium at 390 × 844, 768 × 1024 and 1364 × 950 covered the library entry, 110 default outlines, three colors, empty initial selection, yellow map/list synchronization, grey extension requests, 25 optional outlines with unchanged camera and colors, FR/NL/EN, touch zoom simulation, drag, recenter, fullscreen, and a simulated 503. It also covered admin entry, threshold constraints, preview, cancellation, save/reload, history, reset preview, the locked campaign after a configuration change, and the new campaign taking the new thresholds. The existing prototypes passed their package round-trip and device-size regressions. Physical hardware, real admin identity, and real production campaign writes are outside this test.

[Merchant mobile](bike-mobile.jpg) · [Merchant desktop](bike-desktop.jpg) · [Admin mobile](bike-admin-mobile.jpg) · [Admin desktop](bike-admin-desktop.jpg)

## Direct surface selection · 2026-11-28

The experimental merchant map now accepts a tap or click over the whole yellow polygon. Individual checkboxes remain in the list. Map labels and check marks are passive. A selected yellow territory keeps its original fill and has a 5 px contrasting stroke. Its check mark appears at the existing interior label point when it fits. Area outlines use a separate non-interactive pane. Double-tap zoom is disabled on the selectable map so two taps can toggle the same territory. Pinch zoom, the zoom buttons and panning remain available.

Chromium assertions exercised actual touchscreen taps and injected single- and multi-touch gestures at 390 × 844, and mouse clicks and drag on desktop. Test coverage includes both views, list synchronization, contrast even when the check mark has no space, removal of the check mark on deselection, prevention of selections during pan or pinch, grey extension access and the package summary. The device was simulated. Data, bike thresholds and package code have no diff.

## Extension request layout · 2026-11-28

COM-PUB-SPON-003 opens the existing request form directly when the merchant chooses a grey zone. The desktop dialog is centered. The mobile sheet follows VisualViewport bounds and uses safe area padding. Its content scrolls independently of the action row, and the 16 px Nunito textarea receives focus only when the merchant enters it. Submit still uses the existing session draft and request rules. Cancel and Close do not save unsubmitted edits.

Chromium checks used iPhone 13 and Pixel 7 emulation, with a simulated 250 px keyboard viewport and a nonzero visual offset, plus desktop at 1364 × 950. They verified opening focus, zone and translations, required-field validation, centering or bottom docking, width, scrolling, action visibility, closing the simulated keyboard without losing input, cancel, close, and request persistence after sending. Native iOS/Android keyboards and in-app iPhone browsers were unavailable. The desktop WebKit binary download was rejected with HTTP 403. Physical-device validation remains pending.

## Dedicated mobile extension page · 2026-11-28

The founder rejected the bottom-sheet release on iPhone. The prior release was confirmed at the remote review repository's main ref (9f4a9f9). Both the regular and versioned GitHub Pages URLs returned a proxy CONNECT 403 from Cloud. The checked-out prior release already specifies a 16 px textarea and a non-text autofocus target, so neither stale assets nor the exact native Safari overflow/zoom trigger could be established here. The prior fixed dialog relied on manual VisualViewport positioning.

Mobile now opens a separate page with normal document flow, safe-area padding, a 16 px textarea, no opening focus, and unrestricted browser zoom. Desktop remains on the request dialog. The new page identifies the chosen zone from the existing dataset and draft, keeps typed text in session storage, and merges the request into the existing draft. The controls, geometry, selections, thresholds and package flow of the map are unchanged.

Chromium at iPhone 13 dimensions, Pixel 7 dimensions, 320 × 568 and 1364 × 950 checked direct navigation, no focus on open, viewport width and scrolling, a reduced-height keyboard surrogate, focus loss and text preservation, reopening, sending, selected-zone persistence, and desktop dialog regression. Physical Safari iOS and iPhone in-app browser validation remain pending. A version parameter on the review link and updated static resource versions distinguish this release from the fixed-sheet version.

## Territory purchase guard · 2026-11-28

The merchant screen has customer-facing targeting copy and a live count. The cycling estimate remains in admin and technical notes. The experimental bike flow requires at least one eligible yellow ID before creating a Budget draft. The Budget route checks the saved draft against the current selection and the published bike-time dataset. It checks again before confirmation. Free areas, pending extension requests, unknown IDs and a cleared selection do not qualify. Previously recorded eligible campaign selections remain tied to their snapshot. The prototype does not process payments.

Seventeen Node tests pass. Chromium on desktop and simulated iPhone verified zero, one and multiple yellow selections, toggling back to zero, a pending extension with zero selected, direct Budget access, replay of an old Budget link after clearing the selection, return from Budget, and valid confirmation. The experimental rate table and map geometry have no diff.

## Geographic extension exchange · 2026-11-28

The mobile request stays a standalone page. The desktop dialog submits to the same workflow. The two demonstrator shops have fixed, separate merchant and shop IDs. A request records shop, merchant, address, category, official wijk ID, optional ad ID, timestamp and the first message. Reopening or resending an in-progress request for the same shop and wijk does not create a second record. The dedicated list links to filtered queues and detail, and the existing header bell reads the workflow's local notices. Clicking a notice marks it read and deep-links to the associated request.

The demo admin can accept, decline or ask a question. Declines and questions require a message. A reply reopens the review and preserves the event history. The detail uses the unchanged official geometry and shop coordinates, with a distinct outline for the requested wijk. The three visible scopes are experimental. Use the library's sample ad link to test the ad-only scope. Without an ad, the ad-only option is unavailable.

The eligibility resolver rechecks the beneficiary, ad (where applicable), status and expiry. A valid grant changes only a grey wijk to eligible yellow for the specified shop/context. It creates no selection. Expiry is checked on the map and rechecked at Budget entry and confirmation. An already engaged campaign retains its original snapshot. The code makes no payment, billing, production, or identity-provider calls.

This is a same-origin, same-browser demonstration in two tabs using localStorage for requests, notifications, grants and audit events and sessionStorage for the explicitly opened demo admin role. Application guards cover invalid transitions, ownership, stale revision and eligibility. Browser storage and the demo role are inspectable and editable. A production integration needs authenticated role/ownership checks, atomic revision-checked writes on the server, durable notifications and an audit trail that merchant accounts cannot alter. Do not import the local browser grants into V1.

Automated checks include 19 Node tests and Chromium browser flows. Browser scenarios cover acceptance with ad-only eligibility, refusal with explanation, clarification and reply followed by acceptance, deep links from the notification bell, the highlighted wijk, duplicates, reloading and scope isolation. Node tests additionally probe unauthorized writes, wrong-shop replies, expired grants, stale decisions and preservation of confirmed snapshot state. Mobile iPhone/Android and narrow viewport tests are simulations. A physical iPhone and real authenticated accounts were not used.

## Conditional extension approval

See the [calibration and technical record](../geo-auto-extension/README.md) for the 28 November decision, aggregate BAG evidence, and review implementation.

The [network accessibility review](../geo-network-zones/README.md) supersedes the automatic extension calibration for active COM-PUB-SPON-003.
