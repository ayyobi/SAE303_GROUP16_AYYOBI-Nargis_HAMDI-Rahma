import * as Plot from "@observablehq/plot";
import { namePlotGroups } from "./plotAccessibility.js";

export function createHeatThresholdPlot(model, { document = globalThis.document, width = 900 } = {}) {
  const { points, threshold, record, color, title, summary } = model;
  const compact = width < 600;
  const span = points.at(-1).annee - points[0].annee;
  const step = span > 40 ? (compact ? 20 : 10) : span > 15 ? (compact ? 10 : 5) : (compact ? 5 : 2);
  let ticks = points.map(point => point.annee).filter(year => year % step === 0);
  if (!ticks.length) ticks = [points[0].annee];
  const position = (record.annee - points[0].annee) / (span || 1);
  const chart = Plot.plot({
    document, width, height: compact ? 360 : 440,
    marginTop: 38, marginLeft: compact ? 38 : 58, marginRight: 16, marginBottom: 40,
    ariaLabel: title,
    ariaDescription: `${summary} La courbe sombre indique la moyenne des dix années civiles précédentes, année courante comprise. Elle est absente tant que dix années consécutives ne sont pas disponibles.`,
    style: { background: "transparent", color: "#392C25", fontFamily: '"Open Sans", Arial, sans-serif', fontSize: "14px" },
    x: { domain: points.map(point => point.annee), ticks, tickFormat: String, label: null },
    y: { domain: [0, Math.ceil(record.jours * 1.15) + 2], grid: true, nice: true, ticks: compact ? 5 : 6, label: null },
    marks: [
      Plot.barY(points, { x: "annee", y: "jours", fill: color, inset: compact ? .3 : .8 }),
      Plot.line(points, { x: "annee", y: point => point.moyenne10 ?? NaN, stroke: "#FAF7F0", strokeWidth: 5 }),
      Plot.line(points, { x: "annee", y: point => point.moyenne10 ?? NaN, stroke: "#6B302C", strokeWidth: 3 }),
      Plot.dot([record], { x: "annee", y: "jours", r: 4, fill: "#62251F" }),
      Plot.text([record], { x: "annee", y: "jours", text: point => `${point.annee} : ${point.jours} j`, dy: -13, dx: position > .7 ? -4 : position < .3 ? 4 : 0, textAnchor: position > .7 ? "end" : position < .3 ? "start" : "middle", fontWeight: "bold", fill: "#62251F" }),
      Plot.ruleY([0]),
    ],
  });
  chart.setAttribute("role", "img");
  return namePlotGroups(chart);
}
