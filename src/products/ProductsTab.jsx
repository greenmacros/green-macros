import { useEffect, useState } from "react";

/* =========================
   Starter Products
========================= */

const STARTER_PRODUCTS = [
    { name: "White Rice (cooked)", servingGrams: 100, unit: "g", cal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { name: "Tofu", servingGrams: 100, unit: "g", cal: 76, protein: 8, carbs: 2, fat: 5 },
    { name: "Broccoli", servingGrams: 150, unit: "g", cal: 45, protein: 6, carbs: 8, fat: 1 },
    { name: "Potatoes (boiled)", servingGrams: 100, unit: "g", cal: 80, protein: 2.5, carbs: 18, fat: 0.2 },
    { name: "Lentils (cooked)", servingGrams: 100, unit: "g", cal: 116, protein: 9, carbs: 20, fat: 0.4 },
    { name: "Chickpeas (cooked)", servingGrams: 100, unit: "g", cal: 164, protein: 9, carbs: 27, fat: 2.6 },
    { name: "Soy Milk", servingGrams: 200, unit: "ml", cal: 106, protein: 8.4, carbs: 3.4, fat: 14 },
    { name: "Protein Shake", servingGrams: 35, unit: "g", cal: 160, protein: 25, carbs: 2, fat: 3 }
];

/* =========================
   Label Parsing (EU / US / JP)
========================= */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

  function matchValue(regexes, text) {
    for (const r of regexes) {
      const m = text.match(r);
      if (m) {
        const num = m.find(v => typeof v === "string" && v.match(/^\d/));
        if (num) return parseFloat(num);
      }
    }
    return 0;
  }


function parseLabel(text) {
  const t = normalize(text);

  const kcal =
    matchValue([/calories?\s*(\d+(\.\d+)?)/,/cal\s*(\d+(\.\d+)?)/ ,/kcal\s*(\d+(\.\d+)?)/,/熱量\s*(\d+(\.\d+)?)/], t) ||
    (() => {
      const kj = matchValue([/(\d+(\.\d+)?)\s*kj/], t);
      return kj ? kj / 4.184 : 0;
    })();

  const protein = matchValue([
    /protein[s]?\s*(\d+(\.\d+)?)/,
    /たんぱく質\s*(\d+(\.\d+)?)/,
    /タンパク質\s*(\d+(\.\d+)?)/,
    /蛋白質\s*(\d+(\.\d+)?)/,
  ], t);

  const carbs = matchValue([
    /total\s*carbohydrate(?:s)?\s*(\d+(?:\.\d+)?)/,
    /carbohydrate(?:s)?\s*(\d+(?:\.\d+)?)/,
    /carb(?:s)?\s*(\d+(?:\.\d+)?)/,
    /炭水化物\s*(\d+(?:\.\d+)?)/,
  ], t) || 0;

  const fat = matchValue([
    /fat[s]?\s*(\d+(\.\d+)?)/,
    /脂質\s*(\d+(\.\d+)?)/,
  ], t);

  const serving = matchValue([/(\d+)\s*(g|ml)/], t) || 100;
  const unit = t.includes("ml") ? "ml" : "g";

  const name =
    text
      .split("\n")
      .map(l => l.trim())
      .find(l => l && !/nutrition|calories|energy/i.test(l)) ||
    "Imported product";

  return {
    name,
    servingGrams: serving,
    unit,
    cal: kcal,
    protein,
    carbs,
    fat
  };
}

/* =========================
   Component
========================= */

export default function ProductsTab({ products, setProducts }) {
  /* ---------- OFF Search ---------- */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchOFF() {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=8`
    );
    const data = await res.json();
    setResults(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!query.trim()) setResults([]);
  }, [query]);

  function importOFFProduct(p) {
    const kcal =
      p.nutriments?.["energy-kcal_100g"] ??
      (p.nutriments?.energy_100g
        ? Math.round(p.nutriments.energy_100g / 4.184)
        : 0);
    setProducts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: p.product_name || "Imported product",
        servingGrams: 100,
        unit: "g",
        cal: kcal,
        protein: p.nutriments?.proteins_100g || 0,
        carbs: p.nutriments?.carbohydrates_100g || 0,
        fat: p.nutriments?.fat_100g || 0
      }
    ]);
  }

  /* ---------- Label Import ---------- */
  const [labelText, setLabelText] = useState("");
  const [preview, setPreview] = useState(null);

  /* ---------- Product CRUD ---------- */
  function update(i, key, value) {
    setProducts(p =>
      p.map((x, idx) =>
        idx === i ? { ...x, [key]: key === "name" || key === "unit" ? value : Number(value) || 0 } : x
      )
    );
  }

  function addProduct() {
    setProducts(p => [
      ...p,
      { id: Date.now(), name: "New Product", servingGrams: 100, unit: "g", cal: 0, protein: 0, carbs: 0, fat: 0 }
    ]);
  }

  function duplicateProduct(i) {
    setProducts(p => [...p, { ...p[i], id: Date.now() }]);
  }

  function removeProduct(i) {
    setProducts(p => p.filter((_, idx) => idx !== i));
  }

  function loadStarterPack() {
    setProducts(STARTER_PRODUCTS.map(p => ({ ...p, id: Date.now() + Math.random() })));
  }

  /* ---------- Sort ---------- */
  const [sortBy, setSortBy] = useState(
    localStorage.getItem("productSort") || "name"
  );
  useEffect(() => {
    localStorage.setItem("productSort", sortBy);
  }, [sortBy]);

  function sortProducts(type) {
    setProducts(prev => {
      const sorted = [...prev];

      switch (type) {
        case "name":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;

        case "protein-asc":
          sorted.sort((a, b) => b.protein - a.protein);
          break;

        case "protein-desc":
          sorted.sort((a, b) => a.protein - b.protein);
          break;

        case "carbs-asc":
          sorted.sort((a, b) => b.carbs - a.carbs);
          break;

        case "carbs-desc":
          sorted.sort((a, b) => a.carbs - b.carbs);
          break;

        case "cal-asc":
          sorted.sort((a, b) => b.cal - a.cal);
          break;

        case "cal-desc":
          sorted.sort((a, b) => a.cal - b.cal);
          break;

        case "fat-asc":
          sorted.sort((a, b) => b.fat - a.fat);
          break;

        case "fat-desc":
          sorted.sort((a, b) => a.fat - b.fat);
          break;

        default:
          return prev;
      }

      return sorted;
    });
  }

  /* ---------- Render ---------- */
  return (
    <div className="products-tab">
      <h2>Products</h2>

      {/* Starter pack */}
      <div className="glass-card">
        <button className="primary-btn" onClick={loadStarterPack}>
          Load Starter Products
        </button>
      </div>
          <div className="sort-row">
            <label>Sort by:</label>

              <select
                value={sortBy}
                onChange={e => {
                  setSortBy(e.target.value);
                  sortProducts(e.target.value);
                }}
              >
                <option value="">— Select —</option>
                <option value="name">Alphabetical (A–Z)</option>
                <option value="protein-asc">Protein ⬆</option>
                <option value="protein-desc">Protein ⬇</option>
                <option value="carbs-asc">Carbs ⬆</option>
                <option value="carbs-desc">Carbs ⬇</option>
                <option value="cal-asc">Calories ⬆</option>
                <option value="cal-desc">Calories ⬇</option>
                <option value="fat-asc">Fat ⬆</option>
                <option value="fat-desc">Fat ⬇</option>
              </select>
            </div>
      {/* Products table */}
      <div className="products-table-scroll">
        <div className="products-header products-row">
          <div>Name</div><div>Serving</div><div>Unit</div><div>Calories</div><div>Protein</div><div>Carbs</div><div>Fat</div><div />
        </div>
        {products.map((p, i) => (
          <div key={p.id} className="products-row">
            <input value={p.name} onChange={e => update(i, "name", e.target.value)} />
            <input type="number" value={p.servingGrams} onChange={e => update(i, "servingGrams", e.target.value)} />
            <select value={p.unit} onChange={e => update(i, "unit", e.target.value)}>
              <option>g</option><option>ml</option><option>unit</option><option>scoop</option>
            </select>
            <input type="number" value={p.cal} onChange={e => update(i, "cal", e.target.value)} />
            <input type="number" value={p.protein} onChange={e => update(i, "protein", e.target.value)} />
            <input type="number" value={p.carbs} onChange={e => update(i, "carbs", e.target.value)} />
            <input type="number" value={p.fat} onChange={e => update(i, "fat", e.target.value)} />

            <div className="row-actions">
              <button onClick={() => duplicateProduct(i)}>⧉</button>
              <button className="danger" onClick={() => removeProduct(i)}>✕</button>
            </div>
          </div>
        ))}
        <div>
        <button className="primary-btn" onClick={addProduct}>+ Add Product</button>
        </div>
      </div>

      {/* OFF Search */}
      <div className="glass-card">
        <h3>Search products (Open Food Facts)</h3>
        <div className="search-row">
          <input value={query} onChange={e => setQuery(e.target.value)} />
          <button onClick={searchOFF}>Search</button>
        </div>

        {loading && <div className="muted">Searching…</div>}

        {results.map(p => (
          <div key={p.code} className="off-row">
            <div>{p.product_name || "Unnamed product"}</div>
            <div className="muted">
              {p.nutriments?.energy_kcal_100g ??
              (p.nutriments?.energy_100g
                ? Math.round(p.nutriments.energy_100g / 4.184)
                : "?")} kcal ·

              P {p.nutriments?.proteins_100g ?? "?"} ·
              C {p.nutriments?.carbohydrates_100g ?? "?"} ·
              F {p.nutriments?.fat_100g ?? "?"}
            </div>
            <button onClick={() => importOFFProduct(p)}>Import</button>
          </div>
        ))}
      </div>

      {/* Label Import */}
      <div className="glass-card">
        <h3>Paste nutrition label</h3>
        <div className="label-import">
          <textarea rows={4} value={labelText} onChange={e => setLabelText(e.target.value)} />
        </div>
        <button onClick={() => setPreview(parseLabel(labelText))}>Preview</button>

        {preview && (
          <div className="preview-card">
            <strong>{preview.name}</strong>
            <div>{preview.cal} kcal · P {preview.protein} · C {preview.carbs} · F {preview.fat}</div>
            <button
              className="primary-btn"
              onClick={() => {
                setProducts(p => [...p, { ...preview, id: Date.now() }]);
                setPreview(null);
                setLabelText("");
              }}
            >
              Confirm import
            </button>
          </div>
        )}
        <p className="note">
          ⚠️ Preloaded values are approximate. Always verify nutrition labels.
          GreenMacros is a planning tool, not medical advice.
        </p>

      </div>
    </div>
  );
}
