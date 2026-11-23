/* BUUURT review shared header controls. Review mockups only. */
(function(){'use strict';
const css=document.createElement('style');css.textContent='@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap");.phone,.phone input,.phone button,.phone textarea,.phone select,.phone label,.phone p,.phone h1,.phone h2,.phone h3{font-family:var(--buuurt-font,'Outfit'),system-ui,sans-serif!important}.buuurt-head-button{cursor:pointer;border:0;background:transparent;color:inherit;font:inherit;display:inline-flex;align-items:center;justify-content:center;padding:3px}.buuurt-head-button:focus-visible,.buuurt-head-language:focus-visible{outline:2px solid #d82d60;outline-offset:2px}.buuurt-head-language{font:inherit;border:0;background:transparent;color:inherit;max-width:72px;cursor:pointer}.buuurt-review-dialog{position:fixed;inset:0;z-index:99999;background:#0008;display:flex;align-items:center;justify-content:center;padding:20px}.buuurt-review-dialog[hidden]{display:none}.buuurt-review-dialog>section{background:white;color:#161616;border-radius:18px;max-width:350px;width:100%;padding:24px;font:16px Nunito,Arial,sans-serif;box-shadow:0 10px 40px #0003}.buuurt-review-dialog button{border:1px solid #ccc;border-radius:9px;background:white;padding:8px 13px;cursor:pointer;font:inherit}.buuurt-review-dialog a{display:block;margin:10px 0;color:#a30136}';document.head.appendChild(css);
const text={fr:{menu:'Menu BUUURT',notifications:'Notifications',pending:'La page dédiée sera créée prochainement. Aucun contenu de notification n’est encore connecté.',menuInfo:'Navigation de démonstration : les destinations définitives restent à concevoir.',close:'Fermer',home:'Choix de publication',photos:'Ajouter des photos'},nl:{menu:'BUUURT-menu',notifications:'Meldingen',pending:'De meldingenpagina wordt later gemaakt. Er zijn nog geen meldingen gekoppeld.',menuInfo:'Demonavigatie: de definitieve bestemmingen moeten nog worden ontworpen.',close:'Sluiten',home:'Publicatie kiezen',photos:'Foto’s toevoegen'},en:{menu:'BUUURT menu',notifications:'Notifications',pending:'The notifications page will be created later. No notifications are connected yet.',menuInfo:'Demo navigation: final destinations are not yet designed.',close:'Close',home:'Choose publication',photos:'Add photos'}};
function dialog(kind,lang){const t=text[lang]||text.fr;const bg=document.createElement('div');bg.className='buuurt-review-dialog';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');const panel=document.createElement('section');const title=document.createElement('h2');title.textContent=kind==='menu'?t.menu:t.notifications;panel.appendChild(title);const info=document.createElement('p');info.textContent=kind==='menu'?t.menuInfo:t.pending;panel.appendChild(info);if(kind==='menu'){const a=document.createElement('a');a.href='com-pub-001.html';a.textContent=t.home;panel.appendChild(a);const b=document.createElement('a');b.href='com-pub-003.html#'+lang+'-MER-PUB-003';b.textContent=t.photos;panel.appendChild(b)}const close=document.createElement('button');close.textContent=t.close;close.onclick=()=>bg.remove();panel.appendChild(close);bg.appendChild(panel);bg.onclick=e=>{if(e.target===bg)bg.remove()};document.body.appendChild(bg);close.focus();}
function mount(){document.querySelectorAll('.phone').forEach(phone=>{const header=phone.querySelector('.head,.header');if(!header)return;const article=phone.closest('article[lang]');const lang=article?.lang||document.getElementById('lang')?.value||document.documentElement.lang||'fr';const menu=header.querySelector('.hamb,[aria-label="Menu"],.menu');if(menu){menu.style.cursor='pointer';menu.setAttribute('role','button');menu.setAttribute('tabindex','0');menu.setAttribute('aria-label','Menu');menu.removeAttribute('onclick');menu.addEventListener('click',()=>dialog('menu',article?.lang||document.getElementById('lang')?.value||lang));menu.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();menu.click()}})}
const bell=header.querySelector('[aria-label*="notification" i],.bell');if(bell){bell.style.cursor='pointer';bell.setAttribute('role','button');bell.setAttribute('tabindex','0');bell.removeAttribute('onclick');bell.addEventListener('click',()=>dialog('notifications',article?.lang||document.getElementById('lang')?.value||lang));bell.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();bell.click()}})}
if(article){const right=header.querySelector('.right');if(right){const old=right.querySelector('span[style*="inline-flex"]');if(old){const select=document.createElement('select');select.className='buuurt-head-language';select.setAttribute('aria-label','Changer de langue / Taal wijzigen / Change language');for(const v of ['fr','nl','en']){const o=document.createElement('option');o.value=v;o.textContent='🌐 '+v.toUpperCase();select.appendChild(o)}select.value=article.lang;select.onchange=()=>{const destination=document.getElementById(select.value+'-MER-PUB-003');if(destination){location.hash=destination.id;destination.scrollIntoView({block:'start'});}else select.value=article.lang};old.replaceWith(select)}}}
});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();})();

/* BUUURT global review controls v2: shared across mockups that load this script. */
(function(){
'use strict';
const iconGlobe='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
const iconBell='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21a2 2 0 0 0 4 0"/></svg>';
const css=document.createElement('style');css.textContent='.buuurt-global-lang{display:inline-flex;align-items:center;gap:3px;vertical-align:middle;white-space:nowrap}.buuurt-global-lang select{border:0;background:transparent;color:inherit;font:inherit;max-width:66px;cursor:pointer}.buuurt-global-bell{position:relative;display:inline-grid;place-items:center;border:0;background:transparent;color:inherit;cursor:pointer;min-width:34px;min-height:34px;vertical-align:middle}.buuurt-global-count{position:absolute;right:-3px;top:-4px;min-width:16px;height:16px;padding:0 3px;border-radius:99px;background:#d00039;color:white;font:700 10px/16px system-ui;text-align:center}.buuurt-global-count[hidden]{display:none}.buuurt-global-modal{border:0;border-radius:18px;padding:24px;width:min(360px,calc(100vw - 36px));box-shadow:0 20px 65px #0004;background:white;color:#222}.buuurt-global-modal::backdrop{background:#0007}.buuurt-global-modal button{font:inherit;padding:9px 14px;background:#fff;border:1px solid #ddd;border-radius:9px;cursor:pointer}.buuurt-global-modal h2{font-size:21px;margin:0 0 12px}';document.head.append(css);
const words={fr:['Notifications','Aucune notification non lue.','Notifications de démonstration :','Fermer'],nl:['Meldingen','Geen ongelezen meldingen.','Demonstratiemeldingen:','Sluiten'],en:['Notifications','No unread notifications.','Sample notifications:','Close']};
function setup(){
 const params=new URLSearchParams(location.search);
 const sample=params.get('notifications');
 const count=/^\d{1,2}$/.test(sample||'')?Number(sample):0;
 const heads=[...document.querySelectorAll('header,.head,.header')].filter(h=>h.querySelector('#lang,.buuurt-head-language,.language-select,.lang-select,select[aria-label*="lang" i],#bell,.bell,[aria-label*="notification" i]'));
 for(const head of heads){
  if(head.dataset.buuurtGlobalControls==='1')continue;
  head.dataset.buuurtGlobalControls='1';
  const select=head.querySelector('#lang,.buuurt-head-language,.language-select,.lang-select,select[aria-label*="lang" i]');
  if(select&&!select.closest('.buuurt-global-lang')){
   const wrapper=document.createElement('span');wrapper.className='buuurt-global-lang';wrapper.innerHTML=iconGlobe;
   select.parentNode.insertBefore(wrapper,select);wrapper.append(select);
   select.setAttribute('aria-label','Langue / Taal / Language');
  }
  let bell=head.querySelector('#bell,.bell,[aria-label*="notification" i]');
  if(!bell&&select){bell=document.createElement('button');select.closest('.buuurt-global-lang').after(bell)}
  if(!bell)continue;
  const button=document.createElement('button');button.type='button';button.className='buuurt-global-bell';button.innerHTML=iconBell;
  const badge=document.createElement('span');badge.className='buuurt-global-count';badge.hidden=count===0;badge.textContent=String(count);button.append(badge);
  const lang=()=>{const v=select?.value||document.documentElement.lang||'nl';return words[v]?v:'nl'};
  const label=()=>{button.setAttribute('aria-label',words[lang()][0]+(count?' ('+count+')':''))};
  label();select?.addEventListener('change',label);
  button.addEventListener('click',()=>{
   const w=words[lang()];const modal=document.createElement('dialog');modal.className='buuurt-global-modal';modal.setAttribute('aria-label',w[0]);
   const h=document.createElement('h2');h.textContent=w[0];const p=document.createElement('p');p.textContent=count?w[2]+' '+count:w[1];
   const close=document.createElement('button');close.type='button';close.textContent=w[3];close.onclick=()=>modal.close();
   modal.append(h,p,close);modal.addEventListener('close',()=>{modal.remove();button.focus()},{once:true});
   document.body.append(modal);modal.showModal();
  });
  bell.replaceWith(button);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(setup,0));else setTimeout(setup,0);
})();