# V4 — Choisir un seuil de chaleur

Une moyenne d’été ne dit pas combien de journées atteignent une température donnée. Nous avons donc ajouté un choix entre 25, 30 et 35 °C. Le lecteur peut changer le seuil et regarder comment le comptage évolue, sans quitter le graphique.

## Notre fiche en six points

1. **Question :** les journées atteignant 25, 30 ou 35 °C évoluent-elles de la même façon ?
2. **Famille :** des barres annuelles, une moyenne mobile sur dix ans et une annotation du maximum, comme dans `graphiqueJoursChauds`.
3. **Encodage :** l’année est en abscisse et le nombre de journées en ordonnée. La hauteur des barres donne l’effectif, la courbe sombre sa moyenne mobile. Les libellés, les résultats et le tableau changent avec le seuil.
4. **Unité et dénominateur :** des journées par année civile complète, sur 365 ou 366 observations. Le seuil est inclus : une maximale exactement égale au seuil est comptée. Les comparaisons portent sur 1961–1990 et 1991–2020, soit 30 années chacune.
5. **Titre et sous-titre :** « Jusqu’à N journées à X °C ou plus en Y », selon le seuil ; « Besançon, 1959–2022 · journées par année civile complète ».
6. **Alternative textuelle :** un résumé annonce le seuil, la période, le maximum et les moyennes. Le tableau annuel suit le choix du lecteur et donne les effectifs, la couverture et la moyenne mobile.

## Ce que nous comptons

Les données viennent du fichier `SQR_MTX325056001.csv`, station de Besançon 25056001, dans les [SQR de Météo-France](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference).

Nous gardons 1959–2022, la qualité `Q_SQR = 1`, les dates valides et uniques et les températures numériques finies. Nous excluons 2023–2024. Les valeurs manquantes restent absentes.

La différence avec V1 et V3 est importante : nous comptons **tous les mois de l’année**, pas seulement l’été. Une année doit avoir 365 ou 366 relevés valides. Les données actuelles donnent 64 années complètes et 23 376 observations, sans année écartée. Une barre à zéro signifie donc qu’aucune journée n’a atteint le seuil, et non qu’il manque les relevés.

Pour la moyenne mobile de l’année Y, nous utilisons les années Y−9 à Y, année courante comprise. Il faut dix années consécutives, pas simplement les dix dernières lignes disponibles. Une lacune bloque le calcul. La première moyenne de la série apparaît en 1968. Nous gardons la précision des calculs et affichons les moyennes à deux décimales ; les effectifs restent entiers.

## Pourquoi cette interaction ?

Une même journée peut être comptée à 25 °C et ne plus l’être à 30 ou 35 °C. Changer le seuil aide à lire cette différence. Nous gardons les mêmes années et le même type de graphique pour faciliter la comparaison.

L’axe vertical s’adapte à chaque seuil, comme dans le notebook. Il faut donc regarder ses graduations, et pas seulement comparer la hauteur des barres entre deux sélections.

## Les résultats vérifiés

| Seuil inclus | Maximum annuel | Moyenne 1961–1990 | Moyenne 1991–2020 |
| --- | --- | --- | --- |
| 25 °C | 96 jours en 2018 | 42,60 jours/an | 58,57 jours/an |
| 30 °C | 39 jours en 2003 | 7,33 jours/an | 14,50 jours/an |
| 35 °C | 12 jours en 2003 | 0,23 jour/an | 1,50 jour/an |

Les 192 comptages correspondent au [notebook](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16) et aux observations quotidiennes. Les 165 moyennes mobiles, soit 55 par seuil, ont aussi été comparées. Le test du notebook qui retire 2009 de 2005–2014 ne donne bien aucune moyenne sur dix ans. L’export local utilisé ne porte pas le suffixe `(1)` demandé dans le brief.

## Comment nous l’avons intégré

Nous utilisons la méthode B. Les effectifs annuels sont déjà préparés dans `src/assets/chaleur_annuelle.json`. Le navigateur choisit la colonne du seuil, calcule les moyennes mobiles et les résumés, puis crée le graphique Plot.

Le fichier `/heat-thresholds.json`, généré au build par `src/pages/heat-thresholds.json.ts`, ne contient que les métadonnées et les colonnes utiles : `annee`, `joursValides`, `jours25`, `jours30` et `jours35`. Il pèse environ 4,8 ko. Les relevés quotidiens et le CSV brut ne sont pas envoyés au lecteur.

Nous avons séparé les rôles dans le code :

- `heatThresholds.js` prépare les années, les seuils, la moyenne mobile et les comparaisons.
- `heatThresholdPlot.js` crée le graphique à partir du modèle reçu en argument.
- `heat-threshold-explorer.js` charge les données et met à jour la figure, le texte et le tableau.
- `HeatThresholdExplorer.astro` fournit la structure et le tableau initial à 30 °C.

Le choix initial de 30 °C reprend le notebook. Nous ne proposons pas d’autres seuils ni de filtre de période. `replaceChildren` remplace le SVG à chaque changement ; les graphiques ne s’accumulent pas. Le redimensionnement passe par un ResizeObserver. Le résumé `aria-live="polite"` n’est réécrit que s’il change.

## Lisibilité et accès au clavier

Les barres partent de zéro. Leurs couleurs sont `#AA6A24`, `#B45332` et `#AC403A`, avec des contrastes de 4,09:1, 4,65:1 et 5,53:1 sur le fond de la figure. La courbe `#6B302C` a un halo clair pour rester visible sur les barres. Le maximum possède aussi un point et un texte.

Les boutons radio gardent leur fonctionnement natif au clavier. Le tableau reste accessible sans survol. Sur mobile, les graduations sont moins nombreuses et l’annotation reste dans le dessin. Si le chargement échoue, un bouton permet de réessayer. Sans JavaScript, le tableau à 30 °C reste consultable.

Ce sont des observations d’une station. Nous n’en déduisons ni température par quartier ni conséquence sanitaire. Le seuil choisi ne définit pas à lui seul une canicule.

## Refaire les contrôles

```sh
node scripts/verify-heat-thresholds.mjs /chemin/vers/SQR_MTX325056001.csv
npm test
npm run build
npm run audit:browser
```

Les tests vérifient notamment les années incomplètes, le seuil inclus et les lacunes dans la moyenne mobile. L’audit navigateur teste les trois sélections, les 64 valeurs, le clavier, le tableau, le redimensionnement et le bouton Réessayer.
