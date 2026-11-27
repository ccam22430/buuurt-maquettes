# Contrat de recette GEO-04 et GEO-05

- Mesurer à vol d'oiseau et calculer les itinéraires marche et vélo sur le même instantané OSM, avec version et empreinte vérifiables. Contrôler l'accrochage aux voies, la cohérence des métriques et les erreurs. Comparer des cas avec et sans détour à Amsterdam et Graft. Une cause de détour documentée exige une intersection avec l'obstacle cartographié ou un élément de franchissement identifiable.
- Une recommandation doit porter un code CBS vérifié, des mesures et leur provenance. Refuser par défaut une zone sans autorisation active, une exception révoquée, une mesure absente ou un résultat ambigu. La présence dans les candidats ne donne jamais une autorisation de diffusion.
- Exécuter 18 scénarios à partir de destinations géocodées publiquement. Évaluer stabilité, contrôles des rejets et sensibilité des hypothèses marche/vélo. La pertinence commerciale et les seuils nécessitent une validation distincte si les preuves techniques ne suffisent pas.
- Conserver des cas d'erreur reproductibles, des résultats structurés et des preuves versionnées. L'intégration GEO-06 dépend de la qualification GEO-05. GEO-07 dépend de l'intégration.
