import data from "../../assets/distribution_ete.json";
import metadata from "../../assets/distribution_ete.metadata.json";
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({ metadata: { ...metadata, licence: "Licence Ouverte 2.0", attribution: "Météo-France ; traitement SAE 303, Nargis Ayyobi et Rahma Hamdi" }, data }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
