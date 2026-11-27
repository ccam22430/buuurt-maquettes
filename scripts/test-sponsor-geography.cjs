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


test("Dolores BAG address uses the official Borgerbuurt topology", () => {
  const {features} = load("amsterdam", ".geojson");
  const {neighbors} = load("amsterdam", "-neighbors.json");
  const result = classifySponsorTerritory(reviewProfiles.dolores.center, features, neighbors);
  assert.equal(result.home, "BU0363ES02");
  assert.deepEqual(result.direct.sort(), [
    "BU0363EP02", "BU0363ES01", "BU0363ES03", "BU0363EU01", "BU0363EU02"
  ]);
  assert.deepEqual(Object.keys(result.bands).filter(code => result.bands[code] === "second").sort(), [
    "BU0363AB09", "BU0363EN03", "BU0363EN04", "BU0363EP01", "BU0363EQ01",
    "BU0363ER02", "BU0363ET01", "BU0363EU03", "BU0363EV01", "BU0363EV02"
  ]);
});

test("Dolores uses the fifteen municipal territories at 2009-01-01", () => {
  const base = join(__dirname, "../revue/data", reviewProfiles.dolores.dataset);
  const {features} = JSON.parse(readFileSync(base + ".geojson"));
  const {neighbors, overlapSquareMetres} = JSON.parse(readFileSync(base + "-neighbors.json"));
  const result = classifySponsorTerritory(reviewProfiles.dolores.center, features, neighbors);
  const names = band => features.filter(f => result.bands[f.id] === band).map(f => f.properties.buurtnaam).sort();
  assert.equal(features.length, 15);
  assert.equal(new Set(features.map(f => f.id)).size, 15);
  assert.deepEqual(names("home"), ["Oud-West"]);
  assert.deepEqual(names("direct"), ["Centrum", "De Baarsjes", "Oud-Zuid", "Westerpark"]);
  assert.deepEqual(names("second"), ["Bos en Lommer", "Noord", "Oost-Watergraafsmeer", "Slotervaart",
    "Westpoort", "Zeeburg", "Zuideramstel"]);
  assert.deepEqual(names("other"), ["Geuzenveld-Slotermeer", "Osdorp", "Zuidoost"]);
  assert.equal(overlapSquareMetres.length, 5);
  const districtIds = Object.fromEntries(features.map(f => [f.properties.buurtnaam, f.id]));
  assert(!neighbors[districtIds.Westerpark].includes(districtIds.Noord));
  for (const [id, adjacent] of Object.entries(neighbors)) {
    for (const neighbor of adjacent) assert(neighbors[neighbor].includes(id));
  }
});
