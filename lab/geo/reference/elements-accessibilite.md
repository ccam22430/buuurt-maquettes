# GEO-04 — premier contrôle des sources d'accessibilité

Le 27 novembre 2026, deux fenêtres autour des adresses publiques de la recette GEO-03 ont été interrogées avec un plafond de 15 objets par requête. Les six réponses HTTP 200 ont livré des identifiants distincts et des géométries du type attendu. Les URL exactes, les attributs, la présence d'une page suivante et les empreintes des réponses figurent dans [la preuve JSON](elements-accessibilite.json).

| Source officielle | Amsterdam | Graft | Données directement exploitables |
| --- | --- | --- | --- |
| BGT Kadaster, `waterdeel` | 15, suite disponible | 15, suite disponible | Polygones d'eau. Identifiant local, type, état et dates. |
| BGT Kadaster, `overbruggingsdeel` | 10, dernière page | 15, suite disponible | Polygones d'ouvrages. Type, hauteur relative, caractère mobile le cas échéant. |
| NWB Rijkswaterstaat, `wegvakken` | 15, suite disponible | 15, suite disponible | Segments, identifiant, nœuds de début et de fin, nom de voie et sens. |

Les deux référentiels sont publiés via PDOK sous CC0 1.0. BGT est mis à jour quotidiennement. NWB est publié mensuellement et couvre les voies gérées qui disposent d'un nom ou d'un numéro. Les résultats sont des échantillons. Un tracé de pont est un indice géographique. La possibilité de traverser, le mode autorisé et le temps de trajet nécessitent un réseau raccordé et des données de mobilité qualifiées. Les horaires de transport public restent à qualifier.

Pour les futures recommandations, conserver `source`, `date`, `code du territoire` et l'identifiant d'objet. La sélection du prototype GEO-03 continue d'utiliser la frontière CBS et les conditions existantes du laboratoire. Les données d'accessibilité peuvent étayer une justification ultérieure, après contrôle par les zones actives et les exceptions approuvées. Aucune règle de durée, d'extension ou de tarification n'est introduite.

- [BGT Kadaster via PDOK](https://api.pdok.nl/kadaster/bgt/ogc/v1?f=html&lang=nl)
- [NWB Rijkswaterstaat via PDOK](https://api.pdok.nl/rws/nationaal-wegenbestand-wegen/ogc/v1?f=html&lang=nl)
- [NDOV Loket, données de transport à qualifier](https://data.ndovloket.nl/)
