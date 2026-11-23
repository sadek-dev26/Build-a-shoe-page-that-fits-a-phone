# Vercel launch and Lighthouse prompt

This is the message Farhad Hossain sends Claude Code to put the Pegasus 43
page live on Vercel and check the **live** page like a real phone. Paste it as
is to launch again and get numbers you can compare with
[launch/](launch/). It differs from [trace-prompt.md](trace-prompt.md), which
only runs against `localhost:3000`: this one deploys to Vercel and scores the
public `.vercel.app` address shoppers open. The settings come from the Web
Platform Slow 4G Mobile Check Profile and match
[speed-notes.md](speed-notes.md) and `speed-budget.json`.

Live page: https://build-a-shoe-page-that-fits-a-phone.vercel.app

## Before the first launch (once, by hand)

Connecting Vercel to GitHub needs your own sign-in, so Claude Code can't do it:

1. Go to https://vercel.com/signup, pick **Hobby** (free) and
   **Continue with GitHub**.
2. Let Vercel see the `Build-a-shoe-page-that-fits-a-phone` repo.
3. In Vercel: **Add New → Project → Import** that repo. Leave the settings as
   they are (Vercel finds Next.js) and click **Deploy**.
4. Copy the `.vercel.app` link into the GitHub repo's About box.

From then on, every PR merged into `main` deploys by itself, and every PR
branch gets its own preview link.

## The prompt

```text
Put the Pegasus 43 page live on Vercel and check it like a real phone.

First read speed-budget.json, docs/speed-notes.md and docs/trace-findings.md.
Do not change speed-budget.json: its three values come from the Slow 4G Mobile
Check Profile and only change through a PR on the profile.

1. Stock data. Replace data/nike_pegasus_size_stock.json with the stock
   snapshot I attach (today: "Pegasus Size and Stock Snapshot, 8 December
   2026"). Check it has all 26 sizes and show each one as in stock, few left
   (stock_status "low_stock") or sold out (stock_status "sold_out" or
   in_stock false). Keep 48 px buttons and the size grid at 0 px shift. Do not
   hide sold-out sizes.

2. Launch. Open a PR. Vercel is connected to the repo, so when I merge it
   Vercel deploys main to https://build-a-shoe-page-that-fits-a-phone.vercel.app.
   After the merge, confirm the live link loads (HTTP 200) and shows the new
   stock (count the sold-out and few-left buttons against the snapshot).

3. Check the live page like a slow phone. Run, against the live link:
     PAGE_URL=https://build-a-shoe-page-that-fits-a-phone.vercel.app/ \
     REPORT_DIR=docs/launch/live npm run check:speed
   That is mobile Lighthouse with our speed-notes settings:
   - Screen 375 x 812 at 3x, mobile, touch.
   - Lighthouse: simulate throttling, 150 ms round trip, 1638.4 Kbps, 4x CPU.
   - Slowed real browser: 562.5 ms latency, 1474.56 Kbps down, 675 Kbps up,
     4x CPU, cache off so every run is a first visit.
   - 3 runs.
   Check the worst run against speed-budget.json:
   - performance_score_min: lowest Lighthouse score must be 90 or more.
   - size_grid_shift_px_max: worst size grid movement must be 0 px.
   - size_button_min_px: every size button, sold-out ones included, at least
     44 px on its shorter side.
   All five test ids must be found: size-grid, size-button,
   size-button-sold-out, main-photo, price.

4. Save the proof in docs/. REPORT_DIR saves the worst run's Lighthouse report
   (lighthouse-report.html and .json), summary.json with every check, and a
   375 px phone screenshot with a size tapped (phone-375-size-tapped.png,
   M 10.5 / W 12 by default; change it with TAP_SIZE). Commit them.

5. Put the live link at the top of the README, with the date the stock data
   was checked against the snapshot.

What I want back: the PR link; the live link and whether it loaded; a table
of the 3 Lighthouse scores, worst grid movement, smallest button and CLS for
the live page; and anything that failed, with what you'd change to fix it.
```

## Why each part is there

- **It scores the live address, not localhost.** A Vercel build can differ
  from a local one (its CDN, compression and cold starts), and the live page is
  what shoppers and the launch check open.
- **The settings are spelled out** so every launch gives numbers you can
  compare. Change one and the results stop lining up with earlier runs.
- **The grid is checked in pixels**, not just by score: a late price once
  moved it 28 px while Lighthouse still scored 100
  (see [trace-findings.md](trace-findings.md)).
- **The tapped screenshot** shows the selected state and the real stock in one
  picture, so anyone reviewing can see which sizes shoppers can buy.
