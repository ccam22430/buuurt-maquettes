"use strict";

const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const {test} = require("node:test");
const {bikeDefaults, bikeAdmin, validBikeThresholds, resolveBikeThresholds, classifyBikeSeconds,
  readBikeConfig, saveBikeConfig, engageBikeCampaign, readBikeCampaign} = require("../revue/com-pub-spon-bike-model");
const data = require("../revue/data/amsterdam-bike-times.json");
const neighborhoods = JSON.parse(readFileSync(join(__dirname, "../revue/data/amsterdam-levels-wijken.geojson"))).features;
const storage = () => {
  const values = new Map();
  return {getItem: key => values.get(key), setItem: (key, value) => values.set(key, value)};
};

test("the configured thresholds have inclusive outer boundaries and only three bands", () => {
  assert.deepEqual([0, 300, 301, 600, 601, null].map(t => classifyBikeSeconds(t, bikeDefaults)),
    ["home", "home", "direct", "direct", "other", "other"]);
  assert(!validBikeThresholds({local: 10, standard: 10}));
  assert(!validBikeThresholds({local: 11, standard: 10}));
  assert(!validBikeThresholds({local: 5, standard: 21}));
  assert(validBikeThresholds({local: 7, standard: 15}));
});

test("shop overrides city overrides global, and unauthorized or invalid saves make no change", () => {
  const config = {global: bikeDefaults, cities: {amsterdam: {local: 4, standard: 8}},
    shops: {pilot: {local: 3, standard: 7}}};
  assert.deepEqual(resolveBikeThresholds(config, "amsterdam", "pilot"), config.shops.pilot);
  assert.deepEqual(resolveBikeThresholds(config, "amsterdam", "dolores"), config.cities.amsterdam);
  assert.deepEqual(resolveBikeThresholds(config, "graft", "other"), bikeDefaults);
  const store = storage();
  assert.throws(() => saveBikeConfig(null, {local: 7, standard: 14}, store), /forbidden/);
  assert.throws(() => saveBikeConfig(bikeAdmin, {local: 8, standard: 8}, store), /thresholds/);
  assert.deepEqual(readBikeConfig(store).global, bikeDefaults);
  const saved = saveBikeConfig(bikeAdmin, {local: 7, standard: 14}, store, new Date("2026-11-28T12:00:00Z"));
  assert.deepEqual(readBikeConfig(store), saved);
  assert.deepEqual(saved.history[0], {admin: "review-admin", at: "2026-11-28T12:00:00.000Z",
    scope: "global", before: bikeDefaults, after: {local: 7, standard: 14}});
});

test("future settings cannot alter the bands or selections of an engaged campaign", () => {
  const store = storage();
  const id = "ef4deace-1b93-4bbb-ac64-2243cd1b77ca";
  const draft = {thresholds: bikeDefaults, selected: ["selected", "selected", "gray"], fixture: "dolores",
    network: "top10nl-bike-v1", bands: {selected: "direct", gray: "other"}};
  const original = engageBikeCampaign(store, id, draft);
  assert.deepEqual(original.selected, ["selected"]);
  saveBikeConfig(bikeAdmin, {local: 8, standard: 14}, store);
  assert.deepEqual(readBikeCampaign(store, id), original);
  assert.deepEqual(engageBikeCampaign(store, id, {...draft, selected: []}), original);
});

test("all official wijken have data and route examples cross area boundaries", () => {
  const feature = name => neighborhoods.find(f => f.properties.buurtnaam === name);
  const band = (p, f) => classifyBikeSeconds(p.wijken[f.id].seconds, bikeDefaults);
  assert.equal(neighborhoods.length, 110);
  for (const p of Object.values(data.profiles)) {
    assert.equal(Object.keys(p.wijken).length, 110);
    assert(neighborhoods.every(n => p.wijken[n.id].sampleMetres > 0));
  }
  const {border, pilot, canal, junction} = data.profiles;
  assert.equal(band(border, feature("Helmersbuurt")), "home");
  assert.equal(band(border, feature("Overtoomse Sluis")), "home");
  const greenAreas = new Set(neighborhoods.filter(n => band(pilot, n) === "home").map(n => n.properties.parent));
  assert(greenAreas.size > 1);
  const area = feature("Helmersbuurt").properties.parent;
  assert.equal(new Set(neighborhoods.filter(n => n.properties.parent === area).map(n => band(junction, n))).size, 3);
  assert.equal(band(canal, feature("Haarlemmerbuurt")), "home");
  assert(neighborhoods.some(n => n.properties.parent === feature("Nieuwmarkt/Lastage").properties.parent && band(junction, n) === "other"));
});

test("a bike campaign cannot be confirmed with only the free area or a pending extension", () => {
  const store = storage();
  const id = "ef4deace-1b93-4bbb-ac64-2243cd1b77ca";
  const base = {thresholds: bikeDefaults, fixture: "dolores", bands: {green: "home", gray: "other"},
    requests: [["gray", "Request awaiting review"]]};
  for (const selected of [[], ["green"], ["gray"], ["green", "gray", "invalid"]]) {
    assert.throws(() => engageBikeCampaign(store, id, {...base, selected}), /territory/);
    assert.equal(readBikeCampaign(store, id), null);
  }
});
