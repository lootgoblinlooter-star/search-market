import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Panel } from "@/components/ui-bits";
import { FANTASIES, GAMEPLAYS, GAMES } from "@/lib/market-data";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Game index — Loot Scope" },
      {
        name: "description",
        content:
          "Incumbent Roblox titles by fantasy and loop: concurrent players, visits, like ratio, and where each one is weak.",
      },
      { property: "og:title", content: "Game index — Loot Scope" },
      {
        property: "og:description",
        content: "Competitor intelligence on the Roblox titles that already own each market.",
      },
    ],
  }),
  component: GamesPage,
});

type SortKey = "ccu" | "visits" | "likeRatio" | "ageYears";

function GamesPage() {
  const [fantasy, setFantasy] = useState("all");
  const [sort, setSort] = useState<SortKey>("ccu");

  const name = (id: string, list: { id: string; name: string }[]) =>
    list.find((x) => x.id === id)?.name ?? id;

  const rows = GAMES.filter((g) => fantasy === "all" || g.fantasy === fantasy).sort(
    (a, b) => (b[sort] as number) - (a[sort] as number),
  );

  const chip = (active: boolean) =>
    `rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
      active ? "bg-amber text-ink" : "bg-panel2 text-muted-warm ring-1 ring-line hover:text-sand"
    }`;

  return (
    <AppShell>
      <Panel>
        <Eyebrow>Incumbent index</Eyebrow>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-sand">
          {rows.length} titles under analysis
        </h1>
        <div className="mt-4 flex flex-wrap gap-1">
          <button onClick={() => setFantasy("all")} className={chip(fantasy === "all")}>
            All
          </button>
          {FANTASIES.map((f) => (
            <button key={f.id} onClick={() => setFantasy(f.id)} className={chip(fantasy === f.id)}>
              {f.short}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-warm">
              <th className="pb-2">Title</th>
              <th className="pb-2">Market</th>
              <th className="pb-2">Loop</th>
              {(
                [
                  ["ccu", "CCU"],
                  ["visits", "Visits"],
                  ["likeRatio", "Liked"],
                  ["ageYears", "Age"],
                ] as [SortKey, string][]
              ).map(([k, label]) => (
                <th key={k} className="pb-2">
                  <button
                    onClick={() => setSort(k)}
                    className={sort === k ? "text-amber" : "hover:text-sand"}
                  >
                    {label} ↓
                  </button>
                </th>
              ))}
              <th className="pb-2">Weakness to exploit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.name} className="border-t border-line/70 align-top">
                <td className="py-3 pr-3 text-[13px] font-semibold text-sand">{g.name}</td>
                <td className="py-3 pr-3 font-mono text-[11px] text-muted-warm">
                  {name(g.fantasy, FANTASIES)}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-muted-warm">
                  {name(g.gameplay, GAMEPLAYS)}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-sand">{g.ccu.toLocaleString()}</td>
                <td className="py-3 pr-3 font-mono text-[11px] text-sand">
                  {(g.visits / 1_000_000).toFixed(0)}M
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-sand">
                  {Math.round(g.likeRatio * 100)}%
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-muted-warm">
                  {g.ageYears}y {g.updatedRecently ? "· live" : "· stale"}
                </td>
                <td className="max-w-[280px] py-3 text-[12px] leading-snug text-sand/80">{g.weakness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </AppShell>
  );
}
