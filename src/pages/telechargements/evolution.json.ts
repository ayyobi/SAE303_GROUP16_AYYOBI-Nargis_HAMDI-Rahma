import annual from "../../assets/chaleur_annuelle.json";
import metadata from "../../assets/heat-trends.metadata.json";
import { prepareHeatTrendSeries } from "../../lib/charts/heatTrends.js";
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({ metadata: { ...metadata, licence: "Licence Ouverte 2.0", attribution: "Météo-France ; traitement SAE 303, Nargis Ayyobi et Rahma Hamdi" }, data: prepareHeatTrendSeries(annual) }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
