// Mobile speed check for the Pegasus page, built to the Web Platform
// "Slow 4G Mobile Check Profile". Reads its limits from speed-budget.json.
//
//   npm run build && npm start      (one terminal)
//   npm run check:speed             (another terminal)
//
// Two parts, each using the profile's settings:
//  1. Lighthouse (mobile, simulate, 150 ms RTT, 1638.4 Kbps, 4x CPU,
//     375 x 812 at 3x) for the performance score.
//  2. A real Chromium slowed the "devtools" way (562.5 ms latency,
//     1474.56 Kbps down, 675 Kbps up, 4x CPU, same screen), which tracks
//     the size grid's top edge every frame from first paint to fully loaded
//     and measures every size button.
// Exits with code 1 if any budget is broken or a watched element is missing.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import lighthouse from "lighthouse";

const PAGE_URL = process.env.PAGE_URL ?? "http://localhost:3000/";
const RUNS = Number(process.env.RUNS ?? 3);
// Stress test: hold the photo back this many ms in the slowed browser, to
// prove its box is reserved (LATE_PHOTO_MS=2500 npm run check:speed).
const LATE_PHOTO_MS = Number(process.env.LATE_PHOTO_MS ?? 0);
// Save a Chrome performance trace of the first slowed run. Open it in
// Chrome DevTools > Performance > Load profile.
const TRACE_OUT = process.env.TRACE_OUT;
// Save the worst run's Lighthouse report (HTML and JSON) in this folder,
// plus a 375 px phone screenshot with a size tapped
// (REPORT_DIR=docs/launch npm run check:speed).
const REPORT_DIR = process.env.REPORT_DIR;
// The size to tap for the screenshot.
const TAP_SIZE = process.env.TAP_SIZE ?? "M 10.5 / W 12";
const budget = JSON.parse(readFileSync(new URL("../speed-budget.json", import.meta.url)));

const SCREEN = { width: 375, height: 812, deviceScaleFactor: 3, mobile: true, disabled: false };
const LH_SETTINGS = {
  formFactor: "mobile",
  throttlingMethod: "simulate",
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    requestLatencyMs: 562.5,
    downloadThroughputKbps: 1474.56,
    uploadThroughputKbps: 675,
    cpuSlowdownMultiplier: 4,
  },
  screenEmulation: SCREEN,
  onlyCategories: ["performance"],
};
const WATCHED = ["size-grid", "size-button", "size-button-sold-out", "main-photo", "price"];

async function lighthouseRun() {
  const port = 9300 + Math.floor(Math.random() * 500);
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
  try {
    const r = await lighthouse(PAGE_URL, { port, output: ["html", "json"], logLevel: "error" }, { extends: "lighthouse:default", settings: LH_SETTINGS });
    const a = r.lhr.audits;
    return {
      report: r.report,
      fetchTime: r.lhr.fetchTime,
      score: Math.round(r.lhr.categories.performance.score * 100),
      lcpMs: a["largest-contentful-paint"].numericValue,
      cls: a["cumulative-layout-shift"].numericValue,
      tbtMs: a["total-blocking-time"].numericValue,
      kb: a["total-byte-weight"].numericValue / 1024,
      lcpElement:
        a["lcp-breakdown-insight"]?.details?.items?.find((i) => i.type === "node")?.nodeLabel ?? "?",
    };
  } finally {
    await browser.close();
  }
}

async function traceRun(saveTrace) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: SCREEN.width, height: SCREEN.height },
    deviceScaleFactor: SCREEN.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 562.5,
    downloadThroughput: (1474.56 * 1024) / 8,
    uploadThroughput: (675 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    window.__shifts = [];
    window.__gridTops = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({
          value: e.value,
          at: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            const name = !n
              ? "(removed node)"
              : n.nodeType !== 1
                ? "text"
                : n.dataset?.testid
                  ? `[data-testid=${n.dataset.testid}]`
                  : n.nodeName.toLowerCase() + (n.id ? "#" + n.id : "");
            return `${name} ${Math.round(s.previousRect.y)}→${Math.round(s.currentRect.y)}px`;
          }),
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
    const tick = () => {
      const g = document.querySelector('[data-testid="size-grid"]');
      if (g) {
        const top = Math.round((g.getBoundingClientRect().top + window.scrollY) * 100) / 100;
        const last = window.__gridTops.at(-1);
        if (!last || last.top !== top) window.__gridTops.push({ top, at: Math.round(performance.now()) });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  if (LATE_PHOTO_MS) {
    await page.route(
      (u) => /\.(svg|png|jpe?g|webp|avif)$/.test(u.pathname) || u.pathname.startsWith("/_next/image"),
      async (route) => {
        await new Promise((ok) => setTimeout(ok, LATE_PHOTO_MS));
        await route.continue();
      },
    );
  }
  if (saveTrace) await browser.startTracing(page, { path: saveTrace, screenshots: true });
  await page.goto(PAGE_URL, { waitUntil: "load", timeout: 180_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  if (saveTrace) await browser.stopTracing();
  const r = await page.evaluate((ids) => {
    const found = Object.fromEntries(ids.map((id) => [id, document.querySelectorAll(`[data-testid="${id}"]`).length]));
    const buttons = [...document.querySelectorAll('[data-testid="size-button"],[data-testid="size-button-sold-out"]')].map((b) => {
      const r = b.getBoundingClientRect();
      return Math.min(r.width, r.height);
    });
    return { found, buttons, shifts: window.__shifts, gridTops: window.__gridTops };
  }, WATCHED);
  await browser.close();
  const tops = r.gridTops.map((t) => t.top);
  return {
    ...r,
    gridMove: tops.length ? Math.max(...tops) - Math.min(...tops) : NaN,
    smallestButton: r.buttons.length ? Math.min(...r.buttons) : NaN,
    cls: r.shifts.reduce((s, x) => s + x.value, 0),
  };
}

const lh = [];
const tr = [];
for (let i = 0; i < RUNS; i++) {
  lh.push(await lighthouseRun());
  tr.push(await traceRun(i === 0 ? TRACE_OUT : undefined));
}
async function tappedScreenshot(path) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: SCREEN.width, height: SCREEN.height },
    deviceScaleFactor: SCREEN.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(PAGE_URL, { waitUntil: "networkidle" });
  const button = page.locator('[data-testid="size-button"]', { hasText: TAP_SIZE }).first();
  await button.tap();
  const pressed = await button.getAttribute("aria-pressed");
  // Scroll so the price and the whole size grid are on screen.
  await page.evaluate(() => {
    const top = document.querySelector('[data-testid="price"]').getBoundingClientRect().top;
    window.scrollTo(0, window.scrollY + top - 16);
  });
  await page.screenshot({ path });
  await browser.close();
  return pressed === "true";
}

const med = (arr, k) => [...arr.map((r) => r[k])].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
const worst = (arr, k) => Math.max(...arr.map((r) => r[k]));
const least = (arr, k) => Math.min(...arr.map((r) => r[k]));

const missing = WATCHED.filter((id) => tr.some((r) => !r.found[id]));
const checks = [
  ["performance_score_min", `Lighthouse score, lowest of ${RUNS}`, least(lh, "score"), `>= ${budget.performance_score_min}`, least(lh, "score") >= budget.performance_score_min],
  ["size_grid_shift_px_max", `Size grid movement, worst of ${RUNS}`, `${worst(tr, "gridMove")} px`, `<= ${budget.size_grid_shift_px_max} px`, worst(tr, "gridMove") <= budget.size_grid_shift_px_max],
  ["size_button_min_px", "Smallest size button side", `${least(tr, "smallestButton")} px`, `>= ${budget.size_button_min_px} px`, least(tr, "smallestButton") >= budget.size_button_min_px],
  ["watched_elements", "All five data-testids found", missing.length ? `missing ${missing.join(", ")}` : "yes", "all", missing.length === 0],
];

console.log(`\n${PAGE_URL}  (${RUNS} runs each${LATE_PHOTO_MS ? `, photo held back ${LATE_PHOTO_MS} ms` : ""})\n`);
for (const [, name, val, lim, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(38)} ${String(val).padStart(10)}   budget ${lim}`);
console.log("\nFor information (not in speed-budget.json):");
console.log(`  Lighthouse LCP median ${Math.round(med(lh, "lcpMs"))} ms on "${lh[0].lcpElement}"`);
console.log(`  Lighthouse CLS worst ${worst(lh, "cls").toFixed(3)}, TBT median ${Math.round(med(lh, "tbtMs"))} ms, page weight median ${med(lh, "kb").toFixed(0)} KB`);
console.log(`  Slowed-browser CLS worst ${worst(tr, "cls").toFixed(3)}`);

const shifts = tr.flatMap((r) => r.shifts);
if (shifts.length) {
  console.log("\nWhat moved (slowed browser, all runs):");
  for (const s of shifts) console.log(`  ${s.value.toFixed(3)} at ${s.at} ms: ${s.sources.join("; ")}`);
}
const bad = tr.find((r) => r.gridMove === worst(tr, "gridMove"));
if (bad && bad.gridMove > 0) {
  console.log("\nSize grid top edge over time (worst run):");
  for (const t of bad.gridTops) console.log(`  ${t.at} ms: ${t.top} px`);
}
if (REPORT_DIR) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const worstLh = lh.find((r) => r.score === least(lh, "score"));
  const [html, json] = worstLh.report;
  writeFileSync(`${REPORT_DIR}/lighthouse-report.html`, html);
  writeFileSync(`${REPORT_DIR}/lighthouse-report.json`, json);
  const shot = `${REPORT_DIR}/phone-375-size-tapped.png`;
  const tapped = await tappedScreenshot(shot);
  const summary = {
    url: PAGE_URL,
    measured_at: worstLh.fetchTime,
    runs: RUNS,
    lighthouse_scores: lh.map((r) => r.score),
    checks: Object.fromEntries(checks.map(([key, , value, limit, pass]) => [key, { value, limit, pass }])),
    screenshot: { file: shot, size_tapped: TAP_SIZE, selected: tapped },
  };
  writeFileSync(`${REPORT_DIR}/summary.json`, JSON.stringify(summary, null, 2) + "\n");
  console.log(`\nSaved the worst run's Lighthouse report, summary.json and ${shot} (${TAP_SIZE} tapped) in ${REPORT_DIR}/`);
}
if (process.env.JSON_OUT) writeFileSync(process.env.JSON_OUT, JSON.stringify({ checks, lh: lh.map(({ report, ...r }) => r), tr }, null, 2));
process.exit(checks.every((c) => c[4]) ? 0 : 1);
