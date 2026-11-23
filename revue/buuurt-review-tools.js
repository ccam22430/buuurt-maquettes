/* BUUURT review-only shared typography toolbar. Does not modify app settings. */
(function(){
'use strict';
function mount(){
 if(document.getElementById('buuurt-review-tools'))return;
 const css=document.createElement('style');css.textContent='#buuurt-review-tools{position:relative;z-index:1000;max-width:440px;margin:12px auto 0;padding:12px 14px;border:1px solid #ddd;border-radius:12px;background:#fff;box-shadow:0 2px 10px #0001;display:flex;gap:12px;align-items:center;justify-content:space-between;font:13px Arial,sans-serif;color:#222}#buuurt-review-tools select{padding:7px 10px;border:1px solid #bbb;border-radius:8px;background:white;color:#222;max-width:210px}#buuurt-review-tools label{margin:0;font:inherit;display:flex;gap:10px;align-items:center}';document.head.appendChild(css);
 const panel=document.createElement('aside');panel.id='buuurt-review-tools';panel.setAttribute('aria-label','Outils de présentation de la maquette');const label=document.createElement('label');label.textContent='Police de la maquette';const select=document.createElement('select');select.setAttribute('aria-label','Police de la maquette');[['default','Nunito — police de référence'],['Arial, sans-serif','Arial'],['Georgia, serif','Georgia'],['Verdana, sans-serif','Verdana'],['Tahoma, sans-serif','Tahoma'],['Trebuchet MS, sans-serif','Trebuchet MS']].forEach(([value,name])=>{const o=document.createElement('option');o.value=value;o.textContent=name;select.appendChild(o)});label.appendChild(select);panel.appendChild(label);
 const target=document.querySelector('.phone')||document.querySelector('[class*="phone"]')||document.querySelector('main')||document.body.firstElementChild;
 if(target&&target.parentNode)target.parentNode.insertBefore(panel,target);else document.body.prepend(panel);
 const fontOverride=document.createElement('style');fontOverride.id='buuurt-review-font-override';document.head.appendChild(fontOverride);
 select.addEventListener('change',()=>{const family=select.value==='default'?'Nunito, Arial, sans-serif':select.value;fontOverride.textContent='.phone,.phone *{font-family:'+family+'!important}';});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
