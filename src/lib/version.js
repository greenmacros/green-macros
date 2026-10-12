// Set at build time (see vite.config.js). In dev / tests they fall back to placeholders.
export const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";
export const APP_BUILD = typeof __APP_BUILD__ === "string" ? __APP_BUILD__ : "";

/** Compare the running build with what's deployed: "new" | "same" | "unknown". */
export function compareBuild(remote, local = APP_BUILD) {
  if (!local || !remote || typeof remote.build !== "string") return "unknown";
  return remote.build === local ? "same" : "new";
}

/** Fetch version.json bypassing caches. Resolves to the parsed object, or null (offline, dev, bad file). */
export async function fetchRemoteVersion(base = "./") {
  try {
    const res = await fetch(`${base}version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data.build === "string" ? data : null;
  } catch {
    return null;
  }
}

export async function checkForUpdate(base) {
  const remote = await fetchRemoteVersion(base);
  return { status: compareBuild(remote), remote };
}
