# Qualification GEO — points de contrôle

Inspection du prototype local buuurt-geo-lab.html, 27 novembre.
- Géocodage : premier résultat BAG choisi sans contrôle d'ambiguïté.
- Récupération : bbox fixe +/-0.09 longitude et +/-0.055 latitude ; risque de voisins manquants. Étendre la recherche selon l'enveloppe du territoire identifié, puis contrôler la couverture.
- Pagination : plafond 30 pages, échec explicite ; dédoublonner les identifiants.
- Voisinage : segments colinéaires, tolérance 2 cm ; qualification sur géométries officielles nécessaire.
- Point sur frontière : arbitrage non défini, ne pas choisir arbitrairement.
- Aucun quartier voisin : distinguer absence réelle et couverture insuffisante.
- Libellés : contrôler noms usuels et chevauchements sur mobile.
- Zones actives et GEO-IA non connectées : laboratoire uniquement.
- Aucune recette réelle ni validation de production.
