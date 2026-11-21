# Nike Pegasus 43 phone page

A Next.js + Tailwind CSS page built from the Pegasus 43 phone page plan.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To see it at phone size in Chrome, open DevTools
(F12), turn on the device toolbar (Ctrl+Shift+M, or Cmd+Shift+M on a Mac) and
set the width to 375. On a real phone on the same Wi-Fi, run
`npm run dev -- -H 0.0.0.0` and open `http://<your computer's IP>:3000`.

## How each size button looks

Every size is a 48 px tall button in a 3-column grid. The size label (for
example `M 4 / W 5.5`) is on the first line at 14 px. A second line at 11 px
shows a note only when there is one. The button's state comes from `in_stock`
and `low_stock` in the data file.

| State | When | Label | Note | Colors | Tappable |
| --- | --- | --- | --- | --- | --- |
| In stock | `in_stock: true`, `low_stock: false` | Size label | none | White background, grey border, near-black text | Yes |
| Low stock | `in_stock: true`, `low_stock: true` | Size label | "Few left" in orange | White background, grey border, near-black text | Yes |
| Sold out | `in_stock: false` (even if `low_stock` is true) | Size label, struck through | "Sold out" in light grey | Light grey background and border, light grey text | No: disabled, "not allowed" cursor |
| Selected | The shopper tapped an in-stock or low-stock size | Size label in white | "Few left" in faded white, if low stock | Near-black background and border | Yes |

Sold-out buttons keep their place and size, so the grid never shifts. Screen
readers hear the note with the size, for example "M 4 / W 5.5, few left".

## Use your real data

`data/nike_pegasus_size_stock.json` was rebuilt from an earlier reading of your
file and has **not been checked against the original**. Replace it with your
real `nike_pegasus_size_stock.json` (same file name). The page reads these
fields from each row: `display_order`, `size_label`, `in_stock`, `low_stock`,
`price`, `colorway` and, if present, `product_name`. The file can be a plain
array of rows or an object with a `sizes` array. If your field names differ,
change them in `lib/product.ts`.

## Swap in the photo

Put the photo in `public/` and change `PHOTO_SRC` in `app/page.tsx`. Use one
at least 1125 px wide so it looks sharp on a 3x phone. The box stays 240 px
tall whatever the image size, so the sizes never jump.

## Speed budget and the steady size grid

`speed-budget.json` holds the three limits from the Web Platform Slow 4G
Mobile Check Profile: Lighthouse score 90 or more, the size grid moves 0 px
while the page loads, and size buttons are at least 44 px. To check them:

```bash
npm run build && npm start   # in one terminal
npm run check:speed          # in another
```

The prompt for the trace is in `docs/trace-prompt.md`. See `docs/speed-notes.md` for how each late piece (photo, font, price) has its
space saved, and `docs/trace-findings.md` for the before and after numbers.

## What is where

- `speed-budget.json`: the three limits the launch check reads
- `scripts/check-speed.mjs`: runs Lighthouse and a slowed phone trace and checks the budget
- `docs/trace-prompt.md`: the prompt for the Slow 4G phone trace (screen, network and CPU, what to report)
- `docs/speed-notes.md`, `docs/trace-findings.md`, `docs/trace/`: the budget, the fixes and the results
- `docs/build-prompt.md`: what Claude Code was asked to build
- `docs/pegasus-page-first-screen.png`: the first screen at 375 px
- `app/page.tsx`: the page, top to bottom (photo, name/colorway/price, sizes, details, reviews)
- `components/SizeGrid.tsx`: the 26 size buttons
- `lib/product.ts`: reads the JSON; price and colorway are read once from the first row
- Details and Reviews hold placeholder text, because the data file has none.
