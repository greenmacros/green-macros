import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FirstRunModal from "./components/FirstRunModal";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import ShareImportModal from "./components/ShareImportModal";
import Toast from "./components/Toast";
import PlannerTab from "./planner/PlannerTab";
import ProductsTab from "./products/ProductsTab";
import WeekTab from "./week/WeekTab";
import PrintSheet from "./print/PrintSheet";
import StorageNotice from "./components/StorageNotice";
import {
  daysSince, dismissNotice, getDismissed, getFirstUse, getLastBackup,
  isIos, isStandalone, markBackup, pickNotice, requestPersistence
} from "./lib/persistence";
import { useTheme } from "./theme/useTheme";
import { buildProductMap } from "./lib/macros";
import { starterProducts } from "./data/starterProducts";
import { useI18n } from "./i18n/context";
import { copyToClipboard, downloadJSON, readJSONFile } from "./lib/exporters";
import { normalizePlanner, starterPlans } from "./lib/plans";
import { createProduct, normalizeProducts } from "./lib/products";
import { normalizeRecipes } from "./lib/recipes";
import { buildShareUrl, mergeShared, parseShare } from "./lib/share";
import { STORAGE_KEYS, loadJSON, loadString, saveJSON, saveString } from "./lib/storage";

const MAX_COMFY_URL = 8000;
const TABS = ["planner", "week", "products"];

function readShareFromUrl() {
  const s = new URLSearchParams(window.location.search).get("s");
  if (!s) return null;
  try {
    return { shared: parseShare(s) };
  } catch {
    return { error: true };
  }
}

function stripShareFromUrl() {
  window.history.replaceState({}, "", window.location.pathname);
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const labels = { plan: t("plan.default"), meal: t("meal.default") };

  const [tab, setTab] = useState(() => {
    const saved = loadString(STORAGE_KEYS.tab);
    return TABS.includes(saved) ? saved : "planner";
  });
  const [products, setProducts] = useState(() => normalizeProducts(loadJSON(STORAGE_KEYS.products, [])));
  const [recipes, setRecipes] = useState(() => normalizeRecipes(loadJSON(STORAGE_KEYS.recipes, [])));
  const [plannerState, setPlannerState] = useState(() =>
    normalizePlanner(loadJSON(STORAGE_KEYS.planner, null), labels)
  );
  const [productDraft, setProductDraft] = useState(null);

  const [initialShare] = useState(readShareFromUrl);
  const [pendingShare, setPendingShare] = useState(initialShare?.shared ?? null);
  const [visited, setVisited] = useState(() => Boolean(loadString(STORAGE_KEYS.visited)));
  const [installEvent, setInstallEvent] = useState(null);
  const { theme, toggle: toggleTheme } = useTheme();
  const [printJob, setPrintJob] = useState(null);
  const [lastBackup, setLastBackup] = useState(getLastBackup);
  const [dismissed, setDismissed] = useState(getDismissed);
  const [firstUse] = useState(() => getFirstUse());

  const [toast, setToast] = useState(() =>
    initialShare?.error ? { message: t("toast.badLink") } : null
  );
  const toastTimer = useRef(null);
  const saveWarned = useRef(false);
  const fileInputs = { products: useRef(null), plans: useRef(null), all: useRef(null) };

  const notify = useCallback((message, action) => {
    clearTimeout(toastTimer.current);
    setToast({ message, action });
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 2500);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  useEffect(() => {
    if (initialShare?.error) stripShareFromUrl();
  }, [initialShare]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const onPrompt = e => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  /* ---------- keep data safe: persistent storage + backup reminders ---------- */
  useEffect(() => {
    if (visited) requestPersistence();
  }, [visited]);

  const hasData =
    products.length > 0 ||
    recipes.length > 0 ||
    plannerState.plans.some(p => p.data.meals.some(m => m.items.length > 0));
  const notice = pickNotice({
    ios: isIos(),
    standalone: isStandalone(),
    hasData,
    lastBackup,
    firstUse,
    dismissed
  });

  function dismiss(kind) {
    dismissNotice(kind);
    setDismissed(getDismissed());
  }

  function fullBackup() {
    downloadJSON({ products, plannerState, recipes }, "green-macros-backup.json");
    setLastBackup(markBackup());
  }

  /* ---------- printing ---------- */
  useEffect(() => {
    if (!printJob) return;
    const done = () => setPrintJob(null);
    window.addEventListener("afterprint", done, { once: true });
    // wait for the print sheet to render before opening the dialog
    const id = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("afterprint", done);
    };
  }, [printJob]);

  const productMap = useMemo(() => buildProductMap(products), [products]);

  /* ---------- persistence ---------- */
  useEffect(() => {
    const ok =
      saveJSON(STORAGE_KEYS.products, products) &&
      saveJSON(STORAGE_KEYS.planner, plannerState) &&
      saveJSON(STORAGE_KEYS.recipes, recipes);
    if (!ok && !saveWarned.current) {
      saveWarned.current = true;
      notify(t("toast.saveFail"));
    }
  }, [products, plannerState, recipes, notify, t]);

  useEffect(() => saveString(STORAGE_KEYS.tab, tab), [tab]);

  const usage = useMemo(() => {
    const counts = new Map();
    for (const plan of plannerState.plans)
      for (const meal of plan.data.meals)
        for (const it of meal.items)
          if (it.productId) counts.set(it.productId, (counts.get(it.productId) ?? 0) + 1);
    return counts;
  }, [plannerState.plans]);

  /* ---------- navigation ---------- */
  const createProductFor = useCallback(name => {
    setProductDraft(name ?? "");
    setTab("products");
  }, []);
  const clearDraft = useCallback(() => setProductDraft(null), []);

  function openPlan(id) {
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, archived: false } : p)),
      activePlanId: id
    }));
    setTab("planner");
  }

  /* ---------- first run ---------- */
  function finishFirstRun(preset) {
    if (preset) {
      setProducts(starterProducts(lang).map(p => createProduct(p)));
      setPlannerState(
        normalizePlanner(
          {
            plans: starterPlans({
              workoutDay: t("starter.workoutDay"),
              restDay: t("starter.restDay"),
              breakfast: t("starter.breakfast"),
              lunch: t("starter.lunch"),
              postWorkout: t("starter.postWorkout"),
              dinner: t("starter.dinner")
            })
          },
          labels
        )
      );
    }
    saveString(STORAGE_KEYS.visited, "1");
    setVisited(true);
  }

  /* ---------- sharing ---------- */
  async function copyShareLink(plans) {
    const url = buildShareUrl(plans, products);
    const ok = await copyToClipboard(url);
    if (!ok) return notify(t("toast.copyFail"));
    notify(url.length > MAX_COMFY_URL ? t("toast.linkLong") : t("toast.linkCopied"));
  }

  function closeShare() {
    stripShareFromUrl();
    setPendingShare(null);
    saveString(STORAGE_KEYS.visited, "1");
    setVisited(true);
  }

  function importShared(mode) {
    if (mode === "merge") {
      const merged = mergeShared(products, plannerState, pendingShare);
      setProducts(merged.products);
      setPlannerState(merged.plannerState);
      notify(t("toast.sharedAdded", { n: pendingShare.plans.length }));
    } else {
      const prevProducts = products;
      const prevPlanner = plannerState;
      setProducts(pendingShare.products);
      setPlannerState(normalizePlanner({ plans: pendingShare.plans }, labels));
      notify(t("toast.sharedReplaced"), {
        label: t("common.undo"),
        run: () => {
          setProducts(prevProducts);
          setPlannerState(prevPlanner);
        }
      });
    }
    setTab("planner");
    closeShare();
  }

  /* ---------- backup import / export ---------- */
  async function importFile(file, kind) {
    try {
      const data = await readJSONFile(file);
      const prev = { products, plannerState, recipes };
      const undo = {
        label: t("common.undo"),
        run: () => {
          setProducts(prev.products);
          setPlannerState(prev.plannerState);
          setRecipes(prev.recipes);
        }
      };

      if (kind === "products") {
        const list = normalizeProducts(Array.isArray(data) ? data : data?.products);
        if (!list.length) throw new Error();
        setProducts(list);
        notify(t("toast.importedProducts", { n: list.length }), undo);
      } else if (kind === "plans") {
        if (!Array.isArray(data?.plans)) throw new Error();
        setPlannerState(normalizePlanner(data, labels));
        notify(t("toast.importedPlans"), undo);
      } else {
        if (!Array.isArray(data?.products) || !Array.isArray(data?.plannerState?.plans)) throw new Error();
        setProducts(normalizeProducts(data.products));
        setPlannerState(normalizePlanner(data.plannerState, labels));
        setRecipes(normalizeRecipes(data.recipes));
        notify(t("toast.restored"), undo);
      }
    } catch {
      notify(t("toast.badFile", { kind: t(`kind.${kind}`) }));
    }
  }

  const pickFile = kind => fileInputs[kind].current?.click();
  const activePlan = plannerState.plans.find(p => p.id === plannerState.activePlanId);
  const sharablePlans = plannerState.plans.filter(p => !p.archived);

  return (
    <div className="app">
      <Toast toast={toast} onDismiss={dismissToast} />

      {pendingShare && (
        <ShareImportModal
          shared={pendingShare}
          onMerge={() => importShared("merge")}
          onReplace={() => importShared("replace")}
          onCancel={closeShare}
        />
      )}
      {!visited && !pendingShare && (
        <FirstRunModal onFresh={() => finishFirstRun(false)} onPreset={() => finishFirstRun(true)} />
      )}

      <header className="topbar">
        <div className="topbar-left">
          <h1>GreenMacros</h1>
          <div className="tabs" role="tablist">
            {TABS.map(id => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                {t(`tab.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="topbar-right">
          <Menu label={t("share.button")} title={t("share.button")} className="share-btn">
            <button disabled={!activePlan} onClick={() => copyShareLink([activePlan])}>
              {t("share.copyCurrent")}
            </button>
            <button onClick={() => copyShareLink(sharablePlans)}>
              {t("share.copyAll", { n: sharablePlans.length })}
            </button>
          </Menu>
          <Menu title={t("settings.title")}>
            <div className="menu-note">{t("settings.language")}</div>
            <button onClick={() => setLang("en")}>{lang === "en" ? "✓ " : ""}English</button>
            <button onClick={() => setLang("ja")}>{lang === "ja" ? "✓ " : ""}日本語</button>
            <button onClick={toggleTheme}>
              {theme === "light" ? t("theme.toDark") : t("theme.toLight")}
            </button>
            <hr />
            <button onClick={() => downloadJSON(products, "products.json")}>{t("backup.exportProducts")}</button>
            <button onClick={() => downloadJSON(plannerState, "plans.json")}>{t("backup.exportPlans")}</button>
            <button onClick={fullBackup}>{t("backup.exportAll")}</button>
            <div className="menu-note">
              {lastBackup ? t("backup.last", { n: daysSince(lastBackup) }) : t("backup.lastNever")}
            </div>
            <hr />
            <button onClick={() => pickFile("products")}>{t("backup.importProducts")}</button>
            <button onClick={() => pickFile("plans")}>{t("backup.importPlans")}</button>
            <button onClick={() => pickFile("all")}>{t("backup.restore")}</button>
            {installEvent && (
              <>
                <hr />
                <button
                  onClick={async () => {
                    installEvent.prompt();
                    await installEvent.userChoice;
                    setInstallEvent(null);
                  }}
                >
                  {t("backup.install")}
                </button>
              </>
            )}
          </Menu>
        </div>

        {Object.entries(fileInputs).map(([kind, ref]) => (
          <input
            key={kind}
            ref={ref}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={e => {
              const file = e.target.files[0];
              e.target.value = "";
              if (file) importFile(file, kind);
            }}
          />
        ))}
      </header>

      <StorageNotice
        kind={notice}
        daysSinceBackup={lastBackup ? daysSince(lastBackup) : null}
        onBackup={() => {
          fullBackup();
          notify(t("notice.backedUp"));
        }}
        onDismiss={() => dismiss(notice)}
      />

      {tab === "planner" && (
        <PlannerTab
          products={products}
          recipes={recipes}
          setRecipes={setRecipes}
          plannerState={plannerState}
          setPlannerState={setPlannerState}
          notify={notify}
          onCreateProduct={createProductFor}
          onSharePlan={id => copyShareLink(plannerState.plans.filter(p => p.id === id))}
          onPrint={setPrintJob}
        />
      )}
      {tab === "week" && (
        <WeekTab
          products={products}
          plannerState={plannerState}
          setPlannerState={setPlannerState}
          onOpenPlan={openPlan}
          onPrint={() => setPrintJob({ kind: "week" })}
        />
      )}
      {tab === "products" && (
        <ProductsTab
          products={products}
          setProducts={setProducts}
          recipes={recipes}
          setRecipes={setRecipes}
          usage={usage}
          prefill={productDraft}
          onPrefillUsed={clearDraft}
          notify={notify}
        />
      )}
      <Footer />
      <PrintSheet job={printJob} plannerState={plannerState} productMap={productMap} />
    </div>
  );
}
