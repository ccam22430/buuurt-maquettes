from pathlib import Path
import json,re
p=Path("BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html")
s=p.read_text(encoding="utf-8")
a=s.index("const translations=")+len("const translations=")
b=s.index(";\nlet currentLanguage=",a)
d=json.loads(s[a:b])
d.update({"Amsterdam · 3 quartiers sélectionnés":["Amsterdam · 3 buurten geselecteerd","Amsterdam · 3 neighborhoods selected"],"Mes quartiers : 3 sélectionnés ▾":["Mijn buurten: 3 geselecteerd ▾","My neighborhoods: 3 selected ▾"],"Sponsorisé":["Gesponsord","Sponsored"],"2 bouquets pour 15 € · De Baarsjes":["2 boeketten voor € 15 · De Baarsjes","2 bouquets for €15 · De Baarsjes"],"Offre valable cette semaine":["Aanbieding geldig deze week","Offer valid this week"],"Publié aujourd’hui":["Vandaag geplaatst","Posted today"],"Publié hier":["Gisteren geplaatst","Posted yesterday"],"Publié il y a 2 jours":["2 dagen geleden geplaatst","Posted 2 days ago"],"Proximité : 1 km ▾":["Afstand: 1 km ▾","Distance: 1 km ▾"],"Annonces de Doe-het-zelf ▾":["Berichten van Doe-het-zelf ▾","Posts from Doe-het-zelf ▾"],"🔧 Doe-het-zelf":["🔧 Doe-het-zelf","🔧 Doe-het-zelf"],"-10 % sur les fromages":["10% korting op kaas","10% off cheese"],"-20 % sur les desserts":["20% korting op desserts","20% off desserts"],"Amsterdam · De Baarsjes · QR de rue":["Amsterdam · De Baarsjes · QR-code op straat","Amsterdam · De Baarsjes · street QR code"],"Contrôle vélo gratuit · De Baarsjes":["Gratis fietscontrole · De Baarsjes","Free bike check · De Baarsjes"],"⌕ Rechercher un quartier…":["⌕ Zoek een buurt…","⌕ Search for a neighborhood…"],"Commerce scanné · Doe-het-zelf":["Gescande winkel · Doe-het-zelf","Scanned shop · Doe-het-zelf"],"📣 Sponsorisé":["📣 Gesponsord","📣 Sponsored"],"Nouvelle collection · De Pijp":["Nieuwe collectie · De Pijp","New collection · De Pijp"],"Nouveau brunch · Bos en Lommer":["Nieuwe brunch · Bos en Lommer","New brunch · Bos en Lommer"],"Peintures et accessoires disponibles en magasin":["Verf en accessoires verkrijgbaar in de winkel","Paint and accessories available in store"],"25 € de remise":["€ 25 korting","€25 discount"],"dès 100 € d’achat":["bij besteding vanaf € 100","on purchases of €100 or more"]})
# Translate all user-visible labels, including composite strings with icons and separators.
s=s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[b:]
old="""    const normalized=raw.replace(/&amp;/g,'&').trim();
    const match=normalized.match(/^([\\s◷☷⌖·▾]*)(.*?)([\\s]*)$/s);
    if(!match)return whole;
    const translated=translations[match[2]];
    if(!translated)return whole;
    return '>'+match[1]+translated[index]+match[3]+'<';"""
new="""    const normalized=raw.replace(/&amp;/g,'&').trim();
    const exact=translations[normalized];
    if(exact)return '>'+raw.replace(normalized,exact[index])+'<';
    const match=normalized.match(/^([\\s◷☷⌖·▾📣]*)(.*?)([\\s]*)$/su);
    if(!match)return whole;
    const translated=translations[match[2]];
    if(!translated)return whole;
    return '>'+raw.replace(normalized,match[1]+translated[index]+match[3])+'<';"""
assert old in s
s=s.replace(old,new,1)
assert "Mes quartiers : 3 sélectionnés ▾" in s
assert "2 bouquets pour 15 € · De Baarsjes" in s
assert "Offre valable cette semaine" in s
assert "Publié aujourd’hui" in s
p.write_text(s,encoding="utf-8")
print("Updated translation coverage for requested screen and composite labels")
