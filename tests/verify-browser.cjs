const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const parity = process.argv.includes('--parity');
const mobile = process.argv.includes('--mobile');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BUUURT_CHROMIUM || undefined, args: ['--no-sandbox'] });
  try {
    const base = 'http://127.0.0.1:8765/';
    const context = await browser.newContext({viewport: mobile ? {width:390,height:844} : {width:1280,height:1150}});
    const preview = await context.newPage();
    const pages = parity ? [await context.newPage(), preview] : [preview];
    const errors = [];
    for (const page of pages) {
      page.on('pageerror', err => errors.push(err.message));
      page.on('response', res => {if (res.status() >= 400 && !res.url().endsWith('/favicon.ico')) errors.push(res.status() + ' ' + res.url());});
    }
    const old = 'BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html';
    await Promise.all(pages.map((page,i)=>page.goto(base+(parity && i === 0 ? old : 'modular/')+'#COM-001')));
    await Promise.all(pages.map(page=>page.locator('#nav button').nth(19).waitFor({state:'attached'})));
    assert.equal(new URL(preview.url()).hash,'#MER-001');
    assert.equal(await preview.locator('#uiLanguage').inputValue(), 'nl');
    async function updatePreview(page, action) {
      await page.locator('#preview').evaluate(frame => {
        window.previewLoadedForTest = new Promise(resolve => frame.addEventListener('load', resolve, {once:true}));
      });
      await action();
      await page.evaluate(() => window.previewLoadedForTest);
    }
    const codes = [];
    for (let i=0; i<20; i++) {
      await Promise.all(pages.map(page=>updatePreview(page,()=>page.locator('#nav button').nth(i).click())));
      const hash = new URL(pages[0].url()).hash;
      if (parity) assert.equal(new URL(preview.url()).hash,hash);
      codes.push(hash);
      for (const lang of ['nl','fr','en']) {
        const markup = await Promise.all(pages.map(async page=>{
          const selector = page.locator('#uiLanguage');
          if (await selector.inputValue() !== lang) {
            await updatePreview(page,()=>selector.selectOption(lang));
          }
          await page.mouse.move(0,0);
          return page.locator('#preview').getAttribute('srcdoc');
        }));
        assert(markup[0].includes('<html lang="' + lang + '"'));
        if (parity && lang === 'fr') assert.equal(markup[1],markup[0],hash+' '+lang);
        const renders = await Promise.all(pages.map(page =>
          page.frameLocator('#preview').locator('html[lang='+lang+'] body').evaluate(async body => {
            await body.ownerDocument.fonts.ready;
            const images = [...body.ownerDocument.images];
            await Promise.all(images.map(image => image.decode()));
            const properties = ['display','visibility','opacity','color','background-color',
              'font-family','font-size','font-weight','line-height','border','border-radius',
              'box-shadow','text-align','overflow','object-fit','transform'];
            return {
              images: images.map(image => [image.naturalWidth, image.naturalHeight]),
              elements: [body,...body.querySelectorAll('*')].map(element => {
                const {x,y,width,height} = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return [element.tagName,x,y,width,height,...properties.map(name=>style.getPropertyValue(name))];
              })
            };
          })
        ));
        if (parity && lang === 'fr' && !mobile) {
          assert.deepEqual(renders[1], renders[0], hash + ' French layout');
        } else if (parity) {
          assert.deepEqual(renders[1].images, renders[0].images, hash + ' images');
          assert.deepEqual(renders[1].elements.map(el => el[0]), renders[0].elements.map(el => el[0]), hash + ' element structure');
        }
        const mockup = preview.frameLocator('#preview');
        assert.equal(await mockup.locator('.buuurt-bottom-nav').count(), 1);
        if (mobile) {
          assert(await mockup.locator('.phone').evaluate(phone =>
            phone.getBoundingClientRect().right <= phone.ownerDocument.documentElement.clientWidth
          ), hash + ' mobile preview width');
        }
        if (lang === 'en') {
          assert.equal(await mockup.locator('.buuurt-bottom-nav').getAttribute('aria-label'), 'Main navigation');
          assert.match(await mockup.locator('.buuurt-bottom-nav').innerText(), /Shops\s+♡\s+Favorites/);
          if (hash === '#USR-WEB-001') {
            assert.equal(await mockup.locator('[aria-label="3 unread notifications"]').getAttribute('title'), '3 unread notifications');
          }
        }
      }
    }
    await preview.locator('#next').click();
    assert.equal(new URL(preview.url()).hash,codes[0]);
    await preview.locator('#prev').click();
    assert.equal(new URL(preview.url()).hash,codes[19]);
    const fs = require('node:fs');
    const path = require('node:path');
    const { composeScreen } = await import('../modular/components/compose.mjs');
    const components = require('../modular/components/shared.json');
    const directory = path.join(__dirname, '../modular/screens');
    const screens = fs.readdirSync(directory).filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')));
    const links = screens.flatMap(screen =>
      [...composeScreen(screen.html, components).matchAll(/href="([A-Z-]+\d{3})\.html"/g)].map(match => [screen.en, match[1]])
    );
    const targets = new Map(screens.map(screen => [screen.fr, screen.en]));
    for (const [source, target] of new Map(links.map(link => [link.join('/'), link])).values()) {
      await preview.goto(base + 'modular/?source=' + source + '#' + source);
      const link = preview.frameLocator('#preview').locator('a[href="' + target + '.html"]:visible').first();
      await link.waitFor();
      await updatePreview(preview, () => link.click());
      assert.equal(new URL(preview.url()).hash, '#' + targets.get(target));
    }
    await preview.goto(base + 'modular/?arrival#USR-LOC-002');
    const frame = preview.frameLocator('#preview');
    await frame.locator('.copy.nl input[type=email]').fill('review@example.test');
    await frame.locator('.copy.nl input[type=checkbox]').check();
    await updatePreview(preview, () => frame.locator('label[for="len"]').click());
    assert.equal(await preview.locator('#uiLanguage').inputValue(), 'en');
    assert.equal(await frame.locator('.copy.en input[type=email]').inputValue(), 'review@example.test');
    assert(await frame.locator('.copy.en input[type=checkbox]').isChecked());
    await updatePreview(preview, () => preview.locator('#uiLanguage').selectOption('nl'));
    assert.equal(await frame.locator('.copy.nl input[type=email]').inputValue(), 'review@example.test');
    assert(await frame.locator('.copy.nl input[type=checkbox]').isChecked());
    await updatePreview(preview, () => preview.locator('#uiLanguage').selectOption('en'));
    const arrivalLink = frame.locator('a[href="HAB-MAN-001.html"]:visible').first();
    await updatePreview(preview, () => arrivalLink.click());
    assert.equal(new URL(preview.url()).hash, '#USR-SEL-001');
    assert(await frame.locator('html[lang="en"]').count());
    assert.deepEqual(errors, []);
    await preview.goto('file://' + require('node:path').resolve('preview-review.html'));
    assert.equal(await preview.locator('#nav button').count(), 20);
    for (let index = 0; index < 20; index++) {
      await updatePreview(preview, () => preview.locator('#nav button').nth(index).click());
      for (const lang of ['nl', 'en']) {
        const selector = preview.locator('#uiLanguage');
        if (await selector.inputValue() !== lang) await updatePreview(preview, () => selector.selectOption(lang));
        assert(await preview.frameLocator('#preview').locator('html[lang=' + lang + ']').count());
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS Chromium ' + (mobile ? '390×844' : '1280×1150') +
      ': 60 rendus, 11 parcours, état du formulaire et 40 vues hors ligne');
  } finally { await browser.close(); }
})().catch(err=>{console.error(err); process.exitCode=1;});
