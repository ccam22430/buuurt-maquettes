"use strict";

const extensionKey = "buuurt-review:extension-requests:v1";
const extensionShops = Object.freeze({
  dolores: {shop: "review-dolores", merchant: "demo-dolores", name: "Dolores Del Dia Vintage & Modern",
    address: "Jan Pieter Heijestraat 91, 1053 GM Amsterdam", category: "Vintage & Modern"},
  pilot: {shop: "geo-06-amsterdam", merchant: "demo-pilot", name: "Jan Evertsenstraat",
    address: "Jan Evertsenstraat 55-H, Amsterdam", category: "Commerce · Demo winkel · Demo shop"}
});
function extensionActor(fixture) {
  const shop = extensionShops[fixture];
  return Object.hasOwn(extensionShops, fixture) ? {...shop, fixture, role: "merchant"} : null;
}
function extensionAdmin(session) {
  return session.getItem("buuurt-review:bike-admin-demo") === "review-admin" ?
    {role: "geo-admin", id: "review-admin"} : null;
}
function extensionAd(url) {
  const id = url.searchParams.get("ad");
  return /^[a-zA-Z0-9-]{1,80}$/.test(id || "") ? id : null;
}
function extensionDraftScope(profile, fixture, ad) {
  return sponsorDraftScope(profile) + ":" + fixture + (ad ? ":ad:" + ad : "");
}
function extensionRecords(storage) {
  try {
    const list = JSON.parse(storage.getItem(extensionKey));
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}
function extensionOwns(actor, request) {
  return actor?.role === "merchant" && actor.shop === request.shop && actor.merchant === request.merchant;
}
function extensionAuthorized(storage, fixture, ad, now = Date.now()) {
  const actor = extensionActor(fixture);
  return new Set(extensionRecords(storage).filter(request => {
    if (!extensionOwns(actor, request) || request.status !== "accepted") return false;
    const auth = request.authorization;
    return auth?.scope === "shop" || (auth?.scope === "ad" && Boolean(ad) && request.ad === ad) ||
      (auth?.scope === "until" && Date.parse(auth.until) > now);
  }).map(r => r.zone));
}
function networkGrants(storage, fixture, ad, now = Date.now()) {
  const actor = extensionActor(fixture);
  return extensionRecords(storage).filter(record => extensionOwns(actor, record) &&
    record.status === "accepted" && record.authorization?.kind &&
    (record.authorization.scope === "shop" || (record.authorization.scope === "ad" && ad && record.ad === ad) ||
     (record.authorization.scope === "until" && Date.parse(record.authorization.until) > now)))
    .map(record => ({zone: record.zone, ...record.authorization}));
}

function extensionApply(bands, storage, fixture, ad) {
  const allowed = extensionAuthorized(storage, fixture, ad);
  return Object.fromEntries(Object.entries(bands).map(([id, band]) =>
    [id, band === "other" && allowed.has(id) ? "direct" : band]));
}
function extensionSubmit(storage, actor, {zone, name, note, ad, band}, now = new Date()) {
  const official = extensionActor(actor?.fixture);
  if (!official || !extensionOwns(actor, official) || band !== "other" || !zone || !note.trim()) throw Error("forbidden");
  const records = extensionRecords(storage);
  const related = records.filter(r => extensionOwns(actor, r) && r.zone === zone);
  const duplicate = related.find(r => ["pending", "clarify"].includes(r.status) ||
    (r.status === "accepted" && !r.authorization?.kind && extensionAuthorized(storage, actor.fixture, ad, now.getTime()).has(zone)));
  if (duplicate) return {...duplicate, duplicate: true};
  const created = {id: crypto.randomUUID(), ...official, zone, zoneName: name, ad, created: now.toISOString(),
    status: "pending", events: [{type: "submitted", actor: actor.merchant, at: now.toISOString(), message: note.trim()}]};
  storage.setItem(extensionKey, JSON.stringify([created, ...records]));
  return created;
}
function extensionChange(storage, actor, id, {action, note = "", scope, until, revision, kind, minutes, standard, network}, now = new Date()) {
  const records = extensionRecords(storage);
  const index = records.findIndex(r => r.id === id);
  const record = records[index];
  if (!record || record.events.length !== revision) throw Error("stale");
  const admin = actor?.role === "geo-admin" && actor.id === "review-admin";
  const reply = action === "reply" && record.status === "clarify" && extensionOwns(actor, record);
  const decision = admin && record.status === "pending" && ["accepted", "refused", "clarify"].includes(action);
  const revoke = admin && record.status === "accepted" && action === "revoked";
  if (!reply && !decision && !revoke) throw Error("forbidden");
  if (action !== "accepted" && !note.trim()) throw Error("message");
  let authorization;
  if (action === "accepted") {
    if (!["shop", "ad", "until"].includes(scope) || (scope === "ad" && !record.ad) ||
        (scope === "until" && !(Date.parse(until) > now.getTime()))) throw Error("scope");
    if (kind && (!["targeted", "global"].includes(kind) || !Number.isInteger(minutes) ||
        !Number.isInteger(standard) || minutes <= standard || minutes > 20 || !network)) throw Error("range");
    authorization = {scope, ...(kind ? {kind, minutes, standard, network} : {}), ...(scope === "until" ? {until: new Date(until).toISOString()} : {})};
  }
  const updated = {...record, status: reply ? "pending" : action, authorization, events: [...record.events,
    {type: action, actor: admin ? actor.id : actor.merchant, at: now.toISOString(), message: note.trim(), authorization, previous: record.authorization, origin: admin ? "administrative" : undefined}]};
  records[index] = updated;
  storage.setItem(extensionKey, JSON.stringify(records));
  return updated;
}

if (typeof module !== "undefined") module.exports = {
  extensionActor, extensionAdmin, extensionRecords, extensionSubmit, extensionChange, extensionApply, extensionAuthorized, networkGrants
};
