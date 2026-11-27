# Territory review · reference-image pass

- [Before, 390 × 844](../mobile.jpg) and [after, 390 × 844](final-mobile.jpg).
- [Desktop](final-desktop.jpg), [yellow deselected plus pink and grey selected with list](final-selection.jpg), [zoom in](final-zoom-in.jpg), [zoom out](final-zoom-out.jpg), [full screen](final-fullscreen.jpg), [return from packages](final-return.jpg), [Graft](final-graft.jpg).
- [Chrome viewport evidence](matrix.json). Sizes are iframe CSS dimensions. Widths recorded inside the iframe may exclude the native scrollbar.

## Decisions and comparison

The official BUUURT header and Nunito are reused. The campaign heading, progress rail, saturated palette, white boundaries, shop pin, left outlined Back button and right pink Continue button follow the supplied reference. The rail uses the existing order: Post, Territory, Budget, Review. The legend stays below the map because an inset legend would cover selectable polygons. Background scenery, device frame and schematic geography were excluded.

The mobile check still shows a readability gap relative to the reference. At 390 × 844 the measured initial view displayed two full names and five selected map checkboxes. At 320 × 568 and 375 × 667, the official full names only fit after zooming or in the list for the tested initial view. Placement tries alternative widths and interior offsets, checks the actual SVG polygon fill, and avoids controls, labels and the shop marker. A yellow checkbox retains its official accessible name when its text needs more space. Names remain available in the category-labelled list.

## Implementation and provenance

The Amsterdam snapshot is byte-identical to the previous commit. The 117 Graft geometries match the previously qualified CBS 2025 archive coordinate-for-coordinate. Both datasets use CC BY 4.0 attribution. The [generator](../../../scripts/build-sponsor-geography.py) computes shared boundaries using the PDOK EPSG:28992 shapes, ignoring point-only contact. Geometry is never enlarged or repositioned. Topology is generated offline once per snapshot; containment, graph traversal, and fit bounds use the current supplied coordinates. The static review supplies known BAG coordinates from GEO-06. Amsterdam and Graft default to five direct neighbours, matching the GEO-02 qualification. Pink counts are 9 and 8. Amber defaults are for review. Production uses service-provided identity, geocoding and eligibility.

The two region payloads are fetched on demand. The raw Amsterdam geometry and graph total 192,830 bytes, Graft 927,074 bytes. Label updates are coalesced to an animation frame after map movements. No bandwidth throttling or memory benchmark was collected.

The review saves the merchant key, location, home and selected stable codes, classified bands and extension reasons per profile. Continue carries the current language and prior query context to packages. The authenticated V1 OFF/ON gate, geocoder, publishing draft, live capacity and any GEO-IA recommendations need V1 integration. The separate GEO-06 experiment is historical evidence, with its own fixture inventory. No Scrutiny or User-Testing verifier was available for an independent review in this session.

## Acceptance grid

| ID | Status | Evidence |
| --- | --- | --- |
| GEO-01 | Blocked | Archived BAG coordinates used for two profiles. Live merchant geocoder unavailable. |
| GEO-02 | Passed | Amsterdam BU0363EM02 and Graft BU03611002 via containment. |
| GEO-03 | Passed | Five direct neighbours per address, codes match the archived qualification. |
| GEO-04 | Passed | Graph traversal gives 9 and 8 second-ring codes. |
| GEO-05 | Passed | Remaining 137 and 103 available snapshot neighbourhoods are grey. |
| GEO-06 | Passed | Checked archived geometry equality and preserved mapping scale. |
| UI-01 | Passed | The capture uses the supplied palette; borders are white. |
| UI-02 | Failed | Initial full-name density on small screens remains below reference. |
| UI-03 | Passed | Five map selections at 390 px, four at the two smallest widths. |
| UI-04 | Passed | Checked the 390 × 844 and desktop captures for visible overlaps. |
| UI-05 | Passed | Shared header and official asset visible. |
| UI-06 | Passed | Continue opens packages and Back restores territory. |
| SEL-01 | Passed | Five initial selections from the existing review rights on each profile. |
| SEL-02 | Passed | Yellow checkbox deselection observed. |
| SEL-03 | Passed | Pink selected from the list. |
| SEL-04 | Passed | Trompbuurt selected via its grey dialog. |
| SEL-05 | Passed | SVG fill list identical before and after selection changes. |
| SEL-06 | Passed | One checkbox click toggled the state once. |
| SEL-07 | Passed | Map click updated the list; list selections share the same state. |
| MAP-01 | Passed | Zoom-in button and capture. |
| MAP-02 | Passed | Zoom-out button and capture. |
| MAP-03 | Not run | No drag assertion collected in this pass. |
| MAP-04 | Passed | Recentre exercised with a modified selection, which remained present when transferred. |
| MAP-05 | Passed | Fullscreen exercised with a modified selection, which remained present when transferred. |
| MAP-06 | Passed | Zoom captures show names appearing at higher zoom. |
| MAP-07 | Not run | Native touch gestures were not exercised. |
| PERS-01 | Not run | Static viewport matrix only. |
| PERS-02 | Passed | French to English with edited selection preserved. |
| PERS-03 | Passed | Package round trip retained the yellow deselection and non-contiguous grey selection. |
| MOB-01 | Passed | 320 × 568 and 375 × 667 loaded and had no horizontal overflow in Chrome. |
| MOB-02 | Passed | 390, 393 and 430 px portrait plus 844 × 390 landscape in Chrome. |
| MOB-03 | Passed | 768 × 1024 Chrome viewport. |
| MOB-04 | Passed | 1280 × 800 and 1440 × 900 Chrome viewports. |
| INT-01 | Passed | Both review profiles transferred selection by stable code to packages. |
| INT-02 | Blocked | Photo context passed through the static route. Authenticated draft service unavailable. |
| INT-03 | Blocked | Administrative OFF gate belongs to V1 and is unavailable in static review. |
| ERR-01 | Blocked | Missing/ambiguous geography covered by local tests. Live address geocoding unavailable. |
| ERR-02 | Not run | Fetch error handling implemented. Network failure was not injected. |
| REG-01 | Passed | Free confirmation still opens. |
| REG-02 | Passed | Changes scoped to the sponsored screens and their library entry. |

Six Node tests passed with both BAG profiles, actual interior points of narrow and wide districts, an actual boundary vertex, missing coordinates, an out-of-window coordinate, missing geometry, and missing neighbour data. Run `node --test scripts/test-sponsor-geography.cjs` from the repository root.

## Verification and publication

The previous version is available at commit `9565a92`. This revision is on PR #16 for founder review. In the Cloud desktop open the running local library, select **Choix du territoire sponsorisé**, and choose districts then **Continuer**. The next page is the existing package and duration review. The repository's library entry is available on the PR branch. An authenticated HTTP preview portal was unavailable. The main library URL cannot serve this revision until approved publication. Before V1 release, verify actual account/draft data, OFF/ON and rights with the sponsored service, obtain native touch and independent verification, and confirm small-screen name density with the founder.
