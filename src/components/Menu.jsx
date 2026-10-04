import { useEffect, useRef, useState } from "react";

/**
 * Small popover menu. `children` may be a function receiving `{ close }`.
 * With `closeOnClick` (default) any click inside closes it.
 */
export default function Menu({
  label = "⋯",
  title,
  className = "icon-btn",
  align = "right",
  closeOnClick = true,
  anchorClassName = "",
  children
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={`menu-anchor ${anchorClassName}`} ref={ref}>
      <button
        type="button"
        className={className}
        title={title}
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {label}
      </button>
      {open && (
        <div
          className={`menu floating align-${align}`}
          role="menu"
          onClick={closeOnClick ? close : undefined}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
