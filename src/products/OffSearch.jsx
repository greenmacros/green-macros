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

/** EAN-8 / UPC-A / EAN-13 / GTIN-14 (JAN is EAN-13): digits only, with a valid check digit. */
export function validBarcode(code) {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const digits = [...code].map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export default function OffSearch({ onAdd }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(lang === "ja" ? "jp" : "world");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [added, setAdded] = useState(() => new Set());
  const [barcode, setBarcode] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState(""); // "" | "invalid" | "notFound"
  const [notFoundCode, setNotFoundCode] = useState("");
  const abortRef = useRef(null);
  const preferJa = lang === "ja" || region === "jp";

  useEffect(() => () => abortRef.current?.abort(), []);

  async function search(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    const asCode = q.replace(/[\s-]/g, "").normalize("NFKC");
    // a pasted barcode number in the main box does a barcode lookup instead of a text search
    if (/^\d{8,14}$/.test(asCode) && validBarcode(asCode)) return runBarcode(asCode);
    setBarcodeMsg("");
    setNotFoundCode("");
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

  function lookupBarcode(e) {
    e.preventDefault();
    const code = barcode.replace(/[\s-]/g, "").normalize("NFKC");
    setBarcodeMsg("");
    setNotFoundCode("");
    if (!validBarcode(code)) return setBarcodeMsg("invalid");
    runBarcode(code);
  }

  async function runBarcode(code) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,product_name_ja,brands,nutriments`;
      const res = await fetch(url, { signal: controller.signal });
      const data = res.ok || res.status === 404 ? await res.json() : null;
      if (!data) throw new Error(res.statusText);
      const found = data.status === 1 && data.product && displayName(data.product, preferJa);
      setResults(found ? [{ ...data.product, code }] : []);
      setBarcodeMsg(found ? "" : "notFound");
      setNotFoundCode(found ? "" : code);
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

      <form className="search-row" onSubmit={lookupBarcode}>
        <input
          inputMode="numeric"
          placeholder={t("barcode.placeholder")}
          aria-label={t("barcode.label")}
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <button type="submit" disabled={!barcode.trim() || status === "loading"}>{t("barcode.lookup")}</button>
      </form>
      {barcodeMsg === "invalid" && <div className="hint warn">{t("barcode.invalid")}</div>}
      {barcodeMsg === "notFound" && (
        <div className="hint warn">
          {t("barcode.notFound")}{" "}
          <a
            href={`https://world.openfoodfacts.org/cgi/product.pl?type=product&code=${notFoundCode}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("barcode.contribute")}
          </a>
        </div>
      )}

      {status === "error" && <div className="hint warn">{t("off.error")}</div>}
      {status === "done" && !results.length && !barcodeMsg && <div className="muted">{t("foods.none")}</div>}

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

      <p className="muted off-credit">
        {t("off.credit")}{" "}
        <a href="https://world.openfoodfacts.org/" target="_blank" rel="noreferrer noopener">Open Food Facts</a>{" · "}
        <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer noopener">ODbL</a>
      </p>
    </div>
  );
}
