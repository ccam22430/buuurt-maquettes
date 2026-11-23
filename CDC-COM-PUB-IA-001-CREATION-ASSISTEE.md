# BUUURT — CDC — COM-PUB-IA-001 — Création d'annonce manuelle ou assistée par IA

Statut : **principe fonctionnel validé par le fondateur le 23 novembre 2026**. Maquette, prototype vocal et intégration : à réaliser et à valider séparément. Aucune mise en production ni dépense autorisée.

## Objectif
Permettre aux commerçants de publier rapidement et gratuitement des annonces, avec deux méthodes de création équivalentes : formulaire manuel ou conversation avec un assistant IA spécialisé. Les deux chemins rejoignent le même aperçu final, puis le choix publication gratuite ou sponsorisée.

## Parcours cible
1. **Créer une annonce** : deux choix clairement visibles, « Manuellement » et « Avec l'IA ». Ne pas supprimer le mode manuel.
2. **Manuellement** : réutiliser les écrans existants selon catégorie (Aanbieding, Evenement, Ontdek), puis ajout de photos.
3. **Avec l'IA** : conversation vocale en NL ou EN, avec possibilité de saisir/corriger manuellement. Durée cible 2–3 minutes. Exploiter les données autorisées du profil commerce sans les redemander ; poser seulement les questions indispensables. Proposer la photo existante, la prise de photo, la retouche ou la génération d'image, sans imposer une génération coûteuse.
4. **Aperçu commun** : afficher tous les champs, visuels et informations commerciales, permettre les corrections. Le commerçant confirme via « Terminer ».
5. **COM-PUB-002** : présenter publication gratuite ou sponsorisée. Gratuit → confirmation de publication ; sponsorisé → COM-PUB-SPON-001 (configuration). Ne pas déclencher de paiement ni de publication depuis la seule conversation IA.

## Mission et protections de l'assistant
- Domaine autorisé : création et modification d'annonces BUUURT exclusivement. En cas de demande hors sujet, réponse courte et retour à l'annonce ; autoriser toute clarification réellement utile à l'annonce.
- Ne jamais inventer prix, remise, stock, disponibilité, dates, promesses ou caractéristiques du commerce. Demander confirmation si information manquante.
- Aucun outil généraliste ni accès à des données sans rapport. Permissions et outils limités ; validation structurée des champs par le serveur ; aucune publication autonome.
- Limites côté serveur : durée, nombre d'échanges, appels IA et coût par session ; protections contre abus et demandes répétées. Consentement et règles de conservation des données vocales à préciser selon RGPD.
- La restriction par consignes seule ne garantit pas l'absence absolue de dérive : tester les conversations hors sujet, ambiguës et adversariales.
- Application bilingue NL/EN, NL par défaut ; la documentation de travail reste en français.

## Mesure d'efficacité (à concevoir avec minimisation des données)
Comparer manuellement et IA : taux de démarrage/achèvement, durée médiane de création, corrections nécessaires, abandon, coût IA par annonce finalisée, satisfaction commerçant et taux de publication. Aucune métrique ne justifie de rendre le mode manuel secondaire sans validation métier.

## Prototype isolé validé
- Conversation de 2–3 minutes avec une commerçante fictive (Sanne, nouvelle collection vintage), en NL puis EN.
- Scénarios : description libre, questions minimales, photo existante, champs complets, aperçu modifiable, question hors sujet avec recentrage, absence d'invention commerciale.
- Tests : mobile iOS/Android, micro et permissions, interruptions, qualité de transcription, qualité de l'annonce, latence, coût unitaire observé.
- Réutiliser les composants de la bibliothèque ; ne pas modifier les maquettes déjà validées sans autorisation. Éviter les services payants sans approbation.

## Références GitHub
- Choix type d'annonce : `revue/com-pub-001.html`
- Formulaires : `revue/creer-offre-preview.html`, `revue/creer-evenement-preview.html`, `revue/creer-decouverte-preview.html`
- Photos : `revue/com-pub-003.html`
- Choix gratuit / sponsorisé : `revue/com-pub-002.html`
- Configuration sponsorisée : `revue/com-pub-spon-001.html`
- Registre des validations existantes : `VALIDATIONS-COM-PUB-2026-11-23.md`

## À concevoir
- Écran d'entrée « Manuellement / Avec l'IA » et démonstration vocale.
- Écran d'aperçu final commun, après photos, avant COM-PUB-002.
- Liaison entre écrans et confirmation de publication gratuite.
- Contrat de validation, maquettes et tests du prototype.
