# Ce que nous retenons pour 2050 et pour la ville

Après les observations historiques, nous voulions ouvrir la réflexion sur l’avenir de Besançon. Nous avons donc ajouté deux indicateurs Climadiag, puis une partie sur l’adaptation. Les projections restent à part des graphiques historiques : leurs sources, leurs références et leurs seuils ne sont pas interchangeables.

## Les deux indicateurs repris

Les valeurs viennent de Climadiag Commune, pour Besançon, avec la référence 1976–2005 et l’horizon TRACC 2050. Le JSON local porte la date du 19 octobre 2026 ; nous ne la présentons pas comme une date de publication du rapport.

| Indicateur | Référence | Médiane 2050 | Borne basse | Borne haute | Unité |
| --- | --- | --- | --- | --- | --- |
| Nuits dont le minimum est ≥ 20 °C | 2 | 14 | 9 | 19 | nuits/an |
| Jours dont le maximum est > 35 °C | 1 | 4 | 2 | 7 | jours/an |

Les huit chiffres correspondent au notebook et ont été recoupés le 21 octobre 2026 avec les données chargées par [l’application officielle pour Besançon](https://climadiag.meteofrance.fr/entity/25056), commune 25056 : S1 pour les jours et S2 pour les nuits. Les valeurs décimales et leurs arrondis sont dans [le rapport d’audit](audit-final.md).

Cette vérification a permis de corriger deux libellés. Climadiag compte les jours strictement au-dessus de 35 °C et les nuits qui ne descendent pas sous 20 °C. Les chiffres affichés n’ont pas changé. V4 garde, de son côté, son seuil historique inclusif.

Le notebook cite la page 7 du PDF. Nous n’avons pas relu ce PDF original et sa licence reste à vérifier. L’export local du notebook ne porte pas le suffixe `(1)` ; cette version reste à confirmer. Le JSON contient aussi une température moyenne d’été, mais nous ne l’affichons pas, car la cellule finale `climat2050` ne retient que ces deux indicateurs.

## Notre façon de les présenter

Les cartes montrent la valeur de référence, la médiane projetée et la fourchette basse–haute. Nous affichons les valeurs à l’unité, comme dans le notebook. Elles décrivent des niveaux climatiques possibles, pas la météo certaine d’une année précise.

Nous ne soustrayons pas ces projections aux relevés de la station et ne les raccordons pas aux courbes. Leur référence 1976–2005 diffère des périodes 1961–1990 et 1991–2020 de notre comparaison historique.

Les composants concernés sont `Climate2050.astro`, `UrbanAdaptation.astro` et `ClimateConclusion.astro`. Nous n’avons pas ajouté de cinquième graphique ni de simulateur de quartier.

## Le lien avec l’adaptation

Nous nous appuyons sur le [Plan Climat Air Énergie Territorial 2024–2029 de Grand Besançon Métropole](https://www.grandbesancon.fr/wp-content/uploads/sites/2/2025/03/PCAET-Mars-2025.pdf#page=19), document de mars 2025. Les actions 10 et 11 sont aux pages imprimées 36–37, soit la page 19 du PDF.

Ce document parle notamment d’espaces verts, d’infiltration, de renaturation et de désimperméabilisation. Nous le distinguons de nos trois questions : quelle place pour l’ombre et la végétation, où examiner les sols minéraux, et quels usages des espaces publics faudrait-il étudier ?

Ces questions restent des pistes. Nous ne les présentons pas comme une liste de travaux décidés par la collectivité, ni comme des aménagements dont nous aurions mesuré l’effet.

## Notre conclusion

Nous revenons sur les deux parties de la problématique. Les observations montrent un écart de +1,69 °C entre les maximales moyennes d’été des deux périodes. La moyenne annuelle des journées à 30 °C ou plus passe de 7,33 à 14,50 jours. Ces chiffres viennent des mêmes fonctions que V3 et V4 ; nous ne les ressaisissons pas dans le composant.

La carte apporte un autre regard en situant les types d’espaces. Elle peut aider à préparer des diagnostics, mais elle ne donne pas la température des quartiers. Pour aller plus loin, il faudrait des mesures locales et une étude des usages.

Nous rappelons donc quatre limites : une seule station, des classes LCZ sans relevés de température, des projections incertaines et des références différentes. Nous ne tirons pas de conclusion sanitaire ou de lien de causalité entre le bâti et les valeurs de la station.

## Refaire les vérifications

```sh
npm run build
npm test
npm run audit:build
npm run audit:browser
node scripts/verify-climadiag.mjs artifacts/audit/climadiag-official.json
```

La dernière commande utilise une réponse officielle sauvegardée localement, hors du suivi Git. Le [notebook](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16) garde l’exploration et le journal IA ; le [service Climadiag](https://meteofrance.com/climadiag-commune) donne accès à la source.
