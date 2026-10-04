import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { uid } from "./id";
import { normalizePlanner, productIdsInPlan } from "./plans";
import { normalizeProducts, sameProduct } from "./products";

/*
  Link format (extra fields are appended so older links keep decoding):
    p: [id, name, cal, protein, carbs, fat, serving, unit]
    m: [id, name, [[mealName, [[itemId, productId, amount, note, locked]], [cal, p, c, f]?]], [cal, p, c, f], color]
*/

function encodeProducts(products) {
  return products.map(p => [p.id, p.name, p.cal, p.protein, p.carbs, p.fat, p.servingGrams, p.unit]);
}

function encodePlans(plans) {
  return plans.map(plan => [
    plan.id,
    plan.name,
    plan.data.meals.map(meal => [
      meal.name,
      meal.items.map(it => [it.id, it.productId, it.amount, it.note || "", it.locked ? 1 : 0]),
      [meal.target.calories, meal.target.protein, meal.target.carbs, meal.target.fat]
    ]),
    [
      plan.data.profile.calories,
      plan.data.profile.protein,
      plan.data.profile.carbs,
      plan.data.profile.fat
    ],
    plan.color || ""
  ]);
}

function decodeProducts(arr) {
  return normalizeProducts(
    arr.map(([id, name, cal, protein, carbs, fat, servingGrams, unit]) => ({
      id, name, cal, protein, carbs, fat, servingGrams, unit
    }))
  );
}

function decodePlans(arr) {
  return normalizePlanner({
    plans: arr.map(([id, name, meals, profile, color]) => ({
      id,
      name,
      color,
      data: {
        profile: {
          calories: profile?.[0],
          protein: profile?.[1],
          carbs: profile?.[2],
          fat: profile?.[3]
        },
        meals: (meals || []).map(([mealName, items, target]) => ({
          name: mealName,
          target: {
            calories: target?.[0],
            protein: target?.[1],
            carbs: target?.[2],
            fat: target?.[3]
          },
          items: (items || []).map(([iid, productId, amount, note, locked]) => ({
            id: iid, productId, amount, note, locked: Boolean(locked)
          }))
        }))
      }
    }))
  }).plans;
}

/** Share `plans`, bundling only the products they actually use. */
export function buildShareUrl(plans, products) {
  const used = new Set();
  plans.forEach(p => productIdsInPlan(p).forEach(id => used.add(id)));
  const payload = { p: encodeProducts(products.filter(p => used.has(p.id))), m: encodePlans(plans), v: 2 };
  const blob = compressToEncodedURIComponent(JSON.stringify(payload));
  return `${window.location.origin}${window.location.pathname}?s=${blob}`;
}

/** Throws on anything that isn't a valid share blob. */
export function parseShare(blob) {
  const json = decompressFromEncodedURIComponent(blob);
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed?.m) || !parsed.m.length) throw new Error("No plans in link");
  return {
    products: Array.isArray(parsed.p) ? decodeProducts(parsed.p) : [],
    plans: decodePlans(parsed.m)
  };
}

/**
 * Add shared plans/products to what the user already has without clobbering anything.
 * Plan ids are always regenerated; a shared product with a clashing id but different
 * numbers is re-id'd and the imported items are re-pointed at it.
 */
export function mergeShared(products, plannerState, shared) {
  const byId = new Map(products.map(p => [p.id, p]));
  const idMap = new Map();
  const newProducts = [];

  for (const sp of shared.products) {
    const existing = byId.get(sp.id);
    if (!existing) {
      newProducts.push(sp);
      byId.set(sp.id, sp);
    } else if (!sameProduct(existing, sp)) {
      const remapped = { ...sp, id: uid() };
      idMap.set(sp.id, remapped.id);
      newProducts.push(remapped);
    }
  }

  const newPlans = shared.plans.map(plan => ({
    ...plan,
    id: uid(),
    data: {
      ...plan.data,
      meals: plan.data.meals.map(meal => ({
        ...meal,
        id: uid(),
        items: meal.items.map(it => ({
          ...it,
          id: uid(),
          productId: it.productId && idMap.has(it.productId) ? idMap.get(it.productId) : it.productId
        }))
      }))
    }
  }));

  return {
    products: [...products, ...newProducts],
    plannerState: {
      ...plannerState,
      plans: [...plannerState.plans, ...newPlans],
      activePlanId: newPlans[0].id
    }
  };
}
