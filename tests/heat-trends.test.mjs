import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { aggregateSummerTrends } from "../scripts/verify-heat-trends.mjs";
import { prepareHeatTrendSeries, summarizeHeatTrends, createHeatTrends } from "../src/lib/charts/heatTrends.js";
const json = name => JSON.parse(readFileSync(new URL(`../src/assets/${name}`, import.meta.url), "utf8"));
const annual = json("chaleur_annuelle.json"), observations = json("SQR_MTX325056001.json");
const csv = rows => "AAAAMMJJ;VALEUR;Q_SQR\n" + rows.map(row => `${row.AAAAMMJJ};${row.VALEUR ?? ""};${row.Q_SQR}`).join("\n");

test("V3 reproduit les 64 moyennes estivales du JSON existant", () => {
  const { series, excluded } = aggregateSummerTrends(csv(observations));
  const stored = prepareHeatTrendSeries(annual);
  assert.deepEqual(excluded, []);
  assert.deepEqual(series.map(row => ({ ...row, maximaleMoyenne: Number(row.maximaleMoyenne.toFixed(4)) })), stored);
  assert.deepEqual(series.map(row => row.annee), Array.from({ length: 64 }, (_, i) => 1959 + i));
  assert.equal(series.reduce((sum, row) => sum + row.joursValides, 0), 5888);
  const result = summarizeHeatTrends(series);
  assert.equal(result.meanFirst.toFixed(2), "23.27");
  assert.equal(result.meanRecent.toFixed(2), "24.96");
  assert.equal(result.difference.toFixed(2), "1.69");
  assert.equal(result.record.annee, 2003);
  assert.equal(result.record.maximaleMoyenne.toFixed(2), "29.47");
});

test("un été incomplet est exclu, une absence en hiver ne change pas V3", () => {
  const incomplete = aggregateSummerTrends(csv(observations.filter(row => row.AAAAMMJJ !== "19800601")));
  assert.deepEqual(incomplete.excluded, [1980]);
  assert.equal(incomplete.series.length, 63);
  assert.throws(() => summarizeHeatTrends(incomplete.series), /30 étés/);
  const winter = aggregateSummerTrends(csv(observations.filter(row => row.AAAAMMJJ !== "19800101")));
  assert.equal(winter.series.length, 64);
  assert.deepEqual(winter.series, aggregateSummerTrends(csv(observations)).series);
});

test("les températures manquantes et de mauvaise qualité ne deviennent pas zéro", () => {
  for (const replacement of [{ VALEUR: null }, { Q_SQR: 0 }]) {
    const rows = observations.map(row => row.AAAAMMJJ === "19800601" ? { ...row, ...replacement } : row);
    assert.deepEqual(aggregateSummerTrends(csv(rows)).excluded, [1980]);
  }
  assert.throws(() => aggregateSummerTrends(csv([...observations, observations[0]])), /doublon/);
});

test("les courbes gardent 64 points et l’annotation du maximum, sans modifier les données", () => {
  const dom = new JSDOM("");
  const series = Object.freeze(prepareHeatTrendSeries(annual).map(row => Object.freeze(row)));
  try {
    for (const compact of [false, true]) {
      const svg = createHeatTrends(series, { document: dom.window.document, compact });
      assert.equal(svg.querySelectorAll('g[aria-label="dot"] circle').length, 65);
      assert.equal(svg.querySelectorAll('g[aria-label="line"] path').length, 1);
      assert.match(svg.textContent, /2003/);
      assert.equal(svg.querySelectorAll("script").length, 0);
    }
    assert.throws(() => prepareHeatTrendSeries([...annual, annual[0]]), /dupliquées/);
  } finally { dom.window.close(); }
});
