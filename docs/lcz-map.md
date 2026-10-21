# V2 — Regarder les espaces de Besançon

Après les températures, nous voulions regarder comment la ville est organisée. La carte montre les types d’espaces du secteur central : le bâti, la végétation, les sols et l’eau. Elle donne des pistes à examiner pour l’adaptation, sans attribuer une température à chaque quartier.

## Notre fiche en six points

1. **Question :** où se trouvent les différents types d’espaces, et que peut nous apporter cette lecture de la ville ?
2. **Famille :** une carte catégorielle, parce que notre question porte sur la répartition dans l’espace.
3. **Encodage :** les polygones suivent le GeoJSON et les six couleurs reprennent les familles du notebook. Les zones écartées par le filtre passent en gris. Les libellés, les contours, les informations sous la carte et le tableau complètent la couleur.
4. **Unité et dénominateur :** les surfaces sont en km². Les parts utilisent la somme des surfaces du secteur, soit 64,0002 km² avant arrondi. Le dénominateur n’est ni la population ni toute la commune.
5. **Titre et sous-titre :** « Où se trouvent les différents types d’espaces ? » ; « Cerema · LCZ SPOT 2022 · secteur central de Besançon, environ 8 × 8 km ».
6. **Alternative textuelle :** un tableau dépliable reprend les 14 classes, leurs descriptions, leurs familles, leurs surfaces et le nombre de polygones sources. Il reste disponible sans JavaScript.

## Le fichier que nous avons repris

Les données viennent de la [cartographie LCZ SPOT 2022 du Cerema](https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d), sous [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/). Elles sont aussi utilisées dans [notre notebook](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16).

Le fichier `src/assets/besancon_lcz_coeur_8km.geojson` est déjà un extrait préparé, d’environ 1,04 Mo. Ses métadonnées mentionnent 24 752 polygones au départ, puis 1 961 dans la sélection, regroupés en 14 classes. Nous le réutilisons sans nouvelle simplification. Le contrôle retrouve 13 MultiPolygon, 1 Polygon et 26 964 coordonnées, avec des anneaux fermés et des codes uniques.

Le secteur est un carré de 8 km de côté autour de 6,025 E et 47,238 N. Ses coordonnées vont de 5,970175 à 6,079895 en longitude et de 47,200625 à 47,275352 en latitude. Il ne suit pas les limites de la commune.

Le GeoJSON est en EPSG:4326, dans l’ordre longitude/latitude. Nous utilisons proj4 pour l’afficher en Lambert-93, le système du découpage initial : le carré reste ainsi droit. Le fichier exporté ne change pas.

La préparation amont indique une simplification à 10 m, mais son historique complet n’est pas fourni. Nous ne pouvons donc pas refaire tout ce traitement avec les seuls fichiers du projet. Les contours restent indicatifs. Nous gardons les surfaces des attributs au lieu de les recalculer sur les géométries simplifiées. Leur somme de 64,0002 km² vient des valeurs préarrondies ; nous ne la remplaçons pas par 64 dans les calculs.

## Les couleurs et les filtres

| Famille | Classes présentes | Couleur |
| --- | --- | --- |
| Bâti compact | 2, 3 | `#B44D38` |
| Bâti ouvert ou diffus | 4, 5, 6, 9 | `#D89669` |
| Bâti et sols imperméables | 8, E | `#826D63` |
| Végétation | A, B, C, D | `#468052` |
| Sol nu | F | `#C9B897` |
| Eau | G | `#6B93A5` |

Nous avons repris les trois modes du notebook : tous les espaces (14 classes), le bâti et les sols imperméabilisés (8), puis la végétation et l’eau (5). Le sol nu ne fait pas partie de ce dernier groupe. Les surfaces correspondantes sont 64,0002, 25,2906 et 38,2618 km². L’interface affiche deux décimales.

Le lecteur peut aussi choisir une classe précise. Les deux filtres se combinent : si aucune classe ne correspond, un message l’explique et le bouton de réinitialisation permet de repartir. Les filtres ne modifient pas les géométries. Les descriptions viennent des libellés du fichier ; nous n’ajoutons ni hauteur de bâtiment ni température supposée.

## Pourquoi Leaflet et la méthode B ?

Le notebook utilisait Plot. Pour le site, Leaflet permet de zoomer, de déplacer la carte et de sélectionner les classes. Nous gardons les mêmes géométries, familles, couleurs et filtres. Nous n’avons pas ajouté de fond externe, pour conserver cette lecture des catégories et éviter des requêtes de tuiles.

C’est la méthode B : Leaflet et le GeoJSON sont chargés à l’approche de la section, puis les filtres et les surfaces sont mis à jour dans le navigateur. Le tableau est déjà présent au build. Les crédits Leaflet, Cerema et la licence restent visibles.

La molette ne zoome pas, afin de laisser le lecteur faire défiler le récit. Les boutons, le glissement, le clavier et le zoom tactile restent disponibles. Le bouton de cadrage ramène à l’emprise de départ.

Une classe peut regrouper beaucoup de morceaux séparés. Cliquer sur l’un d’eux donne la surface de **toute la classe dans le secteur**, et non celle du morceau. Nous le précisons sous la carte.

## Accessibilité et limites

Les classes visibles sont accessibles avec Tab, puis Entrée ou Espace. Les classes filtrées sortent du parcours clavier. Les infobulles s’adaptent à la largeur de la carte et leur bouton de fermeture a un libellé français. Une panne de chargement affiche un message et un bouton Réessayer ; le tableau reste là. Les mouvements animés respectent la préférence de réduction des animations.

La carte décrit les formes urbaines et la couverture du sol. Elle ne permet pas de classer les quartiers du plus chaud au plus frais, ni de décider seule des travaux. Elle peut servir de point de départ pour des études locales sur l’ombre, les arbres ou les sols perméables.

## Refaire les vérifications

```sh
node --test tests/lcz-map.test.mjs
npm run build
npm run audit:browser
git ls-files -- '*.csv' '*.shp' '*.gpkg'
```

Les tests vérifient les classes, les couleurs, les surfaces et les sélections. L’audit navigateur couvre les filtres, le clavier, le zoom, les infobulles et les pannes réseau sur six largeurs. L’empreinte du GeoJSON a aussi été comparée à celle de l’extrait initial : le fichier de données est resté identique.
