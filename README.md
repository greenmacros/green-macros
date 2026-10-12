# GreenMacros 🌱

Free, open-source macro planner focused on plant-based nutrition.

- No accounts, no paywalls, no tracking
- Works offline — everything is stored in your browser
- Share plans with a link

## Features
- **Plans built for many plans** — searchable "All plans" switcher with totals, scrollable tabs, drag-to-reorder, colors, duplicate/rename/delete (with undo)
- **Fast product adding** — inline form with auto-calculated calories, searchable picker in the planner (create a product without leaving your plan), favorites, search & sort, Open Food Facts import (search or barcode / JAN number), nutrition-label parsing (EN/JP, per-serving or per-100g)
- **Food log** — a plain diary of what you actually ate, by day; copy a plan's meal into a day, targets shown for reference only
- **Light / dark mode, print, and PNG export** of any plan (and printing the week)
- **Per-meal targets** — optional calorie/macro target on any meal (pre/post-workout, etc.)
- **Week view** — assign plans to days, see weekly totals and daily averages
- **Recipes** — save a meal as a recipe and drop it into any meal later
- **English / 日本語** — full UI in both languages (auto-detected, switch any time)
- **Food list** — bundled offline lists — ~100 hand-picked foods (Japan + global) plus the full MEXT table (~2,500 Japanese foods, searchable in kanji / kana), lazy-loaded, Open Food Facts (global or Japan), and CSV import for bigger databases such as the MEXT Japan Standard Tables of Food Composition
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

## Data sources
- **MEXT** — Standard Tables of Food Composition in Japan (8th revised, 2023 supplement); regenerate `src/data/mextFoods.js` with `scripts/build-mext-foods.py`. Source: MEXT website (https://www.mext.go.jp/); values rounded and edited. Usage: MEXT content terms allow commercial use with attribution.
- **USDA FoodData Central** — public domain.
- **Open Food Facts** — ODbL 1.0, https://world.openfoodfacts.org/. Product data is fetched live and attributed in the app.

All values are approximate; always check the package label.
