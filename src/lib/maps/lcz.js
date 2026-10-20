// Ordre, couleurs et modes repris de graphiqueCarteLCZ dans Observable.
export const LCZ_FAMILIES = [
  { name: "Bâti compact", color: "#B44D38" },
  { name: "Bâti ouvert ou diffus", color: "#D89669" },
  { name: "Bâti et sols imperméables", color: "#826D63" },
  { name: "Végétation", color: "#468052" },
  { name: "Sol nu", color: "#C9B897" },
  { name: "Eau", color: "#6B93A5" },
];
export const LCZ_MODES = ["Tous les espaces", "Espaces bâtis et imperméabilisés", "Végétation et eau"];
export const LCZ_SOURCE = "https://www.data.gouv.fr/datasets/6641c562e5acdb35c0e6051d";

export function validateLCZ(data) {
  if (data?.type !== "FeatureCollection" || !Array.isArray(data.features) || !data.features.length) throw new Error("Collection LCZ vide ou invalide.");
  const codes = new Set();
  for (const { properties: p, geometry } of data.features) {
    if (!p || typeof p.lcz !== "string" || codes.has(p.lcz) || !p.libelle ||
      !LCZ_FAMILIES.some(f => f.name === p.famille) || !Number.isFinite(p.surface_km2) || p.surface_km2 < 0 ||
      !Number.isInteger(p.polygones_source) || p.polygones_source < 1 ||
      !["Polygon", "MultiPolygon"].includes(geometry?.type)) throw new Error("Attributs ou géométrie LCZ invalides.");
    codes.add(p.lcz);
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    if (!polygons?.length) throw new Error("Géométrie LCZ vide.");
    for (const polygon of polygons) {
      if (!polygon.length) throw new Error("Polygone LCZ vide.");
      for (const ring of polygon) {
        if (ring.length < 4 || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) throw new Error("Anneau LCZ non fermé.");
        for (const point of ring) if (point.length < 2 || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || point[0] < -180 || point[0] > 180 || point[1] < -90 || point[1] > 90) throw new Error("Coordonnées LCZ invalides.");
      }
    }
  }
  return data;
}

export function selectLCZ(data, mode = LCZ_MODES[0], code = "all") {
  if (!LCZ_MODES.includes(mode)) throw new Error("Filtre LCZ inconnu.");
  const families = mode === LCZ_MODES[1] ? LCZ_FAMILIES.slice(0, 3) : mode === LCZ_MODES[2] ? LCZ_FAMILIES.filter(f => ["Végétation", "Eau"].includes(f.name)) : LCZ_FAMILIES;
  return data.features.filter(f => families.some(family => family.name === f.properties.famille) && (code === "all" || f.properties.lcz === code));
}

export function summarizeLCZ(data, features = data.features) {
  const total = data.features.reduce((sum, f) => sum + f.properties.surface_km2, 0);
  const area = features.reduce((sum, f) => sum + f.properties.surface_km2, 0);
  return { classes: features.length, area, total, percent: total > 0 ? 100 * area / total : 0 };
}

export const formatLCZ = value => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function describeLCZ(properties) {
  return `La classe LCZ ${properties.lcz} correspond à la catégorie « ${properties.libelle} » dans le fichier Cerema. Elle appartient à la famille « ${properties.famille} ».`;
}
