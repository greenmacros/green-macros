import { useEffect, useRef, useState } from "react";
import PlannerTab from "./planner/PlannerTab";
import ProductsTab from "./products/ProductsTab";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import Footer from "./components/Footer";
import FirstRunModal from "./components/FirstRunModal";

/* ===============================
   Plan share encoding (Level 1.5)
================================ */

function encodePlans(plans) {
  return plans.map(plan => [
    plan.id,
    plan.name,
    (plan.data?.meals || []).map(meal => [
      meal.name,
      (meal.items || []).map(it => [
        it.id,
        it.productId,
        it.amount,
        it.note ?? ""
      ])
    ]),
    // New: include profile targets in the share link
    [
      plan.data?.profile?.calories || 0,
      plan.data?.profile?.protein || 0,
      plan.data?.profile?.carbs || 0,
      plan.data?.profile?.fat || 0
    ]
  ]);
}

function decodePlans(arr) {
  return arr.map(([id, name, meals, profile]) => ({
    id,
    name,
    data: {
      // New: restore profile targets from the share link
      profile: {
        calories: profile?.[0] || 0,
        protein: profile?.[1] || 0,
        carbs: profile?.[2] || 0,
        fat: profile?.[3] || 0
      },
      meals: meals.map(([mealName, items]) => ({
        name: mealName,
        items: items.map(([iid, productId, amount, note]) => ({
          id: iid,
          productId,
          amount,
          note
        }))
      }))
    }
  }));
}

/* ===============================
   Share encoding helpers 
================================ */
function encodeProducts(products) {
  return products.map(p => [
    p.id,
    p.name,
    p.cal ?? p.calories ?? 0,
    p.protein ?? 0,
    p.carbs ?? 0,
    p.fat ?? 0,
    p.servingGrams ?? 100
  ]);
}

function decodeProducts(arr) {
  return arr.map(([id, name, cal, protein, carbs, fat, servingGrams]) => ({
    id,
    name,
    cal,
    calories: cal,
    protein,
    carbs,
    fat,
    servingGrams
  }));
}

/* =========================
   Preset & Storage helpers
========================= */
const placeholderItems = (count) =>
  Array.from({ length: count }, () => ({
    id: crypto.randomUUID(),
    productId: "__EMPTY__",
    amount: 0,
    note: "Enter an item on the Products tab"
  }));

function createStarterPlans() {
  return [
    {
      id: crypto.randomUUID(),
      name: "Workout Day",
      data: {
        profile: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: [
          { name: "Breakfast", items: placeholderItems(3) },
          { name: "Lunch", items: placeholderItems(3) },
          { name: "Post Workout", items: placeholderItems(1) },
          { name: "Dinner", items: placeholderItems(3) }
        ]
      }
    },
    {
      id: crypto.randomUUID(),
      name: "Rest Day",
      data: {
        profile: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: [
          { name: "Breakfast", items: placeholderItems(3) },
          { name: "Lunch", items: placeholderItems(3) },
          { name: "Dinner", items: placeholderItems(3) }
        ]
      }
    }
  ];
}

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

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
      try { resolve(JSON.parse(e.target.result)); } 
      catch { reject(new Error("Invalid JSON")); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const defaultProducts = [
  { id: 1, name: "Tofu Scramble", servingGrams: 200, unit: "g", cal: 228, protein: 22, carbs: 4, fat: 14 }
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

export default function App() {
  const [tab, setTab] = useState("planner");
  const [products, setProducts] = useState(() => loadFromStorage(STORAGE_KEYS.products, defaultProducts));
  const [plannerState, setPlannerState] = useState(() => loadFromStorage(STORAGE_KEYS.planner, defaultPlannerState));
  const [toast, setToast] = useState(null);
  const [showFirstRun, setShowFirstRun] = useState(!localStorage.getItem("gm_hasVisited"));
  const [importedFromLink, setImportedFromLink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const hasShareInUrl = new URLSearchParams(window.location.search).has("s");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  /* File Import logic (Restored) */
  async function importProducts(file) {
    try {
      const data = await readJSONFile(file);
      if (!Array.isArray(data)) throw new Error();
      setProducts(data);
      showToast("Products imported!");
    } catch { showToast("Invalid products file"); }
  }

  async function importPlans(file) {
    try {
      const data = await readJSONFile(file);
      if (!data.plans || !data.activePlanId) throw new Error();
      setPlannerState(data);
      showToast("Plans imported!");
    } catch { showToast("Invalid plans file"); }
  }

  async function importAll(file) {
    try {
      const data = await readJSONFile(file);
      if (!data.products || !data.plannerState) throw new Error();
      setProducts(data.products);
      setPlannerState(data.plannerState);
      showToast("Full backup restored!");
    } catch { showToast("Invalid backup file"); }
  }

  /* URL Share Import Handler */
  const processUrlImport = () => {
    const s = new URLSearchParams(window.location.search).get("s");
    if (!s) return;
    try {
      const parsed = JSON.parse(decompressFromEncodedURIComponent(s));
      if (parsed.p) setProducts(decodeProducts(parsed.p));
      if (parsed.m) {
        const plans = decodePlans(parsed.m);
        setPlannerState({ plans, activePlanId: plans[0].id });
      }
      setImportedFromLink(true);
      setShowFirstRun(false);
      localStorage.setItem("gm_hasVisited", "1");
      window.history.replaceState({}, "", window.location.pathname);
      showToast("Imported from link!");
    } catch {
      showToast("Failed to decode shared link");
    }
  };

  /* Ensure activePlanId exists */
  useEffect(() => {
    if (plannerState.plans.length && !plannerState.plans.find(p => p.id === plannerState.activePlanId)) {
      setPlannerState(s => ({ ...s, activePlanId: s.plans[0].id }));
    }
  }, []);

  useEffect(() => { saveToStorage(STORAGE_KEYS.products, products); }, [products]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.planner, plannerState); }, [plannerState]);

  const handleShareLink = () => {
    const data = { p: encodeProducts(products), m: encodePlans(plannerState.plans), v: "1.5" };
    const blob = compressToEncodedURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?s=${blob}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied to clipboard!"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast("Link copied!");
    }
  };

  useEffect(() => {
      const handleUrlChange = () => {
        const s = new URLSearchParams(window.location.search).get("s");
        if (s && window.confirm("A shared plan was detected in the URL. Overwrite your current data?")) {
          processUrlImport();
        }
      };

      window.addEventListener('popstate', handleUrlChange);
      // Also check on boot if we aren't showing the FirstRun modal
      if (!showFirstRun && hasShareInUrl) handleUrlChange();

      return () => window.removeEventListener('popstate', handleUrlChange);
    }, [showFirstRun]);
    
  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      {showFirstRun && (
        <FirstRunModal 
          onFresh={() => { localStorage.setItem("gm_hasVisited", "1"); setShowFirstRun(false); }}
          onPreset={() => { setPlannerState({ plans: createStarterPlans(), activePlanId: null }); localStorage.setItem("gm_hasVisited", "1"); setShowFirstRun(false); }}
          onImport={hasShareInUrl ? processUrlImport : null}
        />
      )}

      <header className="topbar">
        <div className="topbar-left">
          <h1>GreenMacros</h1>
          {importedFromLink && <div className="import-banner">Plan imported from link</div>}
          <div className="tabs">
            <button className={tab === "planner" ? "active" : ""} onClick={() => setTab("planner")}>Plan</button>
            <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Products</button>
          </div>

          <div className="menu-wrapper" ref={menuRef}>
            <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && (
              <div className="menu floating">
                <button onClick={() => downloadJSON(products, "products.json")}>Export Products</button>
                <button onClick={() => downloadJSON(plannerState, "plans.json")}>Export Plans</button>
                <button onClick={() => downloadJSON({ products, plannerState }, "full-backup.json")}>Export Full Backup</button>
                <hr />
                <label className="menu-file">Import Products <input type="file" accept="application/json" hidden onChange={e => e.target.files[0] && importProducts(e.target.files[0])} /></label>
                <label className="menu-file">Import Plans <input type="file" accept="application/json" hidden onChange={e => e.target.files[0] && importPlans(e.target.files[0])} /></label>
                <label className="menu-file">Import Full Backup <input type="file" accept="application/json" hidden onChange={e => e.target.files[0] && importAll(e.target.files[0])} /></label>
              </div>
            )}
          </div>
          <button className="btn-secondary share-btn" onClick={handleShareLink}>🔗 Share Link</button>
        </div>
      </header>

      {tab === "planner" && <PlannerTab products={products} plannerState={plannerState} setPlannerState={setPlannerState} />}
      {tab === "products" && <ProductsTab products={products} setProducts={setProducts} />}
      <Footer />
    </div>
  );
}