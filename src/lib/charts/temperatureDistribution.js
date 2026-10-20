import * as Plot from "@observablehq/plot";

/** Fonction autonome : reçoit des classes préfiltrées et un document DOM de rendu. */
export function createTemperatureDistribution(data, { document, width = 900, compact = false, ...options } = {}) {
  if (!Array.isArray(data) || !data.length) throw new Error("V1 : aucune classe à afficher.");
  data.forEach((bin, index) => {
    if (!Number.isFinite(bin.debut_c) || bin.fin_c - bin.debut_c !== 2 ||
      !Number.isSafeInteger(bin.nombre_jours) || bin.nombre_jours < 0 ||
      (index > 0 && data[index - 1].fin_c !== bin.debut_c)) {
      throw new Error("V1 : classes contiguës de 2 °C et effectifs entiers attendus.");
    }
  });
  const min = data[0].debut_c;
  const max = data.at(-1).fin_c;
  const ticks = Array.from({ length: Math.floor((max - Math.ceil(min / 4) * 4) / 4) + 1 }, (_, i) => Math.ceil(min / 4) * 4 + i * 4);
  return Plot.plot({
    document,
    width,
    height: compact ? 350 : 440,
    marginTop: 32,
    marginRight: 20,
    marginLeft: compact ? 48 : 62,
    marginBottom: 52,
    style: { background: "transparent", color: "#392C25", fontFamily: '"DM Sans", Arial, sans-serif', fontSize: "14px" },
    x: { domain: [min, max], ticks, label: null, tickFormat: value => String(value) },
    y: { domain: [0, Math.ceil(Math.max(...data.map(bin => bin.nombre_jours)) * 1.08)], grid: true, label: null, ticks: compact ? 5 : 6, tickFormat: value => String(value) },
    marks: [
      Plot.rectY(data, {
        x1: "debut_c", x2: "fin_c", y: "nombre_jours",
        // Trois familles thermiques comme dans Observable, distinctes de la charte.
        fill: bin => bin.debut_c >= 30 ? "#A9362A" : bin.debut_c >= 24 ? "#B66B39" : "#88786D",
        inset: 1,
      }),
      Plot.ruleX([30], { stroke: "#64251E", strokeWidth: 2, strokeDasharray: "5,4" }),
      Plot.text([{ temperature: 30, label: "30 °C" }], { x: "temperature", y: Math.ceil(Math.max(...data.map(bin => bin.nombre_jours)) * 1.08), text: "label", dy: -14, fill: "#64251E", fontWeight: 700 }),
      Plot.ruleY([0]),
    ],
    ...options,
  });
}
