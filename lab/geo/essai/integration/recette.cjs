"use strict";
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { createInterface } = require("node:readline");
const { mkdtemp, mkdir, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { chromium } = require(process.env.GEO_PLAYWRIGHT_MODULE || "playwright");
const { expect } = require((process.env.GEO_PLAYWRIGHT_MODULE || "playwright") + "/test");

async function start(store) {
  const processHandle = spawn(process.execPath, [join(__dirname, "lancer.cjs")], {
    env: { ...process.env, GEO_TEST_PORT: "0", GEO_TEST_STORE: store, GEO_TEST_OUTPUT: "json" },
    stdio: ["ignore", "pipe", "inherit"]
  });
  const output = createInterface({ input: processHandle.stdout });
  const first = await Promise.race([
    once(output, "line").then(([line]) => JSON.parse(line)),
    once(processHandle, "exit").then(([code]) => { throw new Error("Local server exited: " + code); })
  ]);
  return {
    links: first, origin: new URL(first.admin).origin,
    async stop() {
      if (processHandle.exitCode !== null) return;
      const closed = once(processHandle, "close");
      processHandle.kill();
      await closed;
    }
  };
}
function loc(page, selector) { return page.locator(selector); }
function api(page, path, data) {
  return page.evaluate(async ({ path, data }) => {
    const response = await fetch("/api/" + path, data === undefined ? {} : {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    return { http: response.status, data: await response.json() };
  }, { path, data });
}
async function adminChange(page, selector, action) {
  await Promise.all([page.waitForResponse(response => response.url().endsWith("/api/settings")), action(loc(page, selector))]);
}
async function clickOnMap(page, shape, touch) {
  await shape.scrollIntoViewIfNeeded();
  const point = await shape.evaluate(element => {
    const { left, top, width, height } = element.getBoundingClientRect();
    for (let i = 1; i < 20; i++) {
      for (let j = 1; j < 20; j++) {
        const x = left + width * i / 20, y = top + height * j / 20;
        if (document.elementFromPoint(x, y) === element) return {x, y};
      }
    }
    return null;
  });
  assert.ok(point, "An actual point inside the polygon is clickable");
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

async function run(browser, profile, store, out) {
  let server = await start(store);
  const ctx = await browser.newContext({ viewport: profile.viewport, isMobile: profile.touch, hasTouch: profile.touch });
  const adminCtx = await browser.newContext();
  const otherCtx = await browser.newContext({ viewport: profile.viewport });
  const [page, admin, other] = await Promise.all([ctx.newPage(), adminCtx.newPage(), otherCtx.newPage()]);
  const errors = [], outbound = [];
  const origins = new Set([server.origin]);
  for (const p of [page, admin, other]) {
    p.on("pageerror", error => errors.push(error.message));
    p.on("request", request => {
      if (!origins.has(new URL(request.url()).origin)) outbound.push(request.url());
    });
  }
  try {
    const unauth = await fetch(server.origin + "/api/state");
    assert.equal(unauth.status, 401);
    await Promise.all([
      page.goto(server.links.amsterdam), admin.goto(server.links.admin), other.goto(server.links.graft)
    ]);
    await expect(loc(page, "#preview")).toBeVisible();
    await expect(loc(page, "html")).toHaveAttribute("lang", "nl");
    if (profile.lang === "EN") await loc(page, "#lang").selectOption("EN");
    await expect(loc(page, "html")).toHaveAttribute("lang", profile.lang.toLowerCase());
    await expect(loc(page, "#choice")).toBeHidden();
    await expect(loc(page, "#settings")).toBeHidden();
    await expect(loc(admin, "#editor")).toBeHidden();
    const unauthorizedAdmin = await api(page, "settings", { enabled: true });
    assert.equal(unauthorizedAdmin.http, 403);
    assert.equal((await api(admin, "draft", {})).http, 403);
    assert.equal((await api(admin, "state")).data.draft, undefined);
    await loc(page, "#confirmFree").click();
    await expect(loc(page, "#appError")).toContainText(/Vul eerst|Enter a post/);
    await loc(page, "#draft").fill("Gratis Amsterdam");
    await expect(loc(page, "#draftStatus")).toContainText(/opgeslagen|saved/);
    await loc(page, "#confirmFree").click();
    await expect(loc(page, "#freeResult")).toContainText(/bevestigd|confirmed/);
    const first = (await api(page, "state")).data;
    assert.ok(first.publications.some(pub => pub.kind === "free"));
    assert.ok(first.publications.some(pub => pub.id === "C‑001" && pub.state === "active"));
    assert.equal((await api(other, "state")).data.draft.body, "");
    await loc(other, "#draft").fill("Gratis Graft");
    await expect(loc(other, "#draftStatus")).toContainText(/opgeslagen|saved/);
    assert.equal((await api(page, "state")).data.draft.body, "Gratis Amsterdam");
    assert.equal((await api(other, "state")).data.profile.home, "BU03611002");

    await adminChange(admin, "#enabled", input => input.check());
    await other.reload();
    await expect(loc(other, "#choice")).toBeVisible();
    await loc(other, "#sponsored").click();
    await expect(loc(other, "#address")).toContainText("Raadhuisstraat 24");
    assert.equal(await loc(other, '#map [fill="#a7d7a9"]').getAttribute("data-district"), "BU03611002");
    await page.reload();
    await expect(loc(page, "#choice")).toBeVisible();
    await loc(page, "#sponsored").click();
    await expect(loc(page, "#map")).toBeVisible();
    await expect(loc(page, "#address")).toContainText("Jan Evertsenstraat 55-H");
    assert.equal(await loc(page, '#map [fill="#a7d7a9"]').getAttribute("data-district"), "BU0363EM02");
    assert.equal(await loc(page, "#districts :checked").count(), 5);
    assert.equal(await loc(page, '#map [fill="#d5d8da"][role="button"]').count(), 0);
    const code = await loc(page, "#map [role=button]").first().getAttribute("data-district");
    const shape = loc(page, '#map [data-district="' + code + '"]');
    const checkbox = loc(page, '#districts [data-district="' + code + '"]');
    await clickOnMap(page, shape, profile.touch);
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    if (!profile.touch) {
      await shape.press("Space");
      await expect(checkbox).not.toBeChecked();
      await shape.press("Enter");
      await expect(checkbox).toBeChecked();
    }
    await expect(loc(page, "#draftStatus")).toContainText(/opgeslagen|saved/);
    assert.deepEqual((await loc(page, "#package option").allTextContents()).map(x => x.split("·")[1].trim()), ["15 €", "30 €", "50 €"]);
    await loc(page, "#package").selectOption("1");
    await loc(page, "#duration").fill("10");
    await loc(page, "#duration").press("Tab");
    await loc(page, "#draft").fill("Sponsored Amsterdam");
    await expect(loc(page, "#draftStatus")).toContainText(/opgeslagen|saved/);
    const otherLanguage = profile.lang === "EN" ? "NL" : "EN";
    await loc(page, "#lang").selectOption(otherLanguage);
    await expect(loc(page, "html")).toHaveAttribute("lang", otherLanguage.toLowerCase());
    await expect(loc(page, "#draft")).toHaveValue("Sponsored Amsterdam");
    await loc(page, "#lang").selectOption(profile.lang);

    const captured = (await api(page, "state")).data.draft;
    await adminChange(admin, "#revoked", input => input.check());
    const revoked = await api(page, "draft", captured);
    assert.equal(revoked.http, 409);
    assert.equal(revoked.data.error, "staleDraft");
    const latest = (await api(page, "state")).data.draft;
    const denied = await api(page, "draft", { ...latest, selected: [...latest.selected, code] });
    assert.equal(denied.data.error, "zoneChanged");
    assert.equal((await api(page, "draft", { ...latest, duration: 0 })).http, 422);
    await page.reload();
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).not.toBeChecked();
    await expect(loc(page, "#draft")).toHaveValue("Sponsored Amsterdam");
    await expect(loc(page, "#duration")).toHaveValue("10");
    await expect(loc(page, "#package")).toHaveValue("1");
    await adminChange(admin, "#capacityMode", select => select.selectOption("low"));
    await loc(page, "#confirmSponsored").click();
    await expect(loc(page, "#appError")).toContainText(/exceeds|Onvoldoende/);
    await expect(loc(page, "#confirmSponsored")).toBeDisabled();
    await adminChange(admin, "#capacityMode", select => select.selectOption("missing"));
    await page.reload();
    await expect(loc(page, "#capacity")).toContainText(/unknown|onbekend/);
    const current = (await api(page, "state")).data.draft;
    assert.equal((await api(page, "publication", { kind: "sponsored", revision: current.revision })).data.error, "unknown");
    await adminChange(admin, "#capacityMode", select => select.selectOption("normal"));
    await page.reload();
    await expect(loc(page, "#confirmSponsored")).toBeEnabled();

    await adminChange(admin, "#enabled", input => input.uncheck());
    await loc(page, "#confirmSponsored").click();
    await expect(loc(page, "#appError")).toContainText(/is disabled|uitgeschakeld/);
    await expect(loc(page, "#preview")).toBeVisible();
    assert.match(await loc(page, "#history").textContent(), /C‑001/);
    await adminChange(admin, "#enabled", input => input.check());
    await page.reload();
    await expect(loc(page, "#choice")).toBeVisible();
    await loc(page, "#sponsored").click();
    await expect(loc(page, "#confirmSponsored")).toBeEnabled();
    const simultaneous = await Promise.all([1, 2].map(() => api(page, "publication", { kind: "sponsored", revision: current.revision })));
    assert.deepEqual(simultaneous.map(r => r.http).sort(), [200, 201]);
    assert.equal(simultaneous[0].data.receipt.id, simultaneous[1].data.receipt.id);
    await page.reload();
    await expect(loc(page, "#campaign")).toBeVisible();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: join(out, profile.name + ".png"), fullPage: true });

    await server.stop();
    server = await start(store);
    origins.add(server.origin);
    await Promise.all([page.goto(server.links.amsterdam), other.goto(server.links.graft), admin.goto(server.links.admin)]);
    await expect(loc(page, "#draft")).toHaveValue("Sponsored Amsterdam");
    await expect(loc(other, "#draft")).toHaveValue("Gratis Graft");
    const restarted = (await api(page, "state")).data;
    assert.equal(restarted.revoked, true);
    assert.ok(restarted.publications.some(pub => pub.id === "C‑001" && pub.state === "active"));
    assert.equal(restarted.publications.filter(pub => pub.kind === "sponsored").length, 2);
    assert.deepEqual(errors, []);
    assert.deepEqual(outbound, []);
    return { ...profile, passed: true, browserErrors: 0, externalRequests: 0 };
  } finally {
    await Promise.all([ctx.close(), adminCtx.close(), otherCtx.close()]);
    await server.stop();
  }
}

(async () => {
  const out = resolve(process.argv[2] || ".");
  await mkdir(out, { recursive: true });
  const runtime = await mkdtemp(join(tmpdir(), "buuurt-geo07-"));
  const browser = await chromium.launch({ executablePath: process.env.GEO_CHROMIUM });
  try {
    const profiles = [
      ...["NL", "EN"].map(lang => ({ name: "ordinateur-" + lang, lang, viewport: { width: 1440, height: 900 }, touch: false })),
      ...["NL", "EN"].map(lang => ({ name: "smartphone-" + lang, lang, viewport: { width: 390, height: 844 }, touch: true }))
    ];
    const verified = [];
    for (const profile of profiles) verified.push(await run(browser, profile, join(runtime, profile.name + ".json"), out));
    const result = { date: new Date().toISOString(), browser: browser.version(), profiles: verified,
      languages: ["NL", "EN"], persistence: "server restart", access: "separate merchant/admin sessions",
      route: "free OFF / choice ON / CBS selection / zone revocation / capacity low & unknown / idempotent publication",
      scope: "local test services and test data; official BAG/CBS snapshots" };
    await writeFile(join(out, "recette.json"), JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
    await rm(runtime, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
