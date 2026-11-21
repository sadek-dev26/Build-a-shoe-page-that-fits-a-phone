# Trace findings

Measured on 2026-11-21 with `npm run check:speed` (3 runs per row) against a
production build (`npm run build && npm start`), using the Slow 4G Mobile
Check Profile settings described in [speed-notes.md](speed-notes.md).

## Results

| Version | Lighthouse score (lowest) | Size grid movement (worst) | Smallest size button | Watched test ids | CLS (worst) | Page weight |
| --- | --- | --- | --- | --- | --- | --- |
| Before: `main` at 77ecd1a | 99 | 0 px ¹ | 48 px | **missing all 5** | 0.000 | 148 KB |
| Naive version: price added late, no reserved line ² | 100 | **28 px** | 48 px | all 5 | 0.022 | 241 KB |
| Naive version, photo also held back 2.5 s ² | 100 | **268 px** | 48 px | all 5 | 0.327 | 241 KB |
| **After: this branch** | **99** | **0 px** | **48 px** | **all 5** | **0.000** | 197 KB |
| After, photo held back 2.5 s | 99 | 0 px | 48 px | all 5 | 0.000 | 197 KB |

Budget (`speed-budget.json`): score ≥ 90, grid movement ≤ 0 px, buttons ≥ 44 px.
The "after" rows pass all three, and all five watched elements are found.

¹ `main` has no `data-testid`s, so the grid was tracked by its `<ul>` for this
row. The launch check itself would fail `main`, because it can't find the
five watched elements.

² Not committed. These were built only to prove the check catches a jumping
grid: the photo as a plain `<img>` with no size, Inter from a Google Fonts
`<link>` with no size-matched fallback, and the price drawn by the browser
0.8 s after load with no reserved line.

## What the trace shows

From `docs/trace/pegasus-slow-4g-trace.json.gz` (first slowed run of the
"after" row). Open it in Chrome DevTools, Performance panel, "Load profile".

- **First paint at 1.45 s** shows the name, colorway, price and the full
  size grid, in the size-matched fallback font. The grid's top edge is at
  382 px and stays there in every frame of every run.
- **The font arrives late, at 2.13 s**, after first paint, and swaps in.
  There are **no layout shift events** in the trace, so the size-matched
  fallback (Arial at `size-adjust` 107.12%) and the fixed line heights work.
- **The photo** request finishes at 1.22 s. Its 240 px box is in the HTML
  before any image byte arrives, so even when the photo is held back 2.5 s
  the grid stays at 0 px.
- **The price** is in the HTML on first paint, in a fixed 24 px line. The
  naive run shows what that line prevents: a late price moved the grid 28 px
  and Lighthouse still scored it 100 with a "good" CLS of 0.022. That is why
  the profile checks the grid in pixels and not just the score.
- **Sold-out sizes** (4 of 26) are 48 px tall like the rest, so stock data
  doesn't change the grid's shape.

## Things to know

- **Inter adds about 49 KB** (one Latin woff2 file), which is most of the
  148 KB to 197 KB change. The score stays at 99.
- **The largest paint is the product name, not the photo**, at about
  0.76 s in Lighthouse. Chrome leaves low-detail images like the grey SVG
  placeholder out of LCP. The profile expects `main-photo` to be the largest
  element. When the real photo goes in (at least 1125 px wide, for a 3x
  phone), it should become the LCP element; `priority` already preloads it.
  Re-run `npm run check:speed` after swapping it in.
- These numbers are from a local server in a cloud container, not the live
  Vercel page the launch check reads. Expect the live score to differ a
  little.
