import { useState } from "react";
import ProductForm from "../components/ProductForm";
import { useI18n } from "../i18n/context";
import { cleanBarcode, offAddUrl, validBarcode } from "../lib/barcode";
import { copyToClipboard } from "../lib/exporters";
import { parseLabel } from "../lib/labelParser";

/**
 * Paste a nutrition label and turn it into a product. With `contribute`, an optional barcode field is
 * shown and, after adding, the user is offered a one-tap way to share the product with Open Food Facts.
 */
export default function LabelImport({ existingNames, onAdd, submitLabel, contribute = false }) {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [parsed, setParsed] = useState(null);
  const [shared, setShared] = useState(null); // { name, code, text } for the last added product
  const [copied, setCopied] = useState(false);

  const code = cleanBarcode(barcode);
  const codeBad = barcode.trim() !== "" && !validBarcode(code);

  return (
    <div className="label-import-wrap">
      <div className="label-import">
        <textarea
          rows={5}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t("label.placeholder")}
        />
        {contribute && (
          <div>
            <input
              inputMode="numeric"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder={t("label.barcodeOptional")}
              aria-label={t("barcode.label")}
            />
            {codeBad && <div className="hint warn">{t("barcode.invalid")}</div>}
          </div>
        )}
        <div>
          <button
            disabled={!text.trim()}
            onClick={() => {
              setParsed(parseLabel(text));
              setShared(null);
            }}
          >
            {t("label.read")}
          </button>
        </div>
      </div>

      {parsed && (
        <div className="preview-card">
          {parsed.missing.length > 0 && (
            <div className="hint warn">
              {t("label.missing", { fields: parsed.missing.map(f => t(`macro.${f}`)).join(", ") })}
            </div>
          )}
          {parsed.assumedServing && <div className="hint warn">{t("label.assumed")}</div>}
          <ProductForm
            key={text}
            initial={parsed.product}
            submitLabel={submitLabel}
            existingNames={existingNames}
            onSubmit={p => {
              onAdd(p);
              if (contribute) {
                setShared({ name: p.name, code: validBarcode(code) ? code : "", text });
                setCopied(false);
              }
              setParsed(null);
              setText("");
              setBarcode("");
            }}
            onCancel={() => setParsed(null)}
          />
        </div>
      )}

      {shared && (
        <div className="preview-card contribute-card">
          <div>
            <strong>{t("contribute.added", { name: shared.name })}</strong>
          </div>
          <div className="muted">{t("contribute.why")}</div>
          <div className="contribute-actions">
            <a className="btn-ghost" href={offAddUrl(shared.code, lang)} target="_blank" rel="noreferrer noopener">
              {t("contribute.open")}
            </a>
            <button
              className="btn-ghost"
              onClick={async () => setCopied(await copyToClipboard(shared.text))}
            >
              {copied ? t("contribute.copied") : t("contribute.copy")}
            </button>
            <button className="btn-ghost" onClick={() => setShared(null)}>{t("common.close")}</button>
          </div>
          <div className="hint">{t("contribute.note")}</div>
        </div>
      )}
    </div>
  );
}
