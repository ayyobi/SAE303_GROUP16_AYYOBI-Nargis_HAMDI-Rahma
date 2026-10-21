# V3 — Comment les étés ont-ils évolué ?

La distribution nous donne une vue d’ensemble des températures. Pour voir ce qui change au fil du temps, nous avons ensuite calculé la moyenne des maximales de chaque été. Chaque point de cette courbe correspond donc à un été complet.

## Notre fiche en six points

1. **Question :** comment les températures maximales moyennes d’été ont-elles évolué à Besançon ?
2. **Famille :** une courbe chronologique, comme dans la fonction `graphiqueEvolutionEte` du notebook.
3. **Encodage :** les années sont à l’horizontale et les moyennes à la verticale. La ligne relie les étés. Le maximum est marqué par un point plus grand et une annotation, pour le repérer sans dépendre de la couleur.
4. **Unité et dénominateur :** des °C. Pour un été, nous additionnons les maximales de ses 92 journées de juin à août, puis divisons par 92. Chaque moyenne de période porte ensuite sur 30 étés.
5. **Titre et sous-titre :** « Les maximales moyennes d’été ont augmenté de 1,69 °C entre deux périodes de 30 ans » ; « Besançon · 1959–2022 · moyenne des maximales quotidiennes de juin à août ». Les résultats sont calculés au build.
6. **Alternative textuelle :** le texte compare les deux périodes et indique le maximum de la série. Un tableau donne les 64 moyennes estivales et leur couverture. Les SVG ont un titre et une description.

## Les données et nos calculs

Nous utilisons `SQR_MTX325056001.csv`, pour la station de Besançon 25056001, dans les [SQR de Météo-France](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference). Les séries mensuelles SH_MTX et SH_MTN ne servent pas à ce calcul.

Comme pour V1, nous gardons la qualité `Q_SQR = 1`, les valeurs numériques finies, les dates valides et uniques, entre 1959 et 2022. Les prolongements 2023–2024 sont exclus et les valeurs absentes ne deviennent pas zéro.

Nous sélectionnons juin, juillet et août, puis regroupons les journées par année. Un été doit compter exactement 92 observations. Le jeu utilisé contient 64 étés complets, soit 5 888 journées ; aucun été n’a été écarté. Une éventuelle absence en hiver n’exclurait pas un été complet de V3.

Les moyennes sont déjà dans `src/assets/chaleur_annuelle.json`, à quatre décimales. Nous gardons cette précision pour les calculs et affichons deux décimales. Le script `verify-heat-trends.mjs` refait les calculs depuis le CSV et les compare au JSON, ainsi qu’aux résultats obtenus avant arrondi. Les contrôles et l’empreinte du CSV sont dans `heat-trends.metadata.json`.

Nous avons également repris le code de V3 depuis l’export local du [notebook Observable](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16). Les 64 moyennes concordent avant arrondi. La version du fichier avec `(1)` reste à retrouver.

## Les résultats que nous affichons

| Repère | Valeur |
| --- | --- |
| Moyenne des 30 étés 1961–1990 | 23,27 °C |
| Moyenne des 30 étés 1991–2020 | 24,96 °C |
| Différence entre ces périodes | +1,69 °C |
| Maximum annuel de la série | 2003, avec 29,47 °C |

Nous calculons l’écart avant d’arrondir l’affichage. Le maximum de 2003 est une moyenne estivale des maximales : ce n’est pas la température record d’une journée.

## Notre choix de rendu

Nous avons choisi la méthode A, car cette vue est fixe. Astro et JSDOM créent les SVG avec Plot pendant la compilation. Le lecteur n’a pas besoin de charger Plot ni les observations quotidiennes pour voir la courbe.

`createHeatTrends(data, options)` reçoit sa série et son document DOM en argument. Elle trie une copie des données. Nous gardons la courbe, les points et l’annotation du notebook, sans ajouter de régression ou de moyenne mobile.

La courbe utilise `#B45B36` et son maximum `#842F32`. Leurs contrastes sur le fond du graphique sont respectivement 4,37:1 et 8,06:1. Deux variantes du même SVG adaptent les graduations aux écrans ; une seule est affichée à la fois. Le graphique conserve les 64 points annuels, plus le repère du maximum.

L’axe vertical va de 20 à 31 °C. Nous avons choisi cette échelle pour lire les variations et précisé qu’elle ne part pas de zéro. Sur mobile, il y a moins d’années écrites sur l’axe, mais aucune année n’est retirée de la courbe.

## Ce que cette courbe ne montre pas

Il s’agit de la moyenne des maximales quotidiennes, pas de la température moyenne de toute la journée. La courbe ne compte pas les dépassements d’un seuil et ne décrit pas chaque quartier. Les différences entre périodes restent descriptives : nous ne présentons ni test de significativité ni explication des causes à partir de ce seul graphique.

Le tableau dépliable permet de lire les valeurs sans survol ni JavaScript. Chaque SVG possède un rôle d’image et ses propres identifiants. Le titre, les unités, la source et les explications restent visibles autour de la figure.

## Refaire les contrôles

```sh
node scripts/verify-heat-trends.mjs /chemin/vers/SQR_MTX325056001.csv
node --test tests/heat-trends.test.mjs
npm run build
npm run audit:browser
```

L’audit navigateur vérifie aussi le tableau, le clavier et la lisibilité sur les six largeurs de l’audit final.
