"use strict";

const bikeDefaults = Object.freeze({local: 5, standard: 10});
const bikeConfigKey = "buuurt-review:bike-configuration:v1";
const bikeAdminKey = "buuurt-review:bike-admin-demo";
const bikeAdmin = Object.freeze({id: "review-admin", role: "geo-admin"});
const bikeMin = 1;
const bikeMax = 20;
const bikeProfile = "amsterdam-bike";

function validBikeThresholds(value) {
  return Number.isInteger(value?.local) && Number.isInteger(value?.standard) &&
    value.local >= bikeMin && value.standard <= bikeMax && value.local < value.standard;
}

function resolveBikeThresholds({global, cities, shops}, city, shop) {
  return [shops?.[shop], cities?.[city], global].find(validBikeThresholds) || bikeDefaults;
}

function classifyBikeSeconds(seconds, settings) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > settings.standard * 60) return "other";
  return seconds <= settings.local * 60 ? "home" : "direct";
}

function readBikeConfig(storage) {
  try {
    const value = JSON.parse(storage.getItem(bikeConfigKey));
    if (validBikeThresholds(value?.global) && Array.isArray(value.history)) return value;
  } catch {}
  return {global: {...bikeDefaults}, cities: {}, shops: {}, history: []};
}

function saveBikeConfig(actor, thresholds, storage, now = new Date()) {
  if (actor?.id !== bikeAdmin.id || actor.role !== bikeAdmin.role) throw new Error("forbidden");
  if (!validBikeThresholds(thresholds)) throw new Error("thresholds");
  const current = readBikeConfig(storage);
  if (current.global.local === thresholds.local && current.global.standard === thresholds.standard) return current;
  const next = {...current, global: {...thresholds}, history: [{
    admin: actor.id, at: now.toISOString(), scope: "global",
    before: current.global, after: {...thresholds}
  }, ...current.history]};
  storage.setItem(bikeConfigKey, JSON.stringify(next));
  return next;
}

function bikeCampaignKey(id) {
  return "buuurt-review:bike-campaign:v1:" + id;
}

function readBikeCampaign(storage, id) {
  if (!/^[\da-f-]{36}$/i.test(id || "")) return null;
  try {
    return JSON.parse(storage.getItem(bikeCampaignKey(id)));
  } catch {
    return null;
  }
}

function engageBikeCampaign(storage, id, draft) {
  const existing = readBikeCampaign(storage, id);
  if (existing) return existing;
  if (!/^[\da-f-]{36}$/i.test(id || "") || !validBikeThresholds(draft?.thresholds) ||
      !Array.isArray(draft.selected) || !draft.bands || typeof draft.fixture !== "string") {
    throw new Error("campaign");
  }
  const snapshot = {
    thresholds: {...draft.thresholds}, selected: [...new Set(draft.selected)].filter(code => draft.bands[code] === "direct"),
    bands: {...draft.bands}, fixture: draft.fixture, network: draft.network
  };
  storage.setItem(bikeCampaignKey(id), JSON.stringify(snapshot));
  return snapshot;
}

if (typeof module !== "undefined") module.exports = {
  bikeDefaults, bikeAdmin, validBikeThresholds, resolveBikeThresholds, classifyBikeSeconds,
  readBikeConfig, saveBikeConfig, engageBikeCampaign, readBikeCampaign
};
