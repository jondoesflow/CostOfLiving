import { useState, useEffect } from "react";

// Per-viewer conveniences only: storage can be missing or blocked.
function loadSaved(key, fallback) {
  try {
    const v = localStorage.getItem(`whenToRun.${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try { localStorage.setItem(`whenToRun.${key}`, JSON.stringify(value)); } catch { /* ignore */ }
}

export function useSaved(key, fallback) {
  const [value, setValue] = useState(() => loadSaved(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}
