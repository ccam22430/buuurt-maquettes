# BUUURT GEO‑04/05 — qualification, 27 novembre 2026

## Trajets mesurés et contrôle des obstacles

GraphHopper 11.0 a calculé des trajets locaux à pied et à vélo sur l'extrait OpenStreetMap Noord-Holland du 26 novembre 2026 à 21 h 21 UTC. Aucun service de routage en ligne, compte ou appel d'IA n'est requis. Les routes partent de points publics vers le commerce ou point d'essai. Les coordonnées BAG d'Amsterdam et Graft reprennent la recette GEO‑03. Le contexte touristique utilise l'arrêt public Zaanse Schans et des points d'intérêt publics. Les codes de territoire proviennent des contours officiels CBS 2025.

| Origine | Point de comparaison | Vol d'oiseau | Marche | Vélo |
| --- | --- | ---: | ---: | ---: |
| Jan Evertsenstraat 55‑H | Erasmusgracht | 851 m | 1 107 m · 13 min 17 s | 1 464 m · 5 min 24 s |
| Raadhuisstraat 24, Graft | Bibliotheek De Rijp | 1 445 m | 1 958 m · 23 min 30 s | 2 077 m · 8 min 20 s |
| Raadhuisstraat 24, Graft | Noordeinde | 1 018 m | 1 020 m · 12 min 14 s | 1 020 m · 3 min 30 s |

Les lignes directes des deux premiers exemples traversent des polygones d'eau du BGT Kadaster. Les trajets comprennent des segments signalés comme ponts par le graphe OSM et croisent des ouvrages correspondants dans le BGT. Les objets BGT dont l'enregistrement ou la validité est terminé ont été écartés. Pour Noordeinde, le passage calculé reste proche de la ligne directe. Le réseau et les modes de déplacement influencent le détour même lorsqu'un pont existe.

31 itinéraires retenus sur 34 demandes. Trois calculs touristiques ont été écartés à cause d'un segment marqué privé ou interdit. Les codes sources, positions, géométries, distances, temps et écarts d'accrochage figurent dans `routes.json`. L'exécution en double a rendu les 34 mêmes résultats (hors horodatage). Les distances et durées sont calculées. Aucun constat de circulation, comptage de visiteurs ou relevé sur le terrain n'a été effectué.

## Qualification de la logique de recommandation

Le prototype regroupe les points d'intérêt par territoire, contrôle l'autorisation avant d'évaluer les trajets et justifie chaque candidat avec les mesures datées. Les autorisations d'essai sont fictives. Les codes de territoires et les itinéraires sont issus des référentiels vérifiés. Une exception d'un autre commerce, future, expirée ou révoquée échoue. Les zones inactives, codes inconnus, mesures absentes ou invalides et référentiels incohérents sont rejetés. Aucun changement d'état ni appel externe n'est déclenché par une recommandation.

Les 18 scénarios croisent boulangerie, café, poissonnerie, salon de coiffure, boutique vintage et salle de spectacle avec Amsterdam, Graft et Zaanse Schans. Chaque scénario a été rejoué avec les destinations dans l'ordre inverse et comparé à un calcul de référence séparé. Six scénarios ont en outre des ensembles de zones attendues déclarés explicitement. L'évaluation mathématique ne mesure pas la conversion des visiteurs ni la pertinence perçue par les commerçants. La matrice utilise un lieu d'essai par contexte et réutilise les trajets en changeant l'hypothèse d'activité.

**Sensibilité.** Une variation de ±20 % des temps d'essai a changé le nombre de zones dans 5 scénarios sur 18. À Zaanse Schans, dans le cas poissonnerie, le passage de 6 à 7,2 minutes à vélo fait passer de 0 à 2 zones proposées avec les autorisations fictives du test. Ce résultat justifie de conserver les seuils comme paramètres d'étude en attendant une décision produit. Pour un pilote, les recommandations peuvent être évaluées en mode observation avec les secteurs sélectionnés selon les règles déjà approuvées. Les seuils de cette séance n'ont aucune portée commerciale.

## Reproduction

Les données OSM du dossier de preuve sont attribuées à [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright) sous [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Les géométries dérivées de la preuve de routage sont distribuées sous ODbL 1.0. Les limites CBS 2025 proviennent de PDOK (CC BY 4.0, CBS et Kadaster). Les couches d'eau et ouvrages BGT proviennent du Kadaster via PDOK (CC0 1.0).

1. Télécharger l'[extrait daté](https://download.geofabrik.de/europe/netherlands/noord-holland/noord-holland-261126.osm.pbf) et comparer le SHA‑256 à `routes.json`. L'extrait téléchargé avait le même MD5 que la version datée publiée (`08c9b6c2a8b2837f3dcc9b8362c9513a`). Pour le routeur, utiliser [GraphHopper 11.0](https://repo.maven.apache.org/maven2/com/graphhopper/graphhopper-web/11.0/graphhopper-web-11.0.jar), dont l'empreinte figure également dans la preuve.
2. Nommer l'extrait `noord-holland.osm.pbf`. Lancer `java -Xmx3g -jar graphhopper.jar server graphhopper.yml` dans le dossier contenant l'extrait et la configuration versionnée. Le serveur d'essai écoute uniquement en local. Les deux archives CBS GEO‑03 et le GeoJSON touristique de la preuve servent à vérifier les codes.
3. Avec Python/GDAL, lancer `mesurer.py <extrait.pbf> <graphhopper.jar> <tourisme.geojson> routes.json`, puis `obstacles.py routes.json obstacles.json`. Le BGT en direct peut évoluer à une date ultérieure.
4. Lancer `python recette-matrice.py routes.json matrice.json` puis `python verifier.py routes.json matrice.json obstacles.json`. L'étape 4 se rejoue entièrement avec les fichiers de preuve, sans routeur ni accès réseau.

GEO‑04 et GEO‑05 ont une preuve technique de laboratoire. La recommandation commerciale et les données d'administration doivent être validées avant de brancher les suggestions au parcours sponsorisé. L'audit des étapes suivantes et leurs critères de recette sont dans [préparation de l'intégration](preparation-integration.md). Aucun service hébergé, appel payant, fusion vers main ou déploiement n'a été effectué.
