import { useEffect, useMemo, useState } from "react";
import OrganizeView from "./OrganizeView";
import MealCard from "./MealCard";
import PlanTabs from "./PlanTabs";
import SummaryCard from "./SummaryCard";
import TotalsBar from "./TotalsBar";
import { useI18n } from "../i18n/context";
import { canvasToBlob, renderPlanCanvas } from "../lib/planImage";
import { copyToClipboard, downloadFile, planToText, plansToCSV } from "../lib/exporters";
import { buildProductMap, sumMeals } from "../lib/macros";
import { clonePlan, cloneMeal, createItem, createMeal, createPlan } from "../lib/plans";
import { createRecipe } from "../lib/recipes";
import { moveInList, moveItemInMeals, nudgeInList } from "../lib/reorder";

export default function PlannerTab({
  products,
  recipes,
  setRecipes,
  plannerState,
  setPlannerState,
  notify,
  onCreateProduct,
  onSharePlan,
  onPrint,
  onFit
}) {
  const { t, lang } = useI18n();
  const [summaryInView, setSummaryInView] = useState(false);
  const [organize, setOrganize] = useState(false);
  const { plans: allPlans, activePlanId } = plannerState;
  const plans = useMemo(() => allPlans.filter(p => !p.archived), [allPlans]);
  const archivedPlans = useMemo(() => allPlans.filter(p => p.archived), [allPlans]);
  const activePlan = plans.find(p => p.id === activePlanId) ?? plans[0];
  const { profile, meals } = activePlan.data;

  const productMap = useMemo(() => buildProductMap(products), [products]);
  const totalsByPlan = useMemo(
    () => new Map(allPlans.map(p => [p.id, sumMeals(p.data.meals, productMap)])),
    [allPlans, productMap]
  );
  const dailyTotals = totalsByPlan.get(activePlan.id);

  // The sticky bar duplicates the summary card, so hide it while the card itself is on screen.
  useEffect(() => {
    const el = document.getElementById("summary-card");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setSummaryInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---------- state helpers ---------- */
  function patchPlan(id, patch) {
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p))
    }));
  }

  /** Update the active plan's data. Pass a function (data) => data. */
  function updateData(fn) {
    const id = activePlan.id;
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, data: fn(p.data) } : p))
    }));
  }

  /** Restore a previous version of the active plan's data (used by undo toasts). */
  function restoreData(planId, data) {
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === planId ? { ...p, data } : p))
    }));
  }

  const updateMeals = fn => updateData(d => ({ ...d, meals: fn(d.meals) }));
  const mapMeal = (mealId, fn) => updateMeals(ms => ms.map(m => (m.id === mealId ? fn(m) : m)));

  /* ---------- plan actions ---------- */
  function addPlan() {
    const plan = createPlan(`${t("plan.default")} ${plans.length + 1}`, {
      profile,
      meals: [createMeal(`${t("meal.default")} 1`)]
    });
    setPlannerState(s => ({ ...s, plans: [...s.plans, plan], activePlanId: plan.id }));
  }

  function duplicatePlan(id) {
    const src = plans.find(p => p.id === id);
    const copy = clonePlan(src, t("plan.copyOf", { name: src.name }));
    setPlannerState(s => {
      const at = s.plans.findIndex(p => p.id === id);
      const next = [...s.plans];
      next.splice(at + 1, 0, copy);
      return { ...s, plans: next, activePlanId: copy.id };
    });
  }

  function removePlan(id) {
    if (plans.length <= 1) return;
    const visibleIndex = plans.findIndex(p => p.id === id);
    const fullIndex = allPlans.findIndex(p => p.id === id);
    const removed = allPlans[fullIndex];
    setPlannerState(s => {
      const rest = s.plans.filter(p => p.id !== id);
      const stillActive = rest.some(p => p.id === s.activePlanId);
      const visible = rest.filter(p => !p.archived);
      return {
        ...s,
        plans: rest,
        activePlanId: stillActive ? s.activePlanId : visible[Math.max(0, visibleIndex - 1)].id
      };
    });
    notify(t("toast.planDeleted", { name: removed.name }), {
      label: t("common.undo"),
      run: () =>
        setPlannerState(s => {
          const next = [...s.plans];
          next.splice(Math.min(fullIndex, next.length), 0, removed);
          return { ...s, plans: next, activePlanId: removed.id };
        })
    });
  }

  function movePlan(id, step) {
    setPlannerState(s => {
      const visible = s.plans.filter(p => !p.archived);
      const neighbour = visible[visible.findIndex(p => p.id === id) + step];
      if (!neighbour) return s;
      const i = s.plans.findIndex(p => p.id === id);
      const j = s.plans.findIndex(p => p.id === neighbour.id);
      const next = [...s.plans];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...s, plans: next };
    });
  }

  function archivePlan(id) {
    if (plans.length <= 1) return;
    const plan = plans.find(p => p.id === id);
    const visibleIndex = plans.findIndex(p => p.id === id);
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, archived: true } : p)),
      activePlanId: s.activePlanId === id ? plans[visibleIndex === 0 ? 1 : visibleIndex - 1].id : s.activePlanId
    }));
    notify(t("toast.planArchived", { name: plan.name }), {
      label: t("common.undo"),
      run: () =>
        setPlannerState(s => ({
          ...s,
          plans: s.plans.map(p => (p.id === id ? { ...p, archived: false } : p)),
          activePlanId: id
        }))
    });
  }

  function restorePlan(id) {
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, archived: false } : p)),
      activePlanId: id
    }));
    notify(t("toast.planRestored", { name: allPlans.find(p => p.id === id).name }));
  }

  function reorderPlan(fromId, toId) {
    setPlannerState(s => {
      const from = s.plans.findIndex(p => p.id === fromId);
      const to = s.plans.findIndex(p => p.id === toId);
      if (from < 0 || to < 0) return s;
      const next = [...s.plans];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, plans: next };
    });
  }

  /* ---------- meal actions ---------- */
  function addMeal(afterIndex) {
    updateMeals(ms => {
      const next = [...ms];
      next.splice(afterIndex + 1, 0, createMeal(t("meal.newMeal")));
      return next;
    });
  }

  function duplicateMeal(i) {
    updateMeals(ms => {
      const next = [...ms];
      next.splice(i + 1, 0, cloneMeal(ms[i]));
      return next;
    });
  }

  function moveMeal(i, step) {
    updateMeals(ms => {
      const j = i + step;
      if (j < 0 || j >= ms.length) return ms;
      const next = [...ms];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeMeal(i) {
    if (meals.length <= 1) return;
    const removed = meals[i];
    const planId = activePlan.id;
    updateMeals(ms => ms.filter((_, idx) => idx !== i));
    notify(t("toast.mealRemoved", { name: removed.name }), {
      label: t("common.undo"),
      run: () =>
        setPlannerState(s => ({
          ...s,
          plans: s.plans.map(p => {
            if (p.id !== planId) return p;
            const next = [...p.data.meals];
            next.splice(Math.min(i, next.length), 0, removed);
            return { ...p, data: { ...p.data, meals: next } };
          })
        }))
    });
  }

  function clearMeal(mealId) {
    const before = activePlan.data;
    const name = meals.find(m => m.id === mealId).name;
    mapMeal(mealId, m => ({ ...m, items: [] }));
    notify(t("toast.mealCleared", { name }), {
      label: t("common.undo"),
      run: () => restoreData(activePlan.id, before)
    });
  }

  /* ---------- organize mode: reorder meals and items ---------- */
  const moveMealTo = (fromId, toId) => updateMeals(ms => moveInList(ms, fromId, toId));
  const moveItem = (itemId, toMealId, targetItemId) => updateMeals(ms => moveItemInMeals(ms, itemId, toMealId, targetItemId));
  const nudgeItem = (mealId, itemId, step) => mapMeal(mealId, m => ({ ...m, items: nudgeInList(m.items, itemId, step) }));

  /* ---------- item actions ---------- */
  const addItem = (mealId, product) =>
    mapMeal(mealId, m => ({ ...m, items: [...m.items, createItem(product.id, product.servingGrams)] }));

  const updateItem = (mealId, itemId, patch) =>
    mapMeal(mealId, m => ({
      ...m,
      items: m.items.map(it => (it.id === itemId ? { ...it, ...patch } : it))
    }));

  const removeItem = (mealId, itemId) =>
    mapMeal(mealId, m => ({ ...m, items: m.items.filter(it => it.id !== itemId) }));

  /* ---------- recipes ---------- */
  function saveRecipe(meal) {
    const name = window.prompt(t("recipe.namePrompt"), meal.name);
    if (!name?.trim()) return;
    setRecipes(rs => [...rs, createRecipe(name.trim(), meal.items)]);
    notify(t("toast.recipeSaved", { name: name.trim() }));
  }

  function addRecipe(mealId, recipe) {
    const usable = recipe.items.filter(it => productMap.has(it.productId));
    if (!usable.length) return notify(t("toast.recipeEmpty"));
    mapMeal(mealId, m => ({
      ...m,
      items: [...m.items, ...usable.map(it => createItem(it.productId, it.amount))]
    }));
    const skipped = recipe.items.length - usable.length;
    notify(skipped ? t("toast.recipeAddedSkipped", { name: recipe.name, n: skipped }) : t("toast.recipeAdded", { name: recipe.name }));
  }

  /* ---------- plan-level tools ---------- */
  function exportCsv(id) {
    const plan = plans.find(p => p.id === id);
    downloadFile(plansToCSV([plan], productMap), `${plan.name || "plan"}.csv`, "text/csv;charset=utf-8");
  }

  async function exportImage(id) {
    const plan = plans.find(p => p.id === id);
    try {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const canvas = renderPlanCanvas(plan, productMap, { t, lang, theme });
      downloadFile(await canvasToBlob(canvas), `${plan.name || "plan"}.png`, "image/png");
      notify(t("toast.imageSaved"));
    } catch {
      notify(t("toast.imageFail"));
    }
  }

  async function copyText(id) {
    const plan = plans.find(p => p.id === id);
    const ok = await copyToClipboard(planToText(plan, productMap));
    notify(ok ? t("toast.copiedText") : t("toast.clipboardFail"));
  }

  return (
    <div className={`planner ${organize ? "organizing" : ""}`}>
      <PlanTabs
        plans={plans}
        archived={archivedPlans}
        activeId={activePlan.id}
        totals={totalsByPlan}
        onSelect={id => setPlannerState(s => ({ ...s, activePlanId: id }))}
        onAdd={addPlan}
        onRename={(id, name) => patchPlan(id, { name })}
        onDuplicate={duplicatePlan}
        onArchive={archivePlan}
        onRestore={restorePlan}
        onRemove={removePlan}
        onMove={movePlan}
        onReorder={reorderPlan}
        onColor={(id, color) => patchPlan(id, { color })}
        onExportCsv={exportCsv}
        onExportAllCsv={() =>
          downloadFile(plansToCSV(plans, productMap), "all-plans.csv", "text/csv;charset=utf-8")
        }
        onCopyText={copyText}
        onShare={onSharePlan}
        onPrint={id => onPrint({ kind: "plan", id })}
        onImage={exportImage}
        onFit={() => onFit(null)}
        organize={organize}
        onToggleOrganize={() => setOrganize(o => !o)}
      />

      {products.length === 0 && (
        <div className="glass-card empty-state">
          <span><strong>{t("planner.noProducts")}</strong> {t("planner.noProductsHint")}</span>
          <button className="primary-btn" onClick={() => onCreateProduct("")}>{t("planner.addProducts")}</button>
        </div>
      )}

      {organize ? (
        <OrganizeView
          meals={meals}
          productMap={productMap}
          onMoveMeal={moveMealTo}
          onNudgeMeal={moveMeal}
          onMoveItem={moveItem}
          onNudgeItem={nudgeItem}
        />
      ) : (
        <>
      {meals.map((meal, mi) => (
        <MealCard
          key={meal.id}
          meal={meal}
          index={mi}
          count={meals.length}
          products={products}
          productMap={productMap}
          recipes={recipes}
          onRename={name => mapMeal(meal.id, m => ({ ...m, name }))}
          onAddItem={p => addItem(meal.id, p)}
          onUpdateItem={(itemId, patch) => updateItem(meal.id, itemId, patch)}
          onRemoveItem={itemId => removeItem(meal.id, itemId)}
          onAddMeal={() => addMeal(mi)}
          onDuplicate={() => duplicateMeal(mi)}
          onMove={step => moveMeal(mi, step)}
          onClear={() => clearMeal(meal.id)}
          onRemove={() => removeMeal(mi)}
          onTarget={patch => mapMeal(meal.id, m => ({ ...m, target: { ...m.target, ...patch } }))}
          onSaveRecipe={() => saveRecipe(meal)}
          onAddRecipe={r => addRecipe(meal.id, r)}
          onCreateProduct={onCreateProduct}
        />
      ))}

      <button className="add-meal-btn" onClick={() => addMeal(meals.length - 1)}>{t("meal.addMealBtn")}</button>

        </>
      )}

      {!organize && (
      <TotalsBar
        hidden={summaryInView}
        profile={profile}
        totals={dailyTotals}
        onDetails={() => document.getElementById("summary-card")?.scrollIntoView({ behavior: "smooth", block: "center" })}
      />
      )}

      <SummaryCard
        id="summary-card"
        profile={profile}
        totals={dailyTotals}
        onProfile={patch => updateData(d => ({ ...d, profile: { ...d.profile, ...patch } }))}
      />
    </div>
  );
}
