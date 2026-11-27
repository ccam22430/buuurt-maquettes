"use strict";

const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const {test} = require("node:test");
const {classifySponsorTerritory, reviewProfiles} = require("../revue/com-pub-spon-geography.js");

const load = (region, extension) =>
  JSON.parse(readFileSync(join(__dirname, "../revue/data", region + "-cbs-2025" + extension)));

for (const [region, expectedHome, expectedSecond] of [
  ["amsterdam", "BU0363EM02", 9], ["graft", "BU03611002", 8]
]) {
  const {features} = load(region, ".geojson");
  const {neighbors} = load(region, "-neighbors.json");
  const {center} = reviewProfiles[region];
  test(region + " official address, direct neighbours and second ring", () => {
    const result = classifySponsorTerritory(center, features, neighbors);
    assert.equal(result.home, expectedHome);
    assert.equal(result.direct.length, 5);
    assert.equal(Object.values(result.bands).filter(band => band === "second").length, expectedSecond);
    assert.equal(Object.values(result.bands).filter(band => band === "other").length,
      features.length - expectedSecond - 6);
  });
  test(region + " small and large polygons are classified from their real interior points", () => {
    const ranked = features.filter(feature => neighbors[feature.id].length)
      .sort((a, b) => a.properties.clearance - b.properties.clearance);
    for (const feature of [ranked[0], ranked.at(-1)]) {
      const result = classifySponsorTerritory(feature.properties.label, features, neighbors);
      assert.equal(result.home, feature.id);
      assert.deepEqual(result.direct, neighbors[feature.id]);
    }
  });
  test(region + " invalid or ambiguous inputs fail explicitly", () => {
    const [lng, lat] = features[0].geometry.coordinates[0][0][0];
    assert.throws(() => classifySponsorTerritory(null, features, neighbors), /coordinates/);
    assert.throws(() => classifySponsorTerritory([0, 0], features, neighbors), /territory/);
    assert.throws(() => classifySponsorTerritory([lat, lng], features, neighbors), /boundary/);
    assert.throws(() => classifySponsorTerritory(center, [{geometry: null}], neighbors), /geometry/);
    assert.throws(() => classifySponsorTerritory(center, features, {}), /neighbors/);
  });
}
