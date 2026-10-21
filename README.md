# Besançon sous la chaleur

SAE 303 — BUT MMI2.

- URL site WEB : **À renseigner après déploiement sur Netlify.**
- URL Notebook Observable : [SAE 303 — Gr 16](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16).
- Nom : **AYYOBI**
- Prénom : **Nargis**
- Nom binome : **HAMDI**
- Prénom binome : **Rahma**

**Problématique :** Comment les fortes chaleurs ont-elles évolué à Besançon, et comment l’analyse des espaces urbains peut-elle aider la ville à s’adapter ?

Le lien du notebook provient de l’export HTML local ; son accessibilité publique et sa version actuelle restent à vérifier. Aucune URL de déploiement n’est actuellement documentée.

[Dépôt GitHub](https://github.com/ayyobi/SAE303_GROUP16_AYYOBI-Nargis_HAMDI-Rahma) : URL du remote `origin`.

## Installer et lancer

Node.js **22.22.0 ou supérieur**, compatible avec la version d’Astro installée, et npm.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse indiquée dans le terminal, habituellement `http://localhost:4321`. La documentation est accessible à `/methode` depuis le menu et le footer.

```sh
npm run build
npm run preview
node --test
```

Le build produit le site et ses téléchargements dans `dist/`. L’adaptateur Netlify est configuré ; ces commandes ne publient pas le site.

## Technologies et intégration

Astro, Tailwind CSS, JavaScript, Observable Plot, JSDOM, Leaflet et proj4. Typographie : Open Sans, sans texte en italique.

| Vue | Indicateur | Intégration réelle |
| --- | --- | --- |
| V1 | Distribution des maximales estivales, classes de 2 °C | **A** : SVG Plot au build avec JSDOM |
| V2 | Carte catégorielle des espaces LCZ | **B** : Leaflet et filtres dans le navigateur |
| V3 | Moyenne des maximales de chaque été | **A** : SVG Plot au build avec JSDOM |
| V4 | Journées annuelles ≥ 25, 30 ou 35 °C | **B** : Plot actualisé selon le seuil dans le navigateur |

A signifie génération au build ; B, génération ou mise à jour chez le lecteur. **C**, une page statique par valeur, n’est pas utilisée. Les fonctions de rendu acceptent explicitement données et options ; voir `src/lib/charts/`. Les filtres et résumés LCZ sont dans `src/lib/maps/`.

## Remarques

Notre site associe un récit sur les fortes chaleurs à Besançon à quatre visualisations complémentaires. Nous avons porté les graphiques du notebook Observable dans Astro et ajouté les interactions suivantes :

- **Navigation dans le récit :** le menu donne accès aux sections de l’enquête et à la page Méthode. Sur mobile, un bouton ouvre et ferme le menu ; la touche Échap le ferme et replace le focus sur le bouton. Un lien d’évitement permet d’atteindre directement le contenu. Voir le [menu](src/components/Header.astro) et le [layout commun](src/layouts/Layout.astro).
- **Carte interactive :** Leaflet permet de déplacer la carte, de zoomer et de filtrer les espaces par famille ou par classe LCZ. La sélection d’une zone affiche les informations de sa classe. Des commandes réinitialisent les filtres et le cadrage ; la projection Lambert-93 conserve le carré du secteur droit. Voir le [script de la carte](src/scripts/lcz-map.js) et la [projection](src/lib/maps/lambert93.js).
- **Exploration des seuils :** le lecteur choisit 25, 30 ou 35 °C avec des boutons radio. Le graphique, le texte de synthèse et le tableau annuel se mettent à jour sans rechargement de la page. Une moyenne mobile sur dix ans complète les barres annuelles. Voir les [interactions](src/scripts/heat-threshold-explorer.js) et les [calculs par seuil](src/lib/charts/heatThresholds.js).
- **Affichage responsive :** les colonnes se réorganisent sur les petits écrans. Les graphiques statiques disposent de variantes pour mobile et ordinateur ; le graphique interactif adapte son rendu à la largeur disponible. Voir les [styles du site](src/styles/global.css), la [distribution estivale](src/components/charts/TemperatureDistribution.astro) et le [rendu interactif](src/lib/charts/heatThresholdPlot.js).
- **Accessibilité :** les liens et commandes ont un focus visible. Le menu, les filtres et les seuils sont utilisables au clavier. Les graphiques sont accompagnés de descriptions et de tableaux dépliables ; ces tableaux sont présents dès la construction du site et restent consultables sans JavaScript. La préférence de réduction des animations est respectée. Voir les [styles communs](src/styles/global.css) et le [composant de l’explorateur](src/components/charts/HeatThresholdExplorer.astro).
- **Rendu et chargement :** la distribution et la courbe historique sont générées en SVG à la compilation avec Observable Plot et JSDOM. La carte et l’explorateur sont initialisés dans le navigateur à l’approche de leur section. Voir le [rendu de la courbe historique](src/components/charts/HeatTrends.astro) et les scripts de la [carte](src/scripts/lcz-map.js) et des [seuils](src/scripts/heat-threshold-explorer.js).
- **Transparence des données :** la page Méthode présente les sources, les traitements, les limites et quatre téléchargements de données nettoyées. Voir la [page Méthode](src/pages/methode.astro).

## Sources et traitements

- **Météo-France**, [Données changement climatique - SQR (Séries Quotidiennes de Référence)](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference), station 25056001, fichier `SQR_MTX325056001.csv`. Licence Ouverte 2.0 confirmée sur la fiche officielle. V1, V3 et V4 : 1959–2022, valeurs numériques valides, dates uniques et `Q_SQR = 1`. V1 et V3 utilisent juin–août ; V4 l’année civile entière. Les prolongements 2023–2024 sont exclus. Les CSV mensuels SH_MTX et SH_MTN appartiennent à l’exploration du notebook, pas aux calculs des trois vues quotidiennes.
- **Cerema**, [Cartographie des Zones Climatiques Locales des 93 territoires de plus de 50 000 habitants](https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d), LCZ SPOT 2022. Licence Ouverte 2.0 confirmée sur la fiche officielle. Extrait central de 8 × 8 km, regroupé en 14 classes, géométries simplifiées. Référence de l’archive amont et algorithme de préparation exact : **À vérifier**. Cette carte ne mesure pas des températures par quartier.
- **Météo-France, [Climadiag Commune](https://meteofrance.com/climadiag-commune)** : Besançon, référence 1976–2005, horizon TRACC 2050. Deux indicateurs du notebook : nuits chaudes et journées très chaudes, avec médiane et fourchette. Les valeurs concordent entre notebook et JSON local ; relecture directe du rapport original et licence : **À vérifier**.
- **Grand Besançon Métropole**, [Plan Climat Air Énergie Territorial 2024–2029, mars 2025](https://www.grandbesancon.fr/wp-content/uploads/sites/2/2025/03/PCAET-Mars-2025.pdf#page=19), actions 10–11, pages imprimées 36–37. Contexte pour l’adaptation ; licence du document **À vérifier**.

Les fichiers du site sont dans **`src/assets/`**, sans dossiers `src/data` ou `public/data`. Les CSV bruts ne sont pas publiés ; `.gitignore` exclut les CSV, `data-raw/` et les exports HTML Observable. Les JSON de conversion contiennent davantage d’années que le périmètre des graphiques : ne pas les confondre avec les exports nettoyés.

Les contrôles reproductibles sont dans `scripts/prepare-temperature-distribution.mjs`, `scripts/verify-heat-trends.mjs` et `scripts/verify-heat-thresholds.mjs`. Ils reçoivent le chemin du CSV source en argument. Les valeurs manquantes ne deviennent pas zéro ; V3 exige 92 journées d’été et V4 365 ou 366 journées annuelles. Les moyennes du JSON ont quatre décimales, l’affichage deux. Les détails et limites figurent sur `/methode` et dans les [documents techniques](docs/integration.md).

## Données téléchargeables

La page `/methode#donnees` propose quatre liens réels, produits à la compilation :

| Export | Route | Contenu |
| --- | --- | --- |
| Distribution estivale | `/telechargements/distribution.json` | 17 classes et métadonnées, 1959–2022 |
| Évolution estivale | `/telechargements/evolution.json` | 64 moyennes et couvertures, 1959–2022 |
| Comptages annuels | `/heat-thresholds.json` | 64 années et trois seuils, 1959–2022 |
| Extrait LCZ | Lien d’asset généré par Astro sur la page Méthode | GeoJSON 2022 des 14 classes |

Ces exports dérivés citent Météo-France ou Cerema, sous [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/). Mentionner le producteur, la source, la période et le traitement SAE 303 — Nargis Ayyobi et Rahma Hamdi lors d’une réutilisation.

## Transparence et limites

Les observations d’une station, les types d’espaces LCZ et les projections sont distingués dans le récit. Les périodes de référence diffèrent ; un seuil journalier n’est pas une définition de canicule. Le projet ne mesure ni effet sanitaire, ni causalité urbaine, ni efficacité chiffrée des adaptations proposées.

Le notebook conserve le journal détaillé d’utilisation de l’IA : aide au code, à la préparation des données, aux corrections et à la lisibilité. La page Méthode en donne un résumé et signale les vérifications restant ouvertes. L’export local consulté ne porte pas le suffixe `(1)` demandé dans le brief ; la correspondance avec cette version reste à vérifier.

L’étape 8 ajoute la documentation et les téléchargements. Aucun déploiement ni commit automatique n’est effectué.
