import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, OpportunityCard, Panel } from "@/components/ui-bits";
import { allOpportunities, FANTASIES, GAMEPLAYS } from "@/lib/market-data";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — Loot Scope" },
      {
        name: "description",
        content:
          "Filter every Roblox fantasy x gameplay combination by demand, competition and gap score to find an unclaimed market.",
      },
      { property: "og:title", content: "Opportunities — Loot Scope" },
      {
        property: "og:description",
        content: "Ranked Roblox market gaps, filterable by fantasy, gameplay loop and verdict.",
      },
    ],
  }),
  component: Opportunities,
});

const VERDICTS = ["all", "gap", "moderate", "saturated"] as const;

function Opportunities() {
  const [fantasy, setFantasy] = useState("all");
  const [gameplay, setGameplay] = useState("all");
  const [verdict, setVerdict] = useState<(typeof VERDICTS)[number]>("all");
  const [minDemand, setMinDemand] = useState(0);

  const all = useMemo(() => allOpportunities(), []);
  const rows = all.filter(
    (o) =>
      (fantasy === "all" || o.fantasy.id === fantasy) &&
      (gameplay === "all" || o.gameplay.id === gameplay) &&
      (verdict === "all" || o.verdict === verdict) &&
      o.demand >= minDemand,
  );

  const chip = (active: boolean) =>
    `rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
      active ? "bg-amber text-ink" : "bg-panel2 text-muted-warm ring-1 ring-line hover:text-sand"
    }`;

  return (
    <AppShell
      aside={
        <div className="sticky top-5 space-y-4">
          <Panel className="p-4">
            <Eyebrow>Fantasy</Eyebrow>
            <div className="mt-3 flex flex-col gap-1">
              <button onClick={() => setFantasy("all")} className={chip(fantasy === "all") + " text-left"}>
                All markets
              </button>
              {FANTASIES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFantasy(f.id)}
                  className={chip(fantasy === f.id) + " text-left"}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </Panel>
          <Panel className="p-4">
            <Eyebrow>Minimum demand</Eyebrow>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minDemand}
              onChange={(e) => setMinDemand(Number(e.target.value))}
              className="mt-3 w-full accent-amber"
            />
            <p className="mt-1 font-mono text-[11px] text-muted-warm">{minDemand}/100</p>
          </Panel>
        </div>
      }
    >
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Ranked opportunities</Eyebrow>
            <h1 className="text-xl font-semibold tracking-tight text-sand">
              {rows.length} combination{rows.length === 1 ? "" : "s"} match
            </h1>
          </div>
          <div className="flex flex-wrap gap-1">
            {VERDICTS.map((v) => (
              <button key={v} onClick={() => setVerdict(v)} className={chip(verdict === v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          <button onClick={() => setGameplay("all")} className={chip(gameplay === "all")}>
            All loops
          </button>
          {GAMEPLAYS.map((g) => (
            <button key={g.id} onClick={() => setGameplay(g.id)} className={chip(gameplay === g.id)}>
              {g.name}
            </button>
          ))}
        </div>
      </Panel>

      {rows.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-warm">
            No combinations match those filters. Loosen the demand floor or pick another loop.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} index={i + 1} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
