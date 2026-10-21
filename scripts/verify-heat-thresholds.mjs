import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HEAT_THRESHOLDS, expectedYearDays, prepareThresholdData, getThresholdModel } from "../src/lib/charts/heatThresholds.js";

export function aggregateHeatThresholds(csv) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim() && !line.trimStart().startsWith("#"));
  if (lines.shift()?.trim() !== "AAAAMMJJ;VALEUR;Q_SQR") throw new Error("V4 : CSV quotidien SQR attendu.");
  const years = new Map(), dates = new Set();
  for (const line of lines) {
    const [date, raw, quality] = line.split(";").map(value => value.trim());
    const value = raw === "" ? null : Number(raw);
    if (Number(quality) !== 1 || !Number.isFinite(value) || !/^\d{8}$/.test(date)) continue;
    const year = Number(date.slice(0, 4)), month = Number(date.slice(4, 6)), day = Number(date.slice(6, 8));
    if (year < 1959 || year > 2022) continue;
    if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10).replaceAll("-", "") !== date) throw new Error("V4 : date invalide.");
    if (dates.has(date)) throw new Error("V4 : date dupliquée.");
    dates.add(date);
    const row = years.get(year) ?? { annee: year, joursValides: 0, jours25: 0, jours30: 0, jours35: 0 };
    row.joursValides++;
    for (const threshold of HEAT_THRESHOLDS) if (value >= threshold) row[`jours${threshold}`]++;
    years.set(year, row);
  }
  const all = [...years.values()].sort((a, b) => a.annee - b.annee);
  return { data: prepareThresholdData(all), excluded: all.filter(row => row.joursValides !== expectedYearDays(row.annee)).map(row => row.annee) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error("Usage : node scripts/verify-heat-thresholds.mjs <CSV SQR local>");
  const result = aggregateHeatThresholds(readFileSync(process.argv[2], "utf8"));
  const expected = prepareThresholdData(JSON.parse(readFileSync(new URL("../src/assets/chaleur_annuelle.json", import.meta.url), "utf8")));
  if (JSON.stringify(result.data) !== JSON.stringify(expected)) throw new Error("V4 : divergence entre CSV et JSON préparé.");
  console.log(`${result.data.length} années, ${result.data.reduce((sum, row) => sum + row.joursValides, 0)} observations ; tous les effectifs annuels sont identiques au CSV.`);
  for (const threshold of HEAT_THRESHOLDS) {
    const model = getThresholdModel(result.data, threshold);
    console.log(`${model.title}. Moyennes : ${model.meanFirst.toFixed(2)} et ${model.meanRecent.toFixed(2)} jours/an.`);
  }
}
