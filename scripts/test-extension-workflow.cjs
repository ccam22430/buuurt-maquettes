"use strict";
const assert = require("node:assert/strict");
const {test} = require("node:test");
const {extensionActor, extensionAdmin, extensionSubmit, extensionChange, extensionApply, extensionRecords} =
  require("../revue/buuurt-extension-store");
const {engageBikeCampaign} = require("../revue/com-pub-spon-bike-model");

const actor = extensionActor("dolores");
const admin = {id: "review-admin", role: "geo-admin"};
const base = {zone: "gray", name: "Quartier", note: "Motif", ad: "demo-ad-001", band: "other"};
const now = new Date("2030-01-01T12:00:00Z");
const memory = () => {
  const data = new Map();
  return {getItem: name => data.get(name), setItem: (name, value) => data.set(name, value)};
};

test("pending request, duplicate, permissions, clarification, history and isolated acceptance", () => {
  const storage = memory();
  assert.equal(extensionAdmin(memory()), null);
  const initial = extensionSubmit(storage, actor, base, now);
  assert.equal(extensionSubmit(storage, actor, base, now).id, initial.id);
  assert.equal(extensionRecords(storage).length, 1);
  assert.equal(extensionApply({gray: "other"}, storage, "dolores", base.ad).gray, "other");
  assert.throws(() => extensionChange(storage, actor, initial.id, {action: "accepted", scope: "shop", revision: 1}, now), /forbidden/);
  assert.throws(() => extensionChange(storage, admin, initial.id, {action: "clarify", revision: 1}, now), /message/);
  const clarified = extensionChange(storage, admin, initial.id, {action: "clarify", note: "Question", revision: 1}, now);
  assert.equal(clarified.status, "clarify");
  assert.throws(() => extensionChange(storage, extensionActor("pilot"), initial.id, {action: "reply", note: "other", revision: 2}, now), /forbidden/);
  const replied = extensionChange(storage, actor, initial.id, {action: "reply", note: "Réponse", revision: 2}, now);
  assert.equal(replied.status, "pending");
  const accepted = extensionChange(storage, admin, initial.id, {action: "accepted", scope: "ad", revision: 3}, now);
  assert.deepEqual(accepted.events.map(e => e.type), ["submitted", "clarify", "reply", "accepted"]);
  assert.equal(extensionApply({gray: "other"}, storage, "dolores", base.ad).gray, "direct");
  assert.equal(extensionApply({gray: "other"}, storage, "pilot", base.ad).gray, "other");
  assert.equal(extensionApply({gray: "other"}, storage, "dolores", "other-ad").gray, "other");
  assert.throws(() => extensionChange(storage, admin, initial.id, {action: "refused", note: "Duplicate", revision: 3}, now), /stale/);
});

test("refusal requires a message; expiry blocks future campaigns and preserves snapshots", () => {
  const storage = memory();
  const first = extensionSubmit(storage, actor, base, now);
  assert.throws(() => extensionChange(storage, admin, first.id, {action: "refused", revision: 1}, now), /message/);
  extensionChange(storage, admin, first.id, {action: "refused", revision: 1, note: "Explication"}, now);
  assert.equal(extensionApply({gray: "other"}, storage, "dolores", base.ad).gray, "other");
  const second = extensionSubmit(storage, actor, base, now);
  extensionChange(storage, admin, second.id, {action: "accepted", scope: "until", until: "2030-01-02T22:59:59Z", revision: 1}, now);
  const id = "ef4deace-1b93-4bbb-ac64-2243cd1b77ca";
  const draft = {thresholds: {local: 5, standard: 10}, fixture: "dolores", network: "top10nl-bike-v1", bands: {gray: "direct"}};
  assert.throws(() => engageBikeCampaign(storage, id, {...draft, selected: []}), /territory/);
  const snapshot = engageBikeCampaign(storage, id, {...draft, selected: ["gray"]});
  assert.equal(require("../revue/buuurt-extension-store").extensionAuthorized(storage, "dolores", base.ad,
    Date.parse("2030-01-03T00:00Z")).size, 0);
  assert.deepEqual(engageBikeCampaign(storage, id, {...draft, selected: []}), snapshot);
});
