import { useCallback, useEffect, useState } from "react";

const KEY = "lootscope.watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Client-side watchlist of opportunity ids, persisted in localStorage. */
export function useWatchlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);
    const sync = () => setIds(read());
    window.addEventListener("storage", sync);
    window.addEventListener("lootscope:watchlist", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("lootscope:watchlist", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event("lootscope:watchlist"));
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setIds([]);
    window.dispatchEvent(new Event("lootscope:watchlist"));
  }, []);

  return { ids, hydrated, toggle, clear, has: (id: string) => ids.includes(id) };
}
