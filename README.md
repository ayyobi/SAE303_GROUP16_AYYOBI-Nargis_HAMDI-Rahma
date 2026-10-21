# Besançon sous la chaleur

Nous sommes Nargis Ayyobi et Rahma Hamdi, étudiantes en BUT MMI2. Nous avons réalisé ce site pour la SAE 303, à partir de notre travail sur Observable.

- URL site WEB : [Besançon sous la chaleur](https://spiffy-frangollo-70ef1e.netlify.app/)
- URL Notebook Observable : [SAE 303 — Gr 16](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16)
- Nom : **AYYOBI**
- Prénom : **Nargis**
- Nom binome : **HAMDI**
- Prénom binome : **Rahma**

Notre question de départ est la suivante : **comment les fortes chaleurs ont-elles évolué à Besançon, et comment l’analyse des espaces urbains peut-elle aider la ville à s’adapter ?**

Pour y répondre, nous avons croisé les relevés de Météo-France, la carte des espaces urbains du Cerema et les projections de Climadiag pour 2050. Le site commence par quelques définitions, puis laisse le lecteur explorer les données avant de revenir sur les possibilités d’adaptation.

Le [code du projet est sur GitHub](https://github.com/ayyobi/SAE303_GROUP16_AYYOBI-Nargis_HAMDI-Rahma). Le site en ligne a été vérifié le 21 octobre 2026.

## Lancer le projet

Il faut Node.js **22.22.0 ou une version plus récente** et npm.

```sh
npm ci
npm run dev
```

Le terminal indique l’adresse locale, généralement `http://localhost:4321`. La page Méthode se trouve à `/methode`.

Pour consulter la version compilée :

```sh
npm run build
npm run preview
```

Le résultat est créé dans `dist/`, puis servi sur `http://127.0.0.1:4322`. Nous utilisons une prévisualisation statique, car l’adaptateur Netlify installé ne prend pas en charge `astro preview`. Cette commande ne publie rien en ligne.

## Remarques

Nous avons voulu que le lecteur puisse regarder les données à son rythme, sur ordinateur comme sur téléphone.

- **La navigation** suit les parties du récit. Sur mobile, le menu s’ouvre progressivement avec des liens qui apparaissent en cascade. Il se ferme avec Échap ou en touchant l’extérieur, et respecte le réglage de réduction des animations. Le lien « Aller au contenu » permet de passer directement à la page. Voir le [menu](src/components/Header.astro) et le [layout](src/layouts/Layout.astro).
- **La carte LCZ** permet de filtrer les espaces, de choisir une classe, de zoomer et de revenir au cadrage de départ. Nous utilisons Lambert-93 pour garder le carré du secteur droit. Voir le [script de la carte](src/scripts/lcz-map.js) et la [projection](src/lib/maps/lambert93.js).
- **L’explorateur de seuils** laisse choisir 25, 30 ou 35 °C. Le graphique, les résultats et le tableau changent ensemble, sans recharger la page. Voir les [interactions](src/scripts/heat-threshold-explorer.js) et les [calculs](src/lib/charts/heatThresholds.js).
- **Sur mobile**, les colonnes passent les unes sous les autres et les graphiques adaptent leurs graduations. Nous avons gardé Open Sans, des textes sans italique et une présentation simple, dans des tons chauds. Voir les [styles](src/styles/global.css).
- **Pour l’accessibilité**, nous avons prévu le clavier, un focus visible, des descriptions et des tableaux dépliables. Les tableaux restent lisibles sans JavaScript. Les animations respectent la préférence de réduction des mouvements. Voir les [composants des graphiques](src/components/charts/).
- **La page Méthode** explique nos sources, nos calculs et nos limites. Elle donne aussi accès aux données nettoyées. Voir son [code](src/pages/methode.astro).

## Nos choix techniques

Nous avons utilisé Astro, Tailwind CSS, Observable Plot, JSDOM, Leaflet et proj4.

| Vue | Ce qu’elle montre | Méthode choisie |
| --- | --- | --- |
| V1 | La répartition des maximales d’été, par classes de 2 °C | A : SVG Plot créé au build avec JSDOM |
| V2 | Les types d’espaces LCZ | B : carte Leaflet dans le navigateur |
| V3 | La moyenne des maximales de chaque été | A : SVG Plot créé au build avec JSDOM |
| V4 | Le nombre annuel de journées ≥ 25, 30 ou 35 °C | B : Plot mis à jour selon le seuil |

Nous avons choisi A pour les vues fixes et B pour celles qui demandent une interaction. La méthode C, qui génère une page par valeur, n’est pas utilisée. Les fonctions de [rendu des graphiques](src/lib/charts/) reçoivent leurs données en argument, sans dépendre des cellules Observable.

Le fichier [netlify.toml](netlify.toml) indique la racine du dépôt comme dossier de base, `npm run build` comme commande et `dist` comme dossier à publier. Il fixe Node.js à 22.22.0. Lors du premier déploiement, Netlify servait les sources au lieu du site compilé ; ce réglage a corrigé la 404. Pour un dépôt manuel, il faut donc compiler le projet puis envoyer uniquement `dist`.

## Les données que nous utilisons

**Météo-France.** Nos calculs historiques viennent des [Séries Quotidiennes de Référence](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference), station de Besançon 25056001, fichier `SQR_MTX325056001.csv`. Nous gardons 1959–2022, les valeurs valides et la qualité `Q_SQR = 1`. V1 et V3 portent sur juin, juillet et août ; V4 compte toute l’année. Les prolongements 2023–2024 sont exclus. Les séries mensuelles SH_MTX et SH_MTN ont servi à l’exploration du notebook, mais pas à ces trois vues. La fiche officielle indique la Licence Ouverte 2.0.

**Cerema.** La [carte LCZ SPOT 2022](https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d) décrit un carré central de 8 × 8 km, regroupé en 14 classes. Elle nous aide à lire les espaces urbains, sans donner la température de chaque quartier. La Licence Ouverte 2.0 est indiquée sur la fiche.

**Climadiag Commune.** Nous reprenons deux indicateurs du [service de Météo-France](https://meteofrance.com/climadiag-commune) pour 2050 : les nuits dont la température ne descend pas sous 20 °C et les jours dont la maximale dépasse 35 °C. La référence est 1976–2005. Les huit valeurs, arrondies à l’unité, ont été recoupées avec l’application officielle le 21 octobre 2026. Le seuil strict des jours Climadiag diffère du seuil inclusif de V4.

**Grand Besançon Métropole.** Le [Plan Climat 2024–2029](https://www.grandbesancon.fr/wp-content/uploads/sites/2/2025/03/PCAET-Mars-2025.pdf#page=19), document de mars 2025, apporte le contexte de l’adaptation. Nous citons les actions 10 et 11, pages 36–37.

Les données du site se trouvent dans `src/assets/`. Nous ne publions pas les CSV bruts. Les conversions JSON complètes contiennent aussi des années hors de notre étude ; les téléchargements du site sont, eux, préfiltrés. Une valeur manquante ne devient jamais zéro. Nous demandons 92 jours par été pour V3 et 365 ou 366 jours par année pour V4. Les moyennes sont conservées à quatre décimales et affichées à deux.

## Télécharger et reprendre les données

La page [Méthode](https://spiffy-frangollo-70ef1e.netlify.app/methode#donnees) propose quatre fichiers :

| Fichier | Contenu |
| --- | --- |
| `/telechargements/distribution.json` | Les 17 classes estivales et leurs métadonnées |
| `/telechargements/evolution.json` | Les 64 moyennes estivales et leur couverture |
| `/heat-thresholds.json` | Les 64 comptages annuels pour les trois seuils |
| GeoJSON proposé sur la page | Les 14 classes LCZ du secteur central en 2022 |

Pour les réutiliser, il faut citer Météo-France ou le Cerema, la source, la période et notre traitement : « SAE 303 — Nargis Ayyobi et Rahma Hamdi ». Les jeux SQR et LCZ sont sous [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

## Ce que nous avons vérifié

```sh
npm run build
npm test
npm run audit:build
npm run audit:browser
```

Les 17 tests vérifient les calculs et les données. L’audit navigateur teste notamment la carte, les seuils, le clavier et six largeurs d’écran. Il ouvre son propre Chrome et ferme sa prévisualisation à la fin. Si besoin, `CHROME_PATH` permet de choisir le navigateur ; `AXE_PATH` ajoute l’analyse axe à partir d’un fichier local `axe.min.js`. Sans ce fichier, le rapport précise que cette analyse n’a pas été lancée.

Les captures et rapports détaillés sont gardés dans `artifacts/audit/`, hors du suivi Git. Le [compte rendu](docs/audit-final.md) rassemble les résultats, les mesures Lighthouse datées et les points à compléter.

## Les limites de notre travail

Nous avons séparé les observations, la carte des espaces et les projections. Une station ne représente pas tous les quartiers ; une classe LCZ n’est pas une mesure de chaleur ; une journée au-dessus d’un seuil ne suffit pas à définir une canicule. Nos pistes d’adaptation ne sont pas des effets mesurés.

Nous avons aussi utilisé l’IA pour nous aider avec le code, certaines transformations et la lisibilité. Le notebook garde le journal détaillé de cette aide. L’export local consulté ne porte pas le suffixe `(1)` demandé dans le brief : nous devons encore confirmer qu’il correspond bien à la version remise.
