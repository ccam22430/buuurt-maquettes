// Targeted, idempotent correction for HAB-SIT-001 only.
// Run from repository root: node scripts/fix-hab-sit-001-bell.cjs
const fs = require('node:fs');
const path = 'BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html';
const html = fs.readFileSync(path, 'utf8');
const start = html.indexOf('"fr": "HAB-SIT-001"');
const end = html.indexOf('"}, {"fr":', start + 30);
if (start < 0 || end < 0) throw Error('HAB-SIT-001 page boundaries not found');
const page = html.slice(start, end);
const before = '◎ NL⌄  ♧';
const after = '◎ NL⌄  🔔';
if (page.includes(after) && !page.includes(before)) {
  console.log('PASS: notification bell already present in HAB-SIT-001');
  process.exit(0);
}
if (page.split(before).length !== 2) throw Error('Expected exactly one profile symbol in HAB-SIT-001 header');
const next = html.slice(0, start) + page.replace(before, after) + html.slice(end);
if (next.split(after).length - html.split(after).length !== 1) throw Error('Unexpected bell count');
if (next.length !== html.length + 1) throw Error('Unexpected size change');
fs.writeFileSync(path, next, 'utf8');
console.log('PASS: replaced one header icon in HAB-SIT-001; other pages untouched');
