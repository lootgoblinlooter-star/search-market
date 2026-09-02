import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GAMES } from "@/lib/market-data";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/games", label: "Games" },
  { to: "/research", label: "Research" },
  { to: "/compare", label: "Compare" },
  { to: "/watchlist", label: "Watchlist" },
] as const;

export function AppShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const scanned = GAMES.length * 2093;

  return (
    <div className="min-h-screen bg-ink text-sand">
      <header className="border-b border-line bg-ink2/60">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-md bg-amber/15 ring-1 ring-amber/30">
              <span className="font-mono text-sm font-semibold text-amber">◎</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-sand">Loot Scope</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-warm">
                Market Intelligence · Roblox
              </p>
            </div>
          </Link>

          <nav className="order-3 flex flex-wrap items-center gap-1 lg:order-none">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-panel2 text-sand ring-1 ring-line" }}
                inactiveProps={{ className: "text-muted-warm hover:text-sand" }}
                className="rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-panel px-3 py-1 ring-1 ring-line sm:flex">
              <span className="size-1.5 rounded-full bg-amber" />
              <span className="font-mono text-[11px] text-muted-warm">
                Live · {scanned.toLocaleString()} games scanned
              </span>
            </div>
            <Link
              to="/opportunities"
              className="rounded-md bg-amber px-3.5 py-2 text-sm font-semibold text-ink ring-1 ring-amber transition-transform hover:-translate-y-px"
            >
              Analyze a market
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-4 px-5 py-5">
        {aside ? <aside className="hidden w-56 shrink-0 lg:block">{aside}</aside> : null}
        <main className="min-w-0 flex-1 space-y-5">{children}</main>
      </div>
    </div>
  );
}
