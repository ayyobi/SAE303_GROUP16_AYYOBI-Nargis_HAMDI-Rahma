# Préparation du récit et des visualisations

Étapes 1 à 5 réalisées : accueil, contexte, définitions, sources, distribution V1, carte LCZ V2 et courbe historique V3.
V1 est un histogramme statique rendu au build, documenté dans `temperature-distribution.md`.
V2 est une carte Leaflet rendue chez le lecteur (méthode B), documentée dans `lcz-map.md`.
V3 est une courbe statique rendue au build (méthode A), documentée dans `heat-trends.md`.
L’explorateur V4 reste à réaliser.
La configuration Astro, Tailwind, Observable Plot et Netlify est conservée.
Le graphique initial reste archivé dans `src/components/LegacyPlotExample.astro`,
sans être importé dans la page publique.

## Sources vérifiées

- Notebook local consulté : `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`, dans les téléchargements. La version demandée avec `(1)` est absente.
- Référence publique : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16
- Trois CSV Météo-France consultés hors du dépôt : `SH_MTN325056001.csv`, `SH_MTX325056001.csv`, `SQR_MTX325056001.csv`.
- GeoJSON du projet : extrait Cerema simplifié et regroupé pour un carré central de 8 km de côté ; il s’agit d’un export préparé, pas de l’intégralité des données sources du défi. Il ne correspond pas à la limite communale.
- JSON Climadiag : référence 1976–2005, horizon 2050, observations et projections distinctes.

Les sources originales restent hors du dépôt, ou dans `data-raw/`, ignoré.
Les CSV et exports HTML Observable sont également ignorés. L’inventaire Git ne
contient aucun CSV ni notebook HTML. Le GeoJSON préparé figurait déjà dans le
suivi Git sous `public/data/` avant son déplacement autorisé vers `src/assets/`.
Ne pas supprimer les données ou réécrire l’historique sans décision explicite.

## Problématique à conserver

Comment les fortes chaleurs ont-elles évolué à Besançon, et comment l'analyse des espaces urbains peut-elle aider la ville à s'adapter ?

## Quatre temps narratifs

1. **Contexte** : comprendre pourquoi étudier les fortes chaleurs à Besançon. L’accueil présente les trois axes pédagogiques, sans publier de résultats.
2. **Exploration** : observer la distribution estivale (V1) et les espaces urbains (V2).
3. **Révélation** : suivre l’évolution historique (V3) et explorer les journées à seuil (V4).
4. **Conclusion** : synthèse fondée sur les résultats vérifiés, limites et perspectives d’adaptation ; distinguer Climadiag des observations historiques.

## Contrats à préserver pour l’intégration future

| Vue | Contenu vérifié | Points à conserver |
| --- | --- | --- |
| V1 | Distribution des températures maximales quotidiennes d’été | Juin à août ; classes de 2 °C ; observations 1959–2022 ; la distribution ne donne pas la chronologie |
| V2 | Carte des zones climatiques locales du Cerema | Types d’espaces, surfaces en km² ou parts du secteur ; carré central de 8 km ; aucune température mesurée par quartier |
| V3 | Évolution des fortes chaleurs | Reprendre les calculs, unités, périodes et références exacts du notebook lors de son intégration |
| V4 | Journées atteignant ou dépassant un seuil | Comptage annuel, pas uniquement estival ; reprendre exactement seuils, filtres et traitement des années incomplètes du notebook |

Les JSON convertis des CSV contiennent aussi des prolongements jusqu’en 2024.
Ils ne doivent pas être présentés comme des séries intégralement homogénéisées.
Les futures transformations sélectionneront explicitement 1959–2022 pour
reproduire le périmètre du notebook, avec contrôle des indicateurs de qualité.
Documenter les données manquantes et les critères de validité avant publication.
Les JSON annuels et de distribution préparés sont disponibles dans `src/assets/`.
Cette étape ne modifie aucun fichier de données.

## Méthodes A, B et C et fonction autonome

Les définitions sont fournies par le brief de l’étape 3 : A = calcul et rendu au
build ; B = calcul et rendu chez le lecteur ; C = une page générée par valeur.
V1 utilise A : sa distribution est fixe et rendue en SVG statique dans Astro.
Pour chaque méthode, documenter les dépendances, le chargement des JSON,
l’accessibilité, le responsive et les limites.

Pour le portage autonome depuis Observable, isoler une fonction qui reçoit
ses données et options en paramètres et retourne un élément graphique, sans
`FileAttachment`, `view` ou dépendance implicite à une cellule du notebook.
La fonction `graphiqueCarteLCZ(donnees, mode)` existe dans le notebook et
constitue une candidate à examiner ; aucune carte n’est développée ici.
Le composant `PlotFigure.astro` existant reste disponible pour le rendu Plot.

La future page Méthode décrira la provenance, les transformations, les filtres,
les fonctions portées et les limites. Elle n’est pas créée vide à cette étape.
La palette des graphiques reste à définir : elle sera distincte de la palette
éditoriale et vérifiée pour le contraste et la distinction des séries.

## Vérification avant un futur commit

```sh
git ls-files -- '*.csv' '*Observable*.html' 'data-raw/*'
git status --short
npm run build
```

Contrôler les nouveaux fichiers avant toute mise en suivi. Aucun commit ou push
n’est automatique. Message prévu après validation :
`feat: create climate website homepage`.
