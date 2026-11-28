"use strict";

const demandKey = "buuurt-review:territorial-interest:v1";
const preferenceKey = "buuurt-review:territorial-preferences:v1";

function geoCoverage({direct, routed, nearbyLimit, reasonableLimit, reliable}) {
  if (direct) return "covered";
  if (!reliable) return "manual";
  const candidate = routed.filter(row => row.active > 0 && Number.isFinite(row.minutes) && row.minutes >= 0)
    .sort((a, b) => a.minutes - b.minutes)[0];
  return !candidate || candidate.minutes > reasonableLimit ? "none" :
    candidate.minutes <= nearbyLimit ? "near" : "far";
}

function geoEligibility({base, geographic, active, opportunities, reliable}, salesEnabled) {
  const band = base === "home" ? "home" :
    reliable && geographic && active > 0 && opportunities > 0 ? "direct" : "other";
  return {band, purchasable: band === "direct" && Boolean(salesEnabled)};
}

function geoAttachments({home, excentered, mode, limits, routes, desired}) {
  if (!home) throw Error("address");
  if (!excentered || !["bike", "car"].includes(mode)) return {attached: [home], requests: []};
  const allowed = new Set(routes.filter(row => row.mode === mode && row.reliable &&
    Number.isFinite(row.minutes) && row.minutes >= 0 && row.minutes <= limits[mode]).map(row => row.id));
  const requested = [...new Set(desired || [...allowed])].filter(id => id !== home);
  return {attached: [home, ...requested.filter(id => allowed.has(id))], requests: requested.filter(id => !allowed.has(id))};
}

function interestList(storage) {
  try {
    const ids = JSON.parse(storage.getItem(demandKey));
    return Array.isArray(ids) ? ids : [];
  } catch { return []; }
}
function recordInterest(storage, id, consent) {
  const ids = new Set(interestList(storage));
  if (consent) ids.add(id);
  else ids.delete(id);
  storage.setItem(demandKey, JSON.stringify([...ids]));
}
function sponsoredSlots(total, candidates, validQrPriority = 0) {
  const allowance = Math.max(0, Math.min(Math.floor(total / 3), total - validQrPriority));
  const shops = new Set();
  const chosen = [];
  for (const item of candidates) {
    if (chosen.length >= allowance) break;
    if (item.eligible && !shops.has(item.shop)) {
      shops.add(item.shop);
      chosen.push(item.id);
    }
  }
  return {allowance, chosen};
}
function forecastEvent(metrics, type, slots = 0) {
  const keys = {scan: "scans", visit: "visits", visible: "visible",
    shadow: "opportunities", delivered: "delivered"};
  if (!Object.hasOwn(keys, type) || !Number.isSafeInteger(slots) || slots < 0) throw Error("event");
  const key = keys[type];
  const amount = type === "shadow" ? slots : 1;
  return {...metrics, [key]: (metrics[key] || 0) + amount};
}
if (typeof module !== "undefined") module.exports = {geoCoverage, geoEligibility, geoAttachments, recordInterest,
  interestList, sponsoredSlots, forecastEvent};
