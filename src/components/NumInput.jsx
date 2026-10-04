import { useState } from "react";

/**
 * Number field that lets you clear and retype freely: the raw text is kept
 * while focused and only valid, non-negative numbers are committed.
 */
export default function NumInput({ value, onCommit, blankZero = false, ...rest }) {
  const [text, setText] = useState(null);
  const shown = text ?? (blankZero && !value ? "" : String(value ?? 0));

  return (
    <input
      {...rest}
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      value={shown}
      onFocus={e => e.target.select()}
      onChange={e => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "") return onCommit(0);
        const n = parseFloat(raw);
        if (Number.isFinite(n) && n >= 0) onCommit(n);
      }}
      onBlur={() => setText(null)}
    />
  );
}
