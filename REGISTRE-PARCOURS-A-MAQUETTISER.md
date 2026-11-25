# BUUURT — Registre des parcours et écrans à maquettiser

Mise à jour : 2026-11-23. Ce registre réserve les identifiants de parcours ; **aucune page HTML n'est créée ni déclarée validée**. Source : décision HAB-SUIVI-001 et GitHub issue #4.

| ID réservé | Parcours / écran | Statut | Dépendance |
| --- | --- | --- | --- |
| HAB-SUIVI-001 | Parcours post-scan : action « suivre ce commerce » et découverte de plusieurs commerces | À maquettiser — fonction V1 validée | Respecter priorité du commerce scanné, fil quartier et QR permanents |
| HAB-SUIVI-002 | Sélection multicommerce et confirmation explicite | À maquettiser — fonction V1 validée | Aucun suivi automatique ; NL/EN |
| HAB-SUIVI-003 | Mes commerces suivis : consulter, gérer, se désabonner | À maquettiser — fonction V1 validée | Compte habitant gratuit ; distinct des favoris d'annonces |
| HAB-NOTIF-001 | Préférences de notifications facultatives | À maquettiser — fonction V1 validée | Opt-in habitant ; aucun envoi direct commerçant ; gestion/désactivation |

HAB-INVIT-001 a été retiré du périmètre actuel le 25 novembre 2026 sur décision du fondateur.

## Règles de gouvernance
- Ces IDs sont des références de conception, **pas** des fichiers, routes applicatives ou numéros d'écrans déjà publiés.
- Vérifier les conventions et identifiants existants avant toute génération pour éviter doublons et collisions.
- Les maquettes doivent réutiliser le logo officiel BUUURT, la cloche, le sélecteur NL/EN et les composants communs appropriés ; ne pas répliquer des composants sur des pages où ils n'ont pas lieu d'être.
- Ne pas modifier la bibliothèque publique ni le code applicatif avant la revue des maquettes et les autorisations correspondantes.
- Garder distincts : favoris d'annonces, suivi de commerces, et notifications opt-in.
- Suivi technique et critères : https://github.com/ccam22430/buuurt-maquettes/issues/4 ; https://github.com/ccam22430/buuurt-V1/issues/3 .

## REVUE OBLIGATOIRE — décision validée le 23/11/2026 (fiche commerce et alertes)

**Principe confirmé : une seule fiche commerce complète**, accessible depuis le nom, la photo ou le chevron de la liste des commerces ; ne jamais créer une fiche distincte dédiée uniquement aux notifications. La fiche existante conserve les annonces actives, À propos, Contact, adresse, téléphone et WhatsApp. À examiner/ajouter sans doublon : Suivi, notifications par commerce, accès itinéraire et partage (vérifier les exigences existantes avant de considérer ces deux actions comme de nouvelles fonctions).

**Liste unique des commerces du quartier** : elle remplace le panneau de sélection multicommerce intermédiaire précédemment proposé. Recherche, filtres, catégories et chaque ligne avec trois actions distinctes : Suivre / Suivi ; cloche d'alerte propre à ce commerce ; chevron vers sa fiche complète. Ne pas créer deux pages de sélection successives. Le commerce scanné est prioritaire dans le contexte post-scan ; aucun suivi ni notification implicite.

**Alertes** : réglage indépendant pour chaque commerce suivi. La cloche est un raccourci opt-in, sans notifications commerçant-vers-client. Dans la fiche commerce, un bloc compact « Mes notifications » affiche l'état et la fréquence ; « Modifier » ouvre un panneau de préférences, pas une page commerce parallèle. Options proposées lors de la revue : chaque nouvelle annonce, récapitulatif quotidien, hebdomadaire ou mensuel ; jour préféré si hebdomadaire. La fréquence par défaut et les détails de délivrabilité sont à confirmer lors de la validation des écrans. Une fréquence est un plafond, pas une obligation d'envoyer une alerte ; aucune alerte sans nouveauté.

### Pages et composants à revisiter explicitement

| Référence | Intervention attendue | État de revue |
| --- | --- | --- |
| HAB-VIT-001 (fichier existant `revue/hab-vit-001.html`) | Vérifier emplacement discret de « + Suivre » dans le fil post-scan, sans modifier l'ordre des annonces ni le carrousel par commerce | **À REVOIR — validation antérieure de l'écran non annulée** |
| HAB-SUIVI-001 | Parcours QR → fil → Suivre → liste unique des commerces ; vérifier si l'écran existant suffit | **À CONCEVOIR / ADAPTER** |
| HAB-SUIVI-002 | Liste unique de tous les commerces : recherche, filtres, suivi, cloche et chevron ; **remplace l'ancienne idée d'écran de sélection séparé** | **À CONCEVOIR — parcours révisé** |
| HAB-SUIVI-003 | « Mes commerces suivis » dans le compte habitant, accès aux annonces et désabonnement | **À CONCEVOIR** |
| HAB-FICHE-001 (ID réservé, vérifier correspondance avec la fiche commerce existante) | **Modifier la fiche commerce déjà prévue**, conserver Annonces/À propos/Contact, coordonnées, actions ; ajouter suivi et bloc compact d'alertes | **À RETROUVER ET REVOIR — ne pas dupliquer** |
| HAB-NOTIF-001 | Panneau de configuration des notifications propre à chaque commerce, ouvert depuis sa fiche ; retirer l'interrupteur global ambigu | **À CONCEVOIR / REVOIR** |

**Rappel de revue pour le fondateur** : les lignes marquées À REVOIR, À CONCEVOIR ou À RETROUVER doivent rester visibles dans le registre jusqu'à présentation de la maquette, décision explicite et mise à jour de leur statut. Ne pas déclarer ces écrans validés ni modifier le HTML public sur la seule base de ce registre.

## Fichiers HTML provisoires créés le 23/11/2026

| ID | Fichier réel | Statut |
|---|---|---|
| HAB-SUIVI-001 | `revue/hab-suivi-001.html` | **À VÉRIFIER — HTML créé, non validé** |
| HAB-SUIVI-002 | `revue/hab-suivi-002.html` | **À VÉRIFIER — HTML créé, non validé** |
| HAB-SUIVI-003 | `revue/hab-suivi-003.html` | **À VÉRIFIER — HTML créé, non validé** |
| HAB-FICHE-001 | `revue/hab-fiche-001.html` | **À VÉRIFIER — HTML créé, non validé** |
| HAB-NOTIF-001 | `revue/hab-notif-001.html` | **À VÉRIFIER — HTML créé, non validé** |

Les pages existantes restent conservées sans écrasement. Le sélecteur de typographies est partagé par les maquettes chargeant `buuurt-theme.js` et `buuurt-theme.css`. Les pages historiques qui ne chargent pas ces ressources devront être recensées séparément. Les contenus et interactions des nouvelles pages sont des prototypes, pas une implémentation applicative. Les 5 écrans de ce tableau sont à revoir un par un avec le fondateur.

## Règles globales / spécifiques — audit du 23 novembre 2026

**GLOBAL — composant « badge catégorie sur photo »** : badge entièrement contenu dans sa photo avec marge intérieure, largeur maximale calculée à partir du conteneur, texte multilingue adaptable sur plusieurs lignes, police stable et lisible ; ne pas chevaucher le statut sponsorisé (dans la zone texte de l'annonce). À appliquer aux cartes de fil, carrousels, détails d'annonces et prévisualisations utilisant le même motif. CSS commun : `revue/buuurt-theme.css` ; correctif de défense locale : `revue/hab-vit-001.html`. Les pages ne chargeant pas la feuille commune doivent être qualifiées avant déclaration de conformité.

**GLOBAL — en-tête commun** : menu cliquable, logo officiel, choix NL/EN/FR, cloche avec compteur cliquable ; ne pas ajouter de cœur global non approuvé. Favoris : cœur au niveau de chaque annonce. Composants communs à factoriser ; éviter de recopier des en-têtes contradictoires.

**SPÉCIFIQUE — HAB-VIT-001** : ordre du fil post-scan, commerce scanné, carrousel des annonces, CTA Suivre. **SPÉCIFIQUE — HAB-FICHE-001** : fiche commerce complète et panneau de notifications par commerce. Les règles globales ne doivent pas modifier les fonctions propres à une page.

**Audit initial par fichier (lecture de code, pas test visuel)** : `hab-vit-001.html` : tag catégorie généré dans `.picture`, correctif appliqué ; `com-pub-apercu-001.html` : badges `merchant-tag` à examiner séparément ; `com-pub-spon-001.html` : badge de carte à examiner séparément ; les autres pages de création/publication sont à examiner selon leurs composants et les futures variantes de contenu. **À vérifier** : 320/375/390/430 px, NL/EN/FR, textes longs, sponsorisé, carrousel et détail, sans chevauchement. Aucune certification visuelle globale à ce stade.

## Règle structurelle validée — cartes d'annonces V2 (23/11/2026)
- **Global, obligatoire sur toutes les futures maquettes** : cartes d'annonces mobiles en disposition verticale, **photo pleine largeur au-dessus**, texte et informations en dessous. Aucun rail photo étroit. Conserver le ratio 16:9 avec `object-fit:cover` (recadrage sans étirement).
- Badge de catégorie en haut à gauche **à l'intérieur de l'image**, sans découpe des mots ; favori individuel en haut à droite ; mention « Gesponsord » dans la zone de texte, séparée de la catégorie. Pagination du carrousel sous la carte, sans contrainte héritée d'une photo latérale.
- Source de règle commune : `revue/buuurt-theme.css`, section **BUUURT CARD LAYOUT V2**. Défense autonome : `revue/hab-vit-001.html`. Les maquettes existantes ayant des structures CSS différentes doivent être qualifiées avant d'affirmer qu'elles héritent du comportement.
- **Spécifique à chaque page** : annonces et ordre, CTA, contenu, filtres, fonctionnalités. Ne pas modifier les exigences métier à cause du changement de disposition.
- **Recette non terminée** : vérifier physiquement 320/360/375/390/430 px, NL/EN/FR, textes longs, badges et carrousel, sur Safari iOS et Chrome Android. Pas de certification globale avant preuve.
