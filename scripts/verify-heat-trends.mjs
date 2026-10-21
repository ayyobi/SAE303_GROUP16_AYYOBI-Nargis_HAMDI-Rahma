import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { prepareHeatTrendSeries, summarizeHeatTrends } from "../src/lib/charts/heatTrends.js";

export function aggregateSummerTrends(csv) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim() && !line.trimStart().startsWith("#"));
  if (lines.shift()?.trim() !== "AAAAMMJJ;VALEUR;Q_SQR") throw new Error("V3 : CSV SQR quotidien attendu.");
  const dates = new Set(), summers = new Map();
  for (const line of lines) {
    const [date, raw, quality] = line.split(";").map(value => value.trim());
    const value = raw === "" ? null : Number(raw);
    if (Number(quality) !== 1 || !Number.isFinite(value) || !/^\d{8}$/.test(date)) continue;
    const year = Number(date.slice(0, 4)), month = Number(date.slice(4, 6)), day = Number(date.slice(6, 8));
    if (year < 1959 || year > 2022) continue;
    if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10).replaceAll("-", "") !== date) throw new Error(`V3 : date invalide ${date}`);
    if (dates.has(date)) throw new Error(`V3 : doublon ${date}`);
    dates.add(date);
    if (month < 6 || month > 8) continue;
    const values = summers.get(year) ?? [];
    values.push(value);
    summers.set(year, values);
  }
  const all = [...summers].map(([annee, values]) => ({ annee, joursValides: values.length, maximaleMoyenne: values.reduce((sum, value) => sum + value, 0) / values.length })).sort((a, b) => a.annee - b.annee);
  return { series: all.filter(row => row.joursValides === 92 && Number.isFinite(row.maximaleMoyenne)), excluded: all.filter(row => row.joursValides !== 92).map(row => row.annee) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error("Usage : node scripts/verify-heat-trends.mjs <CSV SQR local>");
  const csv = readFileSync(process.argv[2], "utf8");
  const { series, excluded } = aggregateSummerTrends(csv);
  const stored = prepareHeatTrendSeries(JSON.parse(readFileSync(new URL("../src/assets/chaleur_annuelle.json", import.meta.url), "utf8")));
  if (series.length !== stored.length || series.some((row, i) => row.annee !== stored[i].annee || row.joursValides !== stored[i].joursValides || Number(row.maximaleMoyenne.toFixed(4)) !== stored[i].maximaleMoyenne)) throw new Error("V3 : le JSON existant diffère des calculs du CSV.");
  const exact = summarizeHeatTrends(series), fromJson = summarizeHeatTrends(stored);
  for (const key of ["meanFirst", "meanRecent", "difference"]) if (exact[key].toFixed(2) !== fromJson[key].toFixed(2)) throw new Error(`V3 : comparaison divergente pour ${key}`);
  if (exact.record.annee !== fromJson.record.annee || exact.record.maximaleMoyenne.toFixed(2) !== fromJson.record.maximaleMoyenne.toFixed(2)) throw new Error("V3 : maximum divergent.");
  const round = value => Number(value.toFixed(2));
  const metadata = {
    source: "Météo-France — SQR des températures maximales quotidiennes", source_file: "SQR_MTX325056001.csv", station: "25056001",
    source_url: "https://www.data.gouv.fr/datasets/donnees-changement-climatique-sqr-series-quotidiennes-de-reference",
    source_sha256: createHash("sha256").update(csv).digest("hex"),
    periode: [1959, 2022], mois: [6, 7, 8], qualite: { champ: "Q_SQR", valeur: 1 },
    indicateur: "Moyenne des températures maximales quotidiennes de juin à août", unite: "°C", jours_par_ete: 92,
    etes_retenus: series.length, etes_incomplets_exclus: excluded, observations: series.reduce((sum, row) => sum + row.joursValides, 0),
    precision_json_decimales: 4, precision_affichage_decimales: 2,
    comparaison: { periode_ancienne: [1961, 1990], periode_recente: [1991, 2020], etes_par_periode: 30, moyenne_ancienne: round(exact.meanFirst), moyenne_recente: round(exact.meanRecent), ecart: round(exact.difference) },
    maximum: { annee: exact.record.annee, maximale_moyenne: round(exact.record.maximaleMoyenne) },
  };
  writeFileSync(new URL("../src/assets/heat-trends.metadata.json", import.meta.url), JSON.stringify(metadata, null, 2) + "\n");
  console.log(JSON.stringify(metadata, null, 2));
}
