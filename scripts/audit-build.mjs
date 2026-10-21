import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { JSDOM } from "jsdom";

const read = (file) => fs.readFileSync(file, "utf8");
const documents = new Map([
  [
    "/",
    new JSDOM(read("dist/index.html"), { url: "http://localhost/" }).window
      .document,
  ],
  [
    "/methode",
    new JSDOM(read("dist/methode/index.html"), {
      url: "http://localhost/methode",
    }).window.document,
  ],
]);
for (const [route, document] of documents) {
  assert.equal(document.documentElement.lang, "fr");
  assert.equal(document.querySelectorAll("h1").length, 1);
  assert.equal(document.querySelectorAll("main").length, 1);
  assert.ok(document.title.includes("Besançon"));
  assert.ok(document.querySelector('meta[name="description"]').content);
  assert.equal(
    document.querySelector('link[rel="canonical"]'),
    null,
    "Domaine de production encore inconnu.",
  );
  const ids = [...document.querySelectorAll("[id]")].map(
    (element) => element.id,
  );
  assert.equal(
    ids.length,
    new Set(ids).size,
    route + " : identifiants uniques",
  );
  for (const element of document.querySelectorAll(
    "[aria-labelledby], [aria-describedby]",
  )) {
    for (const attribute of ["aria-labelledby", "aria-describedby"]) {
      for (const id of element.getAttribute(attribute)?.split(/\s+/) ?? [])
        assert.ok(
          document.getElementById(id),
          `${route}: référence ARIA ${id}`,
        );
    }
  }
  for (const anchor of document.querySelectorAll("a[href]")) {
    const url = new URL(anchor.href);
    if (url.origin !== "http://localhost") continue;
    if (url.hash) {
      const target = documents.get(url.pathname.replace(/\/$/, "") || "/");
      assert.ok(target?.getElementById(url.hash.slice(1)), anchor.href);
    } else {
      const file = path.join("dist", url.pathname);
      assert.ok(
        fs.existsSync(file) || fs.existsSync(path.join(file, "index.html")),
        anchor.href,
      );
    }
  }
  for (const group of document.querySelectorAll("svg g[aria-label]"))
    assert.ok(group.hasAttribute("role"), group.outerHTML.slice(0, 80));
  console.log(
    `${route}: structure, noms accessibles, ancres et liens internes vérifiés`,
  );
}

const home = documents.get("/");
const sections = [
  "comprendre",
  "distribution",
  "ville",
  "evolution",
  "explorer",
  "horizon-2050",
  "adaptation",
  "conclusion",
];
const order = [...home.querySelectorAll("section[id]")].map(
  (section) => section.id,
);
for (let index = 1; index < sections.length; index++)
  assert.ok(
    order.indexOf(sections[index]) > order.indexOf(sections[index - 1]),
  );
const method = documents.get("/methode");
assert.equal(method.querySelectorAll(".view-card").length, 4);
for (const fiche of method.querySelectorAll(".view-card"))
  assert.equal(fiche.querySelectorAll("dt").length, 6);
assert.equal(method.querySelectorAll("a[download]").length, 4);
assert.equal(home.querySelectorAll(".projection-card").length, 2);

// Comparer les exports publics aux données effectivement utilisées, pas à une copie attendue.
const json = (file) => JSON.parse(read(file));
const annual = json("src/assets/chaleur_annuelle.json");
assert.deepEqual(
  json("dist/telechargements/distribution.json").data,
  json("src/assets/distribution_ete.json"),
);
assert.deepEqual(
  json("dist/telechargements/evolution.json").data,
  annual.map((row) => ({
    annee: row.annee,
    joursValides: row.joursEteValides,
    maximaleMoyenne: row.maximaleMoyenneEte,
  })),
);
assert.deepEqual(
  json("dist/heat-thresholds.json").data,
  annual.map(({ annee, joursValides, jours25, jours30, jours35 }) => ({
    annee,
    joursValides,
    jours25,
    jours30,
    jours35,
  })),
);
const geojson = method
  .querySelector('a[download$=".geojson"]')
  .getAttribute("href");
assert.deepEqual(
  json(path.join("dist", geojson)),
  json("src/assets/besancon_lcz_coeur_8km.geojson"),
);

const files = fs
  .readdirSync("dist", { recursive: true })
  .filter((file) => fs.statSync(path.join("dist", file)).isFile());
assert.equal(
  files.some(
    (file) =>
      /\.(csv|gpkg|shp)$/i.test(file) ||
      /(?:SQR_MTX|SH_MTX|SH_MTN|penguins)/.test(file),
  ),
  false,
  "Seuls les dérivés utiles sont publiés.",
);
const rawTracked = execFileSync(
  "git",
  [
    "ls-files",
    "--",
    "*.csv",
    "*.shp",
    "*.gpkg",
    "*Observable*.html",
    "data-raw/*",
  ],
  { encoding: "utf8" },
);
assert.equal(rawTracked.trim(), "", "Aucun original brut suivi dans Git.");
for (const [, target] of read("README.md").matchAll(/\]\(([^)]+)\)/g)) {
  if (!/^(https?:|#|\/)/.test(target))
    assert.ok(fs.existsSync(target.split("#")[0]), "Lien README : " + target);
}
console.log(
  "Ordre narratif, quatre fiches, quatre exports exacts, deux projections et absence de fichiers bruts vérifiés.",
);
