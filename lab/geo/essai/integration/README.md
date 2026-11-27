# BUUURT · parcours de publication GEO‑06/07

## Démarrer

1. Extraire toute l'archive dans un dossier.
2. Sur Windows avec Node.js déjà installé, double-cliquer sur `lancer.cmd`. Depuis un terminal, la commande équivalente est `node lancer.cjs`. La recette a été exécutée avec Node.js 24.
3. Ouvrir l'un des liens affichés dans la fenêtre de lancement. **Amsterdam** et **Graft** ouvrent les espaces commerçants d'essai. **admin** permet d'activer le sponsorisé, de révoquer une zone de test et de modifier la capacité. Ouvrir admin et les deux commerces dans des profils de navigateur séparés pour conserver les trois sessions simultanément.
4. Garder la fenêtre de lancement ouverte pendant la visite. Le serveur écoute exclusivement sur `127.0.0.1:8780`. À chaque démarrage, utiliser les nouveaux liens affichés. Les liens et sessions d'essai expirent après deux heures.

Lancer un seul processus pour un même dossier d'état. Les données d'essai persistent dans `etat-essai.json` à côté du lanceur. Extraire dans un autre dossier pour un état neuf. L'archive contient les fichiers web prêts à l'emploi et ne réclame aucun paquet npm pour la visite.

## Réalité des données et limites de la recette

| Élément | Source |
| --- | --- |
| Adresse et contours | Adresses publiques BAG et contours CBS 2025 déjà qualifiés dans GEO‑03. |
| Profils, rôles, dérogations et campagnes | Deux commerces, un administrateur et une campagne fictifs. Sessions séparées contrôlées par le serveur local. |
| Brouillons et publications | Stockage local persistant, contrôle de révision et validation unique par version du brouillon. |
| Capacité | Jeu de données simulé par commerce. Le calcul d'essai utilise la durée et le nombre de zones, puis déduit les impressions réservées par les publications fictives. |
| Services V1 | Aucun contrat de service d'essai raccordable identifié dans la branche autorisée, la recherche GitHub V1 ou les références déjà auditées. |

Les parcours NL/EN ont été vérifiés sur ordinateur et smartphone tactile émulé. Le serveur vérifie encore la capacité, les droits et l'interrupteur au moment de la confirmation. L'administration de test n'affiche pas les brouillons. Les deux profils commerçants ne reçoivent que leurs propres données. La campagne C‑001 reste active dans l'état d'essai lorsque le sponsorisé passe à OFF. Les campagnes confirmées ici sont des entrées locales. Les droits réels et la capacité réelle restent à raccorder. L'environnement ne contient aucun accès à des services de paiement, à un canal de diffusion ou à des impressions facturables. GEO‑IA reste en observation.

## Reproduire depuis le dépôt

Depuis la racine, `python3 lab/geo/essai/integration/construire.py` génère le dossier `dist` à partir du banc GEO‑06 et des données CBS déjà versionnées. Lancer ensuite `node lab/geo/essai/integration/lancer.cjs`.

Avec Playwright et Chromium installés, exécuter `node lab/geo/essai/integration/recette.cjs dossier-de-preuves`. Les options `GEO_PLAYWRIGHT_MODULE` et `GEO_CHROMIUM` permettent de préciser le module et l'exécutable. La recette démarre et redémarre des serveurs isolés avec des fichiers d'état temporaires et les efface à la fin.

Le navigateur Windows n'a pas été utilisé pour la recette. Le lanceur Windows est un raccourci vers la même commande Node exécutée pendant les tests Linux. Les résultats n'attestent d'aucun service V1 hébergé, d'aucune exposition à des commerçants et d'aucune mise en production.
