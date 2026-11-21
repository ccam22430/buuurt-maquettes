# Bibliothèque modulaire BUUURT

## Contrat de validation de la PR nº 2

- Les 20 écrans et leurs deux identifiants sont conservés.
- La composition restitue exactement le HTML historique des 20 écrans dans les trois modes de langue.
- La navigation du visualiseur conserve le néerlandais par défaut, les anciens liens directs et les boutons précédent/suivant. Les liens existants dans les maquettes ouvrent leur écran cible dans le visualiseur, dans la langue courante.
- Une modification locale reste limitée à l’écran édité. Une modification commune s’applique uniquement aux fichiers qui référencent le composant.
- Le HTML historique sert à la comparaison de migration. La vérification courante ne réécrit aucun fichier.

## Prévisualiser et modifier

Depuis la racine du dépôt, lancer `python3 -m http.server 8765 --bind 127.0.0.1`, puis ouvrir <http://127.0.0.1:8765/modular/>. Le serveur HTTP permet au visualiseur de charger ses fichiers.

Chaque fichier de `screens/` contient les codes, le titre et le HTML d’un écran sous forme de lignes assemblées sans séparateur. Modifier ce fichier pour une évolution locale. Les inclusions explicites `{{nom}}` sont remplacées par les fragments de `components/shared.json` avant traduction et rendu. Leur position est définie par chaque écran.

| Portée | Éléments |
| --- | --- |
| Commune aux 20 écrans de référence | Styles de base, logo, menu supérieur et navigation basse |
| Partagée par les écrans qui la référencent | Onglets de filtres sur les cinq écrans de fil concernés, indicateur d’en-tête standard sur 19 écrans |
| Spécifique à un écran | Cloche détaillée de l’accueil web, contenu et CSS propres, sélecteur intégré à l’écran d’arrivée |

Le dictionnaire de traduction et les commandes du visualiseur sont dans `index.html`. Les libellés et interactions représentés restent ceux des maquettes de référence. Des commandes sont purement visuelles. La couverture des traductions est celle de la référence historique et doit être validée séparément pour une livraison bilingue.

## Vérifier

- `node tests/verify-modular.cjs` contrôle les fichiers, les composants et les destinations.
- `node tests/verify-modular.cjs --parity` contrôle en plus la recomposition exacte avec le HTML historique.
- Avec le serveur local démarré et Playwright/Chromium disponibles, `node tests/verify-browser.cjs` contrôle la navigation et les interactions représentées. Ajouter `--parity` pour comparer les 60 rendus avec la référence.
- En cas de changement intentionnel d’une maquette, la comparaison historique peut signaler l’écart. Utiliser les contrôles courants pour vérifier la version en cours de maintenance.
