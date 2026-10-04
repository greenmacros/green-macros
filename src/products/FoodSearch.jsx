import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/context";
import { fold, loadFoods, searchFoods } from "../lib/foods";
import { parseFoodsCsv } from "../lib/foodCsv";
import { createProduct } from "../lib/products";

const MEXT_URL = "https://www.mext.go.jp/a_menu/syokuhinseibun/mext_01110.html";

/** Offline food list (Japan + global) with CSV import for bigger databases. */
export default function FoodSearch({ existingNames = [], onAdd, onAddMany, notify, pick = false }) {
  const { t, lang } = useI18n();
  const [foods, setFoods] = useState(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(lang === "ja" ? "jp" : "all");
  const [added, setAdded] = useState(() => new Set());
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadFoods().then(f => alive && setFoods(f));
    return () => { alive = false; };
  }, []);

  const results = useMemo(() => (foods ? searchFoods(foods, query, region, query.trim() ? 40 : 6) : []), [foods, query, region]);
  const have = useMemo(() => new Set(existingNames.map(fold)), [existingNames]);

  const nameFor = f => (lang === "ja" ? f.ja : f.en);
  const otherName = f => (lang === "ja" ? f.en : f.ja);
  const key = f => `${f.region}:${f.en}`;

  function add(f) {
    onAdd(
      createProduct({
        name: nameFor(f),
        servingGrams: f.servingGrams,
        unit: f.unit,
        cal: f.cal,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat
      })
    );
    setAdded(s => new Set(s).add(key(f)));
  }

  async function importCsv(file) {
    try {
      const { products, skipped } = parseFoodsCsv(await file.text());
      const fresh = products.filter(p => !have.has(fold(p.name)));
      if (!fresh.length) return notify(t("foods.csvNothing"));
      onAddMany(fresh);
      notify(t("foods.csvDone", { n: fresh.length, skipped: skipped + products.length - fresh.length }));
    } catch {
      notify(t("foods.csvBad"));
    }
  }

  return (
    <div className="foods">
      <div className="search-row">
        <input
          type="search"
          placeholder={t("foods.search")}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select value={region} onChange={e => setRegion(e.target.value)} aria-label={t("foods.region")}>
          <option value="all">{t("foods.all")}</option>
          <option value="jp">{t("foods.jp")}</option>
          <option value="global">{t("foods.global")}</option>
        </select>
      </div>

      {!foods && <div className="muted">{t("common.loading")}</div>}
      {foods && !results.length && <div className="muted">{t("foods.none")}</div>}

      {!query.trim() && foods && <div className="hint">{t("foods.typeToSearch")}</div>}
      <div className="foods-list">
        {results.map(f => {
          const done = !pick && (added.has(key(f)) || have.has(fold(nameFor(f))));
          return (
            <div key={key(f)} className="off-row">
              <div>
                {nameFor(f)} <small className="muted">· {otherName(f)}</small>
              </div>
              <div className="muted">
                {t("foods.per100")} · {f.cal} {t("unit.kcal")} · {t("macro.p")} {f.protein} · {t("macro.c")} {f.carbs} · {t("macro.f")} {f.fat}
              </div>
              <button disabled={done} onClick={() => add(f)}>{done ? t("foods.added") : pick ? t("fit.use") : t("foods.add")}</button>
            </div>
          );
        })}
      </div>

      {!pick && (
      <div className="foods-footer">
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>{t("foods.importCsv")}</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".csv,.tsv,.txt,text/csv"
          onChange={e => {
            const f = e.target.files[0];
            e.target.value = "";
            if (f) importCsv(f);
          }}
        />
        <span className="hint">
          {t("foods.csvHint")}{" "}
          <a href={MEXT_URL} target="_blank" rel="noopener noreferrer">{t("foods.mext")}</a>
        </span>
      </div>
      )}
      <p className="hint">{t("foods.approx")}</p>
    </div>
  );
}
