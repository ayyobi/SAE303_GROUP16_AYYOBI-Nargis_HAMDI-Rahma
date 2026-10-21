import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
const output = path.resolve("artifacts/audit");
fs.mkdirSync(output, { recursive: true });
const checks = [];
const log = (...items) => {
  checks.push(items);
  console.log(...items);
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const root = path.resolve("dist");
if (!fs.existsSync(path.join(root, "index.html")))
  throw new Error("Exécutez npm run build avant cet audit.");
const server = http.createServer((request, response) => {
  try {
    let file = path.resolve(
      root,
      "." +
        decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    response.setHeader(
      "Content-Type",
      {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".geojson": "application/geo+json",
        ".svg": "image/svg+xml",
      }[path.extname(file)] || "application/octet-stream",
    );
    response.end(fs.readFileSync(file));
  } catch {
    response.writeHead(404).end();
  }
});
if (process.argv.includes("--serve")) {
  server.listen(4322, "127.0.0.1", () => {
    console.log("Build local : http://127.0.0.1:4322 — Ctrl+C pour fermer.");
  });
} else {
  (async () => {
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "besancon-audit-"));
    const browser = spawn(
      process.env.CHROME_PATH ||
        (process.platform === "win32"
          ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
          : "google-chrome"),
      [
        "--headless",
        "--no-sandbox",
        "--no-first-run",
        "--remote-debugging-port=0",
        "--user-data-dir=" + profile,
        "about:blank",
      ],
      { stdio: "ignore" },
    );
    let ws;
    const timeout = setTimeout(() => {
      browser.kill();
      server.close();
      process.exit(1);
    }, 90000);
    try {
      let pages;
      for (let i = 0; i < 30; i++) {
        try {
          pages = await (
            await fetch(
              "http://127.0.0.1:" +
                fs
                  .readFileSync(
                    path.join(profile, "DevToolsActivePort"),
                    "utf8",
                  )
                  .split("\n")[0] +
                "/json",
              { signal: AbortSignal.timeout(400) },
            )
          ).json();
          break;
        } catch {
          await delay(200);
        }
      }
      ws = new WebSocket(
        pages.find((p) => p.type === "page").webSocketDebuggerUrl,
      );
      await new Promise((r) => (ws.onopen = r));
      let id = 0;
      const pending = new Map(),
        errors = [];
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.method === "Runtime.exceptionThrown")
          errors.push(m.params.exceptionDetails.text);
        if (
          m.method === "Runtime.consoleAPICalled" &&
          m.params.type === "error"
        )
          log(
            JSON.stringify(m.params.args.map((a) => a.description || a.value)),
          );
        if (pending.has(m.id)) {
          pending.get(m.id)(m.result);
          pending.delete(m.id);
        }
      };
      const call = (method, params = {}) =>
        new Promise((r) => {
          pending.set(++id, r);
          ws.send(JSON.stringify({ id, method, params }));
        });
      const run = async (expression) => {
        const r = await call("Runtime.evaluate", {
          expression,
          returnByValue: true,
          awaitPromise: true,
        });
        if (r.exceptionDetails)
          throw Error(
            r.exceptionDetails.exception?.description ??
              r.exceptionDetails.text,
          );
        return r.result.value;
      };
      await call("Runtime.enable");
      await call("Network.enable");
      await call("Network.setBlockedURLs", { urls: [] });
      await call("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await call("Page.enable");
      await call("Page.navigate", {
        url: "http://127.0.0.1:" + server.address().port + "/",
      });
      await delay(1200);
      await run(
        "Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,8000))])",
      );
      await run(
        "document.querySelector('#ville').scrollIntoView({behavior:'instant'})",
      );
      for (let i = 0; i < 80; i++) {
        if (
          await run(
            "document.querySelector('[data-lcz-map]').dataset.mapState==='ready'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run("document.querySelector('[data-lcz-map]').dataset.mapState"),
        "ready",
        await run("document.querySelector('[data-status]').textContent"),
      );
      const visible = () =>
        run(
          "document.querySelectorAll('.lcz-map .leaflet-overlay-pane path[aria-hidden=false]').length",
        );
      assert.equal(await visible(), 14);
      log("Map loaded: 14 GeoJSON features rendered");
      const colors = JSON.parse(
        await run(
          "JSON.stringify([...document.querySelectorAll('.lcz-map .leaflet-overlay-pane path')].map(p=>p.getAttribute('fill')))",
        ),
      );
      assert.deepEqual(colors, [
        "#B44D38",
        "#B44D38",
        "#D89669",
        "#D89669",
        "#D89669",
        "#826D63",
        "#D89669",
        "#468052",
        "#468052",
        "#468052",
        "#468052",
        "#826D63",
        "#C9B897",
        "#6B93A5",
      ]);
      log("All 14 colors match notebook legend");
      const select = async (selector, value) =>
        run(
          "(()=>{const e=document.querySelector(" +
            JSON.stringify(selector) +
            ");e.value=" +
            JSON.stringify(value) +
            ";e.dispatchEvent(new Event('change',{bubbles:true}))})()",
        );
      await select("[data-mode]", "Espaces bâtis et imperméabilisés");
      assert.equal(await visible(), 8);
      await select("[data-mode]", "Végétation et eau");
      assert.equal(await visible(), 5);
      await select("[data-category]", "2");
      assert.equal(await visible(), 0);
      assert.match(
        await run("document.querySelector('[data-zone-info]').textContent"),
        /Aucune classe/,
      );
      await select("[data-category]", "A");
      assert.equal(await visible(), 1);
      await run(
        "document.querySelector('.lcz-map .leaflet-overlay-pane path[aria-hidden=false]').focus()",
      );
      await call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
      });
      assert.match(
        await run("document.querySelector('[data-zone-info]').textContent"),
        /Arbres denses/,
      );
      assert.match(
        await run("document.querySelector('[data-zone-info]').textContent"),
        /22,19/,
      );
      assert.ok(await run("!!document.querySelector('.leaflet-popup')"));
      await run("document.querySelector('[data-show-all]').click()");
      assert.equal(await visible(), 14);
      log(
        "3 modes, exact-class filter, empty state, keyboard info and reset: OK",
      );
      const initial = await run(
        "document.querySelector('.lcz-map .leaflet-overlay-pane path').getAttribute('d')",
      );
      await run("document.querySelector('.leaflet-control-zoom-in').click()");
      await delay(250);
      assert.notEqual(
        await run(
          "document.querySelector('.lcz-map .leaflet-overlay-pane path').getAttribute('d')",
        ),
        initial,
      );
      await run("document.querySelector('[data-reset-bounds]').click()");
      await delay(150);
      assert.equal(
        await run(
          "document.querySelector('.lcz-map .leaflet-overlay-pane path').getAttribute('d')",
        ),
        initial,
      );
      const transform = await run(
        "document.querySelector('.leaflet-map-pane').style.transform",
      );
      await run("document.querySelector('[data-map]').focus()");
      await call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "ArrowRight",
        code: "ArrowRight",
        windowsVirtualKeyCode: 39,
      });
      await delay(200);
      assert.notEqual(
        await run(
          "document.querySelector('.leaflet-map-pane').style.transform",
        ),
        transform,
      );
      await run("document.querySelector('[data-reset-bounds]').click()");
      log("Zoom, keyboard panning and extent reset: OK");
      for (const width of [320, 375, 430, 768, 1024, 1440]) {
        await call("Emulation.setDeviceMetricsOverride", {
          width,
          height: 950,
          deviceScaleFactor: 1,
          mobile: width < 640,
        });
        await delay(200);
        assert.equal(
          await run("document.documentElement.scrollWidth>innerWidth"),
          false,
          "overflow " + width,
        );
        assert.ok(
          await run(
            "document.querySelector('[data-map]').getBoundingClientRect().width>200",
          ),
        );
        assert.equal(await visible(), 14);
        log(width + "px: responsive OK");
        if (width === 320 || width === 1440) {
          await run(
            "document.querySelector('[data-reset-bounds]').click();document.querySelector('.lcz-explorer').scrollIntoView({behavior:'instant'})",
          );
          await delay(100);
          const clip = JSON.parse(
            await run(
              "JSON.stringify((()=>{const r=document.querySelector('.lcz-explorer').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})())",
            ),
          );
          const shot = await call("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            clip,
          });
          const target = path.join(output, "besancon-lcz-" + width + ".png");
          fs.writeFileSync(target, Buffer.from(shot.data, "base64"));
          log(target);
        }
      }
      const summary = JSON.parse(
        await run(
          "JSON.stringify({broken:[...document.querySelectorAll('a[href*=\"#\"]')].filter(a=>new URL(a.href).origin===location.origin&&new URL(a.href).hash&&!document.getElementById(new URL(a.href).hash.slice(1))).length,h1:document.querySelectorAll('h1').length,table:document.querySelectorAll('.lcz-table tbody tr').length,v1:document.querySelectorAll('.distribution-desktop svg g[aria-label=\"rect\"] rect').length,credit:document.querySelector('.leaflet-control-attribution').textContent})",
        ),
      );
      log("Summary: " + JSON.stringify(summary));
      log(
        await run(
          "JSON.stringify([...document.querySelectorAll('a[href]')].filter(a=>new URL(a.href).origin===location.origin&&new URL(a.href).hash&&!document.getElementById(new URL(a.href).hash.slice(1))).map(a=>({href:a.getAttribute('href'),label:a.textContent})))",
        ),
      );
      assert.equal(summary.broken, 0);
      assert.equal(summary.h1, 1);
      assert.equal(summary.table, 14);
      assert.equal(summary.v1, 17);
      assert.match(summary.credit, /Cerema/);
      assert.match(summary.credit, /Leaflet/);
      assert.deepEqual(errors, []);
      log(JSON.stringify(summary));
      log("Map regression checks passed");
      for (const width of [320, 375, 430, 768, 1024, 1440]) {
        await call("Emulation.setDeviceMetricsOverride", {
          width,
          height: 950,
          deviceScaleFactor: 1,
          mobile: width < 640,
        });
        await delay(150);
        const r = JSON.parse(
          await run(
            `JSON.stringify((()=>{const svg=[...document.querySelectorAll('.heat-figure svg')].find(s=>s.getBoundingClientRect().width>0);const labels=[...svg.querySelectorAll('g[aria-label="x-axis tick label"] text')].map(e=>{const b=e.getBoundingClientRect();return {text:e.textContent,left:b.left,right:b.right}});return {overflow:document.documentElement.scrollWidth>innerWidth,visible:[...document.querySelectorAll('.heat-figure svg')].filter(s=>s.getBoundingClientRect().width>0).length,points:svg.querySelectorAll('g[aria-label="dot"] circle').length,lines:svg.querySelectorAll('g[aria-label="line"] path').length,labels:labels.map(l=>l.text),overlap:labels.some((l,i)=>i>0&&labels[i-1].right>l.left),description:svg.querySelector('desc').textContent.includes('23,27'),role:svg.getAttribute('role')}})())`,
          ),
        );
        assert.equal(r.overflow, false);
        assert.equal(r.visible, 1);
        assert.equal(r.points, 65);
        assert.equal(r.lines, 1);
        assert.equal(r.overlap, false);
        assert.equal(r.description, true);
        assert.equal(r.role, "img");
        log("V3 " + width + "px: " + JSON.stringify(r));
        if (width === 320 || width === 1440) {
          await run(
            "document.activeElement?.blur();document.querySelector('.site-header').style.visibility='hidden';document.querySelector('.skip-link').style.visibility='hidden';document.querySelector('.heat-figure').scrollIntoView({behavior:'instant'})",
          );
          await delay(120);
          const clip = JSON.parse(
            await run(
              "JSON.stringify((()=>{const b=document.querySelector('.heat-figure').getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})())",
            ),
          );
          const shot = await call("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            clip,
          });
          const file = path.join(output, "besancon-v3-" + width + ".png");
          fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
          log(file);
        }
      }
      assert.equal(
        await run("document.querySelectorAll('.heat-table tbody tr').length"),
        64,
      );
      await run("document.querySelector('.heat-table summary').focus()");
      await call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: " ",
        code: "Space",
        text: " ",
        windowsVirtualKeyCode: 32,
      });
      await call("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: " ",
        code: "Space",
        windowsVirtualKeyCode: 32,
      });
      assert.equal(
        await run("document.querySelector('.heat-table').open"),
        true,
      );
      log("V3 table: 64 rows, keyboard opening OK");
      await run(
        "document.querySelector('#explorer').scrollIntoView({behavior:'instant'})",
      );
      for (let i = 0; i < 80; i++) {
        if (
          await run(
            "document.querySelector('[data-threshold-explorer]').dataset.thresholdState==='ready'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run(
          "document.querySelector('[data-threshold-explorer]').dataset.thresholdState",
        ),
        "ready",
        await run(
          "document.querySelector('[data-threshold-status]').textContent",
        ),
      );
      assert.equal(
        await run(
          "document.querySelector('[name=heat-threshold]:checked').value",
        ),
        "30",
      );
      assert.equal(
        await run("document.querySelectorAll('[name=heat-threshold]').length"),
        3,
      );
      const annual = JSON.parse(
        fs.readFileSync("src/assets/chaleur_annuelle.json", "utf8"),
      );
      for (const threshold of [25, 30, 35, 30, 25, 35]) {
        await run(
          "document.querySelector('label[for=threshold-" +
            threshold +
            "]').click()",
        );
        assert.equal(
          await run(
            "document.querySelectorAll('[data-threshold-chart] svg').length",
          ),
          1,
        );
        assert.equal(
          await run(
            "document.querySelectorAll('[data-threshold-chart] g[aria-label=bar] rect').length",
          ),
          64,
        );
        const values = JSON.parse(
          await run(
            "JSON.stringify([...document.querySelectorAll('.threshold-table tbody tr')].map(row=>Number(row.children[1].textContent)))",
          ),
        );
        assert.deepEqual(
          values,
          annual.map((row) => row["jours" + threshold]),
        );
        assert.ok(
          await run(
            "document.querySelector('[data-threshold-summary]').textContent.includes('" +
              threshold +
              " °C')",
          ),
        );
        assert.ok(
          await run(
            "document.querySelector('[data-threshold-chart] svg').getAttribute('aria-description').includes('dix années')",
          ),
        );
        log(
          "V4 " +
            threshold +
            " °C: 64 exact counts, title/summary/table and single SVG OK",
        );
      }
      await run(
        "document.querySelector('#threshold-30').focus();document.querySelector('#threshold-30').click()",
      );
      await call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "ArrowLeft",
        code: "ArrowLeft",
        windowsVirtualKeyCode: 37,
      });
      assert.equal(
        await run(
          "document.querySelector('[name=heat-threshold]:checked').value",
        ),
        "25",
      );
      assert.equal(await run("document.activeElement.id"), "threshold-25");
      log("Native radio keyboard: ArrowLeft changes threshold and keeps focus");
      for (const width of [320, 375, 430, 768, 1024, 1440]) {
        await call("Emulation.setDeviceMetricsOverride", {
          width,
          height: 950,
          deviceScaleFactor: 1,
          mobile: width < 640,
        });
        await delay(180);
        for (const threshold of [25, 30, 35]) {
          await run(
            "document.querySelector('label[for=threshold-" +
              threshold +
              "]').click()",
          );
          const r = JSON.parse(
            await run(
              `JSON.stringify((()=>{const svg=document.querySelector('[data-threshold-chart] svg');const labels=[...svg.querySelectorAll('g[aria-label="x-axis tick label"] text')].map(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right}});const ann=svg.querySelector('g[aria-label="text"] text').getBoundingClientRect(),box=svg.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,overlap:labels.some((l,i)=>i>0&&labels[i-1].right>l.left),annotationInside:ann.left>=box.left&&ann.right<=box.right,svgs:document.querySelectorAll('[data-threshold-chart] svg').length}})())`,
            ),
          );
          assert.equal(r.overflow, false);
          assert.equal(r.overlap, false);
          assert.equal(r.annotationInside, true);
          assert.equal(r.svgs, 1);
        }
        log(
          "V4 " +
            width +
            "px: all 3 thresholds readable, no overlap or overflow",
        );
        if (width === 320 || width === 1440) {
          await run(
            "document.querySelector('.site-header').style.visibility='hidden';document.activeElement?.blur();document.querySelector('.threshold-figure').scrollIntoView({behavior:'instant'})",
          );
          await delay(100);
          const clip = JSON.parse(
            await run(
              "JSON.stringify((()=>{const b=document.querySelector('.threshold-figure').getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})())",
            ),
          );
          const shot = await call("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            clip,
          });
          const name = path.join(output, "besancon-v4-" + width + ".png");
          fs.writeFileSync(name, Buffer.from(shot.data, "base64"));
          log(name);
        }
      }
      await run("document.querySelector('.threshold-table summary').focus()");
      await call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: " ",
        code: "Space",
        text: " ",
        windowsVirtualKeyCode: 32,
      });
      await call("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: " ",
        code: "Space",
        windowsVirtualKeyCode: 32,
      });
      assert.equal(
        await run("document.querySelector('.threshold-table').open"),
        true,
      );
      log("V4 table keyboard opening OK");
      assert.equal(
        await run("performance.getEntriesByType('navigation').length"),
        1,
      );
      log("No page reload after threshold changes");
      await call("Network.setBlockedURLs", { urls: ["*heat-thresholds.json"] });
      await call("Page.reload", { ignoreCache: true });
      await delay(800);
      await run(
        "document.querySelector('#explorer').scrollIntoView({behavior:'instant'})",
      );
      for (let i = 0; i < 60; i++) {
        if (
          await run(
            "document.querySelector('[data-threshold-explorer]').dataset.thresholdState==='error'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run(
          "document.querySelector('[data-threshold-explorer]').dataset.thresholdState",
        ),
        "error",
      );
      assert.equal(
        await run(
          "document.querySelector('.threshold-table tbody').children.length",
        ),
        64,
      );
      assert.equal(
        await run("document.querySelector('[data-threshold-retry]').hidden"),
        false,
      );
      await call("Network.setBlockedURLs", { urls: [] });
      await run("document.querySelector('[data-threshold-retry]').click()");
      for (let i = 0; i < 60; i++) {
        if (
          await run(
            "document.querySelector('[data-threshold-explorer]').dataset.thresholdState==='ready'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run(
          "document.querySelector('[data-threshold-explorer]').dataset.thresholdState",
        ),
        "ready",
      );
      log("V4 loading error, fallback table and retry OK");

      const origin = "http://127.0.0.1:" + server.address().port;
      const axePath = process.env.AXE_PATH;
      const axeSource = axePath ? fs.readFileSync(axePath, "utf8") : null;
      const axeResults = [];
      async function auditAccessibility(page, width) {
        if (!axeSource) return;
        await call("Runtime.evaluate", { expression: axeSource });
        const result = await run(
          "axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>v.id)}))",
        );
        axeResults.push({ page, width, ...result });
        assert.deepEqual(
          result.violations,
          [],
          "axe " +
            page +
            " " +
            width +
            ": " +
            JSON.stringify(result.violations),
        );
        log(
          "axe " +
            page +
            " " +
            width +
            "px: no detected WCAG A/AA violation; " +
            result.incomplete.length +
            " rules require manual review",
        );
      }
      await run(
        "document.querySelector('#ville').scrollIntoView({behavior:'instant'})",
      );
      for (let i = 0; i < 80; i++) {
        if (
          await run(
            "document.querySelector('[data-lcz-map]').dataset.mapState==='ready'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run("document.querySelector('[data-lcz-map]').dataset.mapState"),
        "ready",
      );
      for (const width of [320, 375, 430, 768, 1024, 1440]) {
        await call("Emulation.setDeviceMetricsOverride", {
          width,
          height: 950,
          deviceScaleFactor: 1,
          mobile: width < 640,
        });
        await delay(150);
        await run(
          "document.querySelector('[data-reset-bounds]').click();document.querySelector('[data-map]').scrollIntoView({behavior:'instant'});(()=>{const p=document.querySelector('.leaflet-overlay-pane path');p.focus();p.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})()",
        );
        await delay(250);
        const popup = await run(
          "(()=>{const b=document.querySelector('.leaflet-popup').getBoundingClientRect(),m=document.querySelector('[data-map]').getBoundingClientRect();return {left:b.left,right:b.right,mapLeft:m.left,mapRight:m.right,label:document.querySelector('.leaflet-popup-close-button').getAttribute('aria-label')}})()",
        );
        assert.ok(
          popup.left >= popup.mapLeft - 1 && popup.right <= popup.mapRight + 1,
          JSON.stringify({ width, ...popup }),
        );
        assert.match(popup.label, /Fermer/);
        await run(
          "document.querySelector('.leaflet-popup-close-button').click()",
        );
        // Aucune étiquette d'axe V1 ne doit chevaucher la suivante.
        const labels = await run(
          "[...document.querySelectorAll('#distribution svg')].filter(s=>s.getBoundingClientRect().width).flatMap(s=>[...s.querySelectorAll('g[aria-label=\"x-axis tick label\"] text')].map(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right}}))",
        );
        assert.equal(
          labels.some((label, i) => i > 0 && labels[i - 1].right > label.left),
          false,
        );
        if (width === 320 || width === 1440)
          await auditAccessibility("/", width);
        log(
          "Popup within map, French close label and V1 axes: " +
            width +
            "px OK",
        );
      }
      await call("Network.setBlockedURLs", { urls: ["*besancon_lcz*"] });
      await call("Page.navigate", { url: origin + "/" });
      await delay(600);
      await run(
        "document.querySelector('#ville').scrollIntoView({behavior:'instant'})",
      );
      for (let i = 0; i < 80; i++) {
        if (
          await run(
            "document.querySelector('[data-lcz-map]').dataset.mapState==='error'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run("document.querySelector('[data-lcz-map]').dataset.mapState"),
        "error",
      );
      assert.equal(
        await run("document.querySelectorAll('.lcz-table tbody tr').length"),
        14,
      );
      await call("Network.setBlockedURLs", { urls: [] });
      await run("document.querySelector('[data-retry]').click()");
      for (let i = 0; i < 80; i++) {
        if (
          await run(
            "document.querySelector('[data-lcz-map]').dataset.mapState==='ready'",
          )
        )
          break;
        await delay(100);
      }
      assert.equal(
        await run("document.querySelector('[data-lcz-map]').dataset.mapState"),
        "ready",
      );
      log("Map network failure: table preserved and retry successful");
      for (const pathname of ["/", "/methode"]) {
        await call("Page.navigate", { url: origin + pathname });
        await delay(650);
        await run(
          "Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,8000))])",
        );
        assert.equal(await run("document.documentElement.lang"), "fr");
        assert.equal(await run("document.querySelectorAll('h1').length"), 1);
        assert.equal(await run("document.querySelectorAll('main').length"), 1);
        assert.equal(
          await run(
            "[...document.querySelectorAll('h1,h2,h3,h4')].some((e,i,a)=>i&&Number(e.tagName[1])>Number(a[i-1].tagName[1])+1)",
          ),
          false,
        );
        assert.equal(
          await run(
            "[...document.querySelectorAll('[id]')].map(e=>e.id).length===new Set([...document.querySelectorAll('[id]')].map(e=>e.id)).size",
          ),
          true,
        );
        assert.match(
          await run("getComputedStyle(document.body).fontFamily"),
          /Open Sans/,
        );
        assert.equal(
          await run(
            "[...document.querySelectorAll('main *')].some(e=>getComputedStyle(e).fontStyle==='italic')",
          ),
          false,
        );
        for (const width of [320, 375, 430, 768, 1024, 1440]) {
          await call("Emulation.setDeviceMetricsOverride", {
            width,
            height: 950,
            deviceScaleFactor: 1,
            mobile: width < 640,
          });
          await delay(120);
          await run(
            "document.querySelectorAll('details').forEach(d=>d.open=true)",
          );
          assert.equal(
            await run("document.documentElement.scrollWidth>innerWidth"),
            false,
            pathname + " tables " + width,
          );
          assert.equal(
            await run(
              "[...document.querySelectorAll('.method-content .method-note')].some(e=>e.scrollWidth>e.clientWidth+1||getComputedStyle(e).display!=='block')",
            ),
            false,
          );
          if (pathname === "/methode") {
            await run(
              "document.querySelector('.method-toc a[href=\"#donnees\"]').click()",
            );
            await delay(80);
            assert.ok(
              await run(
                "document.querySelector('#donnees').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom",
              ),
            );
            if (width === 320 || width === 1440)
              await auditAccessibility(pathname, width);
          }
          log(
            "All tables open, no overflow, readable method notes: " +
              pathname +
              " " +
              width +
              "px OK",
          );
        }
        if (pathname === "/methode") {
          assert.equal(
            await run("document.querySelectorAll('.view-card dt').length"),
            24,
          );
          const downloads = await run(
            "Promise.all([...document.querySelectorAll('a[download]')].map(async a=>{const r=await fetch(a.href);return {name:a.download,status:r.status,body:await r.json()}}))",
          );
          assert.deepEqual(
            downloads.map((d) => d.status),
            [200, 200, 200, 200],
          );
          assert.deepEqual(
            downloads[0].body.data,
            JSON.parse(
              fs.readFileSync("src/assets/distribution_ete.json", "utf8"),
            ),
          );
          assert.deepEqual(
            downloads[1].body.data,
            annual.map((r) => ({
              annee: r.annee,
              joursValides: r.joursEteValides,
              maximaleMoyenne: r.maximaleMoyenneEte,
            })),
          );
          assert.deepEqual(
            downloads[2].body.data,
            annual.map(
              ({ annee, joursValides, jours25, jours30, jours35 }) => ({
                annee,
                joursValides,
                jours25,
                jours30,
                jours35,
              }),
            ),
          );
          assert.deepEqual(
            downloads[3].body,
            JSON.parse(
              fs.readFileSync(
                "src/assets/besancon_lcz_coeur_8km.geojson",
                "utf8",
              ),
            ),
          );
          log(
            "Four built downloads: HTTP 200 and exact equality to visualization data",
          );
        }
        await call("Emulation.setDeviceMetricsOverride", {
          width: 375,
          height: 950,
          deviceScaleFactor: 1,
          mobile: true,
        });
        await run("document.querySelector('.menu-toggle').click()");
        assert.equal(
          await run(
            "document.querySelector('.menu-toggle').getAttribute('aria-expanded')",
          ),
          "true",
        );
        await call("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        assert.equal(
          await run("document.activeElement.className"),
          "menu-toggle",
        );
        assert.equal(
          await run(
            "document.querySelector('.menu-toggle').getAttribute('aria-expanded')",
          ),
          "false",
        );
        await call("Page.navigate", { url: origin + pathname });
        await delay(400);
        await call("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Tab",
          code: "Tab",
          windowsVirtualKeyCode: 9,
        });
        assert.equal(
          await run("document.activeElement.className"),
          "skip-link",
        );
        assert.notEqual(
          await run("getComputedStyle(document.activeElement).outlineStyle"),
          "none",
        );
        await call("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Enter",
          code: "Enter",
          windowsVirtualKeyCode: 13,
        });
        assert.equal(await run("location.hash"), "#contenu");
        log("Mobile menu/Escape and first Tab/skip link: " + pathname + " OK");
      }
      await call("Emulation.setScriptExecutionDisabled", { value: true });
      for (const pathname of ["/", "/methode"]) {
        await call("Page.navigate", { url: origin + pathname });
        await delay(500);
        assert.equal(
          await run(
            "getComputedStyle(document.querySelector('#main-navigation')).display",
          ),
          "grid",
        );
        await run(
          "document.querySelectorAll('details').forEach(d=>d.open=true)",
        );
        assert.equal(
          await run("document.documentElement.scrollWidth>innerWidth"),
          false,
        );
        if (pathname === "/") {
          assert.equal(
            await run(
              "document.querySelectorAll('.lcz-table tbody tr').length",
            ),
            14,
          );
          assert.equal(
            await run(
              "document.querySelectorAll('.threshold-table tbody tr').length",
            ),
            64,
          );
          assert.equal(
            await run(
              "document.querySelectorAll('.heat-table tbody tr').length",
            ),
            64,
          );
        }
        log(
          "Without JavaScript: navigation and data alternatives " +
            pathname +
            " OK",
        );
      }
      await call("Emulation.setScriptExecutionDisabled", { value: false });
      assert.deepEqual(errors, []);
      const version = await call("Browser.getVersion");
      fs.writeFileSync(
        path.join(output, "browser.json"),
        JSON.stringify(
          {
            date: new Date().toISOString(),
            browser: version.product,
            widths: [320, 375, 430, 768, 1024, 1440],
            axe: axeSource ? axeResults : "Not run: set AXE_PATH to axe.min.js",
            checks,
          },
          null,
          2,
        ),
      );
      log("Build browser audit passed. Evidence: artifacts/audit/browser.json");
    } finally {
      clearTimeout(timeout);
      ws?.close();
      browser.kill();
      server.close();
    }
  })().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
