# Sponsored publication V1 review

## Commercial acceptance criteria

The issue [#17](https://github.com/ccam22430/buuurt-maquettes/issues/17) defines the initial launch hypotheses: 30 active businesses, 25 QR codes, 3,000 valid scans, 30 days of history, 10,000 sellable screen displays, a 30% safety margin and a cumulative 10% cap per business. The workshop defaults to sales disabled. Its Super Admin can explicitly enable the simulation. A strategic recommendation never activates sales or changes settings.

Budget requires at least one currently authorized and selected additional territory. It recalculates for the chosen 3, 7, 14 or 30 days, on return and before confirmation. The seller may select the maximum if it falls between slider increments. An invalidated quote requires explicit correction. The top Back link keeps the territory, duration and volume. The duration is indicative and the purchased count is guaranteed. The advertisement expires independently of the sponsored campaign.

## Forecast and accounting

The fixture supplies estimated paid display opportunities by inventory pool and UTC day, plus coverage and commercial readiness indicators. A QR scan, a feed visit and a delivered display are separate signals. A forecast requires sufficient history and uses known display opportunity estimates, never treating scans as delivered displays. Shared pool/day opportunities are counted once. Existing commitments and unexpired holds reduce capacity. The safety margin rounds down after deduction. The business cap is floored against the safe pool/day inventory before subtracting its own cumulative commitments, including those from other advertisements on overlapping dates or territories. The quote is bounded by capacity and the last pricing anchor.

The experimental tariff interpolates the total in cents between 500/€15, 1,200/€30 and 2,500/€50, with a second configurable interpolation option based on unit price. Values outside the configured anchors are not sold. New settings apply to future quotes. Confirmed orders retain their purchased volume, amount, duration and territory snapshot.

The static demo serializes reservations with an origin-scoped Web Lock, rechecks the quote and commits the order to browser storage. Holds expire after ten minutes. No payment is taken. The lifecycle simulation counts idempotent delivery events up to the purchased count, extends an underdelivered valid campaign for free, and stops an expired advertisement. Refund proposal = paid cents × undelivered displays ÷ purchased displays, rounded to the nearest cent, half up. Refund is the default. Credit requires a merchant choice, followed by administrative processing. No territory extension is applied automatically.

## Additional review surfaces

Settings include pending changes, reset, save and history. The commercial dashboard shows territory capacity, commitments and insufficient-history checks. The campaign dashboard shows delivery progress, prolongation and refund or credit handling. Strategy uses local statistical rules and records an administrative decision. Its daily check runs when the review interface is opened. The bell, email preview and territory demand signals are simulated. Resident coverage scenarios, attachment suggestions and consent are isolated from the validated Amsterdam map. Pioneer attachment, the one-sponsored-slot-per-three policy and shadow counters are modelled for evaluation.

## Verification and remaining V1 work

- Automated suite: 25 passing Node tests, including overlapping quota, shared inventory, insufficient history, pricing, expiry and prorated refunds, and geographic and shadow scenarios.
- Chromium: desktop, tablet and a touch-emulated mobile viewport exercised duration, slider, retained choices on Back, NL/EN, settings activation, simulation of purchase, delivery, extension, expiry, credit and strategic notice.
- Chromium: two tabs attempted conflicting reservations. Exactly one succeeded through Web Locks.
- Physical iPhone and Android remain outside this run.

Before V1 integration, validate the tariff formula and fiscal rounding, establish sufficient observation history, and connect authorized settings, campaign snapshots and outbox notifications to authenticated application services. Use server-side inventory transactions, expiring holds, idempotent payment and refund operations, and daily strategy jobs. Define aggregated event retention and consent before real collection. The static review only stores demo state in the current browser. It has no cross-account persistence, real email, settlement or operating AI service. The validated geographic rules and map remain the source for the existing merchant flow.
