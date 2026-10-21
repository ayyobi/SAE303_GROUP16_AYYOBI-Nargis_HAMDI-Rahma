// Un groupe SVG nommé doit exposer un rôle autorisant son nom accessible.
// Plot ajoute les noms des marques, mais certaines marques n'ajoutent pas de rôle.
export function namePlotGroups(chart) {
  chart.querySelectorAll("g[aria-label]:not([role])").forEach((group) => {
    group.setAttribute("role", "group");
  });
  return chart;
}
