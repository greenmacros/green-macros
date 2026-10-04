import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FirstRunModal from "./components/FirstRunModal";
import LangSwitch from "./components/LangSwitch";
import ThemeSwitch from "./components/ThemeSwitch";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import ShareImportModal from "./components/ShareImportModal";
import Icon from "./components/Icon";
import Tour from "./components/Tour";
import Toast from "./components/Toast";
import FitProduct from "./planner/FitProduct";
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
import { useI18n } from "./i18n/context";
import { MESSAGES } from "./i18n/messages";
import { backupFilename, buildBackup, formatDateTime, parseBackup } from "./lib/backup";
import { copyToClipboard, downloadJSON, readJSONFile } from "./lib/exporters";
import { normalizePlanner } from "./lib/plans";
import { normalizeProducts } from "./lib/products";
import { normalizeRecipes } from "./lib/recipes";
import { buildShareUrl, mergeShared, parseShare } from "./lib/share";
import { STORAGE_KEYS, loadJSON, loadString, saveJSON, saveString } from "./lib/storage";

const MAX_COMFY_URL = 8000;
const TABS = ["planner", "week", "products"];
const TOUR_STEPS = [
  { id: "welcome" },
  { id: "tabs", target: ".tabs" },
  { id: "plans", target: ".plan-tabs-bar", tab: "planner" },
  { id: "meal", target: ".meal-card" },
  { id: "additem", target: ".meal-card .add-item" },
  { id: "summary", target: ".daily-summary" },
  { id: "week", target: ".week-grid", tab: "week" },
  { id: "filters", target: ".products-tab .toolbar", tab: "products" },
  { id: "manual", target: ".products-tab .heading-actions" },
  { id: "addpanel", target: ".add-panel" },
  { id: "share", target: ".share-anchor" },
  { id: "settings", target: ".settings-anchor" }
].map(s => ({ ...s, title: `tour.${s.id}.title`, body: `tour.${s.id}.body` }));

/** A single empty plan/meal still carrying a generated default name ("Plan 1" / "プラン 1"). */
function isUntouchedDefault({ plans }) {
  const isDefault = (name, key) => Object.values(MESSAGES[key]).some(base => name === `${base} 1`);
  return (
    plans.length === 1 &&
    isDefault(plans[0].name, "plan.default") &&
    plans[0].data.meals.length === 1 &&
    isDefault(plans[0].data.meals[0].name, "meal.default") &&
    plans[0].data.meals[0].items.length === 0
  );
}

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
  const { t, lang } = useI18n();
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
  const [tourOpen, setTourOpen] = useState(false);
  const [visited, setVisited] = useState(() => Boolean(loadString(STORAGE_KEYS.visited)));
  const [installEvent, setInstallEvent] = useState(null);
  const { theme, toggle: toggleTheme } = useTheme();
  const [printJob, setPrintJob] = useState(null);
  const [fitDialog, setFitDialog] = useState(null); // null | { product }
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
    downloadJSON(buildBackup({ products, plannerState, recipes }), backupFilename());
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

  /* ---------- fit a product into the plan ---------- */
  function applySwap(candidate, swap) {
    const prev = { products, plannerState };
    if (!products.some(p => p.id === candidate.id)) setProducts(ps => [...ps, candidate]);
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(plan =>
        plan.id !== swap.planId
          ? plan
          : {
              ...plan,
              data: {
                ...plan.data,
                meals: plan.data.meals.map(meal =>
                  meal.id !== swap.mealId
                    ? meal
                    : {
                        ...meal,
                        items: meal.items.map(it =>
                          it.id === swap.itemId ? { ...it, productId: candidate.id, amount: swap.newAmount } : it
                        )
                      }
                )
              }
            }
      )
    }));
    setFitDialog(null);
    notify(t("toast.swapped", { from: swap.oldProduct.name, to: candidate.name }), {
      label: t("common.undo"),
      run: () => {
        setProducts(prev.products);
        setPlannerState(prev.plannerState);
      }
    });
  }

  /* ---------- merge duplicate products ---------- */
  function mergeProducts(keepId, removeIds) {
    const prev = { products, plannerState, recipes };
    const gone = new Set(removeIds);
    const repoint = it => (gone.has(it.productId) ? { ...it, productId: keepId } : it);
    setProducts(ps => ps.filter(p => !gone.has(p.id)));
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(plan => ({
        ...plan,
        data: { ...plan.data, meals: plan.data.meals.map(m => ({ ...m, items: m.items.map(repoint) })) }
      }))
    }));
    setRecipes(rs => rs.map(r => ({ ...r, items: r.items.map(repoint) })));
    notify(t("toast.merged", { n: removeIds.length, name: products.find(p => p.id === keepId)?.name ?? "" }), {
      label: t("common.undo"),
      run: () => {
        setProducts(prev.products);
        setPlannerState(prev.plannerState);
        setRecipes(prev.recipes);
      }
    });
  }

  /* ---------- first run ---------- */
  function finishFirstRun() {
    if (isUntouchedDefault(plannerState)) {
      // the default plan/meal were named in whichever language loaded first; rename for the chosen one
      setPlannerState(normalizePlanner(null, labels));
    }
    saveString(STORAGE_KEYS.visited, "1");
    setVisited(true);
    setTourOpen(true);
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
        const backup = parseBackup(data, labels);
        const when = backup.exportedAt ? formatDateTime(backup.exportedAt, lang) : t("backup.unknownDate");
        if (!window.confirm(t("backup.confirm", { when, ...backup.counts }))) return;
        setProducts(backup.products);
        setPlannerState(backup.plannerState);
        setRecipes(backup.recipes);
        notify(t("toast.restoredFrom", { when }), undo);
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
        <FirstRunModal onStart={finishFirstRun} />
      )}

      {tourOpen && <Tour steps={TOUR_STEPS} tab={tab} onTab={setTab} onClose={() => setTourOpen(false)} />}

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
          <Menu label={<Icon name="share" size={18} />} title={t("share.button")} anchorClassName="share-anchor">
            <button disabled={!activePlan} onClick={() => copyShareLink([activePlan])}>
              {t("share.copyCurrent")}
            </button>
            <button onClick={() => copyShareLink(sharablePlans)}>
              {t("share.copyAll", { n: sharablePlans.length })}
            </button>
          </Menu>
          <Menu title={t("settings.title")} anchorClassName="settings-anchor">
            <button onClick={() => downloadJSON(products, backupFilename("products"))}>{t("backup.exportProducts")}</button>
            <button onClick={() => downloadJSON(plannerState, backupFilename("plans"))}>{t("backup.exportPlans")}</button>
            <button onClick={fullBackup}>{t("backup.exportAll")}</button>
            <div className="menu-note">
              {lastBackup
                ? t("backup.last", { when: formatDateTime(lastBackup, lang), n: daysSince(lastBackup) })
                : t("backup.lastNever")}
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
          <button type="button" className="icon-btn tour-btn" title={t("tour.button")} aria-label={t("tour.button")} onClick={() => setTourOpen(true)}>?</button>
          <LangSwitch />
          <ThemeSwitch theme={theme} onChange={toggleTheme} />
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
          onFit={product => setFitDialog({ product })}
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
          onFit={product => setFitDialog({ product })}
          onMerge={mergeProducts}
          notify={notify}
        />
      )}
      {fitDialog && (
        <FitProduct
          products={products}
          plannerState={plannerState}
          initialProduct={fitDialog.product}
          onApply={applySwap}
          onClose={() => setFitDialog(null)}
        />
      )}
      <Footer />
      <PrintSheet job={printJob} plannerState={plannerState} productMap={productMap} />
    </div>
  );
}
