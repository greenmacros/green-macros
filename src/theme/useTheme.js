import { useCallback, useEffect, useState } from "react";
import { loadString, saveString } from "../lib/storage";

const KEY = "gm_theme";

function initial() {
  const saved = loadString(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4faf5" : "#0b0f0c");
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === "light" ? "dark" : "light";
      saveString(KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
