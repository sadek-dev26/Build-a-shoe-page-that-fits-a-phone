# Nike Pegasus 43 phone page

**Live page: https://build-a-shoe-page-that-fits-a-phone.vercel.app**

A Next.js + Tailwind CSS page built from the Pegasus 43 phone page plan.
Vercel deploys `main` to the live page on every merge.

Stock: all 26 sizes come from the **Pegasus Size and Stock Snapshot,
8 December 2026**, checked on 23 Nov 2026: 10 in stock, 7 few left, 9 sold out.

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

## Stock data

`data/nike_pegasus_size_stock.json` is the **Pegasus Size and Stock Snapshot,
8 December 2026**, copied in unchanged. It was checked on 23 Nov 2026: 26 rows,
26 different SKUs and display orders 1 to 26, $140 and Black/White-Volt on
every row, and `in_stock` agrees with `stock_status` on every row.

| Shown as | Snapshot says | Sizes |
| --- | --- | --- |
| Sold out (9) | `stock_status: "sold_out"`, 0 pairs | M 4.5, M 6, M 9, M 10, M 11.5, M 14, M 15, M 15.5, M 16 |
| Few left (7) | `stock_status: "low_stock"`, 1 to 5 pairs | M 3.5, M 4, M 5, M 8.5, M 13, M 13.5, M 14.5 |
| In stock (10) | `stock_status: "in_stock"`, 9 or more pairs | M 5.5, M 6.5, M 7, M 7.5, M 8, M 9.5, M 10.5, M 11, M 12, M 12.5 |

To use a newer snapshot, replace the file (same name). The page reads
`display_order`, `size_label`, `in_stock`, `stock_status` (or an older
`low_stock` flag), `price`, `colorway` and `product_name`. The file can be a
plain array of rows or an object with a `sizes` array. If field names change,
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

Add `PAGE_URL=https://build-a-shoe-page-that-fits-a-phone.vercel.app/` to
check the live page instead, and `REPORT_DIR=docs/launch/live` to save the
worst run's Lighthouse report and a 375 px screenshot with a size tapped.
`docs/vercel-launch-prompt.md` is the prompt that launches and checks the live
page.

See `docs/speed-notes.md` for how each late piece (photo, font, price) has its
space saved, `docs/trace-findings.md` for the before and after numbers, and
`docs/trace-prompt.md` for the prompt that runs the Slow 4G trace again.

## What is where

- `speed-budget.json`: the three limits the launch check reads
- `scripts/check-speed.mjs`: runs Lighthouse and a slowed phone trace and checks the budget
- `docs/speed-notes.md`, `docs/trace-findings.md`, `docs/trace/`: the budget, the fixes and the results
- `docs/build-prompt.md`: what Claude Code was asked to build
- `docs/trace-prompt.md`: what Claude Code is asked to run the Slow 4G phone trace
- `docs/vercel-launch-prompt.md`: what Claude Code is asked to put the page live on Vercel and run Lighthouse on the live link
- `docs/launch/`: Lighthouse reports and the size-tapped phone screenshot (`local-build/` now; `live/` once run against the live link)
- `docs/pegasus-page-first-screen.png`: the first screen at 375 px
- `app/page.tsx`: the page, top to bottom (photo, name/colorway/price, sizes, details, reviews)
- `components/SizeGrid.tsx`: the 26 size buttons
- `lib/product.ts`: reads the JSON; price and colorway are read once from the first row
- Details and Reviews hold placeholder text, because the data file has none.
