import { useState } from "react";
import ProductForm from "../components/ProductForm";
import { useI18n } from "../i18n/context";
import { parseLabel } from "../lib/labelParser";

export default function LabelImport({ existingNames, onAdd }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);

  return (
    <div className="label-import-wrap">
      <div className="label-import">
        <textarea
          rows={5}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t("label.placeholder")}
        />
        <div>
          <button disabled={!text.trim()} onClick={() => setParsed(parseLabel(text))}>
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
            existingNames={existingNames}
            onSubmit={p => {
              onAdd(p);
              setParsed(null);
              setText("");
            }}
            onCancel={() => setParsed(null)}
          />
        </div>
      )}
    </div>
  );
}
