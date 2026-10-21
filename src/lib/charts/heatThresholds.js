export const HEAT_THRESHOLDS = [25, 30, 35];
export const THRESHOLD_COLORS = { 25: "#AA6A24", 30: "#B45332", 35: "#AC403A" };
export const formatThresholdMean = value => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
export const expectedYearDays = year => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;

export function prepareThresholdData(rows) {
  const selected = rows.filter(row => Number.isInteger(row.annee) && row.annee >= 1959 && row.annee <= 2022 && row.joursValides === expectedYearDays(row.annee))
    .map(({ annee, joursValides, jours25, jours30, jours35 }) => ({ annee, joursValides, jours25, jours30, jours35 }))
    .sort((a, b) => a.annee - b.annee);
  if (!selected.length || new Set(selected.map(row => row.annee)).size !== selected.length) throw new Error("V4 : années absentes ou dupliquées.");
  for (const row of selected) {
    if (HEAT_THRESHOLDS.some(t => !Number.isInteger(row[`jours${t}`]) || row[`jours${t}`] < 0 || row[`jours${t}`] > row.joursValides) || row.jours35 > row.jours30 || row.jours30 > row.jours25) throw new Error("V4 : effectifs invalides.");
  }
  return selected;
}

export function getThresholdModel(data, threshold = 30) {
  if (!HEAT_THRESHOLDS.includes(threshold)) throw new Error("Choisissez un seuil de 25, 30 ou 35 °C.");
  const series = prepareThresholdData(data);
  const field = `jours${threshold}`;
  const byYear = new Map(series.map(row => [row.annee, row[field]]));
  const points = series.map(row => {
    const window = Array.from({ length: 10 }, (_, i) => byYear.get(row.annee - 9 + i));
    return { annee: row.annee, jours: row[field], joursValides: row.joursValides, moyenne10: window.every(Number.isFinite) ? window.reduce((sum, value) => sum + value, 0) / 10 : null };
  });
  const record = points.reduce((best, point) => point.jours > best.jours ? point : best);
  const meanPeriod = (start, end) => {
    const period = points.filter(point => point.annee >= start && point.annee <= end);
    return period.length === end - start + 1 ? period.reduce((sum, point) => sum + point.jours, 0) / period.length : null;
  };
  const meanFirst = meanPeriod(1961, 1990), meanRecent = meanPeriod(1991, 2020);
  const title = `Jusqu’à ${record.jours} journées à ${threshold} °C ou plus en ${record.annee}`;
  const comparison = meanFirst !== null && meanRecent !== null ? `La moyenne annuelle passe de ${formatThresholdMean(meanFirst)} jours sur 1961–1990 à ${formatThresholdMean(meanRecent)} jours sur 1991–2020 ; chaque période compte 30 années complètes.` : "Les données disponibles ne permettent pas de comparer deux périodes de 30 années complètes.";
  const summary = `Pour le seuil de ${threshold} °C inclus, les barres comptent les journées sur l’année civile entière, de ${points[0].annee} à ${points.at(-1).annee}. Le maximum de cette série est de ${record.jours} journées en ${record.annee}. ${comparison}`;
  return { threshold, points, record, meanFirst, meanRecent, title, summary, color: THRESHOLD_COLORS[threshold] };
}
