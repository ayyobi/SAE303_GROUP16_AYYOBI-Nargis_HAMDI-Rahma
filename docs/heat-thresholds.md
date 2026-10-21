# V4 — Explorateur interactif des journées à seuil

## Fiche V4 en six points

1. **Question** : les journées atteignant 25, 30 ou 35 °C évoluent-elles de la même façon ? Le lecteur choisit le seuil et observe les effectifs au fil des années.
2. **Famille** : barres annuelles avec boutons radio de seuil, courbe de moyenne sur dix années civiles consécutives et annotation du maximum, comme dans `graphiqueJoursChauds`.
3. **Encodage** : année en x, nombre de journées en y, hauteur de barre = effectif ; couleur chaude propre au seuil ; courbe sombre = moyenne mobile ; point et annotation = maximum annuel. Les libellés et le résumé changent avec les valeurs, pas uniquement la couleur.
4. **Dénominateur et unité** : nombre entier de journées sur une année civile complète (365 ou 366 journées observées), pas un pourcentage. Le seuil est inclus (`>=`). Les moyennes de comparaison portent chacune sur 30 années complètes : 1961–1990 et 1991–2020. La moyenne mobile utilise exactement dix années civiles consécutives, année courante comprise.
5. **Titre et sous-titre** : « Jusqu’à N journées à X °C ou plus en Y », calculé pour le seuil actif ; « Besançon, 1959–2022 · journées par année civile complète ». Les années réellement présentes servent au titre du modèle et au sous-titre dynamique.
6. **Alternative textuelle** : résumé dynamique indiquant seuil inclus, période, maximum et moyennes des deux périodes. Description SVG des barres et de la moyenne sur dix ans. Tableau HTML synchronisé avec effectifs, jours observés et moyenne mobile, disponible au clavier.

L’interaction change la mesure étudiée, pas seulement un habillage : une journée
peut entrer dans le comptage à 25 °C et ne pas y entrer à 30 ou 35 °C. Les mêmes
années et les mêmes encodages permettent de comparer ces lectures successives
sans parcourir trois graphiques identiques. Les axes sont réévalués pour chaque
seuil, conformément au notebook ; comparer les graduations, pas seulement la
hauteur visuelle des barres d’un seuil à l’autre.

## Source et règles de calcul

- Météo-France, `SQR_MTX325056001.csv`, station de Besançon 25056001.
- Source officielle : https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference
- Notebook : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16
- Version locale disponible : `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`. La version demandée avec `(1)` est absente.

Les commentaires sont retirés ; les valeurs manquantes restent absentes et ne
sont jamais converties en zéro. Sélection : indicateur `Q_SQR = 1`, valeurs
numériques finies, dates valides et uniques, 1959–2022 inclus. Les prolongements
2023–2024 sont exclus. Contrairement à V1 et V3, **tous les mois de l’année**
sont comptés. Une journée est retenue si sa maximale est supérieure ou égale au
seuil. Les années avec moins de 365/366 journées valides sont exclues.

Les données actuelles donnent 64 années civiles complètes et 23 376 observations
valides, sans année exclue. Une barre à zéro représente donc une absence de
dépassement du seuil, pas une absence de relevés dans l’année.

Les moyennes mobiles pour une année Y exigent les valeurs des années Y−9 à Y.
Il ne suffit pas de prendre les dix dernières lignes disponibles. Une lacune
empêche le calcul tant que dix années consécutives ne sont pas à nouveau
disponibles. Les premières moyennes de la série complète apparaissent en 1968.
Les moyennes sont conservées en pleine précision dans les calculs et arrondies
à deux décimales dans le texte et le tableau ; les nombres de journées restent entiers.

## Données réutilisées et export minimal

`src/assets/chaleur_annuelle.json` contient déjà les effectifs annuels préparés.
Il reste inchangé. `scripts/verify-heat-thresholds.mjs` les recalcule depuis le CSV
local et vérifie les 192 valeurs (64 années × 3 seuils).

`src/pages/heat-thresholds.json.ts` crée au build le fichier statique
`/heat-thresholds.json` (environ 4,8 ko). Il conserve seulement les métadonnées de
sélection et les colonnes `annee`, `joursValides`, `jours25`, `jours30`, `jours35`.
Il n’y a ni nouvelle copie du CSV ni observations quotidiennes dans cette réponse.
Le répertoire `src/assets` reste l’emplacement des données sources du site ;
l’endpoint est du code Astro qui génère une réponse dérivée.

## Méthode B et architecture

**B : calcul et rendu chez le lecteur.** Les effectifs sont préagrégés ; le
navigateur sélectionne les valeurs, recalcule la moyenne mobile et les résumés,
puis génère le graphique Observable Plot. Les trois boutons radio reprennent
`Inputs.radio([25, 30, 35], { value: 30 })` du notebook. Aucun filtre de période
ou seuil supplémentaire n’est ajouté.

- `heatThresholds.js` : validation des années complètes, choix du seuil, points,
  moyenne mobile, maximum et comparaisons entre périodes ; aucune dépendance DOM.
- `heatThresholdPlot.js` : fonction graphique autonome, données en argument,
  sans mutation de l’entrée.
- `heat-threshold-explorer.js` : chargement à l’approche de la section, écoute
  unique des changements, remplacement du SVG et synchronisation du texte et du tableau.
- `HeatThresholdExplorer.astro` : structure sémantique, radios initialement à
  30 °C, sources et tableau initial préaffichés au build.

`replaceChildren` remplace le SVG existant à chaque changement. Un seul
ResizeObserver et un seul écouteur de changement sont créés par composant ;
les tentatives de chargement ne réenregistrent pas ces événements. Un résumé
`aria-live="polite"` n’est réécrit que lorsqu’il change, pas à chaque redimensionnement.
Les radios natives conservent leur comportement au clavier et leur focus.

Le chargement traite les erreurs HTTP, réseau, JSON et de structure. Le bouton
de nouvelle tentative est utilisable et le tableau initial à 30 °C reste présent.
Sans JavaScript, ce tableau reste disponible et les contrôles sont désactivés.

## Adaptations de rendu

Même structure que le notebook : barres, moyenne sur dix ans, annotation du
maximum et axe y partant de zéro. La courbe est interrompue si les données ne
permettent pas de calculer une moyenne. Les couleurs des barres sont légèrement
assombries pour le contraste : 25 °C `#AA6A24`, 30 °C `#B45332`, 35 °C `#AC403A`
(contrastes respectifs 4,09:1, 4,65:1 et 5,53:1 sur le fond du graphique).
La courbe `#6B302C` dispose d’un fin halo clair pour rester visible sur les barres.
Les graduations temporelles sont moins nombreuses sur mobile sans retirer
d’années du graphique ; l’annotation du maximum s’aligne pour rester dans le SVG.
Les informations exactes se lisent dans le tableau, sans dépendre du survol.

## Comparaison et résultats vérifiés

La fonction originale `graphiqueJoursChauds` a été extraite et exécutée pour
les trois seuils : égalité exacte des 192 effectifs et des 165 moyennes mobiles
(55 par seuil), ainsi que du test de lacune du notebook (2005–2014 sans 2009 :
neuf années, aucune moyenne sur dix ans).

| Seuil inclus | Maximum annuel | Moyenne 1961–1990 | Moyenne 1991–2020 |
| --- | --- | --- | --- |
| 25 °C | 96 jours en 2018 | 42,60 jours/an | 58,57 jours/an |
| 30 °C | 39 jours en 2003 | 7,33 jours/an | 14,50 jours/an |
| 35 °C | 12 jours en 2003 | 0,23 jour/an | 1,50 jour/an |

Ce sont des observations de station et des comparaisons descriptives. Un seuil
ne définit pas à lui seul une canicule ; ni risque sanitaire ni température par
quartier ne sont déduits. Aucune projection, conclusion générale ou page Méthode
n’est développée à cette étape.

## Vérifications

```powershell
node scripts/verify-heat-thresholds.mjs 'C:\Users\Panda\Downloads\SQR_MTX325056001.csv'
node --test tests/*.test.mjs
npm run build
git ls-files -- '*.csv'
```

17 tests automatisés réussissent. Dans Chrome, chaque seuil a été testé plusieurs
fois : effectifs identiques au tableau source, un seul SVG, aucun rechargement
de page, titre et résumé synchronisés. Le clavier des radios (flèches) et celui
du tableau ont été testés. Aucun débordement ou chevauchement de graduations à
320, 390, 768 et 1440 px pour les trois seuils. Le blocage volontaire du JSON
déclenche le message d’erreur et la nouvelle tentative fonctionne. Les contrôles
de V1, V2 et V3 restent réussis. Les tests navigateur utilisent les polices de
secours, sans requêtes Google Fonts.
