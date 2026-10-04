import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import Menu from "../components/Menu";
import NumInput from "../components/NumInput";
import ProductForm from "../components/ProductForm";
import AddPanel from "./AddPanel";
import { starterProducts } from "../data/starterProducts";
import { useI18n } from "../i18n/context";
import { fold } from "../lib/foods";
import { caloriesLookOff, kcalFromMacros } from "../lib/macros";
import { UNITS, createProduct, sortProducts } from "../lib/products";
import { STORAGE_KEYS, loadString, saveString } from "../lib/storage";

const SORTS = ["name", "recent", "protein", "carbs", "fat", "cal"];

export default function ProductsTab({
  products, setProducts, recipes, setRecipes, usage, prefill, onPrefillUsed, onFit, notify
}) {
  const { t, lang } = useI18n();
  const [showForm, setShowForm] = useState(prefill != null);
  const [formKey, setFormKey] = useState(0);
  const [formInitial] = useState(() => (prefill ? { name: prefill } : undefined));
  const [search, setSearch] = useState("");
  const [favsOnly, setFavsOnly] = useState(false);
  const [sortBy, setSortBy] = useState(() => loadString(STORAGE_KEYS.productSort, "name"));

  useEffect(() => {
    if (prefill != null) onPrefillUsed();
  }, [prefill, onPrefillUsed]);

  useEffect(() => saveString(STORAGE_KEYS.productSort, sortBy), [sortBy]);

  const visible = useMemo(() => {
    const q = fold(search);
    return sortProducts(products, sortBy).filter(
      p => (!favsOnly || p.fav) && (!q || fold(p.name).includes(q))
    );
  }, [products, sortBy, search, favsOnly]);

  const names = useMemo(() => products.map(p => p.name), [products]);

  /* ---------- CRUD (always by id — the list is filtered/sorted) ---------- */
  const update = (id, patch) =>
    setProducts(ps => ps.map(p => (p.id === id ? { ...p, ...patch } : p)));

  function addProduct(p) {
    setProducts(ps => [...ps, p]);
    notify(t("toast.productAdded", { name: p.name }));
  }

  const addMany = list => setProducts(ps => [...ps, ...list]);

  function duplicateProduct(p) {
    setProducts(ps => [...ps, { ...p, id: createProduct().id, name: t("plan.copyOf", { name: p.name }) }]);
  }

  function removeProduct(p) {
    const used = usage.get(p.id) ?? 0;
    if (used && !window.confirm(t("products.confirmUsed", { name: p.name, n: used }))) return;
    const index = products.findIndex(x => x.id === p.id);
    setProducts(ps => ps.filter(x => x.id !== p.id));
    notify(t("toast.productDeleted", { name: p.name }), {
      label: t("common.undo"),
      run: () =>
        setProducts(ps => {
          if (ps.some(x => x.id === p.id)) return ps;
          const next = [...ps];
          next.splice(Math.min(index, next.length), 0, p);
          return next;
        })
    });
  }

  function loadStarter() {
    const have = new Set(products.map(p => fold(p.name)));
    const fresh = starterProducts(lang).filter(p => !have.has(fold(p.name))).map(p => createProduct(p));
    if (!fresh.length) return notify(t("toast.starterHave"));
    addMany(fresh);
    notify(t("toast.starterAdded", { n: fresh.length }));
  }

  function clearAll() {
    if (!products.length) return;
    if (!window.confirm(t("products.confirmAll", { n: products.length }))) return;
    const prev = products;
    setProducts([]);
    notify(t("toast.allDeleted"), { label: t("common.undo"), run: () => setProducts(prev) });
  }

  return (
    <div className="products-tab">
      <div className="tab-heading">
        <h2>{t("products.title")} <span className="muted count">{products.length}</span></h2>
        <div className="heading-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setShowForm(s => !s);
              setFormKey(k => k + 1);
            }}
          >
            {showForm ? t("products.hideForm") : t("products.add")}
          </button>
          <Menu title={t("products.more")}>
            <button onClick={loadStarter}>{t("products.starter")}</button>
            <hr />
            <button className="danger" disabled={!products.length} onClick={clearAll}>{t("products.deleteAll")}</button>
          </Menu>
        </div>
      </div>

      {showForm && (
        <div className="glass-card">
          <ProductForm
            key={formKey}
            initial={formInitial}
            existingNames={names}
            onSubmit={addProduct}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="toolbar">
        <input
          type="search"
          className="toolbar-search"
          placeholder={t("products.search", { n: products.length })}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="toolbar-check">
          <input type="checkbox" checked={favsOnly} onChange={e => setFavsOnly(e.target.checked)} />
          ★ {t("products.favorites")}
        </label>
        <label className="toolbar-sort">
          {t("products.sort")}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORTS.map(v => <option key={v} value={v}>{t(`sort.${v}`)}</option>)}
          </select>
        </label>
      </div>

      <div className="products-table-scroll">
        <div className="products-header products-row">
          <div /><div>{t("form.name")}</div><div>{t("products.colServing")}</div><div>{t("form.unit")}</div><div>{t("unit.kcal")}</div>
          <div>{t("macro.protein")}</div><div>{t("macro.carbs")}</div><div>{t("macro.fat")}</div><div />
        </div>

        {visible.map(p => {
          const used = usage.get(p.id) ?? 0;
          return (
            <div key={p.id} className="products-row">
              <button
                className={`icon-btn fav row-action ${p.fav ? "on" : ""}`}
                aria-pressed={p.fav}
                title={t("products.favHint")}
                onClick={() => update(p.id, { fav: !p.fav })}
              >
                <Icon name="star" filled={p.fav} />
              </button>
              <div className="name-cell">
                <input aria-label={t("form.name")} value={p.name} onChange={e => update(p.id, { name: e.target.value })} />
                {used > 0 && <small className="muted">{t("products.usedIn", { n: used })}</small>}
              </div>
              <div className="pf" data-l={t("products.colServing")}>
                <NumInput aria-label={t("form.serving")} value={p.servingGrams} onCommit={v => update(p.id, { servingGrams: v || 1 })} />
              </div>
              <div className="pf" data-l={t("form.unit")}>
                <select aria-label={t("form.unit")} value={p.unit} onChange={e => update(p.id, { unit: e.target.value })}>
                  {UNITS.map(u => <option key={u} value={u}>{t(`unit.${u}`)}</option>)}
                </select>
              </div>
              <div className="pf" data-l={t("unit.kcal")}>
              <div className="kcal-cell">
                <NumInput aria-label={t("macro.calories")} value={p.cal} onCommit={v => update(p.id, { cal: v })} />
                {caloriesLookOff(p) && (
                  <button
                    className="icon-btn warn-btn"
                    title={t("products.kcalOff", { n: kcalFromMacros(p.protein, p.carbs, p.fat) })}
                    onClick={() => update(p.id, { cal: kcalFromMacros(p.protein, p.carbs, p.fat) })}
                  >
                    ⚠
                  </button>
                )}
              </div>
              </div>
              <div className="pf" data-l={t("macro.protein")}>
                <NumInput aria-label={t("macro.protein")} value={p.protein} onCommit={v => update(p.id, { protein: v })} />
              </div>
              <div className="pf" data-l={t("macro.carbs")}>
                <NumInput aria-label={t("macro.carbs")} value={p.carbs} onCommit={v => update(p.id, { carbs: v })} />
              </div>
              <div className="pf" data-l={t("macro.fat")}>
                <NumInput aria-label={t("macro.fat")} value={p.fat} onCommit={v => update(p.id, { fat: v })} />
              </div>
              <div className="row-actions">
                <button className="icon-btn row-action" title={t("fit.rowHint")} aria-label={t("fit.rowHint")} onClick={() => onFit(p)}><Icon name="swap" /></button>
                <button className="icon-btn row-action" title={t("common.duplicate")} aria-label={t("common.duplicate")} onClick={() => duplicateProduct(p)}><Icon name="copy" /></button>
                <button className="icon-btn row-action remove" title={t("common.delete")} aria-label={t("common.delete")} onClick={() => removeProduct(p)}><Icon name="close" /></button>
              </div>
            </div>
          );
        })}

        {!visible.length && (
          <div className="muted empty-row">
            {products.length ? t("products.noMatch") : t("products.empty")}
            {!products.length && (
              <div><button className="primary-btn" onClick={loadStarter}>{t("products.starter")}</button></div>
            )}
          </div>
        )}
      </div>

      <AddPanel
        products={products}
        names={names}
        recipes={recipes}
        setRecipes={setRecipes}
        onAdd={addProduct}
        onAddMany={addMany}
        notify={notify}
      />

      <p className="note">{t("products.disclaimer")}</p>
    </div>
  );
}
