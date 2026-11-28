"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {geoAutoEvaluate} = require("../revue/buuurt-geo-auto.js");
const {extensionActor, extensionSubmit, extensionApply, extensionChange, extensionRecords} =
  require("../revue/buuurt-extension-store.js");
const times = require("../revue/data/amsterdam-bike-times.json");
const evidence = require("../revue/data/amsterdam-extension-evidence.json");
const landlust = "03630970000024";
const market = "03630970000026";
const project = (zone, minutes = 10, criteria) => geoAutoEvaluate(evidence, times, "dolores", zone, minutes, criteria);
const storage = () => {
  const data = new Map();
  return {getItem: key => data.get(key), setItem: (key, value) => data.set(key, value)};
};

test("real evidence is compatible with the map and independently distinguishes Landlust and Centrale Markt", () => {
  assert.equal(project(landlust).outcome, "automatic");
  assert.equal(project(market).outcome, "insufficient");
  assert.equal(project("missing").outcome, "insufficient");
  assert.equal(project(landlust, 1).outcome, "manual");
  assert.equal(project(landlust, 10, {percent: 50, metres: 500, addresses: 50}).outcome, "manual");
  assert.equal(geoAutoEvaluate(evidence, {}, "dolores", landlust, 10).outcome, "insufficient");
  assert.equal(project("03630970000022").outcome === "automatic", false);
});

test("marginal links and roads without residential service require human review", () => {
  const fixture = {addressCoverage: true, residentialTotal: 100, residentialSnapped: 100, roadMetres: 10000};
  for (const [road, residential] of [[30, 90], [4000, 0], [600, 100], [0, 0]]) {
    const input = {version: "synthetic-unit-test", networkSha256: times.sourceSha256, profiles: {test: {zone: {
      ...fixture, road: [road], residential: [residential]
    }}}};
    assert.equal(geoAutoEvaluate(input, times, "test", "zone", 1).outcome, "manual");
  }
});

test("historical automatic evidence cannot approve new requests", () => {
  const db = storage();
  const request = extensionSubmit(db, extensionActor("dolores"), {
    zone: landlust, name: "Landlust", band: "other", note: "Test", evidence: project(landlust)
  });
  assert.equal(request.status, "pending");
  assert.deepEqual(extensionApply({[landlust]: "other"}, db, "dolores", null), {[landlust]: "other"});
});
