import { useId } from "react";

/** Hand-drawn flags used as language icons: Union Jack (English) and Hinomaru (Japanese). */
export default function Flag({ lang, width = 24 }) {
  const id = useId();
  return (
    <svg
      width={width}
      height={(width * 2) / 3}
      viewBox={lang === "ja" ? "0 0 3 2" : "0 0 60 40"}
      role="img"
      aria-hidden="true"
      className="flag"
    >
      {lang === "ja" ? (
        <>
          <rect width="3" height="2" fill="#fff" />
          <circle cx="1.5" cy="1" r="0.6" fill="#bc002d" />
        </>
      ) : (
        <>
          <clipPath id={`${id}-s`}><rect width="60" height="40" /></clipPath>
          <clipPath id={`${id}-t`}><path d="M30 20h30v20zM30 20v20H0zM30 20H0V0zM30 20V0h30z" /></clipPath>
          <g clipPath={`url(#${id}-s)`}>
            <rect width="60" height="40" fill="#012169" />
            <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
            <path d="M0 0l60 40M60 0L0 40" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="5" />
            <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
            <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="8" />
          </g>
        </>
      )}
    </svg>
  );
}
