import proj4 from "proj4";

const LAMBERT_93 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs";
const conversion = proj4("EPSG:4326", LAMBERT_93);

export const projectLambert93 = coordinates => conversion.forward(coordinates);
export const unprojectLambert93 = coordinates => conversion.inverse(coordinates);

// Même repère que celui du découpage initial : le carré reste aligné à l’écran.
export function createLambert93CRS(L) {
  return L.extend({}, L.CRS.Earth, {
    code: "EPSG:2154",
    projection: {
      project(latlng) {
        const [x, y] = projectLambert93([latlng.lng, latlng.lat]);
        return L.point(x, y);
      },
      unproject(point) {
        const [lng, lat] = unprojectLambert93([point.x, point.y]);
        return L.latLng(lat, lng);
      },
    },
    transformation: new L.Transformation(1, 0, -1, 0),
    scale: zoom => 2 ** zoom,
    zoom: scale => Math.log2(scale),
    infinite: true,
    wrapLng: undefined,
  });
}
