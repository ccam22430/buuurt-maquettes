import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { codes } from '../modular/components/render.mjs';

const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'buuurt-mobile-'));
const root = new URL('../', import.meta.url);
const marker = 'BUUURT MOBILE TEST 83471';
const output = 'mobile.html';
const interactive = 'interactive.html';

function build() {
  for (const [tool, file] of [['bundle-mobile.mjs', output], ['bundle-preview.cjs', interactive]]) {
    execFileSync(process.execPath, ['tools/' + tool, file], { cwd: isolated });
  }
  const html = fs.readFileSync(path.join(isolated, output), 'utf8');
  const views = new Map([...html.matchAll(/<article class="screen" id="([^"]+)">([\s\S]*?)<\/article>/g)]
    .map(([, id, content]) => [id, content]));
  const bundle = fs.readFileSync(path.join(isolated, interactive), 'utf8');
  return { html, views, bundle };
}

function change(file, mutate) {
  const target = path.join(isolated, 'modular', file);
  const original = fs.readFileSync(target, 'utf8');
  const data = JSON.parse(original);
  mutate(data);
  fs.writeFileSync(target, JSON.stringify(data));
  try { return build(); }
  finally { fs.writeFileSync(target, original); }
}

function changedViews(base, edited) {
  return [...base.views.keys()].filter(id => base.views.get(id) !== edited.views.get(id));
}

try {
  for (const dir of ['modular', 'tools']) fs.cpSync(new URL(dir, root), path.join(isolated, dir), { recursive: true });
  const base = build();
  const expected = ['nl', 'en'].flatMap(lang => codes.map(code => lang + '-' + code));
  assert.equal(expected.length, 40);
  assert.deepEqual([...base.views.keys()], expected);
  const ids = [...base.html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const unique = new Set(ids);
  assert.equal(ids.length, unique.size);
  const links = [...base.html.matchAll(/\shref="([^"]+)"/g)].map(match => match[1]);
  assert(links.every(href => href.startsWith('#') && unique.has(href.slice(1))));
  assert(expected.every(id => links.includes('#' + id)));
  assert(!/<(?:script|iframe)\b/i.test(base.html));
  assert(!/\b(?:src|srcset)="https?:/i.test(base.html));

  const edited = change('screens/MER-003.json', page => {
    const index = page.html.findIndex(line => line.includes('</h2>'));
    assert(index !== -1);
    page.html[index] = page.html[index].replace('</h2>', ' ' + marker + '</h2>');
  });
  const local = ['nl-MER-003', 'en-MER-003'];
  assert.deepEqual(changedViews(base, edited), local);
  assert(local.every(id => edited.views.get(id).includes(marker)));
  assert(!base.bundle.includes(marker) && edited.bundle.includes(marker));

  const components = change('components/shared.json', shared => {
    shared['feed-category-tabs'] = shared['feed-category-tabs'].replace('</div>', '<span>' + marker + '</span></div>');
  });
  const feed = ['USR-SEL-003', 'USR-STR-001', 'USR-STO-001', 'USR-POS-001', 'USR-LOC-001'];
  const group = ['nl', 'en'].flatMap(lang => feed.map(code => lang + '-' + code));
  assert.deepEqual(changedViews(base, components), group);
  assert(group.every(id => components.views.get(id).includes(marker)));
  assert(components.bundle.includes(marker));
  const clean = build();
  assert.equal(clean.html, base.html);
  assert.equal(clean.bundle, base.bundle);
  console.log('PASS : 40 vues, identifiants uniques et liens valides. Retouche locale : 2 vues, 38 identiques. Filtre : 10 vues, 30 identiques. Deux aperçus régénérés.');
} finally {
  fs.rmSync(isolated, { recursive: true, force: true });
}
