import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { aggregateHeatThresholds } from "../scripts/verify-heat-thresholds.mjs";
import { HEAT_THRESHOLDS, getThresholdModel, prepareThresholdData } from "../src/lib/charts/heatThresholds.js";
import { createHeatThresholdPlot } from "../src/lib/charts/heatThresholdPlot.js";
const json = name => JSON.parse(readFileSync(new URL(`../src/assets/${name}`, import.meta.url), "utf8"));
const annual = json("chaleur_annuelle.json"), daily = json("SQR_MTX325056001.json");
const csv = rows => "AAAAMMJJ;VALEUR;Q_SQR\n" + rows.map(row => `${row.AAAAMMJJ};${row.VALEUR ?? ""};${row.Q_SQR}`).join("\n");

test("V4 : les 192 effectifs annuels correspondent aux relevés quotidiens", () => {
  const result = aggregateHeatThresholds(csv(daily));
  assert.deepEqual(result.data, prepareThresholdData(annual));
  assert.deepEqual(result.excluded, []);
  assert.equal(result.data.reduce((sum, row) => sum + row.joursValides, 0), 23376);
  assert.deepEqual(HEAT_THRESHOLDS, [25, 30, 35]);
  assert.equal(getThresholdModel(result.data).threshold, 30);
});

test("V4 : le seuil est inclus et les mois hors été sont comptés", () => {
  const rows = daily.map(row => ({ ...row, VALEUR: 0 }));
  for (const [date, value] of [["19590101", 25], ["19590102", 30], ["19590103", 35], ["19590104", 24.9]]) rows.find(row => row.AAAAMMJJ === date).VALEUR = value;
  const first = aggregateHeatThresholds(csv(rows)).data[0];
  assert.equal(first.jours25, 3);
  assert.equal(first.jours30, 2);
  assert.equal(first.jours35, 1);
});

test("V4 : une année incomplète est exclue et bloque dix années consécutives", () => {
  const missing = daily.map(row => row.AAAAMMJJ === "19800101" ? { ...row, VALEUR: null } : row);
  const result = aggregateHeatThresholds(csv(missing));
  assert.deepEqual(result.excluded, [1980]);
  const points = getThresholdModel(result.data, 30).points;
  assert.ok(points.filter(row => row.annee >= 1981 && row.annee <= 1989).every(row => row.moyenne10 === null));
  assert.ok(Number.isFinite(points.find(row => row.annee === 1990).moyenne10));
  const nine = annual.filter(row => row.annee >= 2005 && row.annee <= 2014 && row.annee !== 2009);
  assert.equal(getThresholdModel(nine, 30).points.length, 9);
  assert.ok(getThresholdModel(nine, 30).points.every(row => row.moyenne10 === null));
  assert.equal(getThresholdModel(nine, 30).meanFirst, null);
});

test("V4 : résumés vérifiés pour les trois seuils et premières moyennes glissantes", () => {
  const expected = [[25, 2018, 96, "42.60", "58.57"], [30, 2003, 39, "7.33", "14.50"], [35, 2003, 12, "0.23", "1.50"]];
  for (const [threshold, year, count, first, recent] of expected) {
    const model = getThresholdModel(annual, threshold);
    assert.equal(model.record.annee, year);
    assert.equal(model.record.jours, count);
    assert.equal(model.meanFirst.toFixed(2), first);
    assert.equal(model.meanRecent.toFixed(2), recent);
    assert.ok(model.points.slice(0, 9).every(row => row.moyenne10 === null));
    assert.equal(model.points[9].annee, 1968);
    assert.equal(model.points[9].moyenne10, model.points.slice(0, 10).reduce((sum, row) => sum + row.jours, 0) / 10);
  }
  assert.throws(() => getThresholdModel(annual, 32), /25, 30 ou 35/);
  assert.throws(() => prepareThresholdData([...annual, annual[0]]), /dupliquées/);
});

test("V4 : chaque seuil produit 64 barres, une description et un SVG remplaçable", () => {
  const dom = new JSDOM("<div id='chart'></div>");
  const before = JSON.stringify(annual);
  try {
    const frame = dom.window.document.querySelector("#chart");
    for (const threshold of [30, 25, 35, 30]) {
      const model = getThresholdModel(annual, threshold);
      for (const width of [280, 900]) {
        const svg = createHeatThresholdPlot(model, { document: dom.window.document, width });
        frame.replaceChildren(svg);
        assert.equal(frame.querySelectorAll("svg").length, 1);
        assert.equal(svg.querySelectorAll('g[aria-label="bar"] rect').length, 64);
        assert.equal(svg.getAttribute("role"), "img");
        assert.match(svg.getAttribute("aria-label"), new RegExp(`${threshold} °C`));
        assert.ok(svg.getAttribute("aria-description")?.includes("dix années"));
      }
    }
    assert.equal(JSON.stringify(annual), before);
  } finally { dom.window.close(); }
});
