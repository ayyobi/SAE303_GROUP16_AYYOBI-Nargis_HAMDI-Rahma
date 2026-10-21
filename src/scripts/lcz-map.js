import { LCZ_FAMILIES, LCZ_MODES, validateLCZ, selectLCZ, summarizeLCZ, formatLCZ, describeLCZ, LCZ_SOURCE } from "../lib/maps/lcz.js";

export function mountLCZMap(root) {
  const container = root.querySelector("[data-map]");
  const status = root.querySelector("[data-status]");
  const info = root.querySelector("[data-zone-info]");
  const mode = root.querySelector("[data-mode]");
  const category = root.querySelector("[data-category]");
  const retry = root.querySelector("[data-retry]");
  let loading = false;
  let loaded = false;

  async function load() {
    if (loading || loaded) return;
    loading = true;
    retry.hidden = true;
    status.textContent = "Chargement de la carte et des catégories…";
    let map;
    try {
      const [module, response, { createLambert93CRS }] = await Promise.all([
        import("leaflet"),
        fetch(root.dataset.geojson, { signal: AbortSignal.timeout(20000) }),
        import("../lib/maps/lambert93.js"),
      ]);
      if (!response.ok) throw new Error("GeoJSON indisponible");
      const data = validateLCZ(await response.json());
      const L = module.default ?? module;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map = L.map(container, { crs: createLambert93CRS(L), scrollWheelZoom: false, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced, inertia: !reduced, zoomSnap: 0, minZoom: -8, maxZoom: 2, attributionControl: true, zoomControl: false });
      L.control.zoom({ zoomInTitle: "Zoomer", zoomOutTitle: "Dézoomer" }).addTo(map);
      L.control.scale({ imperial: false }).addTo(map);
      map.attributionControl.addAttribution(`<a href="${LCZ_SOURCE}">Cerema · LCZ SPOT 2022</a> · Licence Ouverte 2.0`);
      container.setAttribute("aria-label", "Carte des types d’espaces du centre de Besançon. Utilisez les flèches pour déplacer la carte, plus et moins pour zoomer.");
      const color = feature => LCZ_FAMILIES.find(f => f.name === feature.properties.famille).color;
      let selected = new Set(data.features.map(f => f.properties.lcz));
      let activeCode = null;
      const style = feature => ({ fillColor: selected.has(feature.properties.lcz) ? color(feature) : "#ECEBE9", fillOpacity: 1, color: activeCode === feature.properties.lcz ? "#222222" : "#68635C", weight: activeCode === feature.properties.lcz ? 1.2 : .25, opacity: selected.has(feature.properties.lcz) ? 1 : .35 });
      const showInfo = feature => {
        const p = feature.properties;
        activeCode = p.lcz;
        info.replaceChildren();
        const heading = document.createElement("h4");
        heading.textContent = `LCZ ${p.lcz} — ${p.libelle}`;
        const description = document.createElement("p");
        description.textContent = describeLCZ(p);
        const area = document.createElement("p");
        area.textContent = `Dans tout le secteur : ${formatLCZ(p.surface_km2)} km² ; ${p.polygones_source} polygones sources regroupés. La surface concerne toute cette classe, pas seulement le morceau cliqué.`;
        info.append(heading, description, area);
        overlay.setStyle(style);
      };
      const popupWidth = () => Math.max(120, Math.min(260, container.clientWidth - 72));
      const overlay = L.geoJSON(data, { style, onEachFeature(feature, layer) {
        const p = feature.properties;
        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = `LCZ ${p.lcz} — ${p.libelle}`;
        const text = document.createElement("p");
        text.textContent = `${p.famille}. Surface de la classe dans le secteur : ${formatLCZ(p.surface_km2)} km². Détails sous la carte.`;
        popup.append(title, text);
        layer.bindPopup(popup, { maxWidth: popupWidth(), autoPanPadding: [12, 12] });
        layer.on("popupopen", event => {
          event.popup.getElement()?.querySelector(".leaflet-popup-close-button")?.setAttribute("aria-label", "Fermer les informations de la classe");
        });
        layer.on("click", () => showInfo(feature));
      } }).addTo(map);
      const bounds = overlay.getBounds();
      let initialView = true;
      let fitting = false;
      map.on("dragstart zoomstart", () => { if (!fitting) initialView = false; });
      const resetBounds = () => {
        fitting = true;
        initialView = true;
        map.closePopup();
        map.invalidateSize({ pan: false });
        map.fitBounds(bounds, { padding: [12, 12], animate: false });
        fitting = false;
      };
      resetBounds();
      function apply() {
        const features = selectLCZ(data, mode.value, category.value);
        selected = new Set(features.map(f => f.properties.lcz));
        activeCode = null;
        map.closePopup();
        overlay.setStyle(style);
        overlay.eachLayer(layer => {
          const path = layer.getElement();
          const visible = selected.has(layer.feature.properties.lcz);
          path.setAttribute("tabindex", visible ? "0" : "-1");
          path.setAttribute("role", "button");
          path.setAttribute("aria-label", `LCZ ${layer.feature.properties.lcz} — ${layer.feature.properties.libelle}. Afficher les informations de cette classe.`);
          path.setAttribute("aria-hidden", String(!visible));
          path.style.pointerEvents = visible ? "auto" : "none";
        });
        const stats = summarizeLCZ(data, features);
        status.textContent = `${stats.classes} classes sélectionnées sur ${data.features.length} : ${formatLCZ(stats.area)} km², soit ${formatLCZ(stats.percent)} % des ${formatLCZ(stats.total)} km² représentés. Les autres zones sont atténuées en gris.`;
        info.textContent = features.length ? "Cliquez sur une zone, ou utilisez Tab puis Entrée sur une classe de la carte, pour lire ses informations." : "Aucune classe ne correspond à ces deux filtres. Affichez toutes les zones ou changez de sélection.";
        root.querySelectorAll("[data-family]").forEach(item => { item.dataset.active = String(features.some(f => f.properties.famille === item.dataset.family)); });
      }
      overlay.eachLayer(layer => {
        const path = layer.getElement();
        path.addEventListener("keydown", event => {
          if (["Enter", " "].includes(event.key)) { event.preventDefault(); showInfo(layer.feature); layer.openPopup(); }
        });
        path.addEventListener("focus", () => layer.setStyle({ weight: 1.5, color: "#222222" }));
        path.addEventListener("blur", () => layer.setStyle(style(layer.feature)));
      });
      mode.addEventListener("change", apply);
      category.addEventListener("change", apply);
      root.querySelector("[data-show-all]").addEventListener("click", () => { mode.value = LCZ_MODES[0]; category.value = "all"; apply(); });
      root.querySelector("[data-reset-bounds]").addEventListener("click", resetBounds);
      root.querySelectorAll("[data-map-control]").forEach(control => { control.disabled = false; });
      const resize = new ResizeObserver(() => {
        overlay.eachLayer(layer => { layer.getPopup().options.maxWidth = popupWidth(); });
        map.eachLayer(layer => { if (layer instanceof L.Popup) layer.update(); });
        if (initialView) resetBounds();
        else map.invalidateSize({ animate: false });
      });
      resize.observe(container);
      apply();
      loaded = true;
      root.dataset.mapState = "ready";
    } catch (error) {
      map?.remove();
      root.dataset.mapState = "error";
      status.textContent = "La carte ne peut pas être chargée. Le tableau des 14 catégories reste disponible ci-dessous. Vous pouvez réessayer.";
      retry.hidden = false;
      console.error("Chargement LCZ :", error);
    } finally { loading = false; }
  }
  retry.addEventListener("click", load);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); } }, { rootMargin: "800px" });
    observer.observe(root);
  } else load();
}
