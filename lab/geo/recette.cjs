/* Playwright + Chromium with live PDOK requests. No fixture interception. */
const assert = require('node:assert/strict');
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.GEO_PLAYWRIGHT_MODULE || 'playwright');
const reference = require('./reference/qualification.json');

const cases = reference.cbs.filter(entry => entry.year === 2025 && entry.level === 'buurten');
const profiles = [
  { name: 'ordinateur', viewport: { width: 1440, height: 900 } },
  { name: 'smartphone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
];

async function submit(page, address) {
  await page.locator('#address').fill(address);
  await page.locator('form button').click();
  await page.waitForFunction(() =>
    /Échec|voisins détectés/.test(document.querySelector('#status').textContent), null, { timeout: 70000 });
  return page.locator('#status').textContent();
}

async function clickPolygon(page, polygon, mobile) {
  await polygon.scrollIntoViewIfNeeded();
  const point = await polygon.evaluate(element => {
    const box = element.getBoundingClientRect();
    for (let row = 1; row < 20; row++) {
      for (let col = 1; col < 20; col++) {
        const x = box.left + (box.width * col) / 20;
        const y = box.top + (box.height * row) / 20;
        if (document.elementFromPoint(x, y) === element) return { x, y };
      }
    }
    return null;
  });
  assert.ok(point, 'No clickable point found inside the actual polygon');
  if (mobile) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

async function runCase(browser, profile, geo, output) {
  const { name, ...options } = profile;
  const context = await browser.newContext(options);
  try {
    const page = await context.newPage();
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.hostname === 'api.pdok.nl') network.push({ path: url.pathname, status: response.status() });
    });
    await page.goto(pathToFileURL(resolve(__dirname, 'index.html')).href);
    assert.equal(await submit(page, reference.addresses[geo.case].weergavenaam),
      reference.addresses[geo.case].weergavenaam + ' — ' + geo.home[1] + ' · ' + geo.neighbors.length + ' voisins détectés');
    assert.equal(await page.locator('#map [fill="#83ce87"]').getAttribute('data-code'), geo.home[0]);
    const active = page.locator('#map [role="button"]');
    const expected = geo.neighbors.map(neighbor => neighbor[0]).sort();
    assert.deepEqual((await active.evaluateAll(nodes => nodes.map(node => node.dataset.code))).sort(), expected);
    assert.equal(await page.locator('#choices input:checked').count(), expected.length);
    assert.equal(await page.locator('#map [aria-pressed="true"]').count(), expected.length);

    const gray = page.locator('#map [fill="#d4d7db"]');
    assert.ok(await gray.count() > 0);
    assert.equal(await gray.and(page.locator('[tabindex], [role]')).count(), 0);
    for (const code of geo.point_only) {
      const feature = page.locator('#map [data-code="' + code + '"]');
      if (await feature.count()) assert.equal(await feature.getAttribute('fill'), '#d4d7db');
    }

    const initial = await page.locator('#map').getAttribute('viewBox');
    await page.locator('#zoom-in').click();
    assert.notEqual(await page.locator('#map').getAttribute('viewBox'), initial);
    await page.locator('#zoom-reset').click();
    assert.equal(await page.locator('#map').getAttribute('viewBox'), initial);

    await page.screenshot({ path: resolve(output, geo.case + '-' + name + '.png'), fullPage: true });
    const selected = active.first();
    const label = await selected.getAttribute('aria-label');
    const checkbox = page.getByRole('checkbox', { name: label, exact: true });
    await clickPolygon(page, selected, !!options.hasTouch);
    assert.equal(await selected.getAttribute('aria-pressed'), 'false');
    assert.equal(await checkbox.isChecked(), false);
    await checkbox.check();
    assert.equal(await selected.getAttribute('aria-pressed'), 'true');
    if (!options.hasTouch) {
      await selected.press('Space');
      assert.equal(await selected.getAttribute('aria-pressed'), 'false');
      await selected.press('Enter');
      assert.equal(await selected.getAttribute('aria-pressed'), 'true');
    }
    assert.equal(await page.locator('#choices input:checked').count(), expected.length);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.locator('#address').fill('Adresse modifiée');
    assert.equal(await page.locator('#map path').count(), 0);
    assert.equal(await page.locator('#count').textContent(), '');
    if (!options.hasTouch && geo.case === 'amsterdam') {
      assert.match(await submit(page, 'Jan Evertsenstraat 55 Amsterdam'), /Adresse non confirmée/);
      assert.equal(await page.locator('#map path').count(), 0);
    }
    assert.deepEqual(errors, []);
    assert.ok(network.length >= 3 && network.every(response => response.status === 200), JSON.stringify(network));
    return { case: geo.case, profile: name, viewport: options.viewport, home: geo.home, neighbors: expected,
      liveHttp: network, touch: !!options.hasTouch, keyboard: !options.hasTouch, zoom: true, grayLocked: true,
      pageErrors: errors, screenshot: geo.case + '-' + name + '.png' };
  } finally {
    await context.close();
  }
}

async function main() {
  const output = resolve(process.argv[2] || '/tmp/buuurt-geo-recipe');
  await mkdir(output, { recursive: true });
  const executablePath = process.env.GEO_CHROMIUM;
  const proxy = process.env.GEO_CHROMIUM_PROXY;
  const browser = await chromium.launch({ executablePath, ...(proxy ? { proxy: { server: proxy } } : {}) });
  try {
    const historical = process.env.GEO_V6_ORIGINAL;
    let historicalStatus;
    if (historical) {
      const page = await browser.newPage();
      const oldRequests = [];
      page.on('request', request => {
        if (request.url().includes('/cbs/wijkenbuurten/2025/')) oldRequests.push(request.url());
      });
      await page.goto(pathToFileURL(resolve(historical)).href);
      historicalStatus = await submit(page, reference.addresses.amsterdam.weergavenaam);
      assert.equal(oldRequests.length, 1);
      assert.match(historicalStatus, /HTTP 404|Failed to fetch/);
      assert.equal(await page.locator('#map path').count(), 0);
      console.log('V6 historique :', historicalStatus);
      await page.close();
    }
    const results = await Promise.all(profiles.flatMap(profile => cases.map(geo => runCase(browser, profile, geo, output))));
    const proof = { at: new Date().toISOString(), browser: browser.version(), originalV6Tested: !!historical, historicalStatus, results };
    await writeFile(resolve(output, 'recette.json'), JSON.stringify(proof, null, 2) + '\n');
    console.log(JSON.stringify(proof, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
