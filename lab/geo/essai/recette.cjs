const assert = require("node:assert/strict");
const { mkdir, writeFile } = require("node:fs/promises");
const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.GEO_PLAYWRIGHT_MODULE || "playwright");

async function mapClick(page, shape, touch) {
  await shape.scrollIntoViewIfNeeded();
  const inside = await shape.evaluate(element => {
    const box = element.getBoundingClientRect();
    for (let row = 1; row < 15; row++) {
      for (let col = 1; col < 15; col++) {
        const x = box.left + box.width * col / 15;
        const y = box.top + box.height * row / 15;
        if (document.elementFromPoint(x, y) === element) return { x, y };
      }
    }
    return null;
  });
  assert.ok(inside, "Clickable point on district");
  if (touch) await page.touchscreen.tap(inside.x, inside.y);
  else await page.mouse.click(inside.x, inside.y);
}

async function verify(browser, profile, output) {
  const page = await browser.newPage({ viewport: profile.viewport, isMobile: profile.touch, hasTouch: profile.touch });
  const loc = selector => page.locator(selector);
  const errors = [], remote = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
  await page.goto(pathToFileURL(resolve(__dirname, "buuurt-v1-essai.html")).href);
  assert.equal(await loc("html").getAttribute("lang"), "nl");
  assert.equal(await loc("#choice").isVisible(), false);
  assert.equal(await loc("#preview").isVisible(), true);
  await loc("#confirmFree").click();
  assert.match(await loc("#freeResult").textContent(), /Vul eerst/);
  await loc("#draft").fill("GEO test · Amsterdam");
  await loc("#confirmFree").click();
  assert.match(await loc("#freeResult").textContent(), /bevestigd/i);
  const running = await loc("#running").textContent();
  await loc("#enabled").check();
  assert.equal(await loc("#choice").isVisible(), true);
  await loc("#sponsored").click();
  assert.match(await loc("#address").textContent(), /Jan Evertsenstraat 55-H/);
  assert.equal(await loc('#map [fill="#a7d7a9"]').getAttribute("data-district"), "BU0363EM02");
  assert.equal(await loc("#districts :checked").count(), 5);
  assert.equal(await loc('#map [fill="#d5d8da"][role]').count(), 0);
  await loc("#package").selectOption("1");
  assert.deepEqual((await loc("#package option").allTextContents()).map(v => v.split("·")[1].trim()), ["15 €", "30 €", "50 €"]);
  await loc("#duration").fill("9");
  await loc("#duration").press("Tab");
  const first = loc("#map path[role=button]").first();
  const code = await first.getAttribute("data-district");
  const shape = loc('#map [data-district="' + code + '"]');
  const checkbox = loc('#districts [data-district="' + code + '"]');
  await mapClick(page, shape, profile.touch);
  assert.equal(await shape.getAttribute("aria-pressed"), "false");
  assert.equal(await checkbox.isChecked(), false);
  await checkbox.check();
  assert.equal(await shape.getAttribute("aria-pressed"), "true");
  if (!profile.touch) {
    await shape.press("Space");
    assert.equal(await shape.getAttribute("aria-pressed"), "false");
    await shape.press("Enter");
    assert.equal(await shape.getAttribute("aria-pressed"), "true");
  }
  await loc("#revoked").check();
  assert.equal(await shape.getAttribute("role"), null);
  assert.equal(await checkbox.isChecked(), false);
  assert.equal(await checkbox.isEnabled(), false);
  await loc("#capacityMode").selectOption("low");
  assert.equal(await loc("#confirmSponsored").isEnabled(), false);
  await loc("#capacityMode").selectOption("missing");
  assert.equal(await loc("#confirmSponsored").isEnabled(), false);
  await loc("#lang").selectOption("EN");
  assert.equal(await loc("#running").textContent(), "Existing test campaign C‑001: displaying.");
  assert.match(await loc("#capacity").textContent(), /unknown/i);
  await loc("#capacityMode").selectOption("normal");
  assert.equal(await loc("#confirmSponsored").isEnabled(), true);
  await loc("#confirmSponsored").click();
  assert.match(await loc("#sponsoredResult").textContent(), /confirmed/i);
  await page.reload();
  assert.equal(await loc("html").getAttribute("lang"), "en");
  assert.equal(await loc("#campaign").isVisible(), true);
  assert.equal(await loc("#draft").inputValue(), "GEO test · Amsterdam");
  assert.equal(await loc("#package").inputValue(), "1");
  assert.equal(await loc("#duration").inputValue(), "9");
  assert.equal(await checkbox.isEnabled(), false);
  await page.screenshot({ path: resolve(output, profile.name + ".png"), fullPage: true });
  await loc("#enabled").uncheck();
  assert.equal(await loc("#campaign").isVisible(), false);
  assert.equal(await loc("#choice").isVisible(), false);
  assert.equal(await loc("#preview").isVisible(), true);
  assert.match(await loc("#running").textContent(), /C‑001: displaying/);
  await loc("#profile").selectOption("graft");
  assert.match(await loc("#address").textContent(), /Raadhuisstraat 24/);
  assert.equal(await loc("#draft").inputValue(), "");
  await loc("#draft").fill("GEO test · Graft");
  await loc("#enabled").check();
  await loc("#sponsored").click();
  assert.equal(await loc('#map [fill="#a7d7a9"]').getAttribute("data-district"), "BU03611002");
  await loc("#profile").selectOption("amsterdam");
  await loc("#lang").selectOption("FR");
  assert.equal(await loc("#draft").inputValue(), "GEO test · Amsterdam");
  assert.match(await loc("#running").textContent(), /C‑001/);
  assert.ok(running.includes("C‑001"));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(remote, []);
  assert.deepEqual(errors, []);
  await page.close();
  return profile;
}

(async () => {
  const dest = resolve(process.argv[2] || ".");
  await mkdir(dest, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.GEO_CHROMIUM });
  try {
    const profiles = [
      { name: "ordinateur", viewport: { width: 1440, height: 900 }, touch: false },
      { name: "smartphone", viewport: { width: 390, height: 844 }, touch: true }
    ];
    const result = await Promise.all(profiles.map(profile => verify(browser, profile, dest)));
    const proof = {
      date: new Date().toISOString(), browser: browser.version(), profiles: result,
      scenarios: ["OFF direct gratuit", "ON choix", "profil Amsterdam et Graft", "carte CBS et sélection tactile",
        "zone grise et révocation", "capacité disponible, insuffisante et inconnue", "forfaits",
        "reprise du brouillon et langues", "OFF depuis le sponsorisé", "campagne C-001 maintenue",
        "aucune requête externe et aucune erreur JavaScript"]
    };
    await writeFile(resolve(dest, "recette.json"), JSON.stringify(proof, null, 2) + "\n");
    console.log(JSON.stringify(proof));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
