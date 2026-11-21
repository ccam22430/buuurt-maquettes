const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function verify() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const external = [];
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await page.goto(pathToFileURL(process.argv[2]).href);
    const screens = page.locator('.screen');
    assert.equal(await screens.count(), 40);
    assert.equal(await page.locator('.screen .phone:visible').count(), 40);
    assert(await screens.evaluateAll(elements => elements.every(element => {
      const { left, right } = element.querySelector('.phone').getBoundingClientRect();
      return left >= 0 && right <= element.ownerDocument.documentElement.clientWidth;
    })));
    await page.getByRole('link', { name: 'English', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#en');
    await page.locator('#en .index a[href="#en-USR-LOC-002"]').click();
    assert.equal(new URL(page.url()).hash, '#en-USR-LOC-002');
    assert(await page.locator('#en-USR-LOC-002 .copy.en').isVisible());
    assert(!(await page.locator('#en-USR-LOC-002 .copy.nl').isVisible()));
    await page.locator('#en-USR-LOC-002 .copy.en a.cta').click();
    assert.equal(new URL(page.url()).hash, '#en-USR-SEL-001');
    assert.deepEqual(external, []);
    console.log('PASS Chromium 390×844 : 40 vues visibles avec JavaScript désactivé, sommaire et lien interne, aucun chargement réseau.');
  } finally {
    await browser.close();
  }
}

verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
