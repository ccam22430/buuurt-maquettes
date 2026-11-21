const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'modular');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const components = json('components/shared.json');
const screens = Object.fromEntries(
  fs.readdirSync(path.join(root, 'screens'))
    .filter(file => file.endsWith('.json'))
    .map(file => ['screens/' + file, json('screens/' + file)])
);

const payload = JSON.stringify({ 'components/shared.json': components, ...screens }).replace(/</g, '\\u003c');
const loader = 'const embeddedFiles = ' + payload + ';\nasync function loadJson(path) {\n' +
  '  if (!Object.hasOwn(embeddedFiles, path)) throw new Error(path);\n' +
  '  return embeddedFiles[path];\n}';
const source = read('index.html');
const html = source.replace('<script type="module">', '<script>')
  .replace(/import \{ composeScreen \}[^\n]+/, () => read('components/compose.mjs').replace(/^export /gm, ''))
  .replace(/import \{ codes, screenMarkup \}[^\n]+/, () => read('components/render.mjs').replace(/^export /gm, ''))
  .replace(/async function loadJson\(path\) \{[^}]+\}/, () => loader);
if (html === source || !html.includes('const embeddedFiles =')) throw new Error('Preview bundle failed');
const output = process.argv[2];
if (!output) throw new Error('Specify the output HTML path');
fs.writeFileSync(output, html);
