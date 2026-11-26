/* Review-only translations; preserves all campaign selections when switching languages. */
(()=>{'use strict';
const t={
fr:['Retour','Configurer votre campagne sponsorisée','Donnez plus de visibilité à votre annonce auprès des habitants autour de votre commerce.','Choisissez votre budget','Choisissez la durée','Durée de diffusion','Durées proposées pour la maquette, non encore validées.','Définissez votre zone de diffusion',"Le cercle est centré sur l'adresse enregistrée dans votre profil commerçant.",'Carte illustrative','Votre commerce · adresse du profil','Rayon de diffusion','Estimation de diffusion','impressions estimées sur la période choisie','Objectif du forfait','Capacité disponible simulée','Budget total','Campagnes sponsorisées indisponibles','Afficher une simulation d’audience fictive','Paramètres administrateur — démonstration uniquement','Rayon maximal autorisé','Autoriser les campagnes sponsorisées (simulation)'],
nl:['Terug','Stel je gesponsorde campagne in','Geef je bericht meer zichtbaarheid bij buurtbewoners.','Kies je budget','Kies de looptijd','Looptijd','Looptijden zijn voorstellen voor de maquette, nog niet goedgekeurd.','Kies je bereik','De cirkel is gecentreerd op het adres in je ondernemersprofiel.','Voorbeeldkaart','Je winkel · adres uit profiel','Bereik','Verwacht bereik','geschatte vertoningen tijdens de campagne','Doel van het pakket','Gesimuleerde beschikbare capaciteit','Totaalbudget','Gesponsorde campagnes niet beschikbaar','Toon fictieve publieksimulatie','Beheerinstellingen — alleen demonstratie','Maximaal toegestaan bereik','Gesponsorde campagnes toestaan (simulatie)'],
en:['Back','Set up your sponsored campaign','Give your post more visibility among nearby residents.','Choose your budget','Choose the duration','Campaign duration','Durations are mockup proposals, not yet approved.','Set your coverage area','The circle is centered on the address in your business profile.','Illustrative map','Your business · profile address','Coverage radius','Estimated delivery','estimated impressions over the selected period','Package target','Simulated available capacity','Total budget','Sponsored campaigns unavailable','Show fictional audience simulation','Admin settings — demonstration only','Maximum allowed radius','Enable sponsored campaigns (simulation)']};
const extra={
 fr:{note:"Carte OpenStreetMap, périmètre gratuit illustratif et audience simulée. Aucun achat ni paiement.",map:"Le quartier gratuit reste en vert. Faites glisser le curseur pour ajuster la zone sponsorisée autour du commerce.",location:"Commerce d’exemple",free:"Quartier gratuit (périmètre illustratif)",paid:"Zone de diffusion sponsorisée",days:"jours",target:"impressions cibles",max:"max. autorisés",pending:"À calculer",unmeasured:"À mesurer",warning:"Simulation fictive. Ces chiffres ne représentent pas l’audience réelle de BUUURT.",empty:"Estimation indisponible avant mesure de l’audience réelle.",continue:"Continuer (démo sans paiement)",stopped:"La commercialisation n’est pas activée.",sim:"Mode démonstration. Aucune campagne ne sera créée.",close:"Fermer",review:"Maquettes BUUURT",choice:"Choix du mode de publication",admin:"Ces réglages sont réservés à l’administration.",demo:"L’estimation réelle dépendra des emplacements disponibles sur la période."},
 nl:{note:"OpenStreetMap-kaart, indicatieve gratis dekking en gesimuleerd bereik. Geen aankoop of betaling.",map:"De gratis buurtdekking blijft groen. Versleep de schuifregelaar om het gesponsorde bereik rond de winkel aan te passen.",location:"Voorbeeldwinkel",free:"Gratis buurtdekking (voorbeeldgebied)",paid:"Gesponsord verspreidingsgebied",days:"dagen",target:"doelvertoningen",max:"maximaal toegestaan",pending:"Nog te berekenen",unmeasured:"Nog te meten",warning:"Fictieve simulatie. Deze cijfers tonen geen werkelijk BUUURT-bereik.",empty:"Er is nog geen schatting zonder gemeten bereik.",continue:"Doorgaan (demo zonder betaling)",stopped:"Gesponsorde campagnes zijn nog niet te koop.",sim:"Demomodus. Er wordt geen campagne gemaakt.",close:"Sluiten",review:"BUUURT-maquettes",choice:"Publicatiemethode",admin:"Deze instellingen zijn alleen voor beheerders.",demo:"De werkelijke schatting hangt af van de beschikbare advertentieplaatsen tijdens de campagne."},
 en:{note:"OpenStreetMap basemap, illustrative free coverage and simulated audience. No purchases or payments.",map:"Free neighbourhood coverage (illustrative area) stays green. Move the slider to adjust sponsored coverage around the shop.",location:"Example shop",free:"Free neighbourhood coverage",paid:"Sponsored coverage area",days:"days",target:"target impressions",max:"maximum allowed",pending:"To be calculated",unmeasured:"To be measured",warning:"Fictional simulation. These figures do not represent BUUURT’s actual audience.",empty:"An estimate is unavailable until the actual audience has been measured.",continue:"Continue (demo without payment)",stopped:"Sponsored campaigns are not available to buy yet.",sim:"Demo mode. No campaign will be created.",close:"Close",review:"BUUURT prototypes",choice:"Publication method",admin:"These settings are for administrators only.",demo:"Actual estimates depend on the available ad placements during the campaign."}
};
const $=id=>document.getElementById(id);
const targets={15:500,30:1200,50:2500};
const dailyInventory=[65,140,210,275,330];
const wanted=new URLSearchParams(location.search).get("lang");
const language=$("lang");
language.value=Object.hasOwn(t,wanted)?wanted:"fr";
function update(){
 const lang=language.value,copy=extra[lang];
 const number=new Intl.NumberFormat(lang,{maximumFractionDigits:1});
 const km=value=>number.format(value)+" km";
 const budget=Number(document.querySelector('[name="budget"]:checked').value);
 const days=Number($("duration").value);
 const max=Number($("adminMax").value);
 const slider=$("radius");
 slider.max=max;
 const radius=Number(slider.value);
 $("radiusValue").textContent=km(radius);
 $("maxLabel").textContent=km(max)+" "+copy.max;
 // Keep the scale constant while the merchant adjusts the radius.
 $("coverage")?.setAttribute("r",String(radius*150/max));
 const lower=Math.floor(radius)-1;
 const available=Math.floor((dailyInventory[lower]+((dailyInventory[lower+1]??dailyInventory[lower])-dailyInventory[lower])*(radius-Math.floor(radius)))*days*.7);
 const demo=$("simulation").checked;
 $("target").textContent=number.format(targets[budget]);
 $("total").textContent=number.format(budget)+" €";
 $("capacity").textContent=demo?number.format(available):copy.unmeasured;
 $("impressions").textContent=demo?number.format(Math.min(targets[budget],available)):copy.pending;
 $("caution").textContent=demo?copy.warning:copy.empty;
 const enabled=$("adminOn").checked;
 $("continue").disabled=!enabled;
 $("continue").textContent=enabled?copy.continue:t[lang][17];
 $("message").textContent=enabled?copy.sim:copy.stopped;
}
function setLang(){
 const lang=language.value,v=t[lang],copy=extra[lang];
 document.documentElement.lang=lang;
 const pairs=[[".back span",0],["h1",1],[".body > .sub",2],["label[for=duration]",5],[".field + p.demo",6],[".map-badge",9],[".radius label",11],[".estimate > div:first-child",12],[".estimate > small",13],["label[for=simulation]",18],["details summary",19],["label[for=adminMax]",20],["label[for=adminOn]",21]];
 pairs.forEach(([selector,index])=>{{const el=document.querySelector(selector);if(el)el.textContent=v[index]}});
 document.querySelectorAll(".step").forEach((el,i)=>{
  const badge=el.querySelector("span");
  el.replaceChildren(badge," "+v[[3,4,7][i]]);
 });
 document.querySelector(".area-figure").previousElementSibling.textContent=copy.map;
 const mapTitle=document.querySelector("#map-title");
 if(mapTitle)mapTitle.textContent=copy.map;
 for(const [id,key] of [["location-label","location"],["free-legend","free"],["paid-legend","paid"],["close-menu","close"],["review-link","review"],["choice-link","choice"]])$(id).textContent=copy[key];
 for(const link of document.querySelectorAll(".back,#choice-link"))link.href="com-pub-002.html#"+lang+"-MER-PUB-002";
 document.querySelector(".note").textContent="COM-PUB-SPO-001 · "+copy.note;
 document.querySelector(".switch + .demo").textContent=copy.demo;
 document.querySelector("details p.demo").textContent=copy.admin;
 document.querySelector(".footer").textContent="BUUURT · "+copy.note;
 document.querySelectorAll(".estimate .detail span").forEach((el,i)=>{el.textContent=v[14+i]});
 document.querySelectorAll("#duration option").forEach(el=>{el.textContent=el.value+" "+copy.days});
 document.querySelectorAll(".price small").forEach((el,i)=>{el.textContent=new Intl.NumberFormat(lang).format(Object.values(targets)[i])+" "+copy.target});
 update();
}
language.addEventListener("change",()=>{
 const url=new URL(location.href);
 url.searchParams.set("lang",language.value);
 history.replaceState(history.state,"",url);
 setLang();
});
document.querySelectorAll("input:not(#radius),select:not(#lang)").forEach(el=>el.addEventListener("change",update));
$("radius").addEventListener("input",update);
$("continue").addEventListener("click",()=>alert(extra[language.value].sim));
setLang();
})();