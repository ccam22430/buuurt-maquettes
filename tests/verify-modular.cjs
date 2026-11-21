const fs=require('node:fs'),assert=require('node:assert/strict');
const raw=fs.readFileSync('BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html','utf8');
const begin=raw.indexOf('const pages='),end=raw.indexOf('];',begin);
assert(begin>=0&&end>begin);
const original=JSON.parse(raw.slice(begin+'const pages='.length,end+1));
assert.equal(original.length,20);
for(const page of original){
 const file='modular/screens/'+page.en+'.json';
 assert.ok(fs.existsSync(file),file);
 assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),page);
}
const viewer=fs.readFileSync('modular/index.html','utf8');
assert.ok(viewer.length<100000);
assert.ok(viewer.includes("fetch('screens/'+code+'.json')"));
assert.ok(viewer.includes('function screenMarkup'));
assert.ok(viewer.includes("location.hash=p.en"));
assert.equal((viewer.match(/const translations=/g)||[]).length,1);
assert.equal(fs.readdirSync('modular/screens').filter(x=>x.endsWith('.json')).length,20);
console.log('PASS: 20 screen objects identical to source, loader, translations and navigation present');
