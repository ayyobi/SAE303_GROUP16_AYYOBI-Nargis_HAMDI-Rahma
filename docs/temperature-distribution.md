# V1 — Comment se répartissent les températures d’été ?

Avec ce premier graphique, nous voulions voir quelles maximales reviennent le plus souvent pendant les étés étudiés. L’histogramme rassemble les journées par classes de 2 °C. Il donne une vue d’ensemble, avant de regarder l’évolution dans le temps avec V3.

## D’où viennent les données ?

Nous utilisons les [Séries Quotidiennes de Référence de Météo-France](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference), station de Besançon 25056001, fichier `SQR_MTX325056001.csv`. Les séries mensuelles SH_MTX et SH_MTN ne servent pas à ce graphique.

La fonction `graphiqueDistribution(donnees)` du [notebook](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16) a été comparée aux classes du fichier `src/assets/distribution_ete.json`. Les 17 classes correspondent exactement. Nous avons donc repris ce fichier, sans créer une deuxième version. L’export local consulté ne porte pas le suffixe `(1)` ; cette version reste à retrouver.

## Notre préparation

Nous lisons le CSV avec son séparateur `;`, en ignorant les lignes de commentaires. Nous gardons les dates valides et uniques, les températures numériques finies et la qualité `Q_SQR = 1`. Une valeur manquante reste absente : elle ne devient jamais zéro.

Nous retenons 1959–2022 et excluons les prolongements 2023–2024. Le contrôle des années donne 64 années complètes et 23 376 observations quotidiennes valides. Nous sélectionnons ensuite juin, juillet et août : 92 journées par été, soit **5 888 journées**.

Chaque classe inclut sa borne basse et exclut sa borne haute. Le minimum est arrondi vers le bas au multiple de 2 ; le maximum est arrondi de la même façon, puis augmenté de 2. Chaque journée est comptée une seule fois. Nous affichons des nombres de journées, sans pourcentage ni pondération par la population.

Le notebook sélectionne directement les journées, alors que sa fiche mentionne des années complètes. Nous avons vérifié ce point : les 64 années le sont bien, donc le contrôle ne change pas les données. Le script bloque l’export si ce n’est plus le cas.

## Ce que nous retrouvons

| Repère | Résultat |
| --- | --- |
| Classes représentées | 17, de [6 ; 8[ à [38 ; 40[ °C |
| Journées retenues | 5 888 |
| Journées à 30 °C ou plus | 682 |
| Classe la plus fréquente | [24 ; 26[ °C, avec 894 journées |

Le composant Astro calcule ces repères à partir des classes et les compare aux métadonnées pendant le build. Le fichier `distribution_ete.metadata.json` garde la station, les filtres, les effectifs de contrôle et l’empreinte SHA-256 du CSV.

## Pourquoi la méthode A ?

Ce graphique est fixe. Nous avons choisi de le créer pendant la compilation avec Observable Plot et JSDOM, plutôt que d’envoyer les observations quotidiennes et Plot au navigateur.

La fonction `createTemperatureDistribution(data, options)` reçoit les classes et un document DOM en argument. Elle ne charge pas de fichier et ne modifie pas les données. Astro produit deux SVG de la même distribution : un pour ordinateur, un pour les petits écrans. Le CSS n’en affiche qu’un à la fois.

L’axe horizontal indique la maximale en °C et la hauteur des barres le nombre de journées. Un trait pointillé marque 30 °C. Les couleurs changent à 24 et 30 °C : `#88786D`, `#B66B39` et `#A9362A`. La position et la hauteur restent compréhensibles sans couleur.

## Comment lire le graphique autrement ?

Le graphique a un titre, une description, ses unités, sa source et une note de lecture. Les deux SVG possèdent leurs propres identifiants, un rôle d’image, un `title` et un `desc`. Un tableau dépliable reprend les effectifs et les bornes ; il fonctionne au clavier et au toucher. Nous n’avons pas reproduit les infobulles du notebook dans ce rendu statique.

Ces relevés viennent d’une station, pas de chaque rue. Cette distribution regroupe tous les étés : elle ne suffit donc pas à montrer une tendance dans le temps. Le seuil de 30 °C ne définit pas à lui seul une canicule.

## Refaire le contrôle

Le CSV d’origine reste hors du dépôt, ou dans `data-raw/`, qui est ignoré par Git.

```sh
node scripts/prepare-temperature-distribution.mjs /chemin/vers/SQR_MTX325056001.csv
node --test tests/temperature-distribution.test.mjs
npm run build
```

Le script compare les classes recalculées au JSON avant d’écrire les métadonnées. Il s’arrête en cas de différence et ne copie pas le CSV.
