# BUUURT — En-tête officiel des maquettes (validé le 23 novembre 2026)

Référence visuelle et fonctionnelle validée par le fondateur : `hab-fiche-001.html` (menu SVG corrigé, commit `ef697ad`).

## Contrat obligatoire

- Menu : trois traits SVG indépendants, de même longueur et épaisseur, centrés ; bouton arrondi 37 × 37 px, liseré gris clair ; cliquable.
- Logo : logo officiel BUUURT centré, sans substitution.
- Langue : globe noir fin, code de langue NL / EN / FR, sélecteur fonctionnel, liseré gris arrondi ; respecter la langue et le comportement propres à la page.
- Notifications : vraie cloche SVG fine, liseré gris, compteur rouge numérique seulement si supérieur à zéro, ouverture au clic.
- Les écrans sans en-tête mobile ne doivent pas recevoir d'en-tête artificiel.
- Ne pas recopier les SVG, les styles ou la logique dans chaque nouvelle page : utiliser `buuurt-shared-header.js`.

## Implémentation

- `buuurt-shared-header.js` est le composant commun et l'unique source de vérité de l'en-tête.
- `buuurt-theme.js` charge automatiquement le composant sur les nouvelles pages de revue qui utilisent le thème et possèdent un en-tête mobile.
- Pour les pages qui n'utilisent pas `buuurt-theme.js`, ajouter `<script src="buuurt-shared-header.js"></script>` avant `</body>`.
- Conserver les actions existantes de navigation, le contenu des pages et les sélecteurs de langue. Le panneau de notifications est une simulation de revue, pas une connexion à un service réel.
- Les pages à plusieurs écrans internes doivent appliquer la même règle à chaque en-tête ; ne pas ajouter de commandes à un écran qui n'en prévoit pas.

## Contrôles de non-régression

1. Vérifier visuellement le menu SVG, le globe, le logo, la cloche et les alignements sur mobile.
2. Cliquer sur menu, sélecteur de langue et cloche ; vérifier que les fonctions propres à l'écran restent opérationnelles.
3. Vérifier le compteur avec `?notifications=3` et `?notifications=0`.
4. Vérifier FR, NL et EN, les écrans étroits et les écrans à plusieurs langues.
5. Vérifier GitHub Pages après publication ; une mise à jour du dépôt seule ne prouve pas le rendu public.

Cette règle concerne la bibliothèque de maquettes, pas l'application BUUURT en production.
