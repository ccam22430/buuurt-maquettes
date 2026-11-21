// Read the historical screen objects for migration parity checks.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

module.exports = function readLegacyScreens() {
  const file = path.join(__dirname, '..', 'BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html');
  const raw = fs.readFileSync(file, 'utf8');
  const marker = 'const pages=';
  const begin = raw.indexOf(marker);
  const end = raw.indexOf('];', begin);
  assert(begin >= 0 && end > begin, 'Original pages array not found');
  return JSON.parse(raw.slice(begin + marker.length, end + 1));
};
