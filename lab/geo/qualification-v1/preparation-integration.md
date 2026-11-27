# Préparation de GEO-06 et GEO-07

La branche isolée contient les maquettes et le laboratoire.

- COM-PUB-002 montre le choix gratuit/sponsorisé et affiche la confirmation gratuite. Son script ouvre encore un écran interne à curseur sur la branche examinée. Le chemin montré ne prouve ni le branchement sur l'état administrateur ni la poursuite des campagnes engagées lorsque cet état passe à OFF.
- COM-PUB-SPON-001 charge Leaflet en revue et initialise sa carte sur les coordonnées fixes de l'adresse pilote. Le laboratoire GEO-03 vérifie l'adresse et les contours séparément. Le code examiné ne prouve pas une liaison au véritable profil commerçant, aux autorisations actives ni à une capacité publicitaire en temps réel.
- Aucune interface source faisant foi pour le profil, l'état administrateur, l'inventaire publicitaire et la persistance des campagnes n'a été identifiée dans la branche autorisée. Un scénario de démonstration peut valider un écran. La recette fonctionnelle complète exige des interfaces d'essai disposant d'un état réaliste et observable.

## Critères d'entrée et de sortie

| Entrée à obtenir | Critère de recette en environnement isolé |
|---|---|
| Profil d'un commerce d'essai et adresse confirmée | La carte reçoit l'adresse du profil. Changer de commerce change l'adresse. Une adresse manquante ou ambigüe bloque la sélection. |
| Zones administrées et autorisations durables | Toute sélection et recommandation est recontrôlée. Une zone inactive reste bloquée. Une dérogation révoquée à partir d'une date donnée ne s'applique plus aux campagnes futures. |
| Interrupteur administrateur et une campagne existante | OFF mène à l'aperçu et à la confirmation habituelle du gratuit, même via une entrée directe. La nouvelle création sponsorisée est refusée. Une campagne en cours reste diffusée. ON rétablit le choix. |
| Capacité publicitaire, période et forfaits | Capacité réellement vérifiable avant paiement. Un forfait insuffisant ou une source indisponible bloque l'engagement. Prix affichés identiques quelle que soit la sélection géographique. |
| Brouillon d'annonce d'essai | Durée, article et sélection autorisée sont conservés à la reprise et lors d'un changement de langue. Une zone devenue inéligible est retirée et signalée. |
| Vérification produit | NL/EN, FR de revue si disponible, portrait mobile et ordinateur, clavier, erreurs, non-régression gratuit, annonce sponsorisée existante, localisation réelle et mention hors territoire. |

Le paramétrage des temps de visite actuellement mesuré sert à tester la sensibilité. Le lot GEO-05 peut être relu et vérifié techniquement. L'activation d'un barème automatique attend une décision produit et, condition séparée, des interfaces d'essai pour les données métier.
