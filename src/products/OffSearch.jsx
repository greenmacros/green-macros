import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/context";
import { createProduct } from "../lib/products";

const round1 = n => Math.round(n * 10) / 10;

function offKcal(n = {}) {
  if (n["energy-kcal_100g"] != null) return Number(n["energy-kcal_100g"]);
  if (n.energy_100g != null) return Math.round(n.energy_100g / 4.184);
  return null;
}

const displayName = (p, preferJa) => (preferJa && p.product_name_ja) || p.product_name;

function toProduct(p, preferJa) {
  const n = p.nutriments ?? {};
  const brand = p.brands?.split(",")[0]?.trim();
  return createProduct({
    name: `${displayName(p, preferJa)}${brand ? ` (${brand})` : ""}`,
    servingGrams: 100,
    unit: "g",
    cal: round1(offKcal(n) ?? 0),
    protein: round1(Number(n.proteins_100g) || 0),
    carbs: round1(Number(n.carbohydrates_100g) || 0),
    fat: round1(Number(n.fat_100g) || 0)
  });
}

export default function OffSearch({ onAdd }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(lang === "ja" ? "jp" : "world");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [added, setAdded] = useState(() => new Set());
  const abortRef = useRef(null);
  const preferJa = lang === "ja" || region === "jp";

  useEffect(() => () => abortRef.current?.abort(), []);

  async function search(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      const url =
        `https://${region}.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=12` +
        "&fields=code,product_name,product_name_ja,brands,nutriments&search_terms=" +
        encodeURIComponent(q);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setResults((data.products || []).filter(p => displayName(p, preferJa)));
      setStatus("done");
    } catch (err) {
      if (err.name !== "AbortError") setStatus("error");
    }
  }

  return (
    <div className="off">
      <form className="search-row" onSubmit={search}>
        <input
          placeholder={t("off.placeholder")}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select value={region} onChange={e => setRegion(e.target.value)} aria-label={t("foods.region")}>
          <option value="world">{t("foods.global")}</option>
          <option value="jp">{t("foods.jp")}</option>
        </select>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? t("off.searching") : t("off.search")}
        </button>
      </form>

      {status === "error" && <div className="hint warn">{t("off.error")}</div>}
      {status === "done" && !results.length && <div className="muted">{t("foods.none")}</div>}

      {results.map(p => {
        const kcal = offKcal(p.nutriments);
        const done = added.has(p.code);
        return (
          <div key={p.code} className="off-row">
            <div>
              {displayName(p, preferJa)}
              {p.brands && <small className="muted"> · {p.brands.split(",")[0]}</small>}
            </div>
            <div className="muted">
              {t("foods.per100")} · {kcal ?? "?"} {t("unit.kcal")} · {t("macro.p")} {p.nutriments?.proteins_100g ?? "?"} · {t("macro.c")}{" "}
              {p.nutriments?.carbohydrates_100g ?? "?"} · {t("macro.f")} {p.nutriments?.fat_100g ?? "?"}
            </div>
            <button
              disabled={done}
              onClick={() => {
                onAdd(toProduct(p, preferJa));
                setAdded(s => new Set(s).add(p.code));
              }}
            >
              {done ? t("foods.added") : t("off.import")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
