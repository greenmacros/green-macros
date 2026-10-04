import { useI18n } from "../i18n/context";
import { buildProductMap, formatAmount, sumItems } from "../lib/macros";

export default function RecipesCard({ recipes, setRecipes, products, notify }) {
  const { t } = useI18n();
  const productMap = buildProductMap(products);

  function remove(recipe) {
    const index = recipes.findIndex(r => r.id === recipe.id);
    setRecipes(rs => rs.filter(r => r.id !== recipe.id));
    notify(t("toast.recipeDeleted", { name: recipe.name }), {
      label: t("common.undo"),
      run: () =>
        setRecipes(rs => {
          const next = [...rs];
          next.splice(Math.min(index, next.length), 0, recipe);
          return next;
        })
    });
  }

  if (!recipes.length) return <p className="muted">{t("recipe.empty")}</p>;

  return (
    <div className="recipes">
      {recipes.map(r => {
        const tot = sumItems(r.items, productMap);
        return (
          <div key={r.id} className="recipe-row">
            <input
              aria-label={t("recipe.name")}
              value={r.name}
              onChange={e => setRecipes(rs => rs.map(x => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
            />
            <div className="muted recipe-items">
              {r.items
                .map(it => {
                  const p = productMap.get(it.productId);
                  return p ? `${p.name} ${formatAmount(it.amount)}${t(`unit.${p.unit}`)}` : t("picker.missing");
                })
                .join(" · ")}
            </div>
            <div className="recipe-totals">
              {tot.cal.toFixed(0)} {t("unit.kcal")} · {t("macro.p")} {tot.protein.toFixed(1)} · {t("macro.c")} {tot.carbs.toFixed(1)} · {t("macro.f")} {tot.fat.toFixed(1)}
            </div>
            <button className="danger" aria-label={t("common.delete")} onClick={() => remove(r)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
