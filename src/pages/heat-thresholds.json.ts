import annual from "../assets/chaleur_annuelle.json";
import { prepareThresholdData } from "../lib/charts/heatThresholds.js";

// Endpoint statique : seules les colonnes nécessaires à V4 sont livrées.
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({
    source: "Météo-France — SQR, station 25056001",
    periode: [1959, 2022], mois: "année civile entière", seuils: [25, 30, 35], comparaison: ">=", qualite: "Q_SQR = 1",
    data: prepareThresholdData(annual),
  }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
