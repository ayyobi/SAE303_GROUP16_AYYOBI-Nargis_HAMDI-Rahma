import assert from "node:assert/strict";
import fs from "node:fs";

// La réponse de la commune est sauvegardée localement depuis le service officiel,
// hors du suivi Git. Le deuxième groupe correspond à l'horizon TRACC 2050.
if (!process.argv[2]) throw new Error("Usage : node scripts/verify-climadiag.mjs <réponse JSON officielle de Besançon>");
const official = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const local = JSON.parse(fs.readFileSync("src/assets/climadiag_2050.json", "utf8"));
assert.equal(official.identifiant_insee, local.source.codeCommune);
for (const [id, key] of [["S1", "joursTresChauds"], ["S2", "nuitsChaudes"]]) {
  const value = official.indicateurs.find(indicator => indicator.id === id).data[1][0];
  for (const [source, target] of [["ref", "reference"], ["mean", "mediane"], ["min", "basse"], ["max", "haute"]]) {
    assert.equal(local.indicateurs[key][target], Math.round(value[source]), `${id} ${target}`);
  }
  console.log(id, key, "quatre valeurs officielles arrondies conformes", value);
}
