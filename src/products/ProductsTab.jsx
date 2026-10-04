import { useEffect, useMemo, useState } from "react";
import CategoryChips from "../components/CategoryChips";
import DragGhost from "../components/DragGhost";
import Icon from "../components/Icon";
import Menu from "../components/Menu";
import ProductForm from "../components/ProductForm";
import AddPanel from "./AddPanel";
import DuplicatesDialog from "./DuplicatesDialog";
import ProductRow from "./ProductRow";
import { starterProducts } from "../data/starterProducts";
import { useI18n } from "../i18n/context";
import { CATEGORIES } from "../lib/categories";
import { fold } from "../lib/foods";
import { createProduct, sortProducts } from "../lib/products";
import { moveInList, nudgeInList } from "../lib/reorder";
import { STORAGE_KEYS, loadJSON, loadString, saveJSON, saveString } from "../lib/storage";
import { useReorderDrag } from "../lib/useReorderDrag";

const SORTS = ["name", "used", "recent", "manual", "protein", "carbs", "fat", "cal"];
const STATUSES = ["fav", "used", "unused"];
const PAGE = 25;

export default function ProductsTab({
  products, setProducts, recipes, setRecipes, usage, prefill, onPrefillUsed, onFit, onMerge, notify
}) {
  const { t, lang } = useI18n();
  const [showForm, setShowForm] = useState(prefill != null);
  const [formKey, setFormKey] = useState(0);
  const [formInitial] = useState(() => (prefill ? { name: prefill } : undefined));

  // filters / view
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(""); // "" | fav | used | unused
  const [sortBy, setSortBy] = useState(() => loadString(STORAGE_KEYS.productSort, "name"));
  const [view, setView] = useState(() => (loadString("gm_productView") === "grouped" ? "grouped" : "list"));
  const [collapsed, setCollapsed] = useState(() => loadJSON("gm_collapsedCats", {}));
  const [limits, setLimits] = useState({ sig: "", all: PAGE, groups: {} });

  // row state
  const [expandedId, setExpandedId] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [organize, setOrganize] = useState(false);
  const [showDups, setShowDups] = useState(false);

  useEffect(() => {
    if (prefill != null) onPrefillUsed();
  }, [prefill, onPrefillUsed]);
  useEffect(() => saveString(STORAGE_KEYS.productSort, sortBy), [sortBy]);
  useEffect(() => saveString("gm_productView", view), [view]);
  useEffect(() => {
    saveJSON("gm_collapsedCats", collapsed);
  }, [collapsed]);

  /* ---------- filtering, sorting, paging ---------- */
  const names = useMemo(() => products.map(p => p.name), [products]);

  const base = useMemo(() => {
    const q = fold(search);
    return products.filter(p => {
      if (q && !fold(p.name).includes(q)) return false;
      if (status === "fav") return p.fav;
      if (status === "used") return (usage.get(p.id) ?? 0) > 0;
      if (status === "unused") return !usage.get(p.id);
      return true;
    });
  }, [products, search, status, usage]);

  const sorted = useMemo(
    () => sortProducts(category ? base.filter(p => p.category === category) : base, sortBy, usage),
    [base, category, sortBy, usage]
  );

  // paging resets whenever the filters change
  const sig = [search, category, status, sortBy, view].join("|");
  const limit = limits.sig === sig ? limits : { sig, all: PAGE, groups: {} };
  const showMore = (group) =>
    setLimits(group ? { ...limit, groups: { ...limit.groups, [group]: (limit.groups[group] ?? PAGE) + PAGE } } : { ...limit, all: limit.all + PAGE });

  const groups = useMemo(
    () => CATEGORIES.map(c => ({ cat: c, items: sorted.filter(p => p.category === c) })).filter(g => g.items.length),
    [sorted]
  );

  /* ---------- organize mode: arrange the list by hand ---------- */
  function toggleOrganize() {
    if (!organize) {
      setSortBy("manual"); // dragging only makes sense on the saved order
      setSearch("");
      setCategory("");
      setStatus("");
      setView("list");
      setSelectMode(false);
      setExpandedId(null);
    }
    setOrganize(o => !o);
  }

  const moveProduct = (fromId, toId) => setProducts(ps => moveInList(ps, fromId, toId));
  const { gripProps, drag, over } = useReorderDrag((payload, key) => moveProduct(payload.id, key.slice("product:".length)));
  const nudgeProduct = (id, step) => setProducts(ps => nudgeInList(ps, id, step));

  /* ---------- CRUD (always by id — the list is filtered/sorted) ---------- */
  const update = (id, patch) => setProducts(ps => ps.map(p => (p.id === id ? { ...p, ...patch } : p)));

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

  /* ---------- select mode: bulk actions ---------- */
  const selectedProducts = products.filter(p => selected.has(p.id));

  function toggleSelectMode(on = !selectMode) {
    setSelectMode(on);
    setSelected(new Set());
    setExpandedId(null);
  }

  const setSel = (id, on) =>
    setSelected(s => {
      const next = new Set(s);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  function bulkPatch(patch) {
    setProducts(ps => ps.map(p => (selected.has(p.id) ? { ...p, ...patch } : p)));
  }

  function bulkDelete() {
    const used = selectedProducts.filter(p => usage.get(p.id)).length;
    if (!window.confirm(t("products.confirmBulk", { n: selectedProducts.length, used }))) return;
    const prev = products;
    setProducts(ps => ps.filter(p => !selected.has(p.id)));
    notify(t("toast.bulkDeleted", { n: selectedProducts.length }), { label: t("common.undo"), run: () => setProducts(prev) });
    toggleSelectMode(false);
  }

  function selectUnused() {
    const ids = products.filter(p => !usage.get(p.id)).map(p => p.id);
    if (!ids.length) return notify(t("toast.noUnused"));
    setStatus("unused");
    setCategory("");
    setSearch("");
    setSelectMode(true);
    setSelected(new Set(ids));
    setExpandedId(null);
  }

  /* ---------- rendering helpers ---------- */
  const row = p => (
    <ProductRow
      key={p.id}
      p={p}
      used={usage.get(p.id) ?? 0}
      expanded={expandedId === p.id}
      onToggle={() => setExpandedId(id => (id === p.id ? null : p.id))}
      onUpdate={patch => update(p.id, patch)}
      onDuplicate={() => duplicateProduct(p)}
      onFit={() => onFit(p)}
      onRemove={() => removeProduct(p)}
      selectMode={selectMode}
      selected={selected.has(p.id)}
      onSelect={on => setSel(p.id, on)}
      organize={organize}
      onNudge={step => nudgeProduct(p.id, step)}
      gripProps={gripProps}
      dragging={drag?.payload.id === p.id}
      hot={organize && over === `product:${p.id}`}
    />
  );

  const moreButton = (left, group) =>
    left > 0 && (
      <button className="show-more" onClick={() => showMore(group)}>
        {t("products.showMore", { n: Math.min(PAGE, left), left })}
      </button>
    );

  const toggleGroup = cat => setCollapsed(c => ({ ...c, [cat]: !c[cat] }));
  const filtersActive = Boolean(search || category || status);

  return (
    <div className="products-tab">
      <div className="tab-heading">
        <h2>{t("products.title")} <span className="muted count">{products.length}</span></h2>
        <div className="heading-actions">
          <button
            className={`btn-ghost organize-btn ${organize ? "on" : ""}`}
            aria-pressed={organize}
            disabled={!products.length}
            title={t("organize.hint")}
            onClick={toggleOrganize}
          >
            {organize ? t("organize.done") : t("organize.start")}
          </button>
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
            <button disabled={products.length < 2} onClick={() => setShowDups(true)}>{t("products.findDuplicates")}</button>
            <button disabled={!products.length} onClick={selectUnused}>{t("products.selectUnused")}</button>
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

      {organize && <p className="hint">{t("organize.productsHelp")}</p>}

      <div className="toolbar" hidden={organize}>
        <input
          type="search"
          className="toolbar-search"
          placeholder={t("products.search", { n: products.length })}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="toolbar-sort">
          {t("products.sort")}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORTS.map(v => <option key={v} value={v}>{t(`sort.${v}`)}</option>)}
          </select>
        </label>
        <div className="seg" role="group" aria-label={t("products.view.label")}>
          {["list", "grouped"].map(v => (
            <button key={v} className={`seg-text ${view === v ? "on" : ""}`} aria-pressed={view === v} onClick={() => setView(v)}>
              {t(`products.view.${v}`)}
            </button>
          ))}
        </div>
        <button className={`btn-ghost ${selectMode ? "on-soft" : ""}`} aria-pressed={selectMode} onClick={() => toggleSelectMode()}>
          {selectMode ? t("products.selectDone") : t("products.select")}
        </button>
      </div>

      <div hidden={organize}>
        <CategoryChips products={base} value={category} onChange={setCategory} />
        <div className="chips status-chips" role="group" aria-label={t("products.status.label")}>
          {STATUSES.map(s => (
            <button key={s} className={`chip ${status === s ? "on" : ""}`} aria-pressed={status === s} onClick={() => setStatus(status === s ? "" : s)}>
              {s === "fav" && "★ "}{t(`products.status.${s}`)}
            </button>
          ))}
          {filtersActive && (
            <button className="btn-ghost" onClick={() => { setSearch(""); setCategory(""); setStatus(""); }}>{t("products.clearFilters")}</button>
          )}
        </div>
      </div>

      {selectMode && (
        <div className="bulk-bar" role="toolbar">
          <strong>{t("products.selected", { n: selected.size })}</strong>
          <button className="btn-ghost" onClick={() => setSelected(new Set(sorted.map(p => p.id)))}>{t("products.selectAll", { n: sorted.length })}</button>
          <button className="btn-ghost" disabled={!selected.size} onClick={() => setSelected(new Set())}>{t("products.clearSel")}</button>
          <span className="bulk-spacer" />
          <button disabled={!selected.size} onClick={() => bulkPatch({ fav: true })}>★ {t("products.bulkFav")}</button>
          <button disabled={!selected.size} onClick={() => bulkPatch({ fav: false })}>{t("products.bulkUnfav")}</button>
          <select
            disabled={!selected.size}
            value=""
            aria-label={t("products.setCategory")}
            onChange={e => e.target.value && bulkPatch({ category: e.target.value })}
          >
            <option value="">{t("products.setCategory")}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
          </select>
          <button className="danger" disabled={!selected.size} onClick={bulkDelete}>{t("common.delete")}</button>
        </div>
      )}

      <div className={`products-list ${organize ? "organizing-rows" : ""}`}>
        <div className="prow-head" aria-hidden="true">
          <div />
          <div className="prow-headmain">
            <span>{t("form.name")}</span><span>{t("products.colServing")}</span>
            <span className="prow-macros">
              <span className="m-cal">{t("macro.cal")}</span><span className="m-p">{t("macro.p")}</span>
              <span className="m-c">{t("macro.c")}</span><span className="m-f">{t("macro.f")}</span>
            </span>
          </div>
          <div />
        </div>

        {view === "list" || organize ? (
          <>
            {(organize ? sorted : sorted.slice(0, limit.all)).map(row)}
            {!organize && moreButton(sorted.length - limit.all)}
          </>
        ) : (
          groups.map(({ cat, items }) => {
            const open = !collapsed[cat];
            const n = limit.groups[cat] ?? PAGE;
            return (
              <section key={cat} className="pgroup">
                <button className="pgroup-head" aria-expanded={open} onClick={() => toggleGroup(cat)}>
                  <Icon name={open ? "down" : "up"} size={16} />
                  <span className={`cat-dot cat-${cat}`} />
                  <strong>{t(`cat.${cat}`)}</strong>
                  <small className="muted">{items.length}</small>
                </button>
                {open && (
                  <>
                    {items.slice(0, n).map(row)}
                    {moreButton(items.length - n, cat)}
                  </>
                )}
              </section>
            );
          })
        )}

        {!sorted.length && (
          <div className="muted empty-row">
            {products.length ? t("products.noMatch") : t("products.empty")}
            {!products.length && (
              <div><button className="primary-btn" onClick={loadStarter}>{t("products.starter")}</button></div>
            )}
          </div>
        )}
      </div>

      <AddPanel
        hidden={organize}
        products={products}
        names={names}
        recipes={recipes}
        setRecipes={setRecipes}
        onAdd={addProduct}
        onAddMany={addMany}
        notify={notify}
      />

      {showDups && (
        <DuplicatesDialog products={products} usage={usage} onMerge={onMerge} onClose={() => setShowDups(false)} />
      )}

      <DragGhost drag={drag} />

      <p className="note">{t("products.disclaimer")}</p>
    </div>
  );
}
