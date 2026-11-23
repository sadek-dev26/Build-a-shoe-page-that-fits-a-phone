# Launch check results

Each folder holds one `npm run check:speed` run with `REPORT_DIR` set
(3 runs, Slow 4G Mobile Check Profile settings, see
[../speed-notes.md](../speed-notes.md)): the worst run's Lighthouse report
(`lighthouse-report.html`, open it in a browser; `.json` for tools),
`summary.json` with every budget check, and `phone-375-size-tapped.png`,
a 375 x 812 phone screenshot at 3x with M 10.5 / W 12 tapped.

| Folder | Page checked | Date | Lighthouse (3 runs) | Grid shift (worst) | Smallest button | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `local-build/` | Production build on localhost (same code Vercel serves), 8 December stock | 23 Nov 2026 | 100, 100, 100 | 0 px | 48 px | All pass |
| `live/` | https://build-a-shoe-page-that-fits-a-phone.vercel.app | Not run yet | | | | |

`live/` is still to come: the cloud workspace that made `local-build/` was
not allowed to reach `vercel.app`. Run the command in
[../vercel-launch-prompt.md](../vercel-launch-prompt.md) after this PR is
merged to fill it in.
