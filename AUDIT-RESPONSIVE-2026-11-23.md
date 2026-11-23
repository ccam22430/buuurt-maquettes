# Audit responsive des maquettes BUUURT — 23 novembre 2026

## Règle commune confirmée
Pour les cartes d'annonces mobiles, photo au-dessus du contenu, ratio 16:9, image recadrée par object-fit:cover, badge de catégorie contenu dans l'image, mention sponsorisée séparée, cœur réservé aux annonces. Ne pas déformer les images ni couper les mots. Tester NL/EN/FR et les écrans de 320, 360, 375, 390 et 430 px.

## Vérification statique réalisée
- HAB-VIT-001 : importe buuurt-theme.css ; contient des cartes .nearby, des règles responsive et object-fit:cover. Hérite du composant vertical partagé.
- HAB-FICHE-001 : importe la feuille commune, mais n'utilise pas de cartes .nearby dans sa version actuelle ; la fiche commerce ne doit pas être transformée arbitrairement en fil.
- HAB-SUIVI-001, HAB-SUIVI-002, HAB-SUIVI-003 et HAB-NOTIF-001 : importent la feuille commune, sans carte .nearby détectée. Les éléments provisoires nécessitent une revue fonctionnelle distincte.
- Feuille commune : correctif supplémentaire sur les badges multilingues pour autoriser le retour à la ligne à l'intérieur de l'image, sans découpe artificielle des mots (commit 3845721).

## Contrôles restant ouverts — ne pas déclarer « terminé »
- Inventaire et audit des autres pages de revue (commerçant, annonces, aperçus, bibliothèque historique) : vérifier si leurs cartes utilisent .nearby ou une autre structure, puis migrer uniquement les véritables cartes d'annonces.
- Tests visuels réels aux largeurs 320/360/375/390/430 px et langues NL/EN/FR, y compris chaînes longues, badge sponsorisé, favoris et carrousel.
- Safari sur iPhone et Chrome sur Android : non exécutés.
- Contrôle des pages déjà validées : préserver les validations et signaler tout changement d'interface pour revue explicite.

## Gouvernance
Ce document est un état d'audit partiel, pas une certification exhaustive. Toute nouvelle carte d'annonce doit adopter le contrat partagé ; les composants spécifiques aux fiches, tableaux de bord et formulaires restent distincts.
