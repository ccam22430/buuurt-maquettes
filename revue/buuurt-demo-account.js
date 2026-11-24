(() => {
 "use strict";
 const key="buuurt-demo-account";
 if(new URL(location.href).searchParams.get("demo-account")==="1"){
  try{sessionStorage.setItem(key,"1")}catch{}
 }
 let active=false;
 function signedIn(){
  try{return active||sessionStorage.getItem(key)==="1"}catch{return active}
 }
 const copy={
  fr:["Un compte BUUURT est nécessaire","Connectez-vous ou créez un compte pour utiliser les favoris, le suivi et les alertes.","Se connecter","Créer un compte","Annuler","Maquette : ces boutons simulent la connexion ou la création d’un compte."],
  nl:["Een BUUURT-account is nodig","Log in of maak een account aan om favorieten, volgen en meldingen te gebruiken.","Inloggen","Account aanmaken","Annuleren","Prototype: de knoppen simuleren inloggen of een account aanmaken."],
  en:["A BUUURT account is required","Sign in or create an account to use favourites, follow shops and manage alerts.","Sign in","Create an account","Cancel","Prototype: these buttons simulate signing in or creating an account."]
 };
 function requireAccount(resume){
  if(signedIn()){resume();return}
  if(document.querySelector(".buuurt-account-dialog"))return;
  const lang=document.querySelector("#lang,#language")?.value||document.documentElement.lang;
  const [title,body,login,signup,cancel,note]=copy[lang]||copy.fr;
  const dialog=document.createElement("dialog");
  dialog.className="buuurt-account-dialog";
  dialog.setAttribute("aria-labelledby","buuurt-account-title");
  dialog.setAttribute("aria-describedby","buuurt-account-body");
  dialog.innerHTML='<h2 id="buuurt-account-title">'+title+'</h2><p id="buuurt-account-body">'+body+'</p><p class="account-note">'+note+'</p><form method="dialog"><button value="login" autofocus>'+login+'</button><button value="signup">'+signup+'</button><button value="cancel">'+cancel+'</button></form>';
  dialog.addEventListener("close",()=>{
   const result=dialog.returnValue;
   dialog.remove();
   if(result!=="login"&&result!=="signup")return;
   active=true;
   try{sessionStorage.setItem(key,"1")}catch{}
   resume();
  },{once:true});
  document.body.append(dialog);
  dialog.showModal();
 }
 const style=document.createElement("style");
 style.textContent=".buuurt-account-dialog{box-sizing:border-box;width:min(92vw,380px);max-height:85vh;overflow:auto;padding:20px;border:1px solid #eadfe4;border-radius:18px;background:#fff;color:#19161b;box-shadow:0 14px 55px #0004}.buuurt-account-dialog::backdrop{background:#17101780}.buuurt-account-dialog h2{margin:0 0 8px;font-size:21px}.buuurt-account-dialog p{line-height:1.45}.buuurt-account-dialog .account-note{font-size:12px;color:#59545a}.buuurt-account-dialog form{display:grid;gap:8px}.buuurt-account-dialog button{min-height:44px;border:1px solid #e8c9d4;border-radius:10px;background:white;color:#a30136;font-weight:700;cursor:pointer}.buuurt-account-dialog button[value=login]{background:#a30136;color:white;border-color:#a30136}";
 document.head.append(style);
 window.buuurtDemoAccount={signedIn,require:requireAccount};
 document.addEventListener("click",event=>{
  const action=event.target.closest("[data-heart], [data-follow], [data-bell], .follow-shop, [data-account-required]");
  if(!action||signedIn())return;
  event.preventDefault();
  event.stopImmediatePropagation();
  requireAccount(()=>action.click());
 },true);
})();
