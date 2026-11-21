const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const readLegacyScreens = require('../tools/split-library.cjs');

async function verify() {
  const { composeScreen } = await import('../modular/components/compose.mjs');
  const root = path.join(__dirname, '..', 'modular');
  const screens = path.join(root, 'screens');
  const components = require('../modular/components/shared.json');
  const pages = fs.readdirSync(screens).filter(file => file.endsWith('.json')).map(file => {
    const page = JSON.parse(fs.readFileSync(path.join(screens, file), 'utf8'));
    assert.equal(file, page.en + '.json');
    assert(page.html.every(line => typeof line === 'string'), file);
    return page;
  });
  assert.equal(pages.length, 20);
  const codes = new Set(pages.flatMap(page => [page.en, page.fr]));
  assert.equal(codes.size, 40);
  const rendered = pages.map(page => ({ ...page, html: composeScreen(page.html, components) }));
  for (const page of rendered) {
    assert.match(page.html, /<html lang="fr"/);
    for (const [, code] of page.html.matchAll(/href="([A-Z-]+\d{3})\.html"/g)) {
      assert(codes.has(code), page.en + ' → ' + code);
    }
  }
  assert.throws(() => composeScreen(['{{missing}}'], components), /Unknown screen component/);
  if (process.argv.includes('--parity')) {
    const expectedScopes = {
      'base-styles': 20,
      'brand-logo': 20,
      'header-menu': 20,
      'bottom-navigation': 20,
      'standard-header-indicator': 18,
      'notification-header-indicator': 2,
      'feed-category-tabs': 5,
    };
    for (const [name, count] of Object.entries(expectedScopes)) {
      const changed = { ...components, [name]: '<!-- test component -->' };
      const affected = pages.filter((page, index) => composeScreen(page.html, changed) !== rendered[index].html);
      assert.equal(affected.length, count, name);
    }
    const localChange = pages.map((page, index) => index === 0
      ? { ...page, html: [...page.html, '<!-- test local -->'] }
      : page);
    assert.deepEqual(localChange.filter((page, index) =>
      composeScreen(page.html, components) !== rendered[index].html).map(page => page.en), [pages[0].en]);
  }
  if (process.argv.includes('--parity')) {
    const legacy = readLegacyScreens().sort((a, b) => a.en.localeCompare(b.en));
    const original = legacy.find(page => page.en === 'MER-001');
    const merchant = rendered.find(page => page.en === 'MER-001');
    const intro = merchant.html.match(/<style>\.merchant-intro[\s\S]+?<\/main>/)?.[0];
    assert(intro, 'Merchant introduction is missing');
    for (const label of ['Rejoignez BUUURT', 'Créer mon compte commerce', 'J’ai déjà un compte']) {
      assert(intro.includes(label), label);
    }
    const start = original.html.indexOf('<div class="section">');
    const end = original.html.indexOf(components['bottom-navigation']);
    assert(start > 0 && end > start);
    original.html = original.html.slice(0, start).replace(
      components['standard-header-indicator'], components['notification-header-indicator']
    ) + intro + original.html.slice(end);
    assert.deepEqual(rendered, legacy);
  }
  console.log('PASS: 20 écrans, 40 codes, composition et destinations internes');
}

verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
