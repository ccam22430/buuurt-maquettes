# BUUURT — Registre de validation des maquettes de publication

Date de confirmation : 2026-11-23.
Autorité de validation : fondateur BUUURT (confirmation explicite dans la conversation).

## VALIDÉE — COM-PUB-OFF-001 — Créer une offre
- Fichier : `revue/creer-offre-preview.html`
- URL : https://ccam22430.github.io/buuurt-maquettes/revue/creer-offre-preview.html?v=35152b7
- Git blob SHA vérifié : `c47137935b99bdf23b06424a2df26a5c10e65111`
- Périmètre : formulaire d'offre, sans ajout de photos. Choix de mécanisme commercial, détails, validité et conditions, en-tête BUUURT.
- Action Continuer : étape photos COM-PUB-003.
- Statut : APPROUVÉ PAR LE FONDATEUR. Ne pas modifier sans nouvelle validation explicite.

## VALIDÉE — COM-PUB-003 — Ajouter une ou plusieurs photos
- Fichier : `revue/com-pub-003.html`
- URL : https://ccam22430.github.io/buuurt-maquettes/revue/com-pub-003.html#fr-MER-PUB-003
- Git blob SHA vérifié : `e594d382ef80e9824e9f132c0dbc28ff240b3821`
- Périmètre : étape distincte pour les photos (appareil, téléchargement, génération IA, bibliothèque BUUURT).
- Statut : APPROUVÉ PAR LE FONDATEUR. Ne pas modifier sans nouvelle validation explicite.

## Gouvernance
- Cette validation concerne les deux écrans tels qu'approuvés ; elle n'autorise pas une modification des autres pages ni une mise en production de l'application.
- Conserver les versions approuvées ; effectuer les travaux ultérieurs sur des fichiers/branches séparés et obtenir une nouvelle validation pour tout changement fonctionnel ou visuel significatif.
- Ce registre atteste la décision métier et les identifiants des fichiers vérifiés ; il ne constitue pas une preuve de tests navigateur exhaustifs.

## VALIDÉE — COM-PUB-DEC-001 — Créer une découverte
- Confirmation explicite du fondateur : 2026-11-23.
- Fichier de référence : `revue/creer-decouverte-preview.html`.
- URL : https://ccam22430.github.io/buuurt-maquettes/revue/creer-decouverte-preview.html
- Git blob SHA au moment de la validation : `e742023b8edb116f9c6acbb3c12846ec555a468a`.
- Catégorie officielle : Découverte / Ontdek / Discover (pas une quatrième catégorie).
- Introduction approuvée : « Faites découvrir votre commerce, vos produits ou services aux habitants de votre quartier. »
- Étape suivante : page photos `revue/com-pub-003.html`.
- Statut : APPROUVÉ PAR LE FONDATEUR. Conserver cette version et demander une nouvelle validation avant modification significative.

## VALIDÉE — COM-PUB-EVT-001 — Créer un événement
- Validation explicite du fondateur : 2026-11-23 ; anomalie de traduction signalée à corriger.
- Fichier : `revue/creer-evenement-preview.html`.
- URL : https://ccam22430.github.io/buuurt-maquettes/revue/creer-evenement-preview.html
- Blob SHA après correction linguistique : `79c642cc8d1f0967c7103a8d11401580d7670063`.
- Périmètre : date et heures de l'événement, passage automatique au lendemain pour une heure de fin antérieure à l'heure de début, informations pratiques, début de publication immédiat ou programmé, fin par défaut à la fin de l'événement ou programmée avant celle-ci. Pas de champ lieu.
- Sélecteur NL/EN/FR : script `revue/buuurt-event-i18n.js` ajouté après validation pour corriger la traduction. Contrôle visuel navigateur non encore confirmé.
- Statut : maquette fonctionnelle VALIDÉE par le fondateur, correction i18n enregistrée en attente de vérification visuelle.

### Confirmation finale — COM-PUB-EVT-001 (2026-11-23)
- Validation explicite du fondateur après correction multilingue : « Très bien, je valide la page COM PUB EVT 001 ».
- Version approuvée : blob `b145dd76e3ab789837474cb685960bb3f2e25fc0` ; commit correctif `695429835809a3aa929ab47a71704287f2ae4f44`.
- Traductions NL/EN/FR intégrées directement au HTML. Ne pas modifier la maquette validée sans nouvelle décision.

### Confirmation finale — COM-PUB-003 / MER-PUB-003 (2026-11-23)
- Validation explicite du fondateur : « je valide la page COM-PUB-003 / MER-PUB-003 — Ajouter une photo ».
- Fichier : `revue/com-pub-003.html` ; blob au moment de la confirmation : `5928dc6aa9aa41345736fe8ee3b363865db0e50b`.
- Version approuvée : étape photo et commandes communes telles que présentées lors de la validation, avec police de référence Nunito.
- Cette confirmation remplace le statut provisoire « corrections récentes à revoir » de l'inventaire. Ne pas modifier visuellement ou fonctionnellement cette page sans nouvelle approbation.
- Validation métier distincte d'une vérification automatisée exhaustive des interactions.
