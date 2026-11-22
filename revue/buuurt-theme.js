(() => {
 const fonts={"dm-sans":"DM Sans",inter:"Inter",nunito:"Nunito"};
 const key="buuurt-mockup-font";
 const url=new URL(location.href);
 let saved;
 try{saved=localStorage.getItem(key)}catch{}
 const valid=value=>Object.hasOwn(fonts,value);
 const requested=url.searchParams.get("font");
 const initial=valid(requested)?requested:requested==="compare"?"dm-sans":valid(saved)?saved:"inter";
 const root=document.documentElement;
 const apply=font=>{root.dataset.buuurtFont=font};
 apply(initial);
 if(window.parent!==window){
  window.addEventListener("message",event=>{
   if(event.origin===location.origin&&event.source===window.parent&&valid(event.data?.buuurtFont))apply(event.data.buuurtFont);
  });
  return;
 }
 const picker=document.createElement("aside");
 picker.className="buuurt-font-picker";
 picker.setAttribute("role","group");
 const label=document.createElement("strong");
 function updateLabel(){
  label.textContent=({fr:"Police",nl:"Lettertype",en:"Font"})[document.querySelector("#uiLanguage")?.value||root.lang]||"Font";
  picker.setAttribute("aria-label",label.textContent);
 }
 updateLabel();
 document.querySelector("#uiLanguage")?.addEventListener("change",updateLabel);
 picker.append(label);
 const buttons=Object.entries(fonts).map(([font,name])=>{
  const button=document.createElement("button");
  button.type="button";
  button.textContent=name;
  button.setAttribute("aria-pressed",String(font===initial));
  button.onclick=()=>{
   apply(font);
   buttons.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
   const next=new URL(location.href);
   next.searchParams.set("font",font);
   history.replaceState(history.state,"",next);
   try{localStorage.setItem(key,font)}catch{}
   window.dispatchEvent(new Event("buuurt-font-change"));
  };
  picker.append(button);
  return button;
 });
 const catalogPreview=document.querySelector("iframe#preview");
 if(catalogPreview)catalogPreview.before(picker);
 else document.body.prepend(picker);
})();
