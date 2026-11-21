// Non-destructive extraction of all 20 BUUURT mockups.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const original=path.join(root,'BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html');
const raw=fs.readFileSync(original,'utf8');
const marker='const pages=';
const begin=raw.indexOf(marker),end=raw.indexOf('];',begin);
assert(begin>=0&&end>begin,'Original pages array not found');
const pages=JSON.parse(raw.slice(begin+marker.length,end+1));
assert.equal(pages.length,20);
assert.equal(new Set(pages.map(p=>p.fr)).size,20);
assert.equal(new Set(pages.map(p=>p.en)).size,20);
const dir=path.join(root,'modular','screens');
fs.mkdirSync(dir,{recursive:true});
for(const p of pages){
 assert.match(p.fr,/^[A-Z]+(?:-[A-Z]+)?-\d{3}$/);
 assert.match(p.en,/^[A-Z]+(?:-[A-Z]+)?-\d{3}$/);
 assert.ok(p.html.length>500,'Screen too small: '+p.fr);
 const target=path.join(dir,p.en+'.json');
 fs.writeFileSync(target,JSON.stringify(p));
 assert.deepEqual(JSON.parse(fs.readFileSync(target,'utf8')),p);
}
const codes=pages.map(p=>p.en);
const loader="async function initialize(){\nconst pages=await Promise.all("+JSON.stringify(codes)+".map(async code=>{const response=await fetch('screens/'+code+'.json');if(!response.ok)throw Error('Unable to load screen: '+code);return response.json()}));\n";
const suffix='</script></body></html>';
const after=raw.slice(end+2);
assert(after.endsWith(suffix),'Unexpected viewer ending');
const output=raw.slice(0,begin)+loader+after.slice(0,-suffix.length)+
 "\n}\ninitialize().catch(error=>{document.body.insertAdjacentHTML('beforeend','<p role=\"alert\">Unable to load mockup library: '+String(error.message)+'</p>');console.error(error)});\n"+suffix;
fs.writeFileSync(path.join(root,'modular','index.html'),output);
assert(output.length<100000,'Viewer too large');
assert.equal((output.match(/const translations=/g)||[]).length,1);
assert.equal((output.match(/function screenMarkup/g)||[]).length,1);
assert.equal((output.match(/const pages=/g)||[]).length,1);
assert.equal(fs.readdirSync(dir).filter(f=>f.endsWith('.json')).length,20);
console.log('PASS: 20 screens preserved exactly, original untouched; viewer '+output.length+' chars');
