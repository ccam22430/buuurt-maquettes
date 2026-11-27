"use strict";
const { randomUUID } = require("node:crypto");
const { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } = require("node:fs");
const { dirname, resolve } = require("node:path");

const PACKAGES = Object.freeze([{ impressions: 500, euros: 15 }, { impressions: 1200, euros: 30 }, { impressions: 2500, euros: 50 }]);
const MERCHANTS = ["amsterdam", "graft"];
const CAPACITY_MODES = ["normal", "low", "missing"];
class RuleError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}
function fail(status, code) { throw new RuleError(status, code); }

function newStore(maps) {
  return {
    version: 1, enabled: false,
    merchants: Object.fromEntries(MERCHANTS.map(id => [id, {
      available: "normal", revoked: false,
      draft: { revision: 1, body: "", duration: 7, package: 0, selected: [...maps[id].neighbors] },
      publications: id === "amsterdam" ? [{ id: "C‑001", kind: "sponsored", state: "active", reserved: 0 }] : []
    }]))
  };
}

function createService(maps, filename) {
  const storage = resolve(filename);
  mkdirSync(dirname(storage), { recursive: true });
  let data = existsSync(storage) ? JSON.parse(readFileSync(storage, "utf8")) : newStore(maps);
  if (data.version !== 1 || MERCHANTS.some(key => !data.merchants?.[key])) throw new Error("Unknown sandbox storage format");

  function transaction(edit) {
    const next = structuredClone(data);
    const result = edit(next);
    const temporary = storage + ".tmp";
    writeFileSync(temporary, JSON.stringify(next, null, 2) + "\n", { mode: 0o600 });
    renameSync(temporary, storage);
    data = next;
    return result;
  }

  function permission(id, record) {
    return maps[id].neighbors.filter((_, index) => !record.revoked || index !== 0);
  }

  function capacity(merchant, draft) {
    if (merchant.available === "missing") return null;
    const perDay = merchant.available === "low" ? 2 : 44;
    const reserved = merchant.publications.reduce((n, ad) => n + (ad.reserved || 0), 0);
    return Math.max(0, perDay * draft.duration * (draft.selected.length + 1) - reserved);
  }

  function snapshot(session) {
    if (session.role === "admin") {
      return { role: "admin", enabled: data.enabled, merchants: Object.fromEntries(MERCHANTS.map(id => {
        const { available, revoked } = data.merchants[id];
        return [id, { available, revoked }];
      })) };
    }
    const { merchant: id } = session;
    const merchant = data.merchants[id];
    return {
      role: "merchant", profile: { id, ...maps[id] }, enabled: data.enabled,
      allowed: permission(id, merchant), revoked: merchant.revoked, draft: merchant.draft,
      capacity: capacity(merchant, merchant.draft), packages: PACKAGES,
      publications: merchant.publications.map(({ id, kind, state }) => ({ id, kind, state }))
    };
  }

  function saveDraft(id, body) {
    if (typeof body.body !== "string" || body.body.length > 4000 ||
        !Number.isInteger(body.duration) || body.duration < 1 || body.duration > 30 ||
        !Number.isInteger(body.package) || !PACKAGES[body.package] ||
        !Array.isArray(body.selected) || body.selected.length > maps[id].neighbors.length ||
        body.selected.some(code => typeof code !== "string")) fail(422, "invalidDraft");
    return transaction(next => {
      const merchant = next.merchants[id];
      if (body.revision !== merchant.draft.revision) fail(409, "staleDraft");
      const allowed = permission(id, merchant);
      if (body.selected.some(code => !allowed.includes(code))) fail(409, "zoneChanged");
      merchant.draft = {
        body: body.body, duration: body.duration, package: body.package,
        selected: [...new Set(body.selected)], revision: merchant.draft.revision + 1
      };
    });
  }

  function settings(body) {
    if (typeof body.enabled !== "boolean" || !MERCHANTS.includes(body.merchant) ||
        !CAPACITY_MODES.includes(body.available) || typeof body.revoked !== "boolean") fail(422, "invalidSettings");
    return transaction(next => {
      next.enabled = body.enabled;
      const merchant = next.merchants[body.merchant];
      merchant.available = body.available;
      merchant.revoked = body.revoked;
      const cleaned = merchant.draft.selected.filter(code => permission(body.merchant, merchant).includes(code));
      if (cleaned.length !== merchant.draft.selected.length) {
        merchant.draft.selected = cleaned;
        merchant.draft.revision++;
      }
    });
  }

  function publish(id, request) {
    const { kind, revision } = request;
    if (!["sponsored", "free"].includes(kind)) fail(422, "invalidPublication");
    return transaction(next => {
      const record = next.merchants[id];
      if (record.draft.revision !== revision) fail(409, "staleDraft");
      const existing = record.publications.find(publication => publication.revision === revision);
      if (existing) {
        if (existing.kind !== kind) fail(409, "alreadyPublished");
        return { id: existing.id, reused: true };
      }
      const draft = record.draft;
      if (!draft.body.trim()) fail(422, "empty");
      let reserved = 0;
      if (kind === "sponsored") {
        if (!next.enabled) fail(409, "disabled");
        if (draft.selected.some(code => !permission(id, record).includes(code))) fail(409, "zoneChanged");
        const available = capacity(record, draft);
        if (available === null) fail(409, "unknown");
        reserved = PACKAGES[draft.package].impressions;
        if (available < reserved) fail(409, "insufficient");
      }
      const publication = { id: "T-" + randomUUID(), kind, revision, reserved,
        state: "active", demo: true, createdAt: new Date().toISOString(), draft: structuredClone(draft) };
      record.publications.push(publication);
      return { id: publication.id, reused: false };
    });
  }
  return { snapshot, saveDraft, settings, publish };
}

module.exports = { createService, RuleError, MERCHANTS };
