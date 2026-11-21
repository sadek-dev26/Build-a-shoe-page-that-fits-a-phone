# Build prompt

This is what was asked of Claude Code to build this page (Farhad Hossain, 21 Nov 2026).

1. **What it works from:** the Pegasus 43 page plan and `nike_pegasus_size_stock.json`.
2. **The phone and size rules:** 375 pixels with no pinching, all 26 sizes as a grid
   of big buttons (not a dropdown, since a dropdown hides the sold-out and
   low-stock states), sold-out ones greyed and disabled, and the photo in a fixed
   box so the sizes don't jump when it loads.
3. **What you want back:** a working Next.js page with Tailwind CSS that you can
   run and open at phone size.

## What it made

- `app/page.tsx`: the page, top to bottom
- `components/SizeGrid.tsx`: the 26 size buttons
- `lib/product.ts`: reads the size and stock JSON
- `docs/pegasus-page-first-screen.png`: the first screen at 375 px
