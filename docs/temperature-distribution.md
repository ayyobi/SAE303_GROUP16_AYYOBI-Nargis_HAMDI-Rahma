# V1 — Distribution des maximales estivales

## Provenance et comparaison

Source : Météo-France, série quotidienne de référence `SQR_MTX325056001.csv`,
station 25056001, Besançon. Les séries mensuelles SH_MTX et SH_MTN ne sont pas
utilisées pour cet histogramme.

Jeu officiel : https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference

Notebook : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16

La version locale disponible est `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`.
La version nommée `(1)` n’est pas disponible. Le code complet de
`graphiqueDistribution(donnees)` a été extrait du HTML, puis exécuté avec les
observations du CSV original et son algorithme `d3.bin`. Les 17 classes obtenues
coïncident exactement avec `src/assets/distribution_ete.json`, réutilisé sans
modification. Aucun second fichier de classes n’est créé.

## Sélection et calcul

- Lire les lignes non vides hors commentaires, séparateur `;`.
- Ne pas transformer une température manquante en zéro.
- Garder les dates valides et uniques, les valeurs numériques finies et `Q_SQR = 1`.
- Période : 1959–2022 inclus ; les prolongements 2023–2024 sont exclus.
- Vérifier les 64 années complètes : 23 376 observations quotidiennes valides.
- Sélectionner juin, juillet et août : 92 jours par été, soit 5 888 journées.
- Classes de 2 °C : minimum arrondi vers le bas au multiple de 2 ; maximum
  arrondi vers le bas au multiple de 2, puis augmenté de 2.
- Chaque classe inclut sa borne inférieure et exclut sa borne supérieure.
- Une journée correspond à une maximale et contribue à un seul effectif.
- Aucun pourcentage ni pondération par la population ; effectifs entiers.

Le code V1 du notebook sélectionne directement les observations quotidiennes,
tandis que sa fiche annonce des années complètes. Le contrôle confirme que les
64 années sont effectivement complètes : aucune sélection supplémentaire ne
change les données. Le script bloque l’export si cette condition cesse d’être vraie.

Résultats vérifiés : 17 classes de [6 ; 8[ à [38 ; 40[, somme 5 888 journées,
682 journées à au moins 30 °C. Classe modale : [24 ; 26[, 894 journées.
Les valeurs affichées dans Astro sont calculées à partir des classes, et
confrontées aux métadonnées au build.

Les métadonnées sont dans `src/assets/distribution_ete.metadata.json` : station,
période, filtres, dénominateur, effectifs de contrôle et empreinte SHA-256 du CSV.

## Méthode A et fonction autonome

**A = calcul et rendu au build** ; B = calcul et rendu chez le lecteur ;
C = une page générée par valeur. Pour cette distribution fixe, A évite de livrer
les observations quotidiennes et la bibliothèque de calcul au navigateur.

La fonction `createTemperatureDistribution(data, options)` accepte des classes
préfiltrées en argument et un document DOM injecté. Elle ne dépend d’aucune cellule
Observable, ne charge aucun fichier et ne modifie pas les données. Le composant
Astro utilise JSDOM pour construire les SVG pendant le build ; la page reçoit
du SVG statique. Les calculs sur le CSV sont préparés hors navigateur par le script
reproductible ; les totaux, le résultat éditorial et le rendu sont calculés au build.
La base Astro/Plot du professeur et les dépendances existantes sont conservées.

Deux mises en page statiques représentent les mêmes 17 classes : l’une pour
ordinateur, l’autre avec des axes adaptés aux écrans plus étroits. Les médias CSS
n’en affichent qu’une à la fois, y compris dans l’arbre d’accessibilité.

## Encodage et accessibilité

Comme dans le notebook : x = température maximale quotidienne en °C,
y = nombre de journées, couleurs plus chaudes pour les classes élevées,
seuil vertical pointillé à 30 °C. Les trois familles thermiques changent à 24 et
30 °C. Les couleurs sont adaptées pour contraster sur le fond du site et restent
distinctes de la charte éditoriale : `#88786D`, `#B66B39`, `#A9362A`.
La hauteur et la position portent l’information même sans couleur.

Les SVG sont dans une figure avec titre, légende, description des résultats,
source et note de lecture. Chaque format possède un `title`, un `desc`, un rôle
d’image et des identifiants propres. Un tableau HTML repliable donne tous les
effectifs avec leurs bornes. Les infobulles interactives du notebook ne sont pas
reproduites dans le rendu statique ; le tableau fonctionne au clavier et au toucher.

## Limites

Il s’agit des maximales à une station, pas d’une mesure rue par rue ni de
l’exposition individuelle de tous les habitants. Le graphique réunit les étés
sur toute la période : il ne prouve pas une tendance chronologique. Le seuil
30 °C n’est pas à lui seul une définition de canicule. Aucun résultat sanitaire
ni aucune projection 2050 ne découle de cette distribution.

## Reproduire les contrôles

Le CSV reste hors dépôt (ou dans `data-raw/`, ignoré) :

```powershell
node scripts/prepare-temperature-distribution.mjs 'C:\Users\Panda\Downloads\SQR_MTX325056001.csv'
node --test tests/temperature-distribution.test.mjs
npm run build
git ls-files -- '*.csv'
```

Le script compare les classes recalculées au JSON existant avant d’écrire les
métadonnées et s’arrête en cas de différence. Il ne copie pas le CSV.
La page Méthode et V2, V3, V4 restent hors du périmètre de cette étape.
