# Trace prompt

This is the message Farhad Hossain sends Claude Code to run the Slow 4G phone
trace of the Pegasus 43 page. Paste it as is to run the same trace again and
get numbers you can compare with [trace-findings.md](trace-findings.md). The
settings come from the Web Platform Slow 4G Mobile Check Profile and match
[speed-notes.md](speed-notes.md).

## The prompt

```text
Run a Slow 4G trace of the Pegasus 43 page and tell me what moves the size grid.

First read speed-budget.json, docs/speed-notes.md and docs/trace-findings.md.
Do not change speed-budget.json: its three values come from the Slow 4G Mobile
Check Profile and only change through a PR on the profile.

1. Load the page like a slow phone. Build and serve it with
   `npm run build && npm start`, then open http://localhost:3000/ in Chrome:
   - Screen 375 x 812 at 3x device pixel ratio, mobile, touch.
   - Network: 562.5 ms latency, 1474.56 Kbps down, 675 Kbps up.
   - CPU: 4x slowdown.
   - Cache off, so every run is a first visit. Do 3 runs.

2. Watch the size grid while the photo, font and price load. Track the top
   edge of [data-testid="size-grid"] on every frame from first paint to fully
   loaded, and record every layout shift with the element that moved. Note when
   main-photo, the web font and price each arrive. Do one more set of runs with
   the photo held back 2.5 s (LATE_PHOTO_MS=2500) to prove its box is reserved.
   Save the first run as a Chrome trace in docs/trace/.

3. Check the results against speed-budget.json:
   - performance_score_min: lowest Lighthouse mobile score of the 3 runs
     (simulate throttling, 150 ms round trip, 1638.4 Kbps, 4x CPU, 375 x 812
     at 3x) must be 90 or more.
   - size_grid_shift_px_max: worst size grid movement must be 0 px.
   - size_button_min_px: every size button, sold-out ones included, must be
     at least 44 px on its shorter side.
   All five test ids must be found: size-grid, size-button,
   size-button-sold-out, main-photo, price. `npm run check:speed` does all of
   this and exits 1 on any FAIL.

4. Fix anything that moves the grid. For each shift, name the late piece
   (photo, font, price, text wrap or stock data), reserve its space so the grid
   stays put, and re-run until all three budget checks pass. Do not hide
   sold-out sizes or shrink buttons to get there.

What I want back: a table of score, worst grid movement, smallest button and
CLS for each run set, before and after any fix; what moved the grid and the fix
for each; and docs/trace-findings.md updated with the new numbers and date.
```

## Why each part is there

- **The settings are spelled out** so anyone who runs the prompt gets numbers
  they can compare. Change one and the results no longer line up with
  [trace-findings.md](trace-findings.md).
- **The grid is checked in pixels**, not just by score: a late price once moved
  it 28 px while Lighthouse still scored 100.
- **The held-back photo run** shows the grid stays put even when the photo is
  much slower than usual.
