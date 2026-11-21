# Trace prompt: Slow 4G phone trace

This is the prompt for recording the Slow 4G phone trace of the Pegasus 43
page, so it runs the same way every time (Farhad Hossain, 21 Nov 2026). The
values come from the Web Platform Slow 4G Mobile Check Profile (owner: Diego
Salazar). Don't change them here; changes go through a PR on the profile.

`npm run check:speed` runs this same setup. See [speed-notes.md](speed-notes.md)
for how, and [trace-findings.md](trace-findings.md) for the last results.

---

Record a trace of the Pegasus 43 page as a shopper on a slow phone sees it,
from first paint until fully loaded, with the cache off (first visit).

1. **Phone screen:** a 375 x 812 CSS px viewport at 3x pixel density
   (`deviceScaleFactor: 3`), with mobile on (touch and the page's viewport
   meta). Don't judge the size grid from a desktop or unthrottled trace.

2. **Network and CPU:** Slow 4G, the same settings as the Lighthouse check.
   - Lighthouse (`formFactor: mobile`, `throttlingMethod: simulate`):
     150 ms round trip (`rttMs`) and 1638.4 Kbps (`throughputKbps`).
   - Real-browser trace (DevTools throttling): 562.5 ms request latency,
     1474.56 Kbps download, 675 Kbps upload.
   - 4x CPU slowdown (`cpuSlowdownMultiplier: 4`) for both.

3. **What to report about the size grid:**
   - **Grid movement:** how many CSS px the top edge of
     `[data-testid="size-grid"]` moved from first paint to fully loaded.
     The budget is 0 px (`size_grid_shift_px_max` in `speed-budget.json`).
   - **What caused it:** for any movement, which late piece moved it (the
     photo, the font or the price, or something else), when it happened and
     how far, from the layout shift events in the trace.
   - **Smallest size button:** the smaller of width and height of every
     `[data-testid="size-button"]` and `[data-testid="size-button-sold-out"]`.
     The budget is 44 px or more (`size_button_min_px`). Sold-out buttons must
     stay full size.
   - **Lighthouse performance score** under the settings above. The budget is
     90 or more (`performance_score_min`).
   - **The five watched test ids:** confirm the page renders `size-grid`,
     `size-button`, `size-button-sold-out`, `main-photo` and `price`. Name any
     that are missing; a missing one fails the check.

   Give each as a pass or fail against `speed-budget.json`, and save the trace
   so it can be opened in Chrome DevTools > Performance.
