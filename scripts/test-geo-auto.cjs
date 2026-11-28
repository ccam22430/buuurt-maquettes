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

test("automatic rights are isolated, audited, idempotent and revocable without silent reapproval", () => {
  const db = storage(), actor = extensionActor("dolores");
  const params = {zone: landlust, name: "Landlust", band: "other", ad: "demo-ad-001", note: "Test",
    evidence: project(landlust)};
  const approved = extensionSubmit(db, actor, params);
  assert.equal(approved.status, "accepted");
  assert.equal(approved.events[1].origin, "automatic");
  assert.equal(approved.assessment.version, evidence.version);
  const bands = {[landlust]: "other", free: "home", existing: "direct"};
  assert.deepEqual(extensionApply(bands, db, "dolores", "demo-ad-001"), {...bands, [landlust]: "direct"});
  assert.deepEqual(extensionApply(bands, db, "pilot", "demo-ad-001"), bands);
  assert.equal(extensionSubmit(db, actor, params).duplicate, true);
  const revoke = {action: "revoked", revision: 2, note: "Review"};
  assert.throws(() => extensionChange(db, actor, approved.id, revoke));
  extensionChange(db, {id: "review-admin", role: "geo-admin"}, approved.id, revoke);
  assert.deepEqual(extensionApply(bands, db, "dolores", "demo-ad-001"), bands);
  assert.equal(extensionSubmit(db, actor, params).status, "pending");
  assert.equal(extensionRecords(db)[1].events.length, 3);
});
