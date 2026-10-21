# V3 — Évolution des maximales moyennes de l’été

## Fiche V3 en six points

1. **Question** : comment les températures maximales moyennes de l’été ont-elles évolué à Besançon ?
2. **Famille** : série temporelle en courbe, comme `graphiqueEvolutionEte` dans le notebook.
3. **Encodage** : année en position horizontale ; moyenne estivale en position verticale ; une ligne et un point par été ; point plus grand et annotation textuelle sur le maximum de la série. La taille et le texte rendent ce repère compréhensible sans couleur.
4. **Unité et dénominateur** : °C. Pour chaque été complet, somme des 92 températures maximales quotidiennes de juin à août divisée par 92. Les périodes 1961–1990 et 1991–2020 sont des moyennes de 30 moyennes estivales chacune.
5. **Titre et sous-titre** : « Les maximales moyennes d’été ont augmenté de 1,69 °C entre deux périodes de 30 ans » ; « Besançon · 1959–2022 · moyenne des maximales quotidiennes de juin à août ». Résultats calculés au build, pas codés en dur dans le titre.
6. **Alternative textuelle** : les maximales moyennes estivales passent de 23,27 °C sur 1961–1990 à 24,96 °C sur 1991–2020, soit +1,69 °C. Les valeurs varient d’une année à l’autre ; 2003 est le maximum de cette série avec 29,47 °C. Il ne s’agit pas de la température moyenne d’une journée entière ni d’un record quotidien. Un tableau des 64 étés complète les descriptions SVG.

## Sources et préparation

- Source exacte : `SQR_MTX325056001.csv`, Météo-France, station 25056001, Besançon.
- Source officielle : https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference
- Notebook : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16
- Version locale consultée : `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html` ; la version `(1)` reste absente.
- Les séries mensuelles SH_MTX et SH_MTN ne sont pas l’entrée de V3.

Lire les lignes hors commentaires ; convertir les valeurs numériques sans
transformer une valeur absente en zéro. Garder `Q_SQR = 1`, les températures
finies et les dates valides, vérifier l’absence de doublons et limiter à
1959–2022. Les prolongements 2023–2024 sont exclus. Retenir les mois 6, 7 et 8,
regrouper par année et calculer la moyenne des maximales quotidiennes. Exclure
les étés qui n’ont pas exactement 92 jours. Le fichier actuel donne 64 étés
complets, 5 888 observations et aucun été exclu. V3 exige un été complet, sans
ajouter une exclusion d’année sur la seule base d’une absence hivernale.

Le script `scripts/verify-heat-trends.mjs` recalcule les moyennes depuis le CSV
local hors du dépôt. Il vérifie les données déjà nettoyées dans
`src/assets/chaleur_annuelle.json`, sans créer un second fichier annuel.
Ce JSON contient les moyennes estivales à quatre décimales ; ce niveau de
précision existant est conservé pour les calculs, tandis que les valeurs
affichées sont arrondies à deux décimales. Les moyennes des deux périodes,
leur différence et le maximum affichés sont également comparés aux résultats
calculés avant arrondi depuis les observations. Les contrôles et l’empreinte du
CSV sont conservés dans `src/assets/heat-trends.metadata.json`.

Le composant ne retient au build que l’année, la moyenne estivale et le nombre
de jours ; les autres colonnes du JSON annuel ne sont pas envoyées au navigateur.

## Résultats contrôlés

| Indicateur | Valeur affichée |
| --- | --- |
| Moyenne des 30 étés 1961–1990 | 23,27 °C |
| Moyenne des 30 étés 1991–2020 | 24,96 °C |
| Écart entre les périodes | +1,69 °C |
| Maximum annuel de la série | 2003, 29,47 °C |

La différence est calculée avant arrondi ; ne pas soustraire des valeurs
d’affichage déjà arrondies pour fabriquer de nouveaux résultats.

## Export A et présentation

Méthode **A : calcul et rendu au build**. V3 est statique dans la version finale
du notebook. Astro calcule les résumés à partir des agrégats et JSDOM fournit le
document nécessaire à Observable Plot pour produire les SVG. Aucun calcul Plot
ou chargement des observations n’est nécessaire chez le lecteur.

`createHeatTrends(data, options)` reçoit sa série et son document en arguments,
trie une copie et n’altère pas l’entrée. La fonction reprend courbe, points et
annotation du maximum du notebook. Elle n’ajoute aucune régression ou moyenne
glissante. Les couleurs de données `#B45B36` et `#842F32` restent distinctes de
la charte. La couleur de la ligne a été légèrement assombrie pour le contraste.

Deux SVG de la même série adaptent le nombre de graduations et la taille du
dessin aux écrans ; un seul est visible à la fois. Les axes sont linéaires.
L’axe vertical explicite 20–31 °C et son origine non nulle est expliquée sous
le graphique. Cette échelle ne concerne pas une longueur de barre : elle
permet de lire les variations de la courbe tout en gardant toutes les valeurs.
Les années sont écrites sans séparateur de milliers, avec moins de graduations
sur mobile. Les infobulles du notebook ne sont pas simulées dans ce rendu
statique ; un tableau HTML repliable donne les 64 valeurs et leurs effectifs.

La figure a un titre, une légende, une description des résultats et une note
méthodologique. Chaque SVG possède un rôle d’image, un titre et une description
avec identifiants propres. Le maximum est annoté et agrandi, pas seulement coloré.

## Limites

Moyenne des maximales quotidiennes, pas température moyenne de l’ensemble des
journées ni maximum absolu mesuré un jour. Les valeurs concernent une station,
pas tous les quartiers ou une exposition individuelle. Une moyenne ne dénombre
pas les jours au-dessus d’un seuil. Les écarts entre périodes sont descriptifs :
aucune significativité statistique ni cause des variations interannuelles
n’est établie par ce graphique seul. Aucune projection n’est ajoutée à la courbe.
V4, la conclusion et la page Méthode ne sont pas développés à cette étape.

## Vérification

Contrôles réalisés : extraction et exécution du code original de V3 dans le
notebook, avec égalité des 64 moyennes avant arrondi et correspondance du JSON
à quatre décimales. Le titre, l’écart et l’annotation du maximum concordent.
Douze tests automatisés (V1, V2, V3) passent et Astro compile. Vérifications
Chrome réussies à 320, 390, 768 et 1440 px : une seule courbe visible, 64 points
annuels plus le repère du maximum, aucun débordement ni chevauchement des
années, tableau de 64 lignes accessible au clavier, aucune ancre cassée.
Les filtres, le zoom et la réinitialisation de V2 restent fonctionnels. Les
contrastes sur le fond du graphique sont 4,37:1 pour la courbe et 8,06:1 pour
l’annotation. Tests navigateur avec polices de secours, sans Google Fonts.

```powershell
node scripts/verify-heat-trends.mjs 'C:\Users\Panda\Downloads\SQR_MTX325056001.csv'
node --test tests/heat-trends.test.mjs tests/temperature-distribution.test.mjs tests/lcz-map.test.mjs
npm run build
git ls-files -- '*.csv' '*.shp' '*.gpkg'
```
