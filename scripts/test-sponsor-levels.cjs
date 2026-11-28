"use strict";

const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const {test} = require("node:test");
const {classifySponsorTerritory, reviewProfiles} = require("../revue/com-pub-spon-geography");
const {createLevelSelection, distanceToTerritory} = require("../revue/com-pub-spon-levels-model");
const load = name => JSON.parse(readFileSync(join(__dirname, "../revue/data/amsterdam-levels-" + name + ".geojson")));
const areas = load("areas");
const wijken = load("wijken");
const classify = (center, dataset) => classifySponsorTerritory(center, dataset.features, dataset.neighbors);
const name = (dataset, id) => dataset.features.find(feature => feature.id === id).properties.buurtnaam;
const byName = (dataset, title) => dataset.features.find(feature => feature.properties.buurtnaam === title);

test("the source uses one date and retains official parents and the two unassigned port districts", () => {
  assert.equal(areas.snapshot, wijken.snapshot);
  assert.equal(areas.features.length, 25);
  assert.equal(wijken.features.length, 110);
  assert.equal(new Set(wijken.features.map(feature => feature.id)).size, 110);
  const parents = new Set(areas.features.map(feature => feature.id));
  assert(wijken.features.every(feature => !feature.properties.parent || parents.has(feature.properties.parent)));
  assert.deepEqual(wijken.features.filter(f => !f.properties.parent).map(f => f.properties.buurtnaam).sort(),
    ["Coenhaven/Minervahaven", "Havens-West"]);
});

test("the fictional border fixture and Dolores resolve independently", () => {
  const fixture = wijken.borderFixture;
  const zone = classify(fixture, wijken);
  assert.equal(name(wijken, zone.home), "Helmersbuurt");
  assert.equal(name(areas, classify(fixture, areas).home), "Oud-West, De Baarsjes");
  const overtoom = byName(wijken, "Overtoomse Sluis");
  assert.equal(zone.bands[overtoom.id], "direct");
  assert(distanceToTerritory(fixture, overtoom.geometry) < 25);
  assert.equal(zone.bands[byName(wijken, "Jordaan").id], "direct");
  assert.equal(name(wijken, classify(reviewProfiles.dolores.center, wijken).home), "Van Lennepbuurt");
});

test("bulk selection only changes eligible children and partial selection is bidirectional", () => {
  const {bands, home} = classify(reviewProfiles.dolores.center, wijken);
  const model = createLevelSelection(wijken.features, bands);
  const parent = byName(areas, "Oud-West, De Baarsjes").id;
  assert.equal(model.selected.size, 0);
  model.toggle("wijken", home);
  assert.equal(model.selected.size, 0);
  const child = byName(wijken, "Overtoomse Sluis").id;
  model.toggle("wijken", child);
  assert.equal(model.levelState("areas", parent), "mixed");
  model.toggle("areas", parent);
  assert.equal(model.levelState("areas", parent), "true");
  assert([...model.selected].every(id => model.members(parent).includes(id) && bands[id] !== "other"));
  model.toggle("areas", parent);
  assert.equal(model.selected.size, 0);
  assert.equal(model.levelState("wijken", child), "false");
  const gray = wijken.features.find(f => bands[f.id] === "other");
  model.toggle("wijken", gray.id);
  const restored = createLevelSelection(wijken.features, bands, [gray.id, gray.id, home, "unknown"]);
  assert.deepEqual([...restored.selected], [gray.id]);
});
