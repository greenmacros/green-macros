# GreenMacros 🌱

Free, open-source macro planner focused on plant-based nutrition.

- No accounts, no paywalls, no tracking
- Works offline — everything is stored in your browser
- Share plans with a link

## Features
- **Plans built for many plans** — searchable "All plans" switcher with totals, scrollable tabs, drag-to-reorder, colors, duplicate/rename/delete (with undo)
- **Fast product adding** — inline form with auto-calculated calories, searchable picker in the planner (create a product without leaving your plan), favorites, search & sort, Open Food Facts import, nutrition-label parsing (EN/JP, per-serving or per-100g)
- **Auto-fill** — scale all unlocked items to hit a protein / calorie / carb / fat target
- **Smart meal builder** — pick products + a target and it suggests amounts (always shown with a medical-advice warning)
- **Light / dark mode, print, and PNG export** of any plan (and printing the week)
- **Per-meal targets** — optional calorie/macro target on any meal (pre/post-workout, etc.)
- **Week view** — assign plans to days, see weekly totals and daily averages
- **Recipes** — save a meal as a recipe and drop it into any meal later
- **English / 日本語** — full UI in both languages (auto-detected, switch any time)
- **Food list** — bundled offline list of ~100 common foods (Japan + global, searchable in kanji / kana / English), Open Food Facts (global or Japan), and CSV import for bigger databases such as the MEXT Japan Standard Tables of Food Composition
- **Installable & offline** — a service worker caches the app so it works without a connection (try `npm run build && npm run preview`)
- **Share & backup** — share a single plan or everything via link (merge or replace on import), JSON backups, CSV export, copy as text

## Development
```bash
npm install
npm run dev     # local dev server
npm test        # unit tests (lib/)
npm run lint
npm run build
npm run preview # production build incl. service worker
```

Built with React + Vite.
