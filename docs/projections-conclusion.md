# Projections 2050 et conclusion — contrôle complété à l’étape 9

## Périmètre et provenance

Trois composants prolongent V4 : `Climate2050.astro`, `UrbanAdaptation.astro`
et `ClimateConclusion.astro`. Aucun graphique supplémentaire, calcul de
projection, simulateur ou page Méthode n’est créé. Les données restent inchangées.

Le notebook local disponible est `SAE 303 — Gr 16 _ MMI Montbéliard _ Observable.html`.
La version `(1)` demandée est absente. La cellule `climat2050` et la conclusion
du notebook ont été relues ; les huit valeurs de référence, médianes et bornes
ont été comparées exactement à `src/assets/climadiag_2050.json`.

## Indicateurs retenus

Source : Météo-France, Climadiag Commune, Besançon, date renseignée dans le JSON local : 19/10/2026,
page 7 selon le notebook et le JSON fourni. Référence : 1976–2005. Horizon :
2050 dans le cadre TRACC, sans ajout d’un autre scénario ou niveau de réchauffement.

| Indicateur | Référence 1976–2005 | Médiane 2050 | Borne basse | Borne haute | Unité |
| --- | --- | --- | --- | --- | --- |
| Nuits chaudes, minimum ≥ 20 °C | 2 | 14 | 9 | 19 | nuits/an |
| Journées dont la maximale dépasse strictement 35 °C | 1 | 4 | 2 | 7 | jours/an |

Le contrôle officiel de l’étape 9 corrige les libellés du notebook : minimum
≥ 20 °C pour les nuits et maximum > 35 °C pour les jours. Les huit valeurs
arrondies restent inchangées. V4 conserve son comptage historique ≥ au seuil.
Les chiffres des deux sources ne sont pas mélangés.

Le JSON contient aussi une température moyenne d’été, mais cet indicateur
n’est pas retenu dans la cellule finale `climat2050` : il n’est pas affiché.
Les cartes utilisent uniquement les deux indicateurs explicitement vérifiés.

Les valeurs sont annuelles et décrivent un climat possible à l’horizon 2050,
pas une prévision certaine pour cette année. Les bornes sont présentées comme
fourchettes de projections, sans niveau de confiance statistique inventé.
La référence Climadiag n’est ni celle de 1961–1990 ni celle de 1991–2020.
Les valeurs futures ne sont pas soustraites à la série de station, raccordées
aux courbes, ou utilisées pour simuler un quartier.

## Liens et niveau de vérification

- Notebook public : https://observablehq.com/@mmi-montbeliard/sae-303-gr-16
- Adresse de fiche communale conservée dans les données : https://climadiag.meteofrance.fr/entity/25056
- Entrée officielle du service, utilisée dans la page : https://meteofrance.com/climadiag-commune
- Présentation officielle du service : https://meteofrance.com/presse/climadiag-commune-un-outil-pour-decrire-par-territoire-les-risques-devolutions-climatiques

Les huit valeurs arrondies ont été recoupées le 21 octobre 2026 avec la réponse
officielle `entities.jsonl` chargée par l’application pour Besançon (25056),
indicateurs S1 et S2, horizon 2050. Les définitions ont été relues dans les
ressources de l’application. Le rapport final contient les valeurs décimales
et leur arrondi. Aucun PDF original n’a été relu ; la référence à sa page 7
provient du notebook. La licence du rapport reste à vérifier.

## Adaptation et document officiel

Source consultée : Plan Climat Air Énergie Territorial 2024–2029, Grand Besançon
Métropole, document « PCAET-Mars-2025.pdf », pages imprimées 36–37 (page 19 du PDF).

https://www.grandbesancon.fr/wp-content/uploads/sites/2/2025/03/PCAET-Mars-2025.pdf#page=19

Les actions 10 et 11 servent de référence pour les orientations sur les espaces
verts, l’infiltration, la renaturation et la désimperméabilisation. L’interface
les distingue de trois pistes de notre analyse : végétation et ombre, sols
minéraux ou imperméables, étude des usages des espaces publics. Il n’est pas
affirmé que ces pistes constituent des travaux décidés ou déjà réalisés.
Aucun gain chiffré de température n’est promis.

## Conclusion et limites

La conclusion répond aux deux parties de la problématique. Elle relie
l’évolution observée des maximales estivales et des journées à 30 °C avec
l’intérêt des LCZ pour organiser des diagnostics locaux. Les valeurs reprises
(+1,69 °C ; 7,33 et 14,50 jours/an) sont calculées depuis les mêmes données et
fonctions que V3 et V4, pas ressaisies. V1 apporte une lecture de la diversité
des journées estivales ; aucune tendance temporelle n’est déduite de sa seule
distribution. La perspective 2050 utilise les deux indicateurs indépendants
ci-dessus, avec leurs fourchettes.

L’encadré final rappelle quatre limites : station unique et microclimats,
LCZ sans mesures de températures, incertitudes des projections, périodes de
référence distinctes. Il n’est pas établi de causalité entre le bâti et les
valeurs de station, de classement des quartiers les plus chauds ou de résultat
sanitaire. La phrase finale invite à compléter les connaissances par des
mesures locales et l’étude des usages ; ce n’est pas une promesse de résultat.

## Vérifications

```sh
npm run build
node --test tests/*.test.mjs
git ls-files -- '*.csv'
```

L’égalité avec la cellule `climat2050` couvre les deux indicateurs, la référence
1976–2005 et l’horizon 2050. Les contrastes des nouveaux textes sur les fonds
clairs et foncés dépassent 4,5:1 ; les grands chiffres rust dépassent 3:1.
Les liens vers les étapes de fin de récit et l’absence d’un cinquième graphique
sont vérifiés dans le navigateur, ainsi que le responsive et les quatre
visualisations antérieures. La page Méthode reste réservée à l’étape 8.
