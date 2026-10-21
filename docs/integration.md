# Comment nous avons construit le site

Nous sommes parties du notebook Observable pour créer un récit que l’on puisse suivre sans connaître les outils d’analyse. Le site garde notre question de départ : **comment les fortes chaleurs ont-elles évolué à Besançon, et comment l’analyse des espaces urbains peut-elle aider la ville à s’adapter ?**

## Le parcours de lecture

Nous commençons par le contexte et les définitions. Le lecteur découvre ensuite les températures d’été avec V1, puis les espaces urbains avec V2. V3 replace les observations dans le temps et V4 permet de changer le seuil de chaleur. Nous terminons par les projections 2050, les pistes d’adaptation et les limites de notre travail.

La page `/methode` rassemble les sources, les traitements, les quatre fiches de visualisation, les téléchargements et notre utilisation de l’IA. Le site publié sur [Netlify](https://spiffy-frangollo-70ef1e.netlify.app/) a été contrôlé le 21 octobre 2026.

## Les quatre vues

| Vue | Notre choix | À garder en tête | Détail |
| --- | --- | --- | --- |
| V1 | Histogramme des maximales estivales | Juin–août, 1959–2022, classes de 2 °C ; aucune chronologie | [Distribution](temperature-distribution.md) |
| V2 | Carte des espaces LCZ | Carré central de 8 km de côté ; surfaces, pas températures | [Carte](lcz-map.md) |
| V3 | Courbe des maximales moyennes d’été | 92 jours par été ; comparaison de deux périodes de 30 ans | [Évolution](heat-trends.md) |
| V4 | Comptages annuels selon le seuil choisi | Années civiles complètes ; moyenne mobile sur dix ans | [Seuils](heat-thresholds.md) |

Nous utilisons la méthode A pour V1 et V3 : Astro crée les SVG avec Observable Plot et JSDOM pendant la compilation. Pour V2 et V4, nous avons choisi B : les interactions sont gérées dans le navigateur. La méthode C, une page générée par valeur, ne nous était pas utile ici.

Nous avons sorti les calculs et les rendus des cellules Observable. Les fonctions de `src/lib/charts/` reçoivent leurs données et leurs options en argument. Les fonctions de carte sont dans `src/lib/maps/` et les interactions dans `src/scripts/`. L’ancien exemple avec les manchots reste archivé dans `LegacyPlotExample.astro` ; il n’apparaît pas sur le site.

## Notre périmètre de données

Les trois CSV Météo-France ont été consultés hors du dépôt : `SH_MTN325056001.csv`, `SH_MTX325056001.csv` et `SQR_MTX325056001.csv`. Les graphiques quotidiens utilisent seulement le dernier, pour la station 25056001, entre 1959 et 2022, avec la qualité 1. Les valeurs absentes ne sont pas remplacées par zéro. Les données 2023–2024 restent dans les conversions complètes, mais sont exclues des vues.

Le GeoJSON est un extrait déjà préparé du Cerema. Il regroupe 1 961 polygones sources en 14 classes. Nous le conservons dans `src/assets/`, avec les autres données, sans nouvelle simplification. Les coordonnées exportées sont en EPSG:4326 ; la carte les affiche en Lambert-93 pour garder le carré droit. L’extrait ne suit pas la limite de la commune.

Pour Climadiag, nous gardons la référence 1976–2005 et l’horizon 2050. Les huit valeurs arrondies ont été vérifiées avec l’application officielle. Les définitions sont minimum ≥ 20 °C pour les nuits et maximum > 35 °C pour les jours, ce qui diffère du comptage inclusif de V4. Les détails sont dans [notre note sur les projections](projections-conclusion.md).

## Les fichiers que le lecteur peut récupérer

Astro prépare trois réponses JSON : `/telechargements/distribution.json`, `/telechargements/evolution.json` et `/heat-thresholds.json`. Le téléchargement géographique utilise le même GeoJSON que la carte. Nous évitons ainsi d’entretenir plusieurs copies des mêmes données.

Les CSV et les exports HTML Observable restent hors du suivi Git. Les jeux SQR et LCZ sont sous Licence Ouverte 2.0. Le GeoJSON dérivé faisait déjà partie du projet avant son déplacement vers `src/assets/`.

## Ce qui reste à confirmer

Notre export local s’appelle `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`. Nous n’avons pas retrouvé la version avec `(1)`. Le [lien du notebook](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16) correspond à cet export, mais sa lecture automatisée renvoie une erreur 429. Il reste à l’ouvrir dans un navigateur utilisateur.

La licence et le PDF Climadiag original, la licence du Plan Climat, ainsi que l’archive et la préparation géographique amont restent à vérifier. Le journal détaillé de l’IA est conservé dans le notebook.

## Refaire nos contrôles

```sh
npm run build
npm test
npm run audit:build
npm run audit:browser
git ls-files -- '*.csv' '*Observable*.html' 'data-raw/*'
git status --short
```

Le [rapport d’audit](audit-final.md) donne le détail des tests et des corrections. Le [contrôle en ligne](audits/production-check.json) garde les résultats du déploiement. Nous conservons aussi l’optimisation Vite de Leaflet, proj4 et Plot : elle évite les erreurs d’import tardif pendant le développement.
