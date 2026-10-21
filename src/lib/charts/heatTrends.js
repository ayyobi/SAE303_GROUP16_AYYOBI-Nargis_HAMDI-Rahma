import * as Plot from "@observablehq/plot";

export const formatHeat = value => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function prepareHeatTrendSeries(rows) {
  const series = rows.filter(row => row.annee >= 1959 && row.annee <= 2022 && row.joursEteValides === 92 && Number.isFinite(row.maximaleMoyenneEte))
    .map(row => ({ annee: row.annee, joursValides: row.joursEteValides, maximaleMoyenne: row.maximaleMoyenneEte }))
    .sort((a, b) => a.annee - b.annee);
  if (!series.length || new Set(series.map(row => row.annee)).size !== series.length || series.some(row => !Number.isInteger(row.annee))) throw new Error("V3 : années invalides ou dupliquées.");
  return series;
}

export function summarizeHeatTrends(series) {
  const first = series.filter(row => row.annee >= 1961 && row.annee <= 1990);
  const recent = series.filter(row => row.annee >= 1991 && row.annee <= 2020);
  if (first.length !== 30 || recent.length !== 30) throw new Error("V3 : deux périodes de 30 étés complets sont nécessaires.");
  const mean = rows => rows.reduce((sum, row) => sum + row.maximaleMoyenne, 0) / rows.length;
  const meanFirst = mean(first);
  const meanRecent = mean(recent);
  const record = series.reduce((best, row) => row.maximaleMoyenne > best.maximaleMoyenne ? row : best);
  return { meanFirst, meanRecent, difference: meanRecent - meanFirst, record };
}

export function createHeatTrends(data, { document, compact = false, width = compact ? 320 : 900 } = {}) {
  const series = [...data].sort((a, b) => a.annee - b.annee);
  const { record } = summarizeHeatTrends(series);
  const low = Math.floor(Math.min(...series.map(row => row.maximaleMoyenne))) - 1;
  const high = Math.ceil(Math.max(...series.map(row => row.maximaleMoyenne))) + 1;
  return Plot.plot({
    document, width, height: compact ? 360 : 440,
    marginLeft: compact ? 40 : 60, marginRight: compact ? 16 : 30, marginTop: 32, marginBottom: 42,
    style: { background: "transparent", color: "#392C25", fontFamily: '"Open Sans", Arial, sans-serif', fontSize: "14px" },
    x: { domain: [1959, 2022], ticks: compact ? [1960, 1980, 2000, 2020] : [1960, 1970, 1980, 1990, 2000, 2010, 2020], tickFormat: String, label: null },
    y: { domain: [low, high], ticks: compact ? 5 : 6, tickFormat: value => String(value), label: null, grid: true },
    marks: [
      Plot.line(series, { x: "annee", y: "maximaleMoyenne", stroke: "#B45B36", strokeWidth: 2.5 }),
      Plot.dot(series, { x: "annee", y: "maximaleMoyenne", fill: "#B45B36", r: compact ? 2.2 : 3 }),
      Plot.dot([record], { x: "annee", y: "maximaleMoyenne", fill: "#842F32", stroke: "#FAF7F0", strokeWidth: 1, r: 6 }),
      Plot.text([record], { x: "annee", y: "maximaleMoyenne", text: row => `${row.annee} : ${formatHeat(row.maximaleMoyenne)} °C`, dy: -16, dx: compact ? -10 : 0, fontWeight: "bold", fill: "#842F32" }),
    ],
  });
}
