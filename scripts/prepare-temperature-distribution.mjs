import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// Le CSV original reste à l'emplacement local fourni en argument, hors du site.
export function prepareTemperatureDistribution(csv) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/)
    .filter(line => line.trim() && !line.trimStart().startsWith("#"));
  if (lines.shift()?.trim() !== "AAAAMMJJ;VALEUR;Q_SQR") {
    throw new Error("Le fichier attendu est la série quotidienne SQR des maximales.");
  }
  const dates = new Set();
  const years = new Map();
  const summer = [];
  for (const line of lines) {
    const [date, raw, quality] = line.split(";").map(value => value.trim());
    const value = raw === "" ? null : Number(raw);
    if (Number(quality) !== 1 || !Number.isFinite(value) || !/^\d{8}$/.test(date)) continue;
    const year = Number(date.slice(0, 4));
    if (year < 1959 || year > 2022) continue;
    const month = Number(date.slice(4, 6));
    const day = Number(date.slice(6, 8));
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.toISOString().slice(0, 10).replaceAll("-", "") !== date) throw new Error(`Date invalide : ${date}`);
    if (dates.has(date)) throw new Error(`Doublon : ${date}`);
    dates.add(date);
    years.set(year, (years.get(year) ?? 0) + 1);
    if (month >= 6 && month <= 8) summer.push(value);
  }
  // Le code V1 utilise quotidien directement ; la fiche annonce des années complètes.
  // Vérifier cette condition au lieu d'écarter silencieusement d'autres années.
  for (let year = 1959; year <= 2022; year++) {
    const expected = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    if (years.get(year) !== expected) throw new Error(`Année ${year} incomplète : contrôler le notebook avant export.`);
  }
  if (!summer.length) throw new Error("Aucune observation estivale.");
  const min = Math.floor(Math.min(...summer) / 2) * 2;
  const max = Math.floor(Math.max(...summer) / 2) * 2 + 2;
  const bins = Array.from({ length: (max - min) / 2 }, (_, i) => ({
    debut_c: min + i * 2, fin_c: min + (i + 1) * 2, nombre_jours: 0,
  }));
  for (const temperature of summer) bins[Math.floor((temperature - min) / 2)].nombre_jours++;
  return {
    bins,
    metadata: {
      source: "Météo-France — SQR des températures maximales quotidiennes",
      source_file: "SQR_MTX325056001.csv",
      source_sha256: createHash("sha256").update(csv).digest("hex"),
      source_url: "https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference",
      station: "25056001",
      commune: "Besançon",
      periode: { debut: 1959, fin: 2022 },
      mois: [6, 7, 8],
      qualite: { champ: "Q_SQR", valeur: 1 },
      annees_completes: years.size,
      observations_quotidiennes_valides: dates.size,
      total_jours: summer.length,
      jours_au_moins_30: summer.filter(value => value >= 30).length,
      largeur_classe_c: 2,
      unite: "nombre de journées",
      convention_classes: "Borne inférieure incluse, borne supérieure exclue.",
      denominateur: "Toutes les journées de juin à août retenues de 1959 à 2022 ; une journée compte une fois, sans pondération par la population.",
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2];
  if (!source) throw new Error("Usage : node scripts/prepare-temperature-distribution.mjs <CSV local hors du dépôt>");
  const { bins, metadata } = prepareTemperatureDistribution(readFileSync(source, "utf8"));
  const dataFile = new URL("../src/assets/distribution_ete.json", import.meta.url);
  const existing = JSON.parse(readFileSync(dataFile, "utf8"));
  if (JSON.stringify(bins) !== JSON.stringify(existing)) {
    throw new Error("Les classes diffèrent du JSON existant : export arrêté, comparaison avec Observable nécessaire.");
  }
  writeFileSync(new URL("../src/assets/distribution_ete.metadata.json", import.meta.url), JSON.stringify(metadata, null, 2) + "\n");
  console.log(`${bins.length} classes identiques au JSON existant ; ${metadata.total_jours} journées ; ${metadata.jours_au_moins_30} à 30 °C ou plus.`);
}
