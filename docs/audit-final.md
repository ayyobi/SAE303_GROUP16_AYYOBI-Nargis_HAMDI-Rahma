# Étape 9 — Audit final du 21 octobre 2026

Le site compilé a été contrôlé localement, avec Open Sans et sans italique. Aucun déploiement, commit ou changement des résultats numériques n’a été effectué.

## Défauts constatés avant correction

| Constat | Preuve initiale | Correction |
| --- | --- | --- |
| Attributs ARIA interdits sur les groupes SVG Plot | Lighthouse : accueil à 97 en accessibilité ; axe `aria-prohibited-attr` sur V1, V3 et V4 | Rôle `group` ajouté aux groupes nommés, sans retirer leurs descriptions ni leurs marques |
| Encadrés Méthode disposés en colonnes et débordant intérieurement sur mobile | À 320 px, encadré large de 277 px pour un contenu de 346 px ; héritage global `display:flex` | Affichage en bloc limité à la page Méthode et retour à la ligne du texte |
| Infobulle cartographique hors de l’écran | À 320 px, bord droit à 338 px ; carte de x=25 à x=295 | Largeur adaptée au conteneur, recalcul au redimensionnement, marges de déplacement automatique |
| Fermeture d’infobulle annoncée en anglais | `aria-label="Close popup"` | Libellé français |
| Contraste insuffisant dans l’illustration d’accueil | Axe : texte chocolat sur le paysage vert, contraste 1,73 au lieu de 3 pour ce grand texte | Fond beige derrière le texte concerné ; illustration et palette conservées |
| Description du tableau LCZ inexacte sur la page Méthode | La fiche annonçait une colonne de pourcentage absente du tableau | Description alignée sur les colonnes réelles ; pourcentage annoncé au-dessus de la carte |
| Libellés Climadiag différents des définitions officielles | Application : S1 maximum > 35 °C ; S2 minimum ≥ 20 °C | Libellés corrigés dans le JSON et le récit, sans changer les huit valeurs ; différence avec V4 explicitée |
| Date du JSON présentée comme date du rapport | Aucun PDF original permettant d’établir sa date | Provenance de la date précisée, recoupement du 21 octobre daté ; page 7 attribuée au notebook |
| Lien absent sur la carte de source Climadiag | La fiche d’accueil n’avait pas de lien, contrairement aux deux autres sources | Lien vers le service officiel ajouté |
| Commande `npm run preview` en échec | L’adaptateur Netlify installé indique ne pas prendre en charge `astro preview` | Prévisualisation statique du build via le même serveur local que l’audit ; adaptateur de déploiement conservé |

Le titre de la définition du seuil historique est clarifié pour éviter de confondre notre seuil d’analyse à 30 °C avec la définition Climadiag des jours très chauds. Le récit conserve l’ordre Contexte → Exploration (V1/V2) → Révélation (V3/V4) → Conclusion et adaptation. Les deux parties de la problématique sont traitées dans la conclusion.

### Fichiers concernés

- `src/lib/charts/plotAccessibility.js` (créé) et les trois fonctions de rendu Plot : correction ARIA.
- `src/scripts/lcz-map.js` et `src/styles/global.css` : infobulles adaptatives, libellé français et contraste de l’illustration.
- `src/pages/methode.astro` : encadrés lisibles et documentation conforme aux contrôles.
- `src/components/Climate2050.astro`, `ClimateConclusion.astro`, `ClimateDefinitions.astro` et `DataSources.astro` : seuils, provenance, clarification et lien officiel.
- `src/assets/climadiag_2050.json` : deux libellés corrigés, aucun changement numérique.
- `scripts/audit-build.mjs`, `audit-site.mjs`, `verify-climadiag.mjs` (créés), `package.json` et `.gitignore` : contrôles reproductibles et rapports locaux ignorés.
- `README.md`, `docs/integration.md`, `docs/projections-conclusion.md`, ce rapport et `docs/audits/measurements.json` : documentation et preuves de mesure.

## Contrôle scientifique et sources

Les 17 tests recalculent les distributions, les 64 moyennes estivales, les 192 comptages par seuil, les couvertures et les moyennes mobiles à partir des données quotidiennes. Les tests LCZ vérifient classes, couleurs, géométries, filtres et surfaces. Le notebook HTML local a été relu : classes de 2 °C, qualité 1, été juin–août pour V1/V3, année entière pour V4, exclusion 2023–2024, fonctions autonomes et journal IA. La version portant le suffixe `(1)` n’est pas disponible.

La réponse officielle de l’application [Climadiag Besançon](https://climadiag.meteofrance.fr/entity/25056), commune 25056, a été consultée le 21 octobre 2026. L’application charge les données de `entities.jsonl` par requête HTTP Range (206) ; le deuxième groupe des indicateurs correspond à 2050. Ses ressources définissent `mean` comme valeur médiane et distinguent les trois horizons 2030, 2050, 2100. Les huit arrondis concordent :

| Indicateur officiel | Référence brute → affichée | Médiane brute → affichée | Basse brute → affichée | Haute brute → affichée |
| --- | --- | --- | --- | --- |
| S1, maximum > 35 °C, jours/an | 0,70 → 1 | 4,30 → 4 | 2,21 → 2 | 7,18 → 7 |
| S2, minimum ≥ 20 °C, nuits/an | 2,43 → 2 | 13,70 → 14 | 9,19 → 9 | 18,70 → 19 |

La réponse officielle reste dans `artifacts/audit/climadiag-official.json`, ignorée par Git. Le script `verify-climadiag.mjs` reproduit ce contrôle. Les seules modifications de `src/assets/` portent sur les deux libellés de seuil, aucun nombre. La référence Climadiag 1976–2005 reste distincte des périodes historiques 1961–1990 et 1991–2020. La date du 19 octobre est renseignée dans le JSON fourni ; elle n’établit pas la date du PDF original, qui n’a pas été relu.

| Source ou lien | Résultat du contrôle |
| --- | --- |
| [Météo-France SQR](https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference) | Fiche officielle accessible ; Licence Ouverte 2.0 indiquée |
| [Cerema LCZ 2022](https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d) | Redirection vers la fiche officielle actuelle ; Licence Ouverte 2.0 indiquée ; version précise de l’archive de l’extrait à vérifier |
| [Climadiag Commune](https://meteofrance.com/climadiag-commune) | Service et application communale accessibles ; huit arrondis et définitions vérifiés ; licence du rapport à vérifier |
| [Plan Climat 2024–2029](https://www.grandbesancon.fr/wp-content/uploads/sites/2/2025/03/PCAET-Mars-2025.pdf#page=19) | PDF officiel accessible ; actions 10–11, pages imprimées 36–37 ; licence à vérifier |
| [GitHub](https://github.com/ayyobi/SAE303_GROUP16_AYYOBI-Nargis_HAMDI-Rahma) | HTTP 200, dépôt public accessible |
| [Observable](https://observablehq.com/@mmi-montbeliard/sae-303-gr-16) | URL retrouvée dans l’export local ; HTTP 429 « Vercel Security Checkpoint » lors de la lecture directe ; version publiée et accès à vérifier dans un navigateur utilisateur |

Les quatre téléchargements compilés répondent HTTP 200. Leur contenu correspond exactement aux données des vues : 17 classes V1, 64 lignes V3, 64 lignes et trois seuils V4, GeoJSON V2 identique à celui de la carte. Ces fichiers suffisent à reproduire les vues avec les fonctions du dépôt. Ils ne permettent pas de refaire le traitement géographique amont ni de recalculer d’autres seuils à partir des observations brutes.

## Commandes et contrôles exécutés

```sh
npm run build
npm test
npm run audit:build
npm run audit:browser
node scripts/verify-climadiag.mjs artifacts/audit/climadiag-official.json
git diff --check
git ls-files -- '*.csv' '*.shp' '*.gpkg' '*Observable*.html' 'data-raw/*'
```

- Compilation Astro réussie et 17 tests réussis.
- Prévisualisation : `npm run preview` sert maintenant le build sur `http://127.0.0.1:4322` ; accueil, Méthode et téléchargements vérifiés en HTTP. Cette prévisualisation ne prétend pas émuler les fonctions Netlify.
- Audit du build : un H1 par page, langue française, titres et descriptions, identifiants uniques, références ARIA valides, ancres et liens internes, quatre fiches de six points, ordre narratif, exports exacts, favicon présent. Aucune URL canonique inventée.
- Chrome : largeurs **320, 375, 430, 768, 1024 et 1440 px**, sur les deux pages et les quatre vues. Aucun débordement de page, y compris tableaux ouverts ; les encadrés Méthode ne débordent plus intérieurement. Axes et annotations contrôlés ; un seul graphique V4 après chaque changement.
- Carte : 14 classes et couleurs du notebook, trois modes, classe précise, intersection vide, surfaces, clic et clavier, zoom, déplacement, remise à l’emprise initiale et infobulles contenues dans la carte après redimensionnement.
- V4 : seuil initial 30 °C ; sélections 25/30/35 répétées ; comparaison exacte des 64 valeurs pour chaque seuil ; flèches du clavier ; titre, récit, tableau et moyenne mobile actualisés sans navigation.
- Clavier : premier Tab sur le lien d’évitement, activation vers le contenu, menu mobile, Échap avec restitution du focus, sélection cartographique, boutons radio et ouverture des tableaux. Focus visible et préférence de réduction des animations contrôlés.
- Sans JavaScript : navigation mobile visible, SVG statiques présents, tableaux et téléchargements disponibles. V2/V4 nécessitent JavaScript pour leur interaction, ce qui est annoncé.
- Pannes simulées : échec du GeoJSON et du JSON V4, conservation des tableaux, message d’erreur puis réussite du bouton Réessayer. Les erreurs console de ces deux échecs intentionnels sont attendues ; aucune exception JavaScript non interceptée n’est relevée.
- Axe (règles WCAG A/AA 2.0, 2.1 et 2.2) : aucune violation détectée sur l’accueil avec les vues chargées ni sur Méthode, à 320 et 1440 px. Certaines vérifications de contraste sont signalées comme nécessitant un examen manuel ; elles ne sont pas comptées comme des réussites automatiques.
- Aucun CSV, SHP, GPKG ou export HTML brut suivi dans Git, ni publié dans `dist/`. Les conversions JSON complètes préexistantes restent dans `src/assets/` conformément à la demande initiale ; elles ne sont pas livrées au navigateur. Les rapports d’audit sont ignorés par Git.

## Lighthouse mesuré sur le build

Lighthouse **13.5.0**, Chrome **155.0.8059.85**, Windows, mesures du **21 octobre 2026** :

| Page | Profil | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | --- | --- | --- | --- | --- |
| Accueil | Mobile | 98 | 100 | 100 | 100 |
| Méthode | Mobile | 99 | 100 | 100 | 100 |
| Accueil | Ordinateur | 100 | 100 | 100 | 100 |
| Méthode | Ordinateur | 100 | 100 | 100 | 100 |

Les mesures et leurs métriques sont conservées dans [measurements.json](audits/measurements.json). Les quatre rapports complets HTML/JSON sont dans `artifacts/audit/lighthouse-*.report.*`, ainsi que les captures et `browser.json`. Les scores sont ceux d’une exécution par profil sur le dernier build ; les profils ont été exécutés simultanément sur le même ordinateur, donc la performance reste une mesure indicative. Le contrôle initial relevait 97 en accessibilité sur l’accueil et 100 sur Méthode ; le défaut ARIA a été corrigé.

Lighthouse est exécuté temporairement, sans dépendance de production ajoutée. Les mesures portent sur une prévisualisation HTTP locale du build, avec le chargement normal d’Open Sans, et ne préjugent pas de l’hébergement Netlify. Le rendu SVG au build et le chargement des vues interactives à l’approche de leurs sections sont conservés ; aucune optimisation d’architecture n’a été ajoutée sans défaut constaté.

Pour reproduire une mesure, démarrer `node scripts/audit-site.mjs --serve`, puis lancer dans un autre terminal :

```sh
npm exec --yes --package=lighthouse -- lighthouse http://127.0.0.1:4322/ --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=artifacts/audit/lighthouse-home-mobile
```

Remplacer `/` par `/methode` et ajouter `--preset=desktop` pour les autres profils. Les exécutions de cet audit utilisent Chrome headless avec `--chrome-flags="--headless --no-sandbox"`. L’outil Lighthouse et son axe sont temporaires, sans modification des dépendances du projet. Pour l’audit navigateur complet, définir `AXE_PATH` vers le fichier `axe.min.js` disponible localement ; sinon son omission est signalée dans `browser.json`.

Les scores automatisés ne constituent pas une certification WCAG. La lecture par un lecteur d’écran réel et les usages sur appareils physiques n’ont pas été évalués ; les tests mobiles utilisent l’émulation Chrome.

## Conformité SAE et preuves

| Exigence | Statut | Preuve |
| --- | --- | --- |
| Projet Astro et graphiques Observable Plot | Conforme | `package.json`, `src/lib/charts/` |
| Récit en quatre temps | Conforme | Ordre testé dans `audit-build.mjs`, transitions et conclusion relues |
| V1 : classes, période, effectifs, unités et dénominateur | Conforme | Tests V1, 17 classes et 5 888 journées, descriptions et tableau |
| V2 : véritables géométries, classes et filtres | Conforme pour l’extrait fourni | Tests LCZ, 14 classes, 1 961 polygones sources ; préparation amont à vérifier |
| V3 : années, moyennes et comparaisons | Conforme | 64 moyennes et deux périodes complètes contrôlées par les tests |
| V4 : seuils, comptages et mises à jour | Conforme | 192 comptages contrôlés, six largeurs et interaction clavier |
| Comparaison au notebook | Conforme pour l’export local disponible | Cellules relues et tests des calculs ; version `(1)` et publication à vérifier |
| Quatre fiches de six points | Conforme | `/methode#visualisations`, 24 champs testés |
| Méthodes A/B/C choisies et justifiées | Conforme | A pour V1/V3, B pour V2/V4 ; C non utilisée, tableau `/methode#export` |
| Fonction autonome recevant les données | Conforme | `createTemperatureDistribution`, `createHeatTrends`, `createHeatThresholdPlot` |
| Données publiques préfiltrées et dénominateurs conservés | Conforme | `audit-build.mjs`, téléchargements et tests de couverture |
| Arrondis pertinents | Conforme | Moyennes affichées à deux décimales, comptages entiers ; projections à l’unité conformément au notebook, explicitées |
| Aucun original brut suivi ou publié | Conforme au contrôle d’inventaire | `git ls-files` et inspection de `dist/` ; conversions JSON préexistantes conservées hors des exports publics |
| Page Méthode complète et téléchargements réels | Conforme | `/methode`, quatre réponses HTTP 200 et comparaison de contenu |
| Sources, dates, traitements et limites | Documentés, réserves explicites | Licences SQR/LCZ vérifiées ; PDF et licence Climadiag, licence PCAET et archive géographique à vérifier |
| Observations et projections séparées | Conforme | Sections distinctes ; périodes et seuils distincts ; huit valeurs officielles recoupées |
| Palette de données distincte de la charte | Conforme | Palettes V1/V3/V4 et six familles LCZ contrôlées ; libellés et tableaux complètent les couleurs |
| Responsive aux six largeurs imposées | Conforme aux tests | `artifacts/audit/browser.json` et captures |
| Accessibilité | Contrôles réalisés, conformité exhaustive non déclarée | Axe, Lighthouse, clavier, sans JavaScript et structure ; limites ci-dessus |
| SEO de base | Conforme aux contrôles | Titres, descriptions, français, favicon, aucune canonique sans domaine |
| Lien Observable actuel | À vérifier | URL locale connue mais lecture publique bloquée par HTTP 429 |
| README et liens vers le code | Conforme | Identités et URL conservées, remarques techniques, commandes, sources, méthodes et lien vers cet audit |

## Problèmes restant avant publication

1. Ouvrir le notebook publié depuis un navigateur utilisateur et confirmer sa visibilité ainsi que la correspondance avec la version remise ; l’export `(1)` reste introuvable localement.
2. Retrouver le PDF Climadiag original cité page 7 et confirmer les licences de ce rapport et du Plan Climat. Ces documents ne sont pas redistribués ; les chiffres Climadiag sont déjà recoupés avec l’application officielle.
3. Identifier l’archive Cerema exacte et le script de préparation de l’extrait si une reproduction du traitement géographique amont est exigée.

Aucun bug technique bloquant ne reste dans les scénarios exécutés. Le domaine et l’URL Netlify seront renseignés lors de l’étape dédiée au déploiement, qui n’a pas été commencée.
