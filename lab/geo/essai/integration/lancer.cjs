"use strict";
const { randomBytes } = require("node:crypto");
const { createServer } = require("node:http");
const { readFileSync, existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { createService, RuleError, MERCHANTS } = require("./service.cjs");

const assets = existsSync(join(__dirname, "index.html")) ? __dirname : join(__dirname, "dist");
const index = readFileSync(join(assets, "index.html"));
const js = readFileSync(join(assets, "interface.js"));
const maps = JSON.parse(readFileSync(join(assets, "cartes.json"), "utf8"));
const service = createService(maps, resolve(process.env.GEO_TEST_STORE || join(__dirname, "etat-essai.json")));
const timeout = 2 * 60 * 60 * 1000;
const key = () => randomBytes(24).toString("base64url");
const links = new Map([["admin", { role: "admin" }], ...MERCHANTS.map(merchant => [merchant, { role: "merchant", merchant }])]
  .map(([name, session]) => [key(), { name, ...session, until: Date.now() + timeout }]));
const sessions = new Map();
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "X-Robots-Tag": "noindex, nofollow"
};
const unauthenticated = Buffer.from("<!doctype html><html lang=fr><meta charset=utf-8><title>BUUURT · Essai</title><h1>BUUURT · Essai local</h1><p>Utilise l’un des liens affichés dans la fenêtre de lancement.</p></html>");
function send(response, status, payload, type = "application/json; charset=utf-8", extra = {}) {
  response.writeHead(status, { ...headers, "Content-Type": type, ...extra });
  response.end(Buffer.isBuffer(payload) ? payload : JSON.stringify(payload));
}
async function body(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32000) throw new RuleError(413, "invalidDraft");
    chunks.push(chunk);
  }
  let parsed;
  try { parsed = JSON.parse(Buffer.concat(chunks)); }
  catch { throw new RuleError(400, "invalidDraft"); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new RuleError(400, "invalidDraft");
  return parsed;
}
function attached(request) {
  const cookie = /(?:^|;\s*)buuurt_essai=([A-Za-z0-9_-]+)(?:;|$)/.exec(request.headers.cookie || "");
  const session = cookie && sessions.get(cookie[1]);
  return session && session.until > Date.now() ? session : null;
}
const server = createServer(async (request, response) => {
  try {
    const host = "127.0.0.1:" + server.address().port;
    if (request.headers.host !== host) return send(response, 400, { error: "invalidHost" });
    const url = new URL(request.url, "http://" + host);
    const path = url.pathname;
    const method = request.method;
    if (method === "GET" && path.startsWith("/session/")) {
      const session = links.get(path.slice("/session/".length));
      if (!session || session.until < Date.now()) return send(response, 401, unauthenticated, "text/html; charset=utf-8");
      const token = key();
      sessions.set(token, { ...session, until: Date.now() + timeout });
      return send(response, 303, Buffer.alloc(0), "text/plain", {
        Location: "/", "Set-Cookie": "buuurt_essai=" + token + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200"
      });
    }
    const session = attached(request);
    if (method === "GET" && path === "/") return send(response, session ? 200 : 401,
      session ? index : unauthenticated, "text/html; charset=utf-8");
    if (!session) return send(response, 401, { error: "noSession" });
    if (method === "GET" && path === "/interface.js") return send(response, 200, js, "text/javascript; charset=utf-8");
    if (method === "GET" && path === "/api/state") return send(response, 200, service.snapshot(session));
    if (method !== "POST") return send(response, 404, { error: "notFound" });
    if (request.headers.origin !== "http://" + host || !/^application\/json(?:;|$)/.test(request.headers["content-type"] || "")) {
      return send(response, 403, { error: "forbidden" });
    }
    if (path === "/api/settings") {
      if (session.role !== "admin") return send(response, 403, { error: "forbidden" });
      service.settings(await body(request));
      return send(response, 200, service.snapshot(session));
    }
    if (session.role !== "merchant") return send(response, 403, { error: "forbidden" });
    if (path === "/api/draft") {
      service.saveDraft(session.merchant, await body(request));
      return send(response, 200, service.snapshot(session));
    }
    if (path === "/api/publication") {
      const receipt = service.publish(session.merchant, await body(request));
      return send(response, receipt.reused ? 200 : 201, { ...service.snapshot(session), receipt });
    }
    return send(response, 404, { error: "notFound" });
  } catch (error) {
    if (error instanceof RuleError) return send(response, error.status, { error: error.message });
    console.error("Sandbox request failed:", error.message);
    return send(response, 500, { error: "serverError" });
  }
});
server.listen(Number(process.env.GEO_TEST_PORT ?? 8780), "127.0.0.1", () => {
  const origin = "http://127.0.0.1:" + server.address().port;
  const named = Object.fromEntries([...links].map(([token, { name }]) => [name, origin + "/session/" + token]));
  if (process.env.GEO_TEST_OUTPUT === "json") console.log(JSON.stringify(named));
  else {
    console.log("BUUURT · Essai local. Ouvrir les profils dans des fenêtres ou profils de navigateur distincts.");
    for (const [name, url] of Object.entries(named)) console.log(name + "  " + url);
  }
});
