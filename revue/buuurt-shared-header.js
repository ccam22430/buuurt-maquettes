/* BUUURT — En-tête officiel des maquettes. Référence validée HAB-FICHE-001.
   Composant unique pour les écrans avec en-tête mobile ; n'affecte pas les pages sans en-tête. */
(()=>{'use strict';
const menuSvg='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
const globeSvg='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
const bellSvg='<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21a2 2 0 0 0 4 0"/></svg>';
const words={fr:['Notifications','Aucune notification non lue.','Notifications de démonstration :','Fermer','Menu BUUURT'],nl:['Meldingen','Geen ongelezen meldingen.','Demonstratiemeldingen:','Sluiten','BUUURT-menu'],en:['Notifications','No unread notifications.','Sample notifications:','Close','BUUURT menu']};
const style=document.createElement('style');style.id='buuurt-official-header-css';style.textContent=`
.phone .buuurt-official-head,.screen .buuurt-official-head,.buuurt-official-head{display:flex!important;align-items:center!important;gap:8px!important;justify-content:space-between!important}
.buuurt-official-head .buuurt-official-menu,.buuurt-official-head .buuurt-official-bell{box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:37px!important;height:37px!important;min-width:37px!important;min-height:37px!important;flex:0 0 37px!important;border:1px solid #dedde1!important;border-radius:18px!important;background:#fff!important;color:#27242a!important;padding:0!important;line-height:1!important;font-size:0!important;cursor:pointer!important;position:relative!important;box-shadow:none!important}
.buuurt-official-head .buuurt-official-menu::before,.buuurt-official-head .buuurt-official-menu::after{content:none!important;display:none!important}
.buuurt-official-head .buuurt-official-menu svg,.buuurt-official-head .buuurt-official-bell svg{display:block!important;flex:none!important}
.buuurt-official-head .buuurt-official-logo{flex:1 1 auto!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important}
.buuurt-official-head .buuurt-official-logo img{max-width:130px!important;max-height:58px!important;width:auto!important;height:auto!important;object-fit:contain!important}
.buuurt-official-head .buuurt-official-right{display:inline-flex!important;align-items:center!important;gap:8px!important;flex:0 0 auto!important}
.buuurt-official-head .buuurt-official-language{display:inline-flex!important;align-items:center!important;gap:4px!important;box-sizing:border-box!important;min-height:37px!important;border:1px solid #dedde1!important;border-radius:13px!important;padding:0 7px!important;background:white!important;color:#27242a!important;white-space:nowrap!important;position:relative!important}
.buuurt-official-head .buuurt-official-language select{width:43px!important;max-width:43px!important;height:35px!important;min-height:0!important;box-sizing:border-box!important;border:0!important;background:transparent!important;color:#27242a!important;font-size:12px!important;font-weight:650!important;padding:0!important;margin:0!important;cursor:pointer!important;opacity:1!important;position:static!important;appearance:auto!important}
.buuurt-official-head .buuurt-official-language .language-code,.buuurt-official-head .buuurt-official-language .chevron{display:none!important}
.buuurt-official-head .buuurt-official-count{position:absolute!important;top:-6px!important;right:-6px!important;min-width:16px!important;height:16px!important;padding:0 3px!important;border-radius:99px!important;background:#d00039!important;color:white!important;font:700 10px/16px system-ui!important;text-align:center!important;display:block!important}
.buuurt-official-head .buuurt-official-count[hidden]{display:none!important}
.buuurt-official-modal{border:0;border-radius:18px;padding:24px;width:min(360px,calc(100vw - 36px));box-shadow:0 20px 65px #0004;background:white;color:#222}.buuurt-official-modal::backdrop{background:#0007}.buuurt-official-modal button{font:inherit;padding:9px 14px;background:#fff;border:1px solid #ddd;border-radius:9px;cursor:pointer}`;
document.head.append(style);
function init(){
 const sample=new URLSearchParams(location.search).get('notifications');
 const headers=[...document.querySelectorAll('.phone header,.phone .head,.phone .header,.screen header,.screen .header,body>main>header')];
 for(const head of headers){
  if(head.dataset.buuurtOfficial==='1')continue;
  const menu=head.querySelector('#menu,.menu,.hamb,button[aria-label="Menu"],[aria-label="Menu"]');
  const select=head.querySelector('#language,#lang,.language-select,.lang-select,select.lang,select[aria-label*="lang" i]');
  const logo=head.querySelector('a.logo,.static-logo,img.official-logo,img.logo');
  if(!menu||!select||!logo)continue;
  head.dataset.buuurtOfficial='1';head.classList.add('buuurt-official-head');
  menu.classList.add('buuurt-official-menu');menu.innerHTML=menuSvg;
  if(!menu.matches('button,a')){menu.setAttribute('role','button');menu.tabIndex=0;menu.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();menu.click()}})}
  menu.setAttribute('aria-label','Menu');
  logo.classList.add('buuurt-official-logo');
  let right=head.querySelector('.actions,.right')||(select.parentElement?.parentElement===head&&select.parentElement.tagName==='DIV'?select.parentElement:null);
  if(!right){right=document.createElement('span');head.append(right)}
  right.classList.add('buuurt-official-right');
  let lang=select.closest('.language-switch,.buuurt-global-lang,.buuurt-official-language');
  if(!lang){lang=document.createElement('span');select.before(lang);lang.append(select)}
  lang.classList.add('buuurt-official-language');
  // Existing merchant headers already contain their own globe and chevron.
  // Remove only decorative siblings; preserve the native select and its listeners.
  [...lang.children].filter(el=>el!==select&&!el.classList.contains('buuurt-official-globe')&&!el.classList.contains('language-code')&&!el.classList.contains('chevron')).forEach(el=>el.remove());
  if(!lang.querySelector('.buuurt-official-globe')){const icon=document.createElement('span');icon.className='buuurt-official-globe';icon.innerHTML=globeSvg;lang.prepend(icon)}
  if(lang.parentElement!==right)right.prepend(lang);
  [...select.options].forEach(o=>{if(['nl','en','fr'].includes(o.value.toLowerCase()))o.textContent=o.value.toUpperCase()});
  const existing=head.querySelector('#bell,.bell,[aria-label*="notification" i]');
  let count=existing?.querySelector('.badge,.count,.buuurt-global-count')?.textContent?.trim();
  count=/^\d+$/.test(count||'')?Number(count):0;
  if(/^\d{1,2}$/.test(sample||''))count=Number(sample);
  const bell=document.createElement('button');bell.type='button';bell.className='buuurt-official-bell';bell.innerHTML=bellSvg;
  const badge=document.createElement('span');badge.className='buuurt-official-count';badge.textContent=String(count);badge.hidden=count===0;bell.append(badge);
  const currentLang=()=>{const v=select.value?.toLowerCase()||'nl';return words[v]?v:'nl'};
  const label=()=>bell.setAttribute('aria-label',words[currentLang()][0]+(count?' ('+count+')':''));
  label();select.addEventListener('change',label);
  bell.addEventListener('click',()=>{const w=words[currentLang()];const modal=document.createElement('dialog');modal.className='buuurt-official-modal';const title=document.createElement('h2');title.textContent=w[0];const p=document.createElement('p');p.textContent=count?w[2]+' '+count:w[1];const close=document.createElement('button');close.type='button';close.textContent=w[3];close.onclick=()=>modal.close();modal.append(title,p,close);modal.addEventListener('close',()=>{modal.remove();bell.focus()},{once:true});document.body.append(modal);modal.showModal()});
  if(existing)existing.replaceWith(bell);else right.append(bell);
  if(bell.parentElement!==right)right.append(bell);
  if(!menu.matches('button')&&!menu.onclick){menu.addEventListener('click',()=>{const modal=document.createElement('dialog');modal.className='buuurt-official-modal';modal.innerHTML='<h2>Menu BUUURT</h2><p>Navigation de démonstration</p><button type="button">Fermer</button>';modal.querySelector('button').onclick=()=>modal.close();modal.addEventListener('close',()=>modal.remove(),{once:true});document.body.append(modal);modal.showModal()})}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();