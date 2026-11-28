"use strict";
const fs = require("node:fs");
const path = require("node:path");
const data = path.join(__dirname, "../revue/data");
const times = require(path.join(data, "amsterdam-bike-times.json"));
const evidence = require(path.join(data, "amsterdam-extension-evidence.json"));
const districts = JSON.parse(fs.readFileSync(path.join(data, "amsterdam-levels-wijken.geojson"))).features;
const {geoAutoEvaluate} = require("../revue/buuurt-geo-auto.js");
const grid = [];
for (const percent of [5, 10, 15, 20, 25])
  for (const metres of [250, 500, 750, 1000])
    for (const addresses of [25, 50, 75, 100]) grid.push({percent, metres, addresses});

const header = ["fixture", "district", "code", "median_seconds", "road_metres", "road_percent", "addresses",
  "address_total", "address_snapped", "address_percent", "address_bbox_complete", "simpler_500m_50addresses",
  ...grid.map(({percent, metres, addresses}) => `p${percent}_m${metres}_a${addresses}`)];
const csv = row => row.map(value => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(",");
console.log(csv(header));
for (const fixture of Object.keys(evidence.profiles)) {
  for (const district of districts) {
    const {id} = district;
    const median = times.profiles[fixture].wijken[id].seconds;
    const base = geoAutoEvaluate(evidence, times, fixture, id, 10);
    const {metres, percent, addresses, residentialTotal, residentialSnapped} = base.metrics;
    const outcome = criteria => {
      if (median !== null && median <= 600) return "standard";
      if (criteria) return geoAutoEvaluate(evidence, times, fixture, id, 10, criteria).outcome;
      if (base.outcome === "insufficient") return "insufficient";
      return metres >= 500 && addresses >= 50 ? "automatic" : "manual";
    };
    const covered = evidence.profiles[fixture][id].addressCoverage;
    console.log(csv([fixture, district.properties.buurtnaam, id, median, metres, percent?.toFixed(2),
      covered ? addresses : null, covered ? residentialTotal : null, covered ? residentialSnapped : null,
      covered && residentialTotal ? (100 * addresses / residentialTotal).toFixed(2) : null, covered,
      outcome(), ...grid.map(outcome)]));
  }
}
