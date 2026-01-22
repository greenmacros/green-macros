import { useEffect, useRef, useState } from "react";
import PlannerTab from "./planner/PlannerTab";
import ProductsTab from "./products/ProductsTab";
import { decompressFromEncodedURIComponent } from "lz-string";
import { compressToEncodedURIComponent } from "lz-string";


export function safeDecodeState(param) {
  if (!param) return null;

  try {
    const json = decompressFromEncodedURIComponent(param);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ===============================
   Storage helpers
================================ */
const STORAGE_KEYS = {
  products: "greenMacros_products",
  planner: "greenMacros_planner"
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ===============================
   JSON import / export helpers
================================ */
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/* ===============================
   Defaults
================================ */
const defaultProducts = [
  {
    id: 1,
    name: "Tofu Scramble",
    servingGrams: 200,
    unit: "g",
    cal: 228,
    protein: 22,
    carbs: 4,
    fat: 14
  }
];

const defaultPlannerState = {
  plans: [
    {
      id: Date.now(),
      name: "Plan 1",
      data: {
        profile: { calories: 2000, protein: 150, carbs: 250, fat: 40 },
        meals: [{ name: "Meal 1", items: [] }]
      }
    }
  ],
  activePlanId: null
};

/* ===============================
   App
================================ */
export default function App() {
  const [tab, setTab] = useState("planner");

  const [products, setProducts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.products, defaultProducts)
  );

  const [plannerState, setPlannerState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.planner, defaultPlannerState)
  );

  const [importedFromLink, setImportedFromLink] = useState(false);
  /* Ensure activePlanId exists */
  useEffect(() => {
    if (
      plannerState.plans.length &&
      !plannerState.plans.find(p => p.id === plannerState.activePlanId)
    ) {
      setPlannerState(s => ({
        ...s,
        activePlanId: s.plans[0].id
      }));
    }
  }, []);

  /* Auto-save */
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.planner, plannerState);
  }, [plannerState]);

  /* Link-share */
  function handleShareLink() {
  const payload = {
    products,
    plannerState,
  };

  const compressed = compressToEncodedURIComponent(
    JSON.stringify(payload)
  );

  const url =
    window.location.origin +
    window.location.pathname +
    "?data=" +
    compressed;

  navigator.clipboard.writeText(url);
  alert("🔗 Shareable link copied!");
}

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const data = params.get("data");
  if (!data) return;

  try {
    const parsed = JSON.parse(
      decompressFromEncodedURIComponent(data)
    );

    if (parsed.products) setProducts(parsed.products);
    if (parsed.plannerState) setPlannerState(parsed.plannerState);

    setImportedFromLink(true);
    window.history.replaceState({}, "", window.location.pathname);
  } catch (e) {
    console.error("Failed to import shared link", e);
  }
}, []);


  /* ===============================
     "..." menu logic
  ================================ */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ===============================
     Import handlers
  ================================ */
  async function importProducts(file) {
    try {
      const data = await readJSONFile(file);
      if (!Array.isArray(data)) throw new Error();
      setProducts(data);
    } catch {
      alert("Invalid products file");
    }
  }

  async function importPlans(file) {
    try {
      const data = await readJSONFile(file);
      if (!data.plans || !data.activePlanId) throw new Error();
      setPlannerState(data);
    } catch {
      alert("Invalid plans file");
    }
  }

  async function importAll(file) {
    try {
      const data = await readJSONFile(file);
      if (!data.products || !data.plannerState) throw new Error();
      setProducts(data.products);
      setPlannerState(data.plannerState);
    } catch {
      alert("Invalid backup file");
    }
  }

  return (
    <div className="app">
    <header className="topbar">
      <div className="topbar-left">
        <h1>GreenMacros</h1>
            {importedFromLink && (
              <div className="import-banner">
                Plan imported from link
              </div>
            )}

        <div className="tabs">
          <button
            className={tab === "planner" ? "active" : ""}
            onClick={() => setTab("planner")}
          >
            Plan
          </button>
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => setTab("products")}
          >
            Products
          </button>
            </div>

        {/* ⋯ MENU */}
        <div className="menu-wrapper" ref={menuRef}>
          <button className="icon-btn" onClick={() => setMenuOpen(v => !v)}>
            ⋯
          </button>

          {menuOpen && (
            <div className="menu floating">
              <button
                onClick={() =>
                  downloadJSON(products, "products.json")
                }
              >
                Export Products
              </button>

              <button
                onClick={() =>
                  downloadJSON(plannerState, "plans.json")
                }
              >
                Export Plans
              </button>

              <button
                onClick={() =>
                  downloadJSON(
                    { products, plannerState },
                    "greenmacros-full-backup.json"
                  )
                }
              >
                Export Full Backup
              </button>

              <hr />

              <label className="menu-file">
                Import Products
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={e => {
                    if (e.target.files[0]) {
                      importProducts(e.target.files[0]);
                      setMenuOpen(false);
                    }
                  }}
                />
              </label>

              <label className="menu-file">
                Import Plans
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={e => {
                    if (e.target.files[0]) {
                      importPlans(e.target.files[0]);
                      setMenuOpen(false);
                    }
                  }}
                />
              </label>

              <label className="menu-file">
                Import Full Backup
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={e => {
                    if (e.target.files[0]) {
                      importAll(e.target.files[0]);
                      setMenuOpen(false);
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
          <button
            className="btn-secondary share-btn"
            onClick={handleShareLink}
          >
            🔗 Share Link
          </button>
        </div>
      </header>

      {tab === "planner" && (
        <PlannerTab
          products={products}
          plannerState={plannerState}
          setPlannerState={setPlannerState}
        />
      )}

      {tab === "products" && (
        <ProductsTab products={products} setProducts={setProducts} />
      )}

      {/* ===============================
          FOOTER
      ================================ */}
      <footer className="app-footer">
        <p>
          Built with plant-based nutrition in mind 🌱  
          Today is a great day to start!

        </p>
        <p>
          <strong>Free. Open Source.</strong> No paywalls, no subscriptions,
          no “Pro” modes — just a simple tool that runs on plants.
        </p>
      </footer>

    </div>
  );
}
