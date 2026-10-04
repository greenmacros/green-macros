import { useI18n } from "../i18n/context";
import { CATEGORIES, countByCategory } from "../lib/categories";

/** Filter chips: All + one per category that has products. `value` "" means all. */
export default function CategoryChips({ products, value, onChange }) {
  const { t } = useI18n();
  const counts = countByCategory(products);
  return (
    <div className="chips" role="group" aria-label={t("cat.label")}>
      <button className={`chip ${value === "" ? "on" : ""}`} aria-pressed={value === ""} onClick={() => onChange("")}>
        {t("cat.all")} <small>{products.length}</small>
      </button>
      {CATEGORIES.filter(c => counts[c] > 0 || value === c).map(c => (
        <button key={c} className={`chip ${value === c ? "on" : ""}`} aria-pressed={value === c} onClick={() => onChange(value === c ? "" : c)}>
          <span className={`cat-dot cat-${c}`} />
          {t(`cat.${c}`)} <small>{counts[c]}</small>
        </button>
      ))}
    </div>
  );
}
