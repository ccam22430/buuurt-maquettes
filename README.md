# buuurt-maquettes
BUUURT — Bibliothèque visuelle des maquettes UX/UI. Consultation des écrans et suivi des évolutions du produit.

## Référentiel de création d'annonces
- [Cahier des charges COM-PUB-IA-001 — Création manuelle ou par assistant vocal](CDC-COM-PUB-IA-001-CREATION-ASSISTEE.md) : principe validé ; maquette et prototype en attente.
- [Registre des validations des maquettes](VALIDATIONS-COM-PUB-2026-11-23.md) : versions approuvées à préserver.
- [Décisions relatives à la publication et au sponsoring](DECISIONS-SPONSORING-COM-PUB-002.md).
- [Bibliothèque des maquettes](revue/index.html) : consultation des écrans disponibles.

Les modifications futures doivent préserver les écrans validés et être testées avant publication.

## Cloud review startup

Use `./scripts/start-review.sh` as the environment startup command, with the repository root as the working directory. It serves the checked-out revision on port 3000. Open `/revue/index.html` to navigate the library, or `/revue/com-pub-spon-001.html?lang=fr` for the sponsored-territory prototype. No dependency installation is required. For the PR #16 review, configure the checkout to use `feat/com-pub-spon-001` and add port 3000 as an owner-only HTTP preview if desired. Port 8000 is reserved by Cloud Codex.

On a new instance, check the environment ID and the checkout SHA, then request `/revue/index.html` on port 3000 before starting any server manually. Open the library in Chrome and follow **Choix du territoire sponsorisé**. This confirms both the startup configuration and the branch being served.

The [BUUURT geographic reference](revue/GEO-REFERENCE.md) records the current demo shop, the official geodata and the two comparison views.
