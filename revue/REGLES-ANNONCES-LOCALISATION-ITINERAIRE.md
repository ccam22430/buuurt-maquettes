# BUUURT — Règles validées : localisation et itinéraire des annonces

**Statut : validé par le fondateur le 23 novembre 2026.**
**Portée :** toutes les annonces et tous les fils d'annonces concernés (offres, événements, découvertes, sponsorisées), pages existantes et futures. Ce document décrit le comportement attendu ; il ne prouve pas son implémentation dans l'application de production.

## 1. Cartes d'annonces — rue et distance

- Chaque carte d'annonce présente, sous le contenu, une ligne compacte avec **le nom de la rue du commerce** et une icône de commerce/localisation à gauche, puis **une icône de marche et la distance** à droite.
- Cette présentation s'applique aux cartes ordinaires, sponsorisées et à l'annonce mise en avant du commerce dont le QR code a été scanné.
- **Contraste :** sur la grande annonce illustrée du commerce scanné, nom de rue, distance et pictogrammes sont blancs afin de rester lisibles sur la photo. Sur les cartes claires, ils restent foncés.
- Les longues rues doivent pouvoir être tronquées proprement ou passer sur une disposition adaptée sans chevauchement, notamment sur petits écrans et dans les trois langues de l'application.
- Les valeurs affichées doivent provenir des données fiables du commerce et d'une position de référence pertinente. Ne jamais présenter une distance de démonstration comme une distance réelle. Si la distance n'est pas calculable, ne pas inventer de valeur ; conserver la rue si connue.

## 2. Interaction depuis le fil

- La rue et la distance sur une carte sont des **informations**, pas des liens ouvrant directement un service de cartographie.
- Le clic sur la carte ouvre **le détail de l'annonce**. Les autres interactions déjà validées (favoris, carrousel, partage, etc.) restent inchangées.

## 3. Détail de l'annonce et itinéraire

- Le détail de l'annonce propose un bouton explicite **« Itinéraire »** (libellés localisés en NL et EN pour l'application).
- Le bouton lance une navigation vers **l'adresse vérifiée du commerce**, sans imposer Google Maps, Apple Plans ou Waze.
- Utiliser les mécanismes compatibles avec le téléphone ou navigateur pour laisser à l'utilisateur son application de navigation préférée. Une PWA ne peut pas garantir l'affichage de toutes les applications installées : prévoir un choix de services compatible si le mécanisme natif ne permet pas ce choix.
- Ne pas ouvrir une application cartographique en cliquant seulement sur une distance ; éviter les redirections externes accidentelles.
- En l'absence d'adresse exploitable, ne pas construire de destination fictive ; prévoir un comportement d'indisponibilité clair.

## 4. Contrat de validation (avant généralisation)

1. Vérifier une annonce de chaque catégorie et une annonce sponsorisée : rue et distance présentes quand les données le permettent.
2. Vérifier la carte du commerce scanné : tous les textes et icônes de localisation en blanc et lisibles.
3. Vérifier les cartes claires : textes foncés et contrastés ; aucune superposition sur petits écrans.
4. Vérifier que le clic sur une carte ouvre son détail, y compris lorsque l'on clique dans la zone de distance.
5. Vérifier que le bouton « Itinéraire » du détail ouvre une destination correspondant à l'adresse du commerce et ne force pas un fournisseur unique.
6. Vérifier les comportements sans distance, sans adresse, avec longue rue, et en NL/EN.
7. Ne pas assimiler une maquette GitHub Pages à une fonctionnalité déployée et testée en production.

## 5. Suivi d'implémentation

- **Validé fonctionnellement :** toutes les règles ci-dessus.
- **Maquette HAB-VIT-001 :** ligne rue/distance déjà introduite ; correction de contraste blanc enregistrée (commit `758416a`).
- **À réaliser et vérifier :** généralisation à tous les fils concernés ; bouton « Itinéraire » dans les détails ; choix du fournisseur cartographique selon les possibilités de la plateforme ; tests E2E et visuels.

**Source de vérité de cette décision :** ce fichier versionné dans GitHub. Une copie dans Google Drive n'est pas requise pour appliquer la règle et risquerait de diverger ; si le cahier des charges fonctionnel central est conservé dans Drive, le synchroniser ultérieurement avec cette version validée plutôt que créer une seconde règle concurrente.
