# BUUURT — Registre des parcours et écrans à maquettiser

Mise à jour : 2026-11-23. Ce registre réserve les identifiants de parcours ; **aucune page HTML n'est créée ni déclarée validée**. Source : décision HAB-SUIVI-001 et GitHub issue #4.

| ID réservé | Parcours / écran | Statut | Dépendance |
| --- | --- | --- | --- |
| HAB-SUIVI-001 | Parcours post-scan : action « suivre ce commerce » et découverte de plusieurs commerces | À maquettiser — fonction V1 validée | Respecter priorité du commerce scanné, fil quartier et QR permanents |
| HAB-SUIVI-002 | Sélection multicommerce et confirmation explicite | À maquettiser — fonction V1 validée | Aucun suivi automatique ; NL/EN |
| HAB-SUIVI-003 | Mes commerces suivis : consulter, gérer, se désabonner | À maquettiser — fonction V1 validée | Compte habitant gratuit ; distinct des favoris d'annonces |
| HAB-NOTIF-001 | Préférences de notifications facultatives | À maquettiser — fonction V1 validée | Opt-in habitant ; aucun envoi direct commerçant ; gestion/désactivation |
| HAB-INVIT-001 | Inviter un commerce absent de BUUURT | À étudier — **non validé pour V1** | Aucun engagement de réalisation sans décision distincte |

## Règles de gouvernance
- Ces IDs sont des références de conception, **pas** des fichiers, routes applicatives ou numéros d'écrans déjà publiés.
- Vérifier les conventions et identifiants existants avant toute génération pour éviter doublons et collisions.
- Les maquettes doivent réutiliser le logo officiel BUUURT, la cloche, le sélecteur NL/EN et les composants communs appropriés ; ne pas répliquer des composants sur des pages où ils n'ont pas lieu d'être.
- Ne pas modifier la bibliothèque publique ni le code applicatif avant la revue des maquettes et les autorisations correspondantes.
- Garder distincts : favoris d'annonces, suivi de commerces, notifications opt-in, et invitation d'un commerce absent.
- Suivi technique et critères : https://github.com/ccam22430/buuurt-maquettes/issues/4 ; https://github.com/ccam22430/buuurt-V1/issues/3 .
