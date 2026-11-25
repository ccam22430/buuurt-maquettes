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

## Parcours de publication commerçant — décision du 23 novembre 2026

- Le commerçant choisit Offre, Événement ou Découverte, puis la langue du contenu en début de formulaire, avant la rédaction. Le globe règle la langue de l’interface indépendamment de la langue de l’annonce.
- Après la saisie du contenu, le commerçant passe par l’étape photo COM-PUB-003, puis choisit le mode de diffusion dans COM-PUB-002. Publication gratuite est sélectionnée par défaut. L’étape photo conserve ses règles déjà approuvées.
- En gratuit, « Voir l’aperçu » mène à l’aperçu de l’annonce, puis une action explicite « Publier gratuitement » confirme la publication. Cette séquence prévaut sur l’ordre antérieur de l’aperçu et du choix du mode pour le parcours gratuit.
- Pour le sponsorisé, appliquer les conditions d’activation et le parcours budget, zone, durée et récapitulatif déjà validés dans l’addendum du 22 novembre. En production, afficher l’option selon l’activation du périmètre.
- Le retour à une étape précédente conserve la langue du contenu, la saisie et les photos. Le changement de langue de l’interface préserve le brouillon et sa langue.
- Critères de recette à exécuter en environnement isolé. Sur une offre fictive « Coupe à 25 € », choisir la langue de l’annonce, saisir le titre et le prix, ajouter une photo, puis vérifier l’arrivée sur COM-PUB-002 avec Gratuit sélectionné. Vérifier les retours, le changement de langue de l’interface et la fidélité du titre, du prix, du texte et de la photo dans l’aperçu. Vérifier qu’aucune publication n’a lieu avant la confirmation, et qu’une double action ou une reprise après erreur ne crée pas de doublon. Après validation de ce parcours, vérifier les mêmes transitions sur Événement et Découverte en conservant leurs règles propres.

Statut : séquence approuvée par le fondateur. Implémentation et recette à réaliser. Les validations individuelles des maquettes figurent ci-dessus.

## Parcours de publication gratuit ou sponsorisé — décision du 25 novembre 2026

- Le commerçant vérifie son annonce dans COM-PUB-APE-001 après les photos, puis choisit le mode de diffusion dans COM-PUB-002. Cette décision actualise l’ordre aperçu / choix du mode consigné le 23 novembre.
- Gratuit : après « Continuer », afficher le récapitulatif à 0 € avec l’aperçu de l’annonce. La publication est déclenchée par l’action explicite « Publier l’annonce ».
- Sponsorisé : après « Continuer », le commerçant règle le budget, la zone de diffusion et les dates. Le récapitulatif présente le montant total et l’aperçu avec le badge « Sponsorisé ». L’action explicite « Confirmer et payer » suit ce récapitulatif.
- Le badge « Sponsorisé » identifie la diffusion payante sur la carte. Le badge du type d’annonce, par exemple « Offre », reste distinct.
- Statut : principe validé par le fondateur. Récapitulatifs et actions finales à intégrer et à tester dans la maquette. Les conditions d’activation du sponsorisé restent applicables.

## VALIDÉE — COM-PUB-APE-001 / MER-PUB-PRV-001 — Aperçu de l’annonce

- Validation du fondateur le 25 novembre 2026.
- Maquette : `revue/com-pub-apercu-001.html` (blob `dbf410301802b15e6fec433088e6a49fad691336`).
- L’aperçu montre le même brouillon en grand format après un scan du QR vitrine s’il devient l’annonce principale, et en petit format dans le fil du quartier.
- Un seul carrousel, visible à partir de deux photos, synchronise les deux formats. Le badge « Offre » figure dans les deux formats de l’exemple. Le texte « Voir toutes les annonces » est présenté sans navigation dans l’aperçu.
- « Continuer » mène à COM-PUB-002. Le choix de l’annonce principale relève de « Mes annonces ». Les récapitulatifs de publication et le paiement relèvent de la décision de parcours distincte.

## VALIDÉE — COM-PUB-002 / MER-PUB-002 — Choix du mode de publication

- Validation du fondateur le 25 novembre 2026.
- Maquette : `revue/com-pub-002.html` (blob `31901ebe03a0a3bc04b0e7cf00b5cba83f19e9ee`).
- La carte sponsorisée apparaît en premier et présente la mise en avant dans le fil avec les réglages Budget, Zone et Durée. La publication gratuite à 0 € reste sélectionnée par défaut.
- Texte français validé pour le gratuit : « Faites découvrir votre commerce à tout le quartier. Plus la vitrine où l’habitant scanne un QR code est proche de votre commerce, plus votre annonce remonte dans le fil. »
- Cette validation couvre l’écran de choix. Les récapitulatifs finaux, la publication effective et le paiement restent à intégrer selon la décision de parcours du 25 novembre 2026.

## Codes des écrans après l’aperçu — décision du 25 novembre 2026

| Code | Écran |
| --- | --- |
| COM-PUB-002 / MER-PUB-002 | Écran commun de choix du mode de publication après l’aperçu. |
| COM-PUB-GRA-001 | Confirmation de publication gratuite. |
| COM-PUB-SPO-001 | Paramétrage de la campagne sponsorisée : budget, zone et durée. |

Statut : nomenclature validée par le fondateur. La confirmation de publication gratuite est documentée ci-dessous.

## VALIDÉE — COM-PUB-GRA-001 — Confirmation de publication gratuite

- Validation du fondateur le 25 novembre 2026.
- Maquette : `revue/com-pub-002.html` (blob `3d85cef7c503259749d8c38987f10eaef8ab25a8`). [Ouvrir la confirmation](https://ccam22430.github.io/buuurt-maquettes/revue/com-pub-002.html?etape=confirmation-gratuite#fr-MER-PUB-002).
- Après l’aperçu, le bouton « Publier gratuitement » de COM-PUB-002 mène directement à la confirmation. Cette décision remplace le récapitulatif gratuit à 0 € prévu dans la décision antérieure.
- En-tête BUUURT avec menu, logo officiel, globe de langue et cloche. Actions dans l’ordre : « Créer une nouvelle annonce » (principale), « Accéder à mon tableau de bord » (secondaire), « Voir mon annonce dans le fil » (lien texte).
- La publication est simulée. Le lien vers le fil ouvre une annonce gratuite d’exemple.
