import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./tour.css";
import { useI18n } from "../i18n/context";

const PAD = 6;
const GAP = 14;
const MARGIN = 12;

/** First visible element matching the selector, or null. */
function findTarget(selector) {
  if (!selector) return null;
  for (const el of document.querySelectorAll(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/**
 * Guided walkthrough: dims the page, spotlights one element per step and shows a
 * small card with an arrow pointing at it. Steps may switch tabs via `tab`.
 */
export default function Tour({ steps, tab, onTab, onClose }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [pop, setPop] = useState({ top: 0, left: 0, side: "bottom", arrow: 0, ready: false });
  const cardRef = useRef(null);
  const startTab = useRef(tab);
  const step = steps[index];
  const last = index === steps.length - 1;

  const close = useCallback(() => {
    onTab(startTab.current);
    onClose();
  }, [onTab, onClose]);

  useEffect(() => {
    if (step.tab) onTab(step.tab);
  }, [step, onTab]);

  const measure = useCallback(() => {
    const el = findTarget(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  // Scroll the target into view once the step's tab has rendered, then keep measuring.
  useEffect(() => {
    const id = setTimeout(() => {
      findTarget(step.target)?.scrollIntoView({ block: "center", behavior: "auto" });
      measure();
    }, 60);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, measure]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const { offsetWidth: w, offsetHeight: h } = card;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!rect) {
      setPop({ top: (vh - h) / 2, left: (vw - w) / 2, side: "none", arrow: 0, ready: true });
      return;
    }
    const below = rect.bottom + PAD + GAP + h <= vh - MARGIN;
    const above = rect.top - PAD - GAP - h >= MARGIN;
    const side = below || !above ? "bottom" : "top";
    const rawTop = side === "bottom" ? rect.bottom + PAD + GAP : rect.top - PAD - GAP - h;
    const top = Math.min(Math.max(MARGIN, rawTop), vh - h - MARGIN);
    const center = rect.left + rect.width / 2;
    const left = Math.min(Math.max(MARGIN, center - w / 2), vw - w - MARGIN);
    setPop({ top, left, side, arrow: Math.min(Math.max(20, center - left), w - 20), ready: true });
  }, [rect, index]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setIndex(i => Math.min(i + 1, steps.length - 1));
      else if (e.key === "ArrowLeft") setIndex(i => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, steps.length]);

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label={t("tour.title")}>
      {rect ? (
        <div
          className="tour-spot"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2
          }}
        />
      ) : (
        <div className="tour-dim" />
      )}
      <div
        ref={cardRef}
        className={`tour-card side-${pop.side}`}
        style={{ top: pop.top, left: pop.left, visibility: pop.ready ? "visible" : "hidden", "--arrow-x": `${pop.arrow}px` }}
      >
        <div className="tour-step">{t("tour.step", { n: index + 1, total: steps.length })}</div>
        <h3>{t(step.title)}</h3>
        <p>{t(step.body)}</p>
        <div className="tour-actions">
          <button className="btn-ghost" onClick={close}>{t("tour.skip")}</button>
          <span className="tour-spacer" />
          <button className="btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            ← {t("tour.back")}
          </button>
          <button className="primary-btn" onClick={() => (last ? close() : setIndex(index + 1))}>
            {last ? t("tour.done") : `${t("tour.next")} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
