# GEO-V1 — qualification réelle du laboratoire

Recette technique exécutée le 27 novembre 2026, de 09 h 20 à 09 h 33 (Amsterdam, durée globale non mesurée). Travail limité à la branche `lab/geo-v1-20261127`. Aucun frais supplémentaire, achat ou déploiement.

## Données et vérifications

| Source | Preuve | Conclusion |
| --- | --- | --- |
| CBS / PDOK, Wijk- en Buurtkaart 2025, OGC API | Toutes les pages des deux fenêtres. Amsterdam 152 buurten en 2 pages et 40 wijken en 1 page. Graft 117 buurten en 2 pages et 30 wijken en 1 page. | Le niveau buurt est retenu pour le laboratoire. Les contours originaux sont lus en RD (EPSG:28992) pour les calculs. L'export GeoJSON conserve les géométries CRS84 d'origine et ne garde que les propriétés utiles. |
| CBS / PDOK 2026 v0, OGC API | 152 et 117 buurten, 2 pages dans chaque fenêtre. Mêmes codes de territoire et mêmes cinq voisins dans les deux cas. Graft partage 1 940,986 m avec Noordeinde en 2025 et 1 320,519 m en 2026. | Le nouveau millésime contient des différences réelles. Le schéma passe de `buurtcode`/`buurtnaam` à `bu_code`/`bu_naam`. Conserver 2025 pour cette recette reproductible. Tester une migration avant de changer de millésime. |
| CBS, téléchargement direct 2025 v1, GeoPackage non généralisé | ZIP validé et GeoPackage ouvert en lecture seule. 14 823 buurten, 3 505 wijken, 424 enregistrements de la couche gemeenten. Les 269 codes et noms des deux fenêtres PDOK sont retrouvés dans la source directe. Différence symétrique des deux polygones d'origine = 0 m². | Référence officielle utilisable pour une extraction locale versionnée. Les nombres ci-dessus sont des décomptes d'enregistrements de couches. SHA-256 du ZIP original : `3a4aff8938735eef4fba879d41465e0eb06003b00d3755358b7e57ee530b23f0`. |
| Commune d'Amsterdam, registre Gebieden, WFS | 152 objets en 2 pages. 152 codes CBS et noms concordants. Pour Balboaplein e.o., ID municipal `03630980000150`, code `EM02`, code CBS `BU0363EM02`. Différence symétrique ≈ 0,50 m² après reprojection de la réponse municipale en RD. | Source municipale utile au contrôle local. Source CBS préférable comme référentiel commun pour le laboratoire urbain et rural. |
| BAG via PDOK Locatieserver | Jan Evertsenstraat 55-H, 1057BN Amsterdam, ID `0363200000145991`. Raadhuisstraat 24, 1484EN Graft, adresse publique du monument, ID `0365200000002169`. | Contrôle exact sur type, numéro avec éventuel suffixe, code postal et localité. La recherche sans suffixe à Amsterdam renvoie plusieurs adresses. À Graft, le premier résultat est 24a et la correspondance exacte 24 est bien retenue. |

Les fenêtres de qualification englobent entièrement chaque territoire d'origine. Les 269 contours CBS 2025 ont un code unique, un nom, un millésime cohérent et une géométrie polygonale valide. Contrôle distinct des versions RD et CRS84 et de leurs ensembles d'identifiants. L'exhaustivité topologique n'a été testée que pour ces deux territoires. Les relevés 2026, 2025 wijk et WFS municipal servent à la comparaison. Les GeoJSON CBS 2025 archivés constituent un instantané de recette régional, avec URL, pagination et SHA-256 dans `reference/qualification.json`. Le laboratoire en HTML exploite encore les API en direct. Une génération par zone pilote, au prochain stade d'intégration, permettrait d'utiliser cet instantané en repli après contrôle d'intégrité et de couverture.

Sources officielles et licences :

- [CBS 2025 et téléchargement direct](https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/geografische-data/wijk-en-buurtkaart-2025) · attribution CBS et Kadaster.
- [PDOK OGC 2025](https://api.pdok.nl/cbs/wijken-en-buurten-2025/ogc/v1?f=html&lang=nl) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- [PDOK OGC 2026 v0](https://api.pdok.nl/cbs/wijken-en-buurten-2026/ogc/v1?f=html&lang=nl).
- [Registre municipal d'Amsterdam](https://api.data.amsterdam.nl/v1/docs/datasets/gebieden.html) · [métadonnées nationales du registre, CC0 1.0](https://data.overheid.nl/dataset/5l2csm77flzgya). Les données municipales sont datées à l'extraction, avec leurs champs de validité.
- [Adresse du commerce pilote dans le registre municipal](https://data.amsterdam.nl/adressen/0363200000145991) · [adresse publique du monument à Graft](https://www.erfgoedregistratie.nl/document/2895a2cb-7a13-4d35-ac06-f7152bb443a6).
- [Politique des tuiles OSM](https://operations.osmfoundation.org/policies/tiles/). Le laboratoire affiche les contours et noms officiels sans fond de rues, qui reste facultatif. Les transports, obstacles et données d'accessibilité relèvent de la qualification ultérieure des recommandations.

## Anomalies corrigées et recette

- [GitHub Actions initial](https://github.com/ccam22430/buuurt-maquettes/actions/runs/45962926980) à 09 h 04. Le processus a tourné et le serveur a renvoyé HTTP 404 sur l'ancien chemin. La V6 historique, identique à Drive et GitHub, reproduit l'échec de chargement sur cette URL dans Chromium. [Nouvelle exécution](https://github.com/ccam22430/buuurt-maquettes/actions/runs/45965304788) à 09 h 23, succès, 10 polygones et lien de page suivante.
- Calcul de voisinage en RD, comparaison indépendante des intersections de frontières avec GDAL/GEOS. Amsterdam, `BU0363EM02` Balboaplein e.o., cinq voisins et quatre contacts ponctuels exclus. Graft, `BU03611002`, cinq voisins, dont Grootschermer avec 9,473 m de frontière. Le contrôle navigateur compare les cinq codes exacts pour chaque adresse.
- Recette à 09 h 32 avec Chromium 151.0.7922.34 et des réponses HTTP 200 en direct. Deux adresses × deux tailles. Ordinateur 1440 × 900, smartphone émulé avec saisie tactile à 390 × 844. Clic ou toucher du polygone, case synchronisée, zoom et remise à zéro, gris sans action, rejet d'une adresse incomplète et effacement à la modification. Espace et Entrée testés sur ordinateur. Aucune erreur JavaScript. La carte évite les libellés qui se chevauchent sur petit écran et la liste garde tous les noms des zones éligibles.
- `reference/recette.json` contient les résultats exécutés et `reference/recette.jpg` la planche visuelle. Les quatre captures PNG originales sont archivées avec le dossier de preuves.

## Reproduction

1. Depuis la racine, générer la qualification à partir de PDOK et du WFS municipal avec Python 3 et les interfaces GDAL/GEOS. Les exports sont écrits dans le dossier fourni.

   ```sh
   python3 lab/geo/probe.py /tmp/buuurt-geo-data
   python3 lab/geo/compare_cbs.py /tmp/buuurt-geo-data /chemin/vers/wijkenbuurten_2025_v1.gpkg
   ```

2. Avec Playwright et Chromium installés, lancer la recette en direct. `GEO_CHROMIUM`, `GEO_PLAYWRIGHT_MODULE` et `GEO_CHROMIUM_PROXY` permettent d'indiquer un exécutable, un module ou un proxy d'environnement si nécessaire. `GEO_V6_ORIGINAL` pointe facultativement vers l'HTML du commit de référence `a70c1c178293cfaa2d33dcb831c23ef4d9f068a7`.

   ```sh
   node lab/geo/recette.cjs /tmp/buuurt-geo-recette
   ```

Le navigateur a été testé en mode français de revue, avec adresse saisie dans le laboratoire. Le branchement du profil commerce, des zones actives administratives, le bilinguisme NL/EN du parcours final, la recette sur un téléphone physique et la validation du produit restent à réaliser. GEO-IA n'est pas connecté.
