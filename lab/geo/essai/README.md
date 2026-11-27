# BUUURT V1 · banc d’essai local GEO‑06

Ce banc met en œuvre le premier périmètre d'essai de publication. La démo commerçants isolée a été approuvée le 19 novembre 2026. La recherche du 27 novembre dans les dépôts connectés, Sites, Drive et les comptes rendus a retrouvé la spécification, les supports de démonstration et la bibliothèque des maquettes. Aucun lien vers une instance V1 d'essai avec données applicatives n'a été identifié.

## Ouvrir et tester

Télécharger et ouvrir `buuurt-v1-essai.html` dans un navigateur. Le fichier autonome inclut les deux cartes de recette. Le bandeau identifie l'essai à tout moment. La langue initiale est le néerlandais, avec anglais et français de revue.

1. Vérifier l'aperçu gratuit quand les campagnes sponsorisées sont désactivées et saisir un texte.
2. Activer le sponsoring dans les paramètres d'essai, puis ouvrir le choix sponsorisé. Comparer les profils Amsterdam et Graft.
3. Modifier la sélection, révoquer le premier quartier, puis basculer la capacité entre normale, faible et inconnue.
4. Modifier la langue, recharger la page, puis couper le sponsorisé pendant la configuration. Le brouillon subsiste et la campagne d'essai C‑001 reste affichée.

L'adresse BAG et les contours CBS 2025 proviennent du laboratoire qualifié. Les paramètres administratifs, la capacité et les confirmations de publication sont simulés dans le navigateur. Les brouillons sont locaux et distincts par profil. L'interface n'envoie aucune requête externe. Elle n'a ni comptes utilisateurs ni paiement. Les droits applicatifs, les invitations, les QR, la diffusion et la capacité réelle seront à raccorder dans un environnement applicatif avant l'ouverture aux commerçants.

## Reconstruire et rejouer

Depuis la racine du dépôt, lancer `python3 lab/geo/essai/construire.py`. Le script utilise le ZIP de contours déjà versionné et génère le HTML autonome à partir de `page.html` et `essai.js`.

Avec Playwright et Chromium installés, lancer `node lab/geo/essai/recette.cjs /tmp/buuurt-recette`. Les variables facultatives `GEO_PLAYWRIGHT_MODULE` et `GEO_CHROMIUM` acceptent les chemins du module et de Chromium. Les deux profils de dimensions sont 1440 × 900 et 390 × 844 (tactile émulé). La preuve JSON correspond au banc local, avec validations simulées et sans appel à une application V1 hébergée.

Source des contours : Wijk- en Buurtkaart 2025, CBS / Kadaster via PDOK, CC BY 4.0. Aucune fusion ni publication d'un nouvel environnement.
