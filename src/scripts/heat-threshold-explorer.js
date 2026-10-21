import { getThresholdModel, prepareThresholdData, formatThresholdMean } from "../lib/charts/heatThresholds.js";

export function mountHeatThresholdExplorer(root) {
  const frame = root.querySelector("[data-threshold-chart]");
  const status = root.querySelector("[data-threshold-status]");
  const controls = root.querySelector("fieldset");
  const retry = root.querySelector("[data-threshold-retry]");
  let data, createChart, loading = false, renderedWidth = 0, resizeFrame;

  function render() {
    if (!data || !createChart) return;
    const threshold = Number(root.querySelector("input:checked").value);
    const model = getThresholdModel(data, threshold);
    const width = Math.max(240, Math.min(900, Math.floor(frame.getBoundingClientRect().width)));
    const svg = createChart(model, { width });
    frame.replaceChildren(svg);
    root.querySelector("[data-threshold-title]").textContent = model.title;
    root.querySelector("[data-threshold-subtitle]").textContent = `Besançon, ${model.points[0].annee}–${model.points.at(-1).annee} · journées par année civile complète`;
    root.querySelector("[data-threshold-y-label]").textContent = `Journées à ${threshold} °C ou plus`;
    const summary = root.querySelector("[data-threshold-summary]");
    if (summary.textContent !== model.summary) summary.textContent = model.summary;
    root.querySelector("[data-threshold-bar-key]").style.setProperty("--threshold-color", model.color);
    root.querySelector("[data-threshold-table-title]").textContent = `Journées à ${threshold} °C ou plus`;
    const rows = model.points.map(point => {
      const row = document.createElement("tr"), year = document.createElement("th");
      year.scope = "row";
      year.textContent = point.annee;
      row.append(year);
      for (const value of [point.jours, point.joursValides, point.moyenne10 === null ? "Non disponible" : formatThresholdMean(point.moyenne10)]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      return row;
    });
    root.querySelector("tbody").replaceChildren(...rows);
    renderedWidth = width;
    root.dataset.thresholdState = "ready";
  }

  async function load() {
    if (loading || data && createChart) return;
    loading = true;
    frame.setAttribute("aria-busy", "true");
    retry.hidden = true;
    status.textContent = "Chargement de l’explorateur…";
    try {
      const [response, module] = await Promise.all([
        fetch(root.dataset.url, { signal: AbortSignal.timeout(20000) }),
        import("../lib/charts/heatThresholdPlot.js"),
      ]);
      if (!response.ok) throw new Error("Données V4 indisponibles.");
      const payload = await response.json();
      data = prepareThresholdData(payload.data);
      createChart = module.createHeatThresholdPlot;
      render();
      controls.disabled = false;
      status.textContent = "Explorateur chargé. Choisissez 25, 30 ou 35 °C ; le graphique et le tableau se mettent à jour.";
    } catch (error) {
      data = undefined;
      createChart = undefined;
      root.dataset.thresholdState = "error";
      controls.disabled = true;
      status.textContent = "L’explorateur ne peut pas être chargé. Les effectifs à 30 °C restent disponibles dans le tableau ci-dessous.";
      retry.hidden = false;
      console.error("Chargement V4 :", error);
    } finally { loading = false; frame.setAttribute("aria-busy", "false"); }
  }
  controls.addEventListener("change", render);
  retry.addEventListener("click", load);
  new ResizeObserver(() => {
    const width = Math.max(240, Math.min(900, Math.floor(frame.getBoundingClientRect().width)));
    if (width !== renderedWidth) {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(render);
    }
  }).observe(frame);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
    }, { rootMargin: "800px" });
    observer.observe(root);
  } else load();
}
