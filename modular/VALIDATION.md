# Validation de la localisation

- Les 20 maquettes s’ouvrent en néerlandais par défaut, et chaque écran peut passer en anglais sans changer de destination.
- Les textes, titres et attributs d’accessibilité de la maquette sont dans la langue choisie. Les notes de revue et les noms propres conservent leur rôle.
- Le changement de langue conserve les champs et le consentement dans la maquette d’arrivée. Les liens internes existants conservent la langue.
- Les composants, liens, images et styles sources conservent leur portée. La référence française reste identique. Les différences intentionnelles portent sur la traduction et la conservation de l’état.
- Les contrôles Chromium couvrent les écrans sur ordinateur et mobile, y compris le formulaire simulé. Aucune donnée saisie dans la maquette n’est envoyée.

## Audit des 20 écrans

| Écrans | Écart observé et traitement |
| --- | --- |
| Les 20 écrans | Titre de document en français et menu inférieur en néerlandais dans le mode anglais. Titres NL/EN, indicateur de langue et libellés du menu localisés. Les notes de revue du visualiseur restent en français. |
| USR-WEB-001 | Titre et nom accessible de la cloche en néerlandais en mode anglais. Localisés sur l’accueil. |
| USR-SEL-003, USR-STR-001, USR-STO-001, USR-POS-001, USR-LOC-001 | Onglet « News » en mode néerlandais. Affiché « Nieuws » en NL et « News » en EN. |
| USR-STR-001, USR-LOC-001 | Annonce « 2 bouquets pour 15 € » restée en français. Phrase localisée. |
| USR-LOC-002 | Le corps comportait déjà les trois versions. Le sélecteur intégré, le sélecteur du visualiseur, l’adresse et le consentement sont maintenant synchronisés pendant une bascule. |
| USR-SEL-001/002, USR-AUT-001, USR-DIR-001, USR-FAV-001 et MER-001 à MER-008 | Corrections communes. Les parcours et libellés spécifiques existants restent identifiables dans chaque langue. |

La cloche détaillée de l’accueil et l’indicateur standard des 19 autres écrans reprennent la portée graphique existante. Les commandes de menu et de notification dessinées restent des éléments de maquette.

## Revue et publication

Construire le fichier de revue hors ligne avec `node tools/bundle-preview.cjs aperçu.html` et l’ouvrir dans un navigateur. Priorités de revue : accueil et cloche en EN, fil de rue et fil de proximité en NL/EN, écran d’arrivée avec un brouillon de formulaire, puis passage au parcours commerçant.

Le dépôt sert actuellement la bibliothèque historique via GitHub Pages à la racine du site du dépôt. Après accord explicite, confirmer la branche, le dossier source et le SHA du déploiement GitHub Pages actif. Consigner le SHA de restauration, puis fusionner la PR et vérifier le déploiement Pages. Contrôler l’URL historique ainsi que le chemin `/buuurt-maquettes/modular/`, les 20 entrées, les deux langues et un lien historique. L’URL historique reste le point d’entrée connu. Pour un remplacement ou une redirection de cette URL, faire valider le changement d’entrée.

En cas de régression, revenir sur le commit de fusion via un commit de réversion sur la branche publiée, suivre le nouveau déploiement Pages et revérifier l’URL historique. Aucun changement de paramètre Pages ni aucune réécriture d’historique ne sont requis pour cette réversion.
