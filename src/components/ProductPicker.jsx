import { useEffect, useMemo, useRef, useState } from "react";
import CategoryChips from "./CategoryChips";
import { useI18n } from "../i18n/context";
import { fold } from "../lib/foods";

/**
 * Searchable product dropdown. Favourites first, then A–Z.
 * `onCreate(query)` powers the "New product…" row so users never have to
 * leave the planner to find out they're missing something.
 */
export default function ProductPicker({
  products,
  selected,
  missing = false,
  placeholder,
  className = "",
  onSelect,
  onCreate
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [category, setCategory] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const matches = useMemo(() => {
    const q = fold(query);
    return products
      .filter(p => (!q || fold(p.name).includes(q)) && (!category || p.category === category))
      .sort((a, b) => Number(b.fav) - Number(a.fav) || a.name.localeCompare(b.name));
  }, [products, query, category]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = e => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openPicker() {
    setQuery("");
    setCursor(0);
    setOpen(true);
  }

  function choose(p) {
    onSelect(p);
    setOpen(false);
  }

  function create() {
    onCreate?.(query.trim());
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[cursor]) choose(matches[cursor]);
      else if (query.trim() && onCreate) create();
    }
  }

  const label = missing ? t("picker.missing") : selected ? selected.name : placeholder ?? t("picker.choose");

  return (
    <div className={`picker ${className}`} ref={ref}>
      <button
        type="button"
        className={`picker-trigger ${selected ? "" : "muted"} ${missing ? "missing" : ""}`}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <span className="picker-label">{label}</span>
        <span className="picker-caret">▾</span>
      </button>

      {open && (
        <div className="picker-pop" onKeyDown={onKeyDown}>
          <input
            ref={inputRef}
            className="picker-search"
            placeholder={t("picker.search")}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setCursor(0);
            }}
          />
          {products.length >= 12 && (
            <CategoryChips
              products={products}
              value={category}
              onChange={c => {
                setCategory(c);
                setCursor(0);
              }}
            />
          )}
          <div className="picker-list" role="listbox">
            {matches.map((p, i) => (
              <button
                type="button"
                key={p.id}
                role="option"
                aria-selected={selected?.id === p.id}
                className={`picker-option ${i === cursor ? "cursor" : ""}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(p)}
              >
                <span>{p.fav ? "★ " : ""}{p.name}</span>
                <small>{Math.round(p.cal)} {t("unit.kcal")} · {t("macro.p")} {p.protein}</small>
              </button>
            ))}
            {!matches.length && (
              <div className="picker-empty">
                {products.length ? t("picker.noMatch") : t("picker.noProducts")}
              </div>
            )}
          </div>
          {onCreate && (
            <button type="button" className="picker-create" onClick={create}>
              {query.trim() ? t("picker.newNamed", { name: query.trim() }) : t("picker.new")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
