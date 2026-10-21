import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LCZ_FAMILIES, LCZ_MODES, validateLCZ, selectLCZ, summarizeLCZ, describeLCZ } from "../src/lib/maps/lcz.js";
const data = JSON.parse(readFileSync(new URL("../src/assets/besancon_lcz_coeur_8km.geojson", import.meta.url), "utf8"));

test("le GeoJSON dérivé contient les 14 classes exactes, des anneaux fermés et les 1961 polygones sources", () => {
  assert.equal(validateLCZ(data), data);
  assert.deepEqual(data.features.map(f => f.properties.lcz), ["2", "3", "4", "5", "6", "8", "9", "A", "B", "C", "D", "E", "F", "G"]);
  assert.equal(data.features.reduce((sum, f) => sum + f.properties.polygones_source, 0), 1961);
  assert.equal(data.metadata.projection_export, "EPSG:4326");
  assert.equal(data.metadata.simplification_metres, 10);
  const walk = point => {
    if (typeof point[0] === "number") { assert.ok(point[0] > 5.9 && point[0] < 6.2); assert.ok(point[1] > 47.1 && point[1] < 47.4); }
    else point.forEach(walk);
  };
  data.features.forEach(f => walk(f.geometry.coordinates));
});

test("les filtres reprennent les classes et couleurs du notebook, sans modifier les données", () => {
  const before = JSON.stringify(data);
  assert.deepEqual(LCZ_FAMILIES.map(f => f.color), ["#B44D38", "#D89669", "#826D63", "#468052", "#C9B897", "#6B93A5"]);
  assert.equal(selectLCZ(data).length, 14);
  assert.deepEqual(selectLCZ(data, LCZ_MODES[1]).map(f => f.properties.lcz), ["2", "3", "4", "5", "6", "8", "9", "E"]);
  assert.deepEqual(selectLCZ(data, LCZ_MODES[2]).map(f => f.properties.lcz), ["A", "B", "C", "D", "G"]);
  for (const feature of data.features) assert.deepEqual(selectLCZ(data, LCZ_MODES[0], feature.properties.lcz), [feature]);
  assert.equal(selectLCZ(data, LCZ_MODES[2], "2").length, 0);
  assert.equal(JSON.stringify(data), before);
});

test("surfaces et dénominateur conservent les attributs Cerema au lieu de recalculer les géométries simplifiées", () => {
  assert.equal(summarizeLCZ(data).total, 64.0002);
  assert.equal(summarizeLCZ(data).percent, 100);
  assert.ok(Math.abs(summarizeLCZ(data, selectLCZ(data, LCZ_MODES[1])).area - 25.2906) < 1e-9);
  assert.ok(Math.abs(summarizeLCZ(data, selectLCZ(data, LCZ_MODES[2])).area - 38.2618) < 1e-9);
  assert.equal(summarizeLCZ(data, []).percent, 0);
  assert.match(describeLCZ(data.features[0].properties), /Immeubles compacts/);
});

test("une donnée ou une catégorie inconnue déclenche une erreur explicite", () => {
  assert.throws(() => validateLCZ({ type: "FeatureCollection", features: [] }), /vide/);
  const invalid = structuredClone(data);
  invalid.features[0].properties.famille = "Catégorie inventée";
  assert.throws(() => validateLCZ(invalid), /invalides/);
  const projected = structuredClone(data);
  projected.features[0].geometry.coordinates[0][0][0] = [700000, 6600000];
  assert.throws(() => validateLCZ(projected), /LCZ/);
  assert.throws(() => selectLCZ(data, "inconnu"), /inconnu/);
});
