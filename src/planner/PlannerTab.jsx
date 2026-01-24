import React, { useEffect, useRef, useState } from "react";
import { compressToEncodedURIComponent } from "lz-string";

/* ---------- helpers ---------- */
function calcMacros(product, amount) {
  if (!product) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const ratio = amount / product.servingGrams;
  return {
    cal: product.cal * ratio,
    protein: product.protein * ratio,
    carbs: product.carbs * ratio,
    fat: product.fat * ratio
  };
}

function proximityClass(actual, target) {
  if (!target || target === 0) return "";
  const ratio = actual / target;

  if (ratio >= 0.95 && ratio <= 1.05) return "hit";     // green
  if (ratio >= 0.85 && ratio <= 1.15) return "close";   // yellow
  return "off";                                         // red
}


function sumFromRows(items, products) {
  return items.reduce(
    (t, i) => {
      const p = products.find(p => p.id === i.productId);
      if (!p) return t;
      const m = calcMacros(p, i.amount);
      t.cal += m.cal;
      t.protein += m.protein;
      t.carbs += m.carbs;
      t.fat += m.fat;
      return t;
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

const emptyPlan = {
  profile: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  meals: [{ name: "Meal 1", items: [] }]
};


/* ---------- component ---------- */
export default function PlannerTab({ products, plannerState, setPlannerState}) {
  const { plans, activePlanId } = plannerState;
  const activePlan =
    plans.find(p => p.id === activePlanId) || plans[0];

  if (!activePlan) {
    return <div>No plan available</div>;
  }

  const mealPlan = activePlan?.data ?? structuredClone(emptyPlan);
  if (!activePlan || !mealPlan) {
    return null; // or a loading skeleton
  }

  const [openPlanMenu, setOpenPlanMenu] = useState(null);
  const [openMealMenu, setOpenMealMenu] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const menuRef = useRef(null);
  const [toast, setToast] = useState(null);


  useEffect(() => {
    if (!plannerState.plans.length) return;

    const exists = plannerState.plans.some(
      p => p.id === plannerState.activePlanId
    );

    if (!exists) {
      setPlannerState(s => ({
        ...s,
        activePlanId: s.plans[0].id
      }));
    }
  }, [plannerState.plans]);


  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMealMenu(null);
        setOpenPlanMenu(null);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function updatePlan(data) {
    setPlannerState(s => ({
      ...s,
      plans: s.plans.map(p =>
        p.id === activePlanId ? { ...p, data } : p
      )
    }));
  }

    useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);


  /* ---------- plan actions ---------- */
  function addPlan() {
    const id = Date.now();
    setPlannerState(s => ({
      ...s,
      plans: [...s.plans, { id, name: `Plan ${s.plans.length + 1}`, data: structuredClone(emptyPlan) }],
      activePlanId: id
    }));
  }

  function removePlan(id) {
    if (plans.length <= 1) return;
    const rest = plans.filter(p => p.id !== id);
    setPlannerState(s => ({
      ...s,
      plans: rest,
      activePlanId: rest[0].id
    }));
  }

  function duplicatePlan() {
    const id = Date.now();
    setPlannerState(s => ({
      ...s,
      plans: [...s.plans, { id, name: `${activePlan.name} copy`, data: structuredClone(activePlan.data) }],
      activePlanId: id
    }));
  }

  function resetPlan() {
    updatePlan(structuredClone(emptyPlan));
  }

  /* ---------- meal actions ---------- */
  function addMeal(after) {
    const meals = [...mealPlan.meals];
    meals.splice(after + 1, 0, { name: "New Meal", items: [] });
    updatePlan({ ...mealPlan, meals });
  }

  function removeMeal(i) {
    if (mealPlan.meals.length <= 1) return;
    updatePlan({
      ...mealPlan,
      meals: mealPlan.meals.filter((_, idx) => idx !== i)
    });
  }

  function duplicateMeal(i) {
    const meals = [...mealPlan.meals];
    meals.splice(i + 1, 0, structuredClone(mealPlan.meals[i]));
    updatePlan({ ...mealPlan, meals });
  }

  /* ---------- item actions ---------- */
  function addItem(mealIndex) {
    if (!products.length) return;
    const meals = mealPlan.meals.map((m, i) =>
      i === mealIndex
        ? { ...m, items: [...m.items, { productId: products[0].id, amount: products[0].servingGrams }] }
        : m
    );
    updatePlan({ ...mealPlan, meals });
  }

  function updateItem(mi, ii, field, value) {
    const meals = mealPlan.meals.map((m, i) =>
      i === mi
        ? {
            ...m,
            items: m.items.map((it, idx) =>
              idx === ii ? { ...it, [field]: field === "amount" ? Number(value) || 0 : Number(value) } : it
            )
          }
        : m
    );
    updatePlan({ ...mealPlan, meals });
  }

  function removeItem(mi, ii) {
    const meals = mealPlan.meals.map((m, i) =>
      i === mi ? { ...m, items: m.items.filter((_, idx) => idx !== ii) } : m
    );
    updatePlan({ ...mealPlan, meals });
  }

  const dailyTotals = mealPlan.meals.reduce(
    (a, m) => {
      const t = sumFromRows(m.items, products);
      a.cal += t.cal;
      a.protein += t.protein;
      a.carbs += t.carbs;
      a.fat += t.fat;
      return a;
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  /* ---------- render ---------- */
  return (
    <div className="planner">
              {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
      {/* PLAN TABS */}
      <div className="plan-tabs">
        {plans.map(p => (
          <div key={p.id} className="plan-tab-wrapper">
            <input
              value={p.name}
              className={`plan-tab ${p.id === activePlanId ? "active" : ""}`}
              readOnly={editingPlanId !== p.id}
              onClick={() => setPlannerState(s => ({ ...s, activePlanId: p.id }))}
              onDoubleClick={() => setEditingPlanId(p.id)}
              onChange={e =>
                setPlannerState(s => ({
                  ...s,
                  plans: s.plans.map(pl => pl.id === p.id ? { ...pl, name: e.target.value } : pl)
                }))
              }
              onBlur={() => setEditingPlanId(null)}
            />
            <button
              className="icon-btn"
              onClick={() =>
                setOpenPlanMenu(openPlanMenu === p.id ? null : p.id)
              }
            >
              ⋯
            </button>

            {openPlanMenu === p.id && (
              <div ref={menuRef} className="menu floating">
                <button onClick={duplicatePlan}>Duplicate plan</button>
                <button className="danger" onClick={() => removePlan(p.id)}>
                  Remove plan
                </button>
              </div>
            )}
            </div>
        ))}
        <button onClick={addPlan}>＋</button>
      </div>

            {/* MEALS */}
            {mealPlan.meals.map((meal, mi) => {
              const totals = sumFromRows (meal.items, products);
              return (
            <section key={mi} className="glass-card meal-card">
              <div className="meal-header-row">
                <input
                className="meal-name-input"
                value={meal.name || ""}
                onChange={e => {
                  const meals = mealPlan.meals.map((m, i) =>
                  i === mi ? { ...m, name: e.target.value} : m
                  );
                  updatePlan ({ ...mealPlan, meals });
                  }}
                />
                <div className="menu-anchor">
                <button className="icon-btn" onClick={() => setOpenMealMenu (mi)}>…</button>
                {openMealMenu === mi && (
                <div ref={menuRef} className="menu floating">
                <button onClick={() => addMeal (mi)}>Add meal below</button>
                <button onClick={() => duplicateMeal(mi)}>Duplicate</button>
                <button className="danger" onClick={() => removeMeal (mi)}>Remove</button>
                </div>
                )}
              </div>
            </div>



            <div className="meal-header">
              <div>Item</div><div>Amount</div><div>Cal</div><div>P</div><div>C</div><div>F</div><div />
            </div>

            {meal.items.map((it, ii) => {
              const p = products.find(pr => pr.id === it.productId);
              const m = calcMacros(p, it.amount);

              return (
                <div key={ii} className="meal-row">
                  <select value={it.productId} onChange={e => updateItem(mi, ii, "productId", e.target.value)}>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={it.amount} onChange={e => updateItem(mi, ii, "amount", e.target.value)} />
                  <div>{m.cal.toFixed(0)}</div>
                  <div>{m.protein.toFixed(1)}</div>
                  <div>{m.carbs.toFixed(1)}</div>
                  <div>{m.fat.toFixed(1)}</div>
                  <button className="danger" onClick={() => removeItem(mi, ii)}>✕</button>
                </div>
              );
            })}
            <button onClick={() => addItem(mi)}>＋</button>

            <div className="meal-total">
              <div>Total</div><div />
              <div>{totals.cal.toFixed(0)}</div>
              <div>{totals.protein.toFixed(1)}</div>
              <div>{totals.carbs.toFixed(1)}</div>
              <div>{totals.fat.toFixed(1)}</div>
              <div />
            </div>


          </section>
        );
      })}

      <button className="danger" onClick={resetPlan}>Clear all</button>
        <section className="glass-card daily-summary">
          <h3>Daily Targets & Totals</h3>

          <div className="summary-grid">
            <div></div>
            <div>Calories</div>
            <div>Protein</div>
            <div>Carbs</div>
            <div>Fat</div>

            {/* TARGETS */}
            <div className="row-label">Target</div>

            <input
              type="number"
              value={mealPlan.profile.calories || ""}
              onChange={e =>
                updatePlan({
                  ...mealPlan,
                  profile: { ...mealPlan.profile, calories: +e.target.value || 0 }
                })
              }
            />

            <input
              type="number"
              value={mealPlan.profile.protein || ""}
              onChange={e =>
                updatePlan({
                  ...mealPlan,
                  profile: { ...mealPlan.profile, protein: +e.target.value || 0 }
                })
              }
            />

            <input
              type="number"
              value={mealPlan.profile.carbs || ""}
              onChange={e =>
                updatePlan({
                  ...mealPlan,
                  profile: { ...mealPlan.profile, carbs: +e.target.value || 0 }
                })
              }
            />

            <input
              type="number"
              value={mealPlan.profile.fat || ""}
              onChange={e =>
                updatePlan({
                  ...mealPlan,
                  profile: { ...mealPlan.profile, fat: +e.target.value || 0 }
                })
              }
            />

            {/* TOTALS */}
            <div className="row-label">Actual</div>

            <div className={proximityClass(dailyTotals.cal, mealPlan.profile.calories)}>
              {dailyTotals.cal.toFixed(0)}
            </div>

            <div className={proximityClass(dailyTotals.protein, mealPlan.profile.protein)}>
              {dailyTotals.protein.toFixed(1)}
            </div>

            <div className={proximityClass(dailyTotals.carbs, mealPlan.profile.carbs)}>
              {dailyTotals.carbs.toFixed(1)}
            </div>

            <div className={proximityClass(dailyTotals.fat, mealPlan.profile.fat)}>
              {dailyTotals.fat.toFixed(1)}
            </div>
          </div>
        </section>
    </div>
  );
}
