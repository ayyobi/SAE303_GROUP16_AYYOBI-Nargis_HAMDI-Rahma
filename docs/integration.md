# Préparation du récit et des visualisations

Étapes 1 à 8 réalisées : accueil, contexte, définitions, sources, V1 à V4, perspectives 2050, adaptation, conclusion et page `/methode`.
V1 est un histogramme statique rendu au build, documenté dans `temperature-distribution.md`.
V2 est une carte Leaflet rendue chez le lecteur (méthode B), documentée dans `lcz-map.md`.
V3 est une courbe statique rendue au build (méthode A), documentée dans `heat-trends.md`.
V4 utilise la méthode B ; ses trois seuils, calculs et tests sont documentés dans `heat-thresholds.md`.
Les projections et la conclusion sont documentées dans `projections-conclusion.md`.
La page Méthode documente sources, licences, traitements, quatre fiches graphiques, méthodes A/B/C, limites, téléchargements, notebook et usage de l’IA. La finalisation et le déploiement de l’étape 9 restent hors du périmètre réalisé.
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

## Périmètres effectivement intégrés

| Vue | Contenu vérifié | Points à conserver |
| --- | --- | --- |
| V1 | Distribution des températures maximales quotidiennes d’été | Juin à août ; classes de 2 °C ; observations 1959–2022 ; la distribution ne donne pas la chronologie |
| V2 | Carte des zones climatiques locales du Cerema | Types d’espaces, surfaces en km² ou parts du secteur ; carré central de 8 km ; aucune température mesurée par quartier |
| V3 | Moyenne des maximales de chaque été | Juin–août, 92 jours valides ; 1959–2022 ; moyennes des périodes 1961–1990 et 1991–2020 |
| V4 | Journées atteignant ou dépassant 25, 30 ou 35 °C | Année civile complète de 365 ou 366 jours ; 1959–2022 ; moyenne mobile de dix années consécutives |

Les JSON convertis des CSV contiennent aussi des prolongements jusqu’en 2024.
Ils ne doivent pas être présentés comme des séries intégralement homogénéisées.
Les transformations sélectionnent explicitement 1959–2022 et Q_SQR = 1 pour
reproduire le périmètre du notebook. Les valeurs manquantes ne deviennent pas zéro.
Les critères de validité sont documentés dans chaque vue et sur `/methode`.
Les JSON annuels et de distribution préparés sont disponibles dans `src/assets/`.
Les téléchargements dérivés sont produits au build : `/telechargements/distribution.json`, `/telechargements/evolution.json`, `/heat-thresholds.json` et le même asset GeoJSON que la carte. Les CSV bruts ne sont pas redistribués.

## Méthodes A, B et C et fonction autonome

Les définitions sont fournies par le brief de l’étape 3 : A = calcul et rendu au
build ; B = calcul et rendu chez le lecteur ; C = une page générée par valeur.
V1 et V3 utilisent A : leurs SVG Plot sont générés avec JSDOM au build.
V2 et V4 utilisent B : Leaflet ou Plot s’exécutent dans le navigateur.
La méthode C n’est pas utilisée. Les tableaux alternatifs existent dès le build.

Pour le portage autonome depuis Observable, isoler une fonction qui reçoit
ses données et options en paramètres et retourne un élément graphique, sans
`FileAttachment`, `view` ou dépendance implicite à une cellule du notebook.
Le portage remplace les dépendances implicites à Observable par des fonctions
autonomes de rendu et de préparation dans `src/lib/charts/`, des helpers LCZ
dans `src/lib/maps/` et des scripts d’interface dans `src/scripts/`.
Le composant `PlotFigure.astro` existant reste disponible pour le rendu Plot.

La page Méthode indique les licences SQR et LCZ confirmées sur data.gouv.fr
(Licence Ouverte 2.0). Elle marque « À vérifier » la relecture du rapport Climadiag,
sa licence, celle du Plan Climat, la référence exacte de l’archive géographique
et l’accès public actuel au notebook et à GitHub. Le journal détaillé de l’IA
reste dans le notebook. Les couleurs des graphiques sont documentées par vue.

## Vérification avant un futur commit

```sh
git ls-files -- '*.csv' '*Observable*.html' 'data-raw/*'
git status --short
npm run build
node --test
```

Contrôler les nouveaux fichiers avant toute mise en suivi. Aucun commit ou push
n’est automatique. Message prévu après validation :
`feat: add methodology and sources page`.
