from pathlib import Path
import json,re,html
p=Path("BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html")
s=p.read_text(encoding="utf-8")
a=s.index("const pages=")+len("const pages=");b=s.index(";let selected=",a)
pages=json.loads(s[a:b]);assert len(pages)==20
q=next(x for x in pages if x["en"]=="USR-POS-001")
old='<div class="card"><div class="photo">🪚</div><div class="details"><span class="heart">♡</span><b>Doe-het-zelf</b><br/>Nouveaux outils en magasin<br/><span class="muted">◷ Nouveauté</span><br/><span class="dots">● ● ●</span></div></div>'
assert q["html"].count(old)==1
third='<div class="card"><div class="photo">🖌️</div><div class="details"><span class="heart">♡</span><b>Doe-het-zelf</b><br/>Peintures et accessoires disponibles en magasin<br/><span class="muted">◷ Cette semaine</span><br/><span class="dots">● ● ●</span></div></div>'
q["html"]=q["html"].replace(old,old+third)
s=s[:a]+json.dumps(pages,ensure_ascii=False)+s[b:]
# Translate text nodes of each static screen at display time; no scripts run inside the sandboxed iframe.
dictionary={"Tout":["Alles","All"],"Offres":["Aanbiedingen","Offers"],"Événements":["Evenementen","Events"],"Autour de moi":["Bij mij in de buurt","Near me"],"Autour de moi · Amsterdam":["Bij mij in de buurt · Amsterdam","Near me · Amsterdam"],"Choisir mon quartier":["Kies mijn buurt","Choose my neighborhood"],"Choisir mes quartiers":["Kies mijn buurten","Choose my neighborhoods"],"Voir les quartiers disponibles":["Bekijk beschikbare buurten","Explore available neighborhoods"],"Choisissez les quartiers que vous souhaitez découvrir.":["Kies de buurten die je wilt ontdekken.","Choose the neighborhoods you want to explore."],"Bienvenue sur BUUURT":["Welkom bij BUUURT","Welcome to BUUURT"],"Découvrez les annonces des commerçants et artisans de votre quartier.":["Ontdek berichten van winkels en ondernemers in jouw buurt.","Discover updates from local shops and businesses in your neighborhood."],"Découvrez les commerces et artisans de votre quartier":["Ontdek winkels en ondernemers in jouw buurt","Discover shops and local businesses in your neighborhood"],"Se connecter":["Inloggen","Sign in"],"Créer un compte":["Account aanmaken","Create an account"],"Se connecter · Créer un compte":["Inloggen · Account aanmaken","Sign in · Create an account"],"Se connecter ou créer un compte":["Inloggen of een account aanmaken","Sign in or create an account"],"Installer BUUURT sur mon téléphone":["BUUURT op mijn telefoon installeren","Install BUUURT on my phone"],"Rechercher un quartier…":["Zoek een buurt…","Search for a neighborhood…"],"Sélectionnez un ou plusieurs quartiers d’Amsterdam.":["Selecteer een of meer buurten in Amsterdam.","Select one or more neighborhoods in Amsterdam."],"Voir les annonces (3 quartiers)":["Bekijk berichten (3 buurten)","View posts (3 neighborhoods)"],"Vos 3 quartiers":["Jouw 3 buurten","Your 3 neighborhoods"],"Enregistrer cette sélection":["Deze selectie opslaan","Save this selection"],"Continuer sans enregistrer":["Doorgaan zonder op te slaan","Continue without saving"],"Vous pouvez consulter les annonces sans compte. Pour enregistrer plusieurs sélections et les retrouver sur d’autres appareils, connectez-vous.":["Je kunt berichten bekijken zonder account. Log in om meerdere selecties op te slaan en op andere apparaten terug te vinden.","You can browse posts without an account. Sign in to save multiple selections and access them on other devices."],"Adresse e-mail":["E-mailadres","Email address"],"Mot de passe":["Wachtwoord","Password"],"Google / Facebook : options à vérifier avant intégration":["Google / Facebook: opties controleren vóór integratie","Google / Facebook: options to verify before integration"],"Mes favoris ♡":["Mijn favorieten ♡","My favorites ♡"],"Retrouvez les annonces enregistrées.":["Bekijk je opgeslagen berichten.","Find your saved posts."],"Contrôle de sécurité gratuit":["Gratis veiligheidscontrole","Free safety check"],"Contrôle de sécurité gratuit du vélo":["Gratis veiligheidscontrole voor fietsen","Free bicycle safety check"],"Contrôle vélo gratuit · De Baarsjes":["Gratis fietscontrole · De Baarsjes","Free bicycle check · De Baarsjes"],"Nouvelle collection":["Nieuwe collectie","New collection"],"Nouvelle collection · De Pijp":["Nieuwe collectie · De Pijp","New collection · De Pijp"],"Cette semaine":["Deze week","This week"],"Publié il y a 2 jours":["2 dagen geleden geplaatst","Posted 2 days ago"],"Nouveauté":["Nieuw","New"],"Nouveaux outils en magasin":["Nieuw gereedschap in de winkel","New tools in store"],"25 € de remise dès 100 € d’achat":["€ 25 korting bij besteding vanaf € 100","€25 off purchases of €100 or more"],"Commerce scanné · Doe-het-zelf":["Gescande winkel · Doe-het-zelf","Scanned shop · Doe-het-zelf"],"Annonces de Doe-het-zelf":["Berichten van Doe-het-zelf","Posts from Doe-het-zelf"],"Mon commerce":["Mijn winkel","My business"],"Espace commerçant":["Ondernemersomgeving","Merchant area"],"Nom du commerce":["Naam van de winkel","Business name"],"Adresse":["Adres","Address"],"Quartier":["Buurt","Neighborhood"],"Description":["Beschrijving","Description"],"Horaires":["Openingstijden","Opening hours"],"Réseaux sociaux":["Sociale media","Social media"],"Enregistrer le profil":["Profiel opslaan","Save profile"],"Tableau de bord":["Dashboard","Dashboard"],"Créer une annonce":["Bericht maken","Create a post"],"Créer / modifier une annonce":["Bericht maken / bewerken","Create / edit a post"],"Type : Offre / News / Événement":["Type: Aanbieding / Nieuws / Evenement","Type: Offer / News / Event"],"Titre":["Titel","Title"],"Visuels":["Afbeeldingen","Images"],"Validité":["Geldigheid","Validity"],"Enregistrer le brouillon":["Concept opslaan","Save draft"],"Publier":["Publiceren","Publish"],"Comment publier ?":["Hoe wil je publiceren?","How would you like to publish?"],"Choisissez votre mode de publication.":["Kies hoe je wilt publiceren.","Choose how you want to publish."],"Publier gratuitement":["Gratis publiceren","Publish for free"],"Sponsoriser cette annonce":["Dit bericht sponsoren","Sponsor this post"],"Sponsoriser mon annonce":["Mijn bericht sponsoren","Sponsor my post"],"La configuration, les conditions et les prix sont à reprendre des spécifications commerciales approuvées.":["De instellingen, voorwaarden en prijzen moeten uit de goedgekeurde commerciële specificaties worden overgenomen.","Settings, terms and prices must follow the approved commercial specifications."],"Aucun paiement ou campagne n’est lancé par cette maquette.":["Deze maquette start geen betaling of campagne.","This mockup does not start any payment or campaign."],"Voir le récapitulatif":["Overzicht bekijken","View summary"],"Gérez vos annonces":["Beheer je berichten","Manage your posts"],"Mes annonces":["Mijn berichten","My posts"],"Actives":["Actief","Active"],"Brouillons":["Concepten","Drafts"],"Terminées":["Afgelopen","Ended"],"Annonce active":["Actief bericht","Active post"],"Offre de la semaine":["Aanbieding van de week","Offer of the week"],"Offre commerciale active":["Actieve aanbieding","Active offer"],"Supprimées : corbeille 30 jours":["Verwijderd: prullenbak 30 dagen","Deleted: 30-day trash"],"Corbeille : restauration possible pendant 30 jours":["Prullenbak: herstellen mogelijk binnen 30 dagen","Trash: restore within 30 days"],"Partager mon annonce":["Mijn bericht delen","Share my post"],"Partage depuis les applications installées sur le téléphone.":["Delen via apps die op de telefoon zijn geïnstalleerd.","Share using apps installed on the phone."],"Ouvrir le partage natif":["Deelfunctie openen","Open native sharing"],"Les liens de réseaux sociaux ne donnent pas d’autorisation de publication automatique.":["Links naar sociale media geven geen toestemming voor automatisch publiceren.","Social media links do not authorize automatic posting."],"Voir l’offre →":["Bekijk de aanbieding →","View offer →"],"Sponsorisé":["Gesponsord","Sponsored"],"Nouveau brunch · Bos en Lommer":["Nieuwe brunch · Bos en Lommer","New brunch · Bos en Lommer"],"10 % sur les fromages":["10% korting op kaas","10% off cheese"],"20 % sur les desserts":["20% korting op desserts","20% off desserts"],"Favorieten":["Favorieten","Favorites"],"Winkels":["Winkels","Shops"],"Account":["Account","Account"],"Home":["Home","Home"],"NL":["NL","NL"],"FR":["FR","FR"],"EN":["EN","EN"]}
dictionary["Peintures et accessoires disponibles en magasin"]=["Verf en accessoires verkrijgbaar in de winkel","Paint and accessories available in store"]
# Add a language control in the library toolbar. Keep NL default for Amsterdam.
s=s.replace('<div class="actions"><button id="prev">','<div class="actions"><label for="uiLanguage">Langue / Taal / Language </label><select id="uiLanguage" aria-label="Langue des maquettes"><option value="nl" selected>Nederlands</option><option value="fr">Français</option><option value="en">English</option></select> <button id="prev">',1)
# Parent-side transformation is required because the iframe sandbox disables JavaScript.
js=r"""
const translations=TRANSLATIONS;
let currentLanguage='nl';
function translateMarkup(markup,lang){
  if(lang==='fr')return markup;
  const index=lang==='nl'?0:1;
  // Only text nodes, never image data, HTML attributes or markup.
  return markup.replace(/>([^<>]+)</g,(whole,raw)=>{
    const normalized=raw.replace(/&amp;/g,'&').trim();
    const match=normalized.match(/^([\s◷☷⌖·▾]*)(.*?)([\s]*)$/s);
    if(!match)return whole;
    const translated=translations[match[2]];
    if(!translated)return whole;
    return '>'+match[1]+translated[index]+match[3]+'<';
  });
}
function screenMarkup(page,lang){
  let markup=page.html;
  if(page.en==='USR-LOC-002'){
    const checked={fr:'lfr',nl:'lnl',en:'len'}[lang];
    markup=markup.replace(/(<input id="l(?:fr|nl|en)" type="radio" name="arrival-lang")( checked)?>/g,(full,prefix)=>prefix+(prefix.includes('id="'+checked+'"')?' checked':'')+'>');
  }else{
    markup=translateMarkup(markup,lang);
  }
  return markup.replace(/<html lang="fr"/,'<html lang="'+lang+'"');
}
document.getElementById('uiLanguage').addEventListener('change',e=>{currentLanguage=e.target.value;show(selected)});
"""
js=js.replace("TRANSLATIONS",json.dumps(dictionary,ensure_ascii=False,separators=(',',':')))
assert 'let selected=0;' in s
s=s.replace('let selected=0;',js+'\nlet selected=0;',1)
assert 'preview.srcdoc=p.html;' in s
s=s.replace('preview.srcdoc=p.html;','preview.srcdoc=screenMarkup(p,currentLanguage);',1)
assert s.count('id="uiLanguage"')==1
p.write_text(s,encoding="utf-8")
# Verify no screens removed, no image content modified, and all language controls exist.
result,_=json.JSONDecoder().raw_decode(s[s.index("const pages=")+12:])
assert len(result)==20
assert next(x for x in result if x["en"]=="USR-POS-001")["html"].count('class="card"')==3
assert all('buuurt-bottom-nav' in x['html'] for x in result)
assert 'preview.srcdoc=screenMarkup(p,currentLanguage)' in s
print("Validated 20 screens, 3 cashier cards, FR/NL/EN selector")
