import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { prepareTemperatureDistribution } from "../scripts/prepare-temperature-distribution.mjs";
import { createTemperatureDistribution } from "../src/lib/charts/temperatureDistribution.js";

const readJson = name => JSON.parse(readFileSync(new URL(`../src/assets/${name}`, import.meta.url), "utf8"));
const bins = readJson("distribution_ete.json");
const metadata = readJson("distribution_ete.metadata.json");
const observations = readJson("SQR_MTX325056001.json");
const csv = records => "# Commentaire Météo-France\nAAAAMMJJ;VALEUR;Q_SQR\n" + records.map(row => `${row.AAAAMMJJ};${row.VALEUR ?? ""};${row.Q_SQR}`).join("\n");

test("les observations quotidiennes reproduisent exactement les classes déjà exportées", () => {
  const prepared = prepareTemperatureDistribution(csv(observations));
  assert.deepEqual(prepared.bins, bins);
  assert.equal(prepared.metadata.total_jours, 64 * 92);
  assert.equal(prepared.metadata.jours_au_moins_30, 682);
  assert.equal(prepared.metadata.observations_quotidiennes_valides, 23376);
  assert.equal(bins.reduce((sum, bin) => sum + bin.nombre_jours, 0), metadata.total_jours);
  assert.equal(bins.length, 17);
});

test("les bornes sont incluses à gauche et les prolongements non retenus sont ignorés", () => {
  const rows = observations.map(row => ({ ...row, VALEUR: 30 }));
  rows.find(row => row.AAAAMMJJ === "19590601").VALEUR = 29.9;
  rows.find(row => row.AAAAMMJJ === "19590602").VALEUR = 32;
  const prepared = prepareTemperatureDistribution(csv(rows));
  assert.deepEqual(prepared.bins, [
    { debut_c: 28, fin_c: 30, nombre_jours: 1 },
    { debut_c: 30, fin_c: 32, nombre_jours: 5886 },
    { debut_c: 32, fin_c: 34, nombre_jours: 1 },
  ]);
  assert.equal(prepared.metadata.jours_au_moins_30, 5887);
});

test("une année incomplète ou une date dupliquée bloque l’export", () => {
  assert.throws(() => prepareTemperatureDistribution(csv(observations.filter(row => row.AAAAMMJJ !== "19590601"))), /incomplète/);
  assert.throws(() => prepareTemperatureDistribution(csv([...observations, observations[0]])), /Doublon/);
  const invalid = observations.map(row => row.AAAAMMJJ === "19590601" ? { ...row, Q_SQR: 0 } : row);
  assert.throws(() => prepareTemperatureDistribution(csv(invalid)), /incomplète/);
});

test("la fonction Plot rend les deux formats sans modifier les données", () => {
  const dom = new JSDOM("");
  const frozen = Object.freeze(bins.map(bin => Object.freeze({ ...bin })));
  try {
    for (const compact of [false, true]) {
      const svg = createTemperatureDistribution(frozen, { document: dom.window.document, compact, width: compact ? 320 : 900 });
      assert.equal(svg.tagName.toLowerCase(), "svg");
      assert.equal(svg.querySelectorAll('g[aria-label="rect"] rect').length, 17);
      assert.match(svg.outerHTML, /stroke-dasharray="5,4"/);
      assert.equal(svg.querySelectorAll("script").length, 0);
    }
    assert.throws(() => createTemperatureDistribution([], { document: dom.window.document }), /aucune classe/);
    assert.throws(() => createTemperatureDistribution([{ debut_c: 20, fin_c: 23, nombre_jours: 1 }], { document: dom.window.document }), /classes contiguës/);
  } finally { dom.window.close(); }
});
