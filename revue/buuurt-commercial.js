"use strict";

const commercialKey = "buuurt-review:commercial:v1";
const commercialDefaults = Object.freeze({
  enabled: false, minimum: 500, step: 100, margin: 30, quota: 10, days: 30,
  shops: 30, qrShops: 25, scans: 3000, maturity: 10000,
  rates: Object.freeze([[500, 1500], [1200, 3000], [2500, 5000]].map(Object.freeze)),
  pricing: "linear"
});
const commercialDurations = [3, 7, 14, 30];
const commercialDay = 86400000;

function commercialRead(storage) {
  try {
    const data = JSON.parse(storage.getItem(commercialKey));
    if (data?.config && Array.isArray(data.orders) && Array.isArray(data.history) && Array.isArray(data.alerts)) return data;
  } catch {}
  return {config: {...commercialDefaults}, orders: [], history: [], alerts: []};
}

function commercialSave(storage, state) {
  storage.setItem(commercialKey, JSON.stringify(state));
}

function commercialValid(c) {
  const integer = (n, min, max) => Number.isSafeInteger(n) && n >= min && n <= max;
  return typeof c.enabled === "boolean" && integer(c.minimum, 100, 100000) && integer(c.step, 1, 100000) &&
    integer(c.margin, 0, 99) && integer(c.quota, 1, 100) && integer(c.days, 1, 365) &&
    integer(c.shops, 1, 100000) && integer(c.qrShops, 1, 100000) && integer(c.scans, 1, 10000000) &&
    integer(c.maturity, 1, 10000000) && ["linear", "unit"].includes(c.pricing) &&
    Array.isArray(c.rates) && c.rates.length === 3 && c.rates.every(([n, cents], i) =>
      integer(n, c.minimum, 100000) && integer(cents, 1, 10000000) &&
      (!i || (n > c.rates[i - 1][0] && cents > c.rates[i - 1][1] &&
        cents / n <= c.rates[i - 1][1] / c.rates[i - 1][0] &&
        (c.pricing !== "unit" || cents / n + n * (cents / n - c.rates[i - 1][1] / c.rates[i - 1][0]) /
          (n - c.rates[i - 1][0]) >= 0))));
}

function commercialPrice(volume, config) {
  const first = config.rates[0];
  const upper = config.rates.findIndex(([n]) => n >= volume);
  if (upper < 0) return null;
  if (upper === 0) return Math.round(volume * first[1] / first[0]);
  const [low, high] = config.rates.slice(upper - 1, upper + 1);
  const ratio = (volume - low[0]) / (high[0] - low[0]);
  return Math.round(config.pricing === "unit" ?
    volume * (low[1] / low[0] + ratio * (high[1] / high[0] - low[1] / low[0])) :
    low[1] + ratio * (high[1] - low[1]));
}

// Pools represent disjoint sets of opportunities. A shared pool appears once per day.
function commercialCapacity({zones, days, shop, config, pools, orders, now = Date.now(), validUntil = Infinity}) {
  const start = Math.floor(now / commercialDay);
  const end = Math.min(start + days, Math.floor(validUntil / commercialDay));
  const unique = new Map(pools.filter(pool => pool.territories.some(id => zones.includes(id))).map(pool => [pool.id, pool]));
  const buckets = [];
  let estimate = 0, available = 0, reserved = 0, commercializable = 0, quota = 0, missing = 0;
  for (const pool of unique.values()) {
    if (!pool.reliable || pool.history < config.days) { missing++; continue; }
    if (!(pool.active > 0)) continue;
    for (let day = start; day < end; day++) {
      const key = pool.id + ":" + day;
      const safe = Math.floor(pool.daily * (100 - config.margin) / 100);
      const active = orders.filter(order => !order.released && (order.state !== "held" || order.expires > now));
      const booked = active.reduce((total, order) => total + (order.allocation[key] || 0), 0);
      const personal = active.filter(order => order.shop === shop)
        .reduce((total, order) => total + (order.allocation[key] || 0), 0);
      const left = Math.max(0, safe - booked);
      const share = Math.max(0, Math.floor(safe * config.quota / 100) - personal);
      const usable = Math.min(left, share);
      buckets.push({key, usable});
      estimate += pool.daily;
      commercializable += safe;
      reserved += booked;
      available += left;
      quota += share;
    }
  }
  const physical = buckets.reduce((sum, b) => sum + b.usable, 0);
  const ceiling = Math.min(physical, config.rates.at(-1)[0]);
  const max = config.enabled && zones.length && missing === 0 && ceiling >= config.minimum ?
    config.minimum + Math.floor((ceiling - config.minimum) / config.step) * config.step : 0;
  return {estimate, available, reserved, commercializable, quota, physical, max, missing, buckets};
}

function commercialOrder(state, input, pools, now = Date.now()) {
  const existing = state.orders.find(order => order.id === input.id && order.shop === input.shop && !order.released &&
    (order.state !== "held" || order.expires > now));
  if (existing) return existing;
  const capacity = commercialCapacity({...input, pools, config: state.config, orders: state.orders, now});
  const {minimum, step} = state.config;
  if (!commercialDurations.includes(input.days) || !Number.isSafeInteger(input.volume) ||
      input.volume < minimum || (input.volume - minimum) % step || input.volume > capacity.max) throw Error("capacity");
  let remaining = input.volume;
  const allocation = {};
  for (const {key, usable} of capacity.buckets) {
    const amount = Math.min(remaining, usable);
    if (amount) allocation[key] = amount;
    remaining -= amount;
    if (!remaining) break;
  }
  const order = {id: input.id, shop: input.shop, shopName: input.shopName, ad: input.ad,
    zones: [...input.zones], names: [...input.names], volume: input.volume, days: input.days,
    validUntil: input.validUntil, paid: commercialPrice(input.volume, state.config), created: now,
    state: "held", expires: now + 10 * 60000, allocation, delivered: 0, events: []};
  state.orders.push(order);
  return order;
}

function commercialCampaignStatus(order, now = Date.now()) {
  if (order.state === "held") return "held";
  if (["credit", "refunded", "reimbursement"].includes(order.state)) return order.state;
  if (order.delivered >= order.volume) return "complete";
  if (now >= order.validUntil) return "under";
  if (now >= order.created + order.days * commercialDay) return "extended";
  return order.delivered ? "active" : "scheduled";
}
function commercialDelivery(order, amount, at = Date.now()) {
  if (!["scheduled", "active", "extended"].includes(commercialCampaignStatus(order, at)) ||
      !Number.isSafeInteger(amount) || amount < 0) throw Error("delivery");
  order.delivered += Math.min(amount, order.volume - order.delivered);
}
function commercialProrata(order) {
  return Math.round(order.paid * (order.volume - order.delivered) / order.volume);
}

function commercialDemoPools(features) {
  return [
    ...features.map(({id}, i) => ({
      id, territories: [id], daily: 480 + (i % 5) * 115, history: i % 21 === 20 ? 9 : 45,
      active: i % 19 === 18 ? 0 : 38, reliable: true, qr: 35, scans: 8400,
      consultations: 9200, visible: 27600, delivered: 0
    })),
    {id: "shared-central", territories: features.filter((_, index) => index % 3 === 0 && index % 19 !== 18).map(f => f.id),
      daily: 340, history: 45, active: 38, reliable: true, qr: 35, scans: 8400,
      consultations: 9200, visible: 27600, delivered: 0}
  ];
}

function commercialRecommendation(pool, config) {
  if (!pool.reliable || pool.history < config.days || !pool.active) return null;
  const capacity = Math.floor(pool.daily * (100 - config.margin) / 100) * 30;
  const mature = pool.active >= config.shops && pool.qr >= config.qrShops &&
    pool.scans >= config.scans && capacity >= config.maturity;
  return {capacity, mature, suggested: config.quota};
}

async function commercialLocked(fn) {
  if (!navigator.locks) throw Error("lock");
  return navigator.locks.request(commercialKey, fn);
}

if (typeof module !== "undefined") module.exports = {commercialDefaults, commercialCapacity,
  commercialValid, commercialPrice, commercialOrder, commercialCampaignStatus, commercialDelivery,
  commercialProrata, commercialRecommendation};
