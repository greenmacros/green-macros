import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import Menu from "../components/Menu";
import { useI18n } from "../i18n/context";
import { PLAN_COLORS } from "../lib/plans";

/**
 * Plan switcher built for lots of plans:
 *  - "All plans" dropdown with search + at-a-glance totals
 *  - scrollable, drag-to-reorder tab strip (active tab scrolls into view)
 *  - one actions menu for the active plan (kept outside the scroller so it's never clipped)
 */
export default function PlanTabs({
  plans,
  archived,
  activeId,
  totals,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onArchive,
  onRestore,
  onRemove,
  onMove,
  onReorder,
  onColor,
  onExportCsv,
  onExportAllCsv,
  onCopyText,
  onShare,
  onPrint,
  onImage,
  onFit
}) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [dragId, setDragId] = useState(null);
  const stripRef = useRef(null);
  const active = plans.find(p => p.id === activeId);
  const activeIndex = plans.findIndex(p => p.id === activeId);

  useEffect(() => {
    stripRef.current
      ?.querySelector(".plan-tab.active")
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeId, plans.length]);

  function startRename(plan) {
    setEditingId(plan.id);
    setDraft(plan.name);
  }

  function commitRename() {
    if (editingId && draft.trim()) onRename(editingId, draft.trim());
    setEditingId(null);
  }

  function onTabKeyDown(e) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = plans[activeIndex + step];
    if (!next) return;
    e.preventDefault();
    onSelect(next.id);
    requestAnimationFrame(() =>
      stripRef.current?.querySelector(".plan-tab.active")?.focus()
    );
  }

  return (
    <div className="plan-tabs-bar">
      <Menu
        label={`${plans.length}${archived.length ? `+${archived.length}` : ""} ▾`}
        title={t("plans.all")}
        className="plan-switcher-btn"
        align="left"
        closeOnClick={false}
      >
        {({ close }) => (
          <PlanSwitcher
            plans={plans}
            archived={archived}
            activeId={activeId}
            totals={totals}
            onSelect={id => {
              onSelect(id);
              close();
            }}
            onRestore={id => {
              onRestore(id);
              close();
            }}
          />
        )}
      </Menu>

      <div className="plan-tabs" ref={stripRef} role="tablist" onKeyDown={onTabKeyDown}>
        {plans.map(p =>
          editingId === p.id ? (
            <input
              key={p.id}
              autoFocus
              className="plan-tab-edit"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onFocus={e => e.target.select()}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setEditingId(null);
                e.stopPropagation();
              }}
            />
          ) : (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === activeId}
              tabIndex={p.id === activeId ? 0 : -1}
              draggable
              className={`plan-tab ${p.id === activeId ? "active" : ""} ${dragId === p.id ? "dragging" : ""}`}
              onClick={() => onSelect(p.id)}
              onDoubleClick={() => startRename(p)}
              onDragStart={() => setDragId(p.id)}
              onDragOver={e => dragId && e.preventDefault()}
              onDrop={() => {
                if (dragId && dragId !== p.id) onReorder(dragId, p.id);
                setDragId(null);
              }}
              onDragEnd={() => setDragId(null)}
              title={t("plans.tabHint")}
            >
              {p.color && <span className="dot" style={{ background: p.color }} />}
              {p.name}
            </button>
          )
        )}
      </div>

      <button className="icon-btn add-plan" onClick={onAdd} title={t("plans.new")} aria-label={t("plans.new")}><Icon name="plus" size={18} /></button>

      {active && (
        <Menu title={t("plans.actions")}>
          <button onClick={() => startRename(active)}>{t("common.rename")}</button>
          <button onClick={() => onDuplicate(active.id)}>{t("common.duplicate")}</button>
          <button disabled={activeIndex === 0} onClick={() => onMove(active.id, -1)}>{t("plans.moveLeft")}</button>
          <button disabled={activeIndex === plans.length - 1} onClick={() => onMove(active.id, 1)}>{t("plans.moveRight")}</button>
          <div className="swatches" onClick={e => e.stopPropagation()}>
            {PLAN_COLORS.map(c => (
              <button
                key={c || "none"}
                className={`swatch ${active.color === c ? "on" : ""}`}
                style={{ background: c || "transparent" }}
                title={c ? t("plans.color") : t("plans.noColor")}
                aria-label={c ? t("plans.color") : t("plans.noColor")}
                onClick={() => onColor(active.id, c)}
              />
            ))}
          </div>
          <hr />
          <button onClick={onFit}>{t("fit.menu")}</button>
          <hr />
          <button onClick={() => onShare(active.id)}>{t("plans.shareThis")}</button>
          <button onClick={() => onImage(active.id)}>{t("plans.image")}</button>
          <button onClick={() => onPrint(active.id)}>{t("plans.print")}</button>
          <button onClick={() => onCopyText(active.id)}>{t("plans.copyText")}</button>
          <button onClick={() => onExportCsv(active.id)}>{t("plans.csvThis")}</button>
          <button onClick={onExportAllCsv}>{t("plans.csvAll")}</button>
          <hr />
          <button disabled={plans.length <= 1} onClick={() => onArchive(active.id)}>{t("plans.archive")}</button>
          <button className="danger" disabled={plans.length <= 1} onClick={() => onRemove(active.id)}>
            {t("plans.delete")}
          </button>
        </Menu>
      )}
    </div>
  );
}

function PlanSwitcher({ plans, archived, activeId, totals, onSelect, onRestore }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const q = filter.trim().toLowerCase();
  const match = p => p.name.toLowerCase().includes(q);
  const visible = plans.filter(match);
  const hiddenOnes = archived.filter(match);

  return (
    <div className="plan-switcher">
      <input
        autoFocus
        className="plan-switcher-search"
        placeholder={t("plans.search", { n: plans.length })}
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <div className="plan-switcher-list">
        {visible.map(p => {
          const tot = totals.get(p.id);
          return (
            <button
              key={p.id}
              className={`plan-switcher-item ${p.id === activeId ? "active" : ""}`}
              onClick={() => onSelect(p.id)}
            >
              <span className="dot" style={{ background: p.color || "var(--muted)" }} />
              <span className="plan-switcher-name">{p.name}</span>
              <small>{tot ? `${tot.cal.toFixed(0)} ${t("unit.kcal")} · ${t("macro.p")} ${tot.protein.toFixed(0)}` : ""}</small>
            </button>
          );
        })}
        {!visible.length && <div className="picker-empty">{t("plans.noMatch")}</div>}
      </div>

      {archived.length > 0 && (
        <>
          <button className="plan-switcher-toggle" onClick={() => setShowArchived(s => !s)} aria-expanded={showArchived}>
            {showArchived ? "▾" : "▸"} {t("plans.archived", { n: archived.length })}
          </button>
          {(showArchived || (q && hiddenOnes.length > 0)) && (
            <div className="plan-switcher-list">
              {hiddenOnes.map(p => (
                <div key={p.id} className="plan-switcher-item archived">
                  <span className="dot" style={{ background: p.color || "var(--muted)" }} />
                  <span className="plan-switcher-name">{p.name}</span>
                  <button className="btn-ghost" onClick={() => onRestore(p.id)}>{t("plans.restore")}</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
