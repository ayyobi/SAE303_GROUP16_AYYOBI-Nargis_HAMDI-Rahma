# V2 — Carte interactive des espaces urbains

## Fiche V2 en six points

1. **Question** : quels types d’espaces trouve-t-on dans le centre de Besançon, et comment leur répartition peut-elle aider à réfléchir à l’adaptation aux fortes chaleurs ?
2. **Famille** : carte catégorielle de polygones, adaptée à la question spatiale « où se trouvent ces types d’espaces ? ».
3. **Encodage** : géométries du GeoJSON, six couleurs des familles du notebook ; espaces non sélectionnés atténués en gris. Le contour, les libellés, le panneau de détails et le tableau complètent la couleur.
4. **Unité et dénominateur** : surfaces en km², lues dans `surface_km2`. Pour les parts de sélection, dénominateur = somme de ces surfaces sur toutes les classes du secteur, soit 64,0002 km² avant arrondi, pas la population ni toute la commune. La carte elle-même reste catégorielle.
5. **Titre et sous-titre** : « Où se trouvent les différents types d’espaces ? » ; « Cerema · LCZ SPOT 2022 · secteur central de Besançon, environ 8 × 8 km ». La section pose la question de la forme urbaine et de l’adaptation.
6. **Alternative textuelle** : le secteur associe bâti compact, bâti ouvert ou diffus, bâtiments et sols imperméables, végétation, sol nu et eau. La carte ne mesure pas de températures. Un tableau HTML des 14 classes, descriptions, familles, surfaces et nombres de polygones est disponible même sans JavaScript.

## Source, licence et fichier

- Producteur : Cerema, cartographie nationale LCZ SPOT 2022.
- Source officielle : https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d
- Licence Ouverte / Open Licence 2.0, vérifiée sur cette fiche : https://www.etalab.gouv.fr/licence-ouverte-open-licence/
- Notebook : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16
- Référence locale disponible : `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`. La version `(1)` demandée est absente.

Le fichier `src/assets/besancon_lcz_coeur_8km.geojson` est déjà dérivé : il ne
contient pas le jeu brut national. Ses métadonnées annoncent 24 752 polygones
sources, une sélection de 1 961 polygones et 14 classes regroupées.
Il est réutilisé sans copie ni nouvelle simplification (environ 1,04 Mo).
Vite produit son URL de distribution ; le navigateur ne le charge qu’à
l’approche de la section. Aucun CSV ou shapefile brut n’est ajouté au dépôt.

Contrôles : FeatureCollection, 14 entités à code unique, 13 MultiPolygon et
1 Polygon, 26 964 coordonnées ; anneaux fermés et coordonnées valides.
Emprise longitude 5,970175–6,079895 ; latitude 47,200625–47,275352.
La géométrie est exportée en EPSG:4326, ordre longitude/latitude ; le document
indique une projection source EPSG:2154. Leaflet reprojette les coordonnées en
Lambert-93 avec proj4 pour l’affichage : les bords du carré découpé dans ce
repère restent alignés à l’écran. Le GeoJSON demeure inchangé en EPSG:4326.

Le carré central est indiqué autour de 6,025 E, 47,238 N. Il ne correspond pas
à la limite communale. Les géométries ont été découpées, simplifiées à 10 m et
regroupées en amont, selon le fichier et le notebook. Les contours sont donc
indicatifs et ne conviennent pas à des décisions à la parcelle. L’historique
complet du traitement amont n’est pas fourni ; aucune exactitude topologique
supplémentaire n’est affirmée. Les surfaces proviennent des attributs conservés,
pas d’un recalcul sur les contours simplifiés. Leur somme diffère de 64 km² de
0,0002 km² à cause des valeurs préarrondies ; ne pas remplacer le dénominateur.

## Catégories, couleurs et filtres

| Famille du notebook | Classes présentes | Couleur |
| --- | --- | --- |
| Bâti compact | 2, 3 | `#B44D38` |
| Bâti ouvert ou diffus | 4, 5, 6, 9 | `#D89669` |
| Bâti et sols imperméables | 8, E | `#826D63` |
| Végétation | A, B, C, D | `#468052` |
| Sol nu | F | `#C9B897` |
| Eau | G | `#6B93A5` |

Les libellés détaillés sont lus directement dans `libelle`. Les descriptions
reprennent ces libellés et leurs familles sans inventer de hauteur, de densité
numérique ou de température.

Les trois modes sont ceux de `graphiqueCarteLCZ` : tous les espaces (14 classes),
espaces bâtis et imperméabilisés (8 classes), végétation et eau (5 classes).
Le sol nu n’appartient pas au dernier mode, conformément au notebook.
Les surfaces sélectionnées sont respectivement 64,0002 ; 25,2906 ; 38,2618 km².
Les calculs conservent leur précision ; l’interface affiche deux décimales.

Le filtre supplémentaire par classe LCZ est une extension demandée par le brief.
Il se combine au mode choisi ; une combinaison vide est expliquée et peut être
réinitialisée. Aucun filtre ne transforme les géométries.

## Méthode B et différences avec le notebook

Méthode **B : calcul et rendu chez le lecteur**. Leaflet 1.9.4 est importé
dynamiquement dans le navigateur, jamais pendant le rendu Astro. Les filtres,
surfaces de sélection et informations sont actualisés côté client. Le tableau
alternatif et les textes sont rendus au build et restent lisibles hors JavaScript.

Le notebook utilisait Observable Plot pour la carte ; le passage à Leaflet est
demandé à cette étape pour permettre zoom et déplacement. Géométries, familles,
couleurs, filtres et principe d’atténuation restent les mêmes. Aucun fond de
carte externe n’est ajouté : cela conserve la carte catégorielle du notebook,
évite des requêtes de tuiles et garde le jeu Cerema au centre de la lecture.
Les crédits Leaflet et Cerema sont affichés, ainsi que la licence des données.

Interactions : zoom +/−, déplacement au clavier ou par glissement, zoom tactile,
filtre par mode et classe, bouton « Afficher toutes les zones », retour à
l’emprise initiale, popup au clic et panneau textuel pour la classe.
La molette est désactivée pour préserver le défilement du récit.

Une entité regroupe parfois de nombreux morceaux de la même classe. Cliquer un
morceau affiche les attributs de **toute cette classe dans le secteur**, pas une
surface propre à ce morceau. Cette limite est explicitée dans le panneau.

Les couleurs claires du notebook sont conservées ; un contour foncé permet de
repérer les limites. La légende porte des libellés. Les classes filtrées sont
grisées et retirées du parcours Tab ; les classes sélectionnées ont un nom
accessible et s’ouvrent avec Entrée ou Espace. Le tableau HTML permet de lire
tous les attributs sans manipuler les polygones.

Le chargement gère les erreurs réseau, JSON et de structure, avec un bouton de
nouvelle tentative et le tableau toujours disponible. Les mouvements animés
sont désactivés si `prefers-reduced-motion` est actif.

## Limites scientifiques

Les LCZ décrivent des espaces, pas des températures de l’air mesurées, ni un
risque sanitaire. Aucune comparaison de température entre quartiers ne peut
être déduite de cette carte seule. Les catégories peuvent guider des études
locales d’ombre, d’arbres ou de sols perméables ; elles ne déterminent pas seules
des priorités de travaux. V3 et V4 ne sont pas développés ici.

## Contrôles reproductibles

Vérifications effectuées : exécution de la fonction originale `graphiqueCarteLCZ`
extraite du notebook, avec comparaison exacte des trois sélections, des six
couleurs, des surfaces et des proportions. Huit tests automatisés réussissent
(V1 et V2) et Astro compile. Dans Chrome, contrôles réussis du chargement, des
14 géométries, des filtres, de la combinaison vide, des informations au clavier,
du zoom, du déplacement et de la réinitialisation. Aucun débordement à 320,
390, 768 et 1440 px. Le blocage volontaire du GeoJSON affiche l’erreur prévue ;
la nouvelle tentative recharge la carte et les 14 lignes restent disponibles
sans JavaScript. Les tests utilisent les polices de secours sans requêtes
Google Fonts. Les empreintes SHA-256 du GeoJSON local et de l’extrait initial
dans les téléchargements sont identiques : les données n’ont pas été modifiées.

```sh
node --test tests/lcz-map.test.mjs tests/temperature-distribution.test.mjs
npm run build
git ls-files -- '*.csv' '*.shp' '*.gpkg'
```
