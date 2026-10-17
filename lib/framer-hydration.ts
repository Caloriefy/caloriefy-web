/**
 * Framer hydrates `#main` with its own React root. Inserting nodes into a Framer element before that root has
 * claimed it makes the server HTML mismatch (React #418) and Framer re-renders the whole section on the client.
 * Elements rendered inside `#main` are only ever owned by Framer's React, so a fiber key on them means "hydrated".
 */
export function isFramerHydrated(el: Element): boolean {
  return Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
}

/**
 * Calls `onReady` with the first element matching `selector` once Framer has hydrated it
 * (or after `timeoutMs`, so a failed hydration never leaves the page without the enhancement).
 * Returns a cancel function.
 */
export function whenFramerHydrated(selector: string, onReady: (el: HTMLElement) => void, timeoutMs = 10000): () => void {
  const started = Date.now();
  let timer = 0;
  const check = () => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el && (isFramerHydrated(el) || Date.now() - started > timeoutMs)) {
      onReady(el);
      return;
    }
    timer = window.setTimeout(check, 50);
  };
  check();
  return () => window.clearTimeout(timer);
}
