/** Move the entry with id `fromId` to the position of `toId` (list is [{id}, …]). Returns a new list. */
export function moveInList(list, fromId, toId) {
  const from = list.findIndex(x => x.id === fromId);
  const to = list.findIndex(x => x.id === toId);
  if (from < 0 || to < 0 || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Swap an entry with its neighbour (step −1 = up, +1 = down). */
export function nudgeInList(list, id, step) {
  const i = list.findIndex(x => x.id === id);
  const j = i + step;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * Move an item to meal `toMealId`, before `targetItemId` (or to the end when null).
 * Moving down inside the same meal lands after the target, which is what dragging feels like.
 */
export function moveItemInMeals(meals, itemId, toMealId, targetItemId = null) {
  const src = meals.find(m => m.items.some(i => i.id === itemId));
  if (!src || itemId === targetItemId || !meals.some(m => m.id === toMealId)) return meals;

  const item = src.items.find(i => i.id === itemId);
  const srcIndex = src.items.findIndex(i => i.id === itemId);
  const targetOriginal = src.id === toMealId && targetItemId ? src.items.findIndex(i => i.id === targetItemId) : -1;

  return meals
    .map(m => (m.id === src.id ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m))
    .map(m => {
      if (m.id !== toMealId) return m;
      const items = [...m.items];
      let at = targetItemId ? items.findIndex(i => i.id === targetItemId) : items.length;
      if (at < 0) at = items.length;
      if (targetOriginal >= 0 && srcIndex < targetOriginal) at += 1;
      items.splice(at, 0, item);
      return { ...m, items };
    });
}
