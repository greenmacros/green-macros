import { useRef, useState } from "react";
import NumInput from "./NumInput";
import { useI18n } from "../i18n/context";
import { kcalFromMacros } from "../lib/macros";
import { UNITS, createProduct } from "../lib/products";

/** Add-product form, also used to review parsed labels / foods before saving. */
export default function ProductForm({ initial, submitLabel, existingNames = [], onSubmit, onCancel }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => createProduct(initial));
  const [autoKcal, setAutoKcal] = useState(!initial?.cal);
  const nameRef = useRef(null);

  const set = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const kcal = autoKcal ? kcalFromMacros(draft.protein, draft.carbs, draft.fat) : draft.cal;
  const name = draft.name.trim();
  const duplicate = existingNames.some(n => n.toLowerCase() === name.toLowerCase());
  const valid = name && draft.servingGrams > 0;

  function submit(e) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ ...draft, name, cal: kcal });
    setDraft(createProduct());
    setAutoKcal(true);
    nameRef.current?.focus();
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <label className="field field-name">
        {t("form.name")}
        <input
          ref={nameRef}
          autoFocus
          value={draft.name}
          placeholder={t("form.namePlaceholder")}
          onChange={e => set("name", e.target.value)}
        />
      </label>
      <label className="field">
        {t("form.serving")}
        <NumInput value={draft.servingGrams} onCommit={v => set("servingGrams", v)} />
      </label>
      <label className="field">
        {t("form.unit")}
        <select value={draft.unit} onChange={e => set("unit", e.target.value)}>
          {UNITS.map(u => <option key={u} value={u}>{t(`unit.${u}`)}</option>)}
        </select>
      </label>
      <label className="field">
        {t("form.protein")}
        <NumInput value={draft.protein} onCommit={v => set("protein", v)} />
      </label>
      <label className="field">
        {t("form.carbs")}
        <NumInput value={draft.carbs} onCommit={v => set("carbs", v)} />
      </label>
      <label className="field">
        {t("form.fat")}
        <NumInput value={draft.fat} onCommit={v => set("fat", v)} />
      </label>
      <label className="field">
        {t("form.calories")}
        <NumInput value={kcal} disabled={autoKcal} onCommit={v => set("cal", v)} />
      </label>
      <label className="field field-check">
        <input type="checkbox" checked={autoKcal} onChange={e => setAutoKcal(e.target.checked)} />
        {t("form.autoKcal")}
      </label>

      <div className="form-actions">
        {duplicate && <span className="hint warn">{t("form.duplicate")}</span>}
        <span className="hint">
          {t("form.per", { amount: draft.servingGrams || "…", unit: t(`unit.${draft.unit}`) })}
        </span>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>{t("common.close")}</button>
        )}
        <button type="submit" className="primary-btn" disabled={!valid}>
          {submitLabel ?? t("form.add")}
        </button>
      </div>
    </form>
  );
}
