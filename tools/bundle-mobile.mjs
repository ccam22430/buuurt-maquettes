import assert from 'node:assert/strict';
import fs from 'node:fs';
import { composeScreen } from '../modular/components/compose.mjs';
import { codes, screenMarkup } from '../modular/components/render.mjs';

const output = process.argv[2];
if (!output) throw new Error('Indiquer le chemin du fichier HTML');

const readJson = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const shared = readJson('../modular/components/shared.json');
const pages = codes.map(code => {
  const page = readJson('../modular/screens/' + code + '.json');
  return { ...page, html: composeScreen(page.html, shared) };
});
const targets = new Map(pages.flatMap(page => [[page.en, page.en], [page.fr, page.en]]));
const logo = shared['brand-logo'].match(/src="([^"]+)"/)[1];
assert(logo.startsWith('data:'), 'Le logo doit être intégré au fichier');
const baseStyle = shared['base-styles'].replace(/<\/?style>/g, '');

const languages = [['nl', 'Nederlands'], ['en', 'English'], ['fr', 'Français']];

function renderView(page, lang) {
  const id = lang + '-' + page.en;
  const source = screenMarkup(page, lang);
  const title = source.match(/<title>([^<]+)<\/title>/)[1];
  const start = source.indexOf('<div class="phone">');
  assert(start !== -1, page.en);
  const body = source.slice(start, source.lastIndexOf('</html>'))
    .replace(shared['brand-logo'], '<span class="logo static-logo" role="img" aria-label="BUUURT"></span>')
    .replace(/href="([A-Z-]+\d{3})\.html"/g, (_, code) => {
      assert(targets.has(code), code);
      return 'href="#' + lang + '-' + targets.get(code) + '"';
    })
    .replace(/\b(id|for)="([^"]+)"/g, (_, attr, value) => attr + '="' + id + '-' + value + '"')
    .replace(/name="arrival-lang"/g, 'name="' + id + '-arrival"')
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => '<style>' +
      css.replace(/(^|[},])(\s*\.arrival)/g, '$1#' + id + ' $2')
        .replace(/#(lfr|lnl|len):checked/g, '#' + id + '-$1:checked')
        .replace(/label\[for=(lfr|lnl|len)\]/g, 'label[for=' + id + '-$1]') + '</style>');
  const switcher = languages.map(([code, name]) =>
    '<a href="#' + code + '-' + page.en + '" lang="' + code + '"' +
    (code === lang ? ' aria-current="true"' : '') + '>' + name + '</a>').join('');
  return '<article class="screen" id="' + id + '"><h3>' + title + '</h3><nav class="language screen-language" aria-label="NL / EN / FR">' +
    switcher + '</nav>' + body + '</article>';
}

const body = languages.map(([lang, name]) => {
  const links = pages.map(page => '<li><a href="#' + lang + '-' + page.en + '">' + page.en + '</a></li>');
  return '<section lang="' + lang + '" id="' + lang + '"><h2>' + name + '</h2><ol class="index">' +
    links.join('') + '</ol>\n' + pages.map(page => renderView(page, lang)).join('\n') + '</section>';
}).join('\n');

const css = baseStyle + `
body{max-width:900px;margin:auto;padding:12px}
.screen{margin:24px 0 48px;scroll-margin-top:12px}
.screen>h3{max-width:390px;margin:0 auto;font-size:17px}
.phone{max-width:100%}
.static-logo{display:inline-block;background:center/contain no-repeat url("${logo}")}
.index{columns:2;padding-left:30px}.index li{padding:3px}
.screen .reference{max-width:390px}
.language a{display:inline-block;padding:8px 12px}
.screen-language{max-width:390px;margin:4px auto 0;display:flex;flex-wrap:wrap;gap:4px}
.screen-language a[aria-current]{font-weight:bold;background:#fff;border-radius:8px}
.arrival .langs,.arrival input[type=radio],.arrival .copy{display:none}
section[lang=nl] .arrival .copy.nl,section[lang=en] .arrival .copy.en,section[lang=fr] .arrival .copy.fr{display:block}
`;
assert(!/<(?:script|iframe)\b/i.test(body), 'L’aperçu doit rester statique');
fs.writeFileSync(output, '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>BUUURT — 20 maquettes</title>' +
  '<style>' + css + '</style></head><body><h1>BUUURT — 20 maquettes</h1>' +
  '<nav class="language" aria-label="Langues"><a href="#nl">Nederlands</a> <a href="#en">English</a> <a href="#fr">Français</a></nav>\n' +
  body + '</body></html>');
