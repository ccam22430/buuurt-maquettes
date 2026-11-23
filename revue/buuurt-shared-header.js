/* BUUURT — single shared header controller for review mockups. */
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
 const heads=[...document.querySelectorAll('.phone header,.phone .head,.phone .header')].filter(h=>h.querySelector('#lang,.buuurt-head-language,.language-select,.lang-select,select[aria-label*="lang" i],#bell,.bell,[aria-label*="notification" i]'));
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