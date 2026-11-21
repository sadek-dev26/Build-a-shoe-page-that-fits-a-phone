# Speed budget and layout shift notes

Goal: on a slow phone at 375 px, the size grid does not move while the
photo, font and price load. A grid that jumps makes shoppers tap the wrong
size.

## The budget

`speed-budget.json` (repo root) follows the Web Platform **Slow 4G Mobile
Check Profile** (owner: Diego Salazar). It must hold exactly these three keys,
no more and no fewer:

| Key | Value | Meaning |
| --- | --- | --- |
| `performance_score_min` | 90 | Lighthouse mobile performance score must be 90 or more |
| `size_grid_shift_px_max` | 0 | The size grid's top edge may not move at all, first paint to fully loaded |
| `size_button_min_px` | 44 | Every size button, sold-out ones included, is at least 44 px on its shorter side |

These are the profile's required values. The profile allows stricter values
but not looser ones, and its values are changed only by a PR on the profile
itself, not in this repo.

## How it is measured

Settings come from the profile:

- **Lighthouse:** mobile, `simulate` throttling, 150 ms round trip,
  1638.4 Kbps, 4x CPU slowdown, screen 375 x 812 at 3x.
- **Slowed real browser (the trace):** the same screen and CPU, with the
  DevTools-style network the profile gives for traces: 562.5 ms latency,
  1474.56 Kbps down, 675 Kbps up. The cache is off, so each run is a first
  visit. The script tracks `[data-testid="size-grid"]` on every frame and
  records every layout shift with the element that moved.

Run it:

```bash
npm run build && npm start        # terminal 1
npm run check:speed               # terminal 2: 3 runs, exits 1 on any FAIL
LATE_PHOTO_MS=2500 npm run check:speed            # also hold the photo back 2.5 s
TRACE_OUT=trace.json npm run check:speed          # also save a Chrome trace
```

The check also fails if any of the five watched elements is missing:
`size-grid`, `size-button`, `size-button-sold-out`, `main-photo`, `price`.

## The fixes, one per late piece

| Late piece | What would move the grid | Fix | Where |
| --- | --- | --- | --- |
| Photo | An image with no size is 0 px tall until it loads, then pushes everything down | A fixed 240 px box around a `next/image` with `fill`, marked `priority` so it is preloaded. Real photos (JPG, PNG, WebP) are resized and sent as WebP/AVIF; the SVG placeholder is sent as is | `app/page.tsx` |
| Font | A web font with different letter widths and line heights than the fallback can make text grow or wrap when it arrives | `next/font` (Inter) self-hosts and preloads the font and makes a size-matched fallback: Arial with `size-adjust` 107.12% and ascent/descent overrides. Text lines also have fixed pixel line heights | `app/layout.tsx` |
| Price | A price that arrives late (live price, sale) appears in an empty spot and pushes the grid down | A fixed 24 px price line (`h-6`, one line, cut off rather than wrapping) | `app/page.tsx` |
| Name and colorway | A long colorway or a font swap could wrap onto a second line | Fixed one-line heights: 28 px name, 20 px colorway | `app/page.tsx` |
| Stock data | Hiding sold-out sizes would change the grid's shape and move the buttons under a thumb | Sold-out sizes stay as full-size 48 px buttons, greyed out and disabled | `components/SizeGrid.tsx` |

Results are in [trace-findings.md](trace-findings.md).
