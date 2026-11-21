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

## Use your real data

`data/nike_pegasus_size_stock.json` was rebuilt from an earlier reading of your
file and has **not been checked against the original**. Replace it with your
real `nike_pegasus_size_stock.json` (same file name). The page reads these
fields from each row: `display_order`, `size_label`, `in_stock`, `low_stock`,
`price`, `colorway` and, if present, `product_name`. The file can be a plain
array of rows or an object with a `sizes` array. If your field names differ,
change them in `lib/product.ts`.

## Swap in the photo

Put the photo in `public/` and change `PHOTO_SRC` in `app/page.tsx`. The box
stays 240 px tall whatever the image size, so the sizes never jump.

## What is where

- `app/page.tsx`: the page, top to bottom (photo, name/colorway/price, sizes, details, reviews)
- `components/SizeGrid.tsx`: the 26 size buttons
- `lib/product.ts`: reads the JSON; price and colorway are read once from the first row
- Details and Reviews hold placeholder text, because the data file has none.
