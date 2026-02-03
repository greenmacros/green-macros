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
    ])
  ]);
}

function decodePlans(arr) {
  return arr.map(([id, name, meals]) => ({
    id,
    name,
    data: {
      profile: { calories: 0, protein: 0, carbs: 0, fat: 0 },
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
  return arr.map(
    ([id, name, cal, protein, carbs, fat, servingGrams]) => ({
      id,
      name,
      cal,
      calories: cal, 
      protein,
      carbs,
      fat,
      servingGrams
    })
  );
}

/* =========================
   Preset helpers
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
  
  // Check if there is a shared data string in the URL
  const hasShareInUrl = new URLSearchParams(window.location.search).has("s");
  const [showFirstRun, setShowFirstRun] = useState(!localStorage.getItem("gm_hasVisited"));
  const [toast, setToast] = useState(null);
  const [importedFromLink, setImportedFromLink] = useState(false);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  /* Ensure activePlanId exists */
  useEffect(() => {
    if (plannerState.plans.length && !plannerState.plans.find(p => p.id === plannerState.activePlanId)) {
      setPlannerState(s => ({ ...s, activePlanId: s.plans[0].id }));
    }
  }, []);

  /* Auto-save */
  useEffect(() => { saveToStorage(STORAGE_KEYS.products, products); }, [products]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.planner, plannerState); }, [plannerState]);

  /* Link-share logic with Toast */
  const handleShareLink = () => {
    const data = {
      p: encodeProducts(products),
      m: encodePlans(plannerState.plans),
      v: "1.5"
    };
    const blob = compressToEncodedURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?s=${blob}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => showToast("Link copied to clipboard!"))
        .catch(err => console.error("Failed to copy:", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast("Link copied (fallback)!");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  /* Import Logic */
  const processImport = () => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (!s) return;

    try {
      const parsed = JSON.parse(decompressFromEncodedURIComponent(s));
      if (parsed.p) setProducts(decodeProducts(parsed.p));
      if (parsed.m?.length) {
        const plans = decodePlans(parsed.m);
        setPlannerState({ plans, activePlanId: plans[0].id });
      }
      setImportedFromLink(true);
      localStorage.setItem("gm_hasVisited", "1");
      setShowFirstRun(false);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (e) {
      console.error("Failed to import shared link", e);
      showToast("Import failed: invalid link");
    }
  };

  function startFresh() {
    localStorage.setItem("gm_hasVisited", "1");
    setShowFirstRun(false);
  }

  function loadPreset() {
    const plans = createStarterPlans();
    setPlannerState({ plans, activePlanId: plans[0].id });
    localStorage.setItem("gm_hasVisited", "1");
    setShowFirstRun(false);
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      {showFirstRun && (
        <FirstRunModal 
          onFresh={startFresh} 
          onPreset={loadPreset} 
          onImport={hasShareInUrl ? processImport : null} 
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
            <button className="icon-btn" onClick={() => setMenuOpen(v => !v)}>⋯</button>
            {menuOpen && (
              <div className="menu floating">
                <button onClick={() => downloadJSON(products, "products.json")}>Export Products</button>
                <button onClick={() => downloadJSON(plannerState, "plans.json")}>Export Plans</button>
                <button onClick={() => downloadJSON({ products, plannerState }, "full-backup.json")}>Export Backup</button>
                <hr />
                <label className="menu-file">Import Products <input type="file" accept="application/json" hidden onChange={e => e.target.files[0] && readJSONFile(e.target.files[0]).then(setProducts) && setMenuOpen(false)} /></label>
                <label className="menu-file">Import Plans <input type="file" accept="application/json" hidden onChange={e => e.target.files[0] && readJSONFile(e.target.files[0]).then(setPlannerState) && setMenuOpen(false)} /></label>
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