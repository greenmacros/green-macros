import { useCallback, useEffect, useRef, useState } from "react";

const EDGE = 70; // px from the viewport edge where dragging auto-scrolls
const SPEED = 14;

const targetAt = (x, y) => document.elementFromPoint(x, y)?.closest("[data-drop]")?.getAttribute("data-drop") ?? null;

/**
 * Drag-to-reorder with Pointer Events, so it works with mouse, touch and pen alike
 * (the HTML5 drag-and-drop API ignores touch screens).
 *
 *   const { gripProps, drag, over } = useReorderDrag((payload, dropKey) => { … });
 *   <span {...gripProps({ id, type, label })}>⠿</span>      // starts a drag
 *   <li data-drop="item:abc">…</li>                          // anything with data-drop is a target
 *
 * `onDrop` gets the dragged payload and the `data-drop` value under the pointer.
 */
export function useReorderDrag(onDrop) {
  const [drag, setDrag] = useState(null); // { payload, x, y }
  const [over, setOver] = useState(null);
  const active = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const dropRef = useRef(onDrop);
  useEffect(() => {
    dropRef.current = onDrop;
  });

  const end = useCallback(() => {
    active.current = null;
    setDrag(null);
    setOver(null);
  }, []);

  const gripProps = useCallback(
    payload => ({
      onPointerDown(e) {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault(); // no text selection / native drag
        e.currentTarget.setPointerCapture(e.pointerId);
        active.current = payload;
        pos.current = { x: e.clientX, y: e.clientY };
        setDrag({ payload, x: e.clientX, y: e.clientY });
      },
      onPointerMove(e) {
        if (!active.current) return;
        pos.current = { x: e.clientX, y: e.clientY };
        setDrag(d => d && { ...d, x: e.clientX, y: e.clientY });
        setOver(targetAt(e.clientX, e.clientY));
      },
      onPointerUp(e) {
        if (!active.current) return;
        const payload = active.current;
        const key = targetAt(e.clientX, e.clientY);
        end();
        if (key) dropRef.current(payload, key);
      },
      onPointerCancel: end
    }),
    [end]
  );

  // keep the page scrolling while the finger/pointer rests near the top or bottom edge
  const dragging = Boolean(drag);
  useEffect(() => {
    if (!dragging) return;
    document.body.classList.add("is-dragging");
    const timer = setInterval(() => {
      const { x, y } = pos.current;
      if (y < EDGE) window.scrollBy(0, -SPEED);
      else if (y > window.innerHeight - EDGE) window.scrollBy(0, SPEED);
      else return;
      setOver(targetAt(x, y));
    }, 16);
    return () => {
      clearInterval(timer);
      document.body.classList.remove("is-dragging");
    };
  }, [dragging]);

  return { gripProps, drag, over };
}
