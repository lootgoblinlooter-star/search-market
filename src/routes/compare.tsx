import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Panel, ScoreBar, VerdictTag } from "@/components/ui-bits";
import { FANTASIES, GAMEPLAYS, buildOpportunity } from "@/lib/market-data";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare markets — Loot Scope" },
      {
        name: "description",
        content:
          "Put two Roblox fantasy x gameplay combinations side by side and see which one has the bigger unserved market.",
      },
      { property: "og:title", content: "Compare markets — Loot Scope" },
      {
        property: "og:description",
        content: "Head-to-head demand, competition, novelty and gap scoring for two Roblox concepts.",
      },
    ],
  }),
  component: Compare,
});

function Picker({
  label,
  fantasy,
  gameplay,
  onFantasy,
  onGameplay,
}: {
  label: string;
  fantasy: string;
  gameplay: string;
  onFantasy: (v: string) => void;
  onGameplay: (v: string) => void;
}) {
  const cls =
    "w-full rounded-md bg-panel2 px-3 py-2 font-mono text-[12px] text-sand ring-1 ring-line focus:outline-none focus:ring-amber";
  return (
    <div className="space-y-2">
      <Eyebrow>{label}</Eyebrow>
      <select value={fantasy} onChange={(e) => onFantasy(e.target.value)} className={cls}>
        {FANTASIES.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <select value={gameplay} onChange={(e) => onGameplay(e.target.value)} className={cls}>
        {GAMEPLAYS.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Column({ id }: { id: { f: string; g: string } }) {
  const opp = buildOpportunity(id.f, id.g);
  if (!opp) return null;
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <VerdictTag verdict={opp.verdict} />
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-sand">{opp.title}</h2>
        </div>
        <div className="rounded-md bg-amber/15 px-3 py-2 text-center ring-1 ring-amber/30">
          <p className="font-mono text-xl font-semibold leading-none text-amber">{opp.gapScore}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-amber/70">Gap</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <ScoreBar label="Demand" value={opp.demand} />
        <ScoreBar label="Competition" value={opp.competition} tone="ember" />
        <ScoreBar label="Audience opportunity" value={opp.audienceOpportunity} />
        <ScoreBar label="Novelty" value={opp.novelty} tone="sand" />
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-muted-warm">{opp.rationale}</p>
      <Link
        to="/opportunity/$id"
        params={{ id: opp.id }}
        className="mt-4 inline-block font-mono text-[11px] text-amber hover:underline"
      >
        Full report →
      </Link>
    </Panel>
  );
}

function Compare() {
  const [a, setA] = useState({ f: "scp", g: "collection" });
  const [b, setB] = useState({ f: "brainrot", g: "collection" });

  const oa = buildOpportunity(a.f, a.g);
  const ob = buildOpportunity(b.f, b.g);
  const winner = oa && ob ? (oa.gapScore >= ob.gapScore ? oa : ob) : null;

  return (
    <AppShell>
      <Panel>
        <Eyebrow>Head to head</Eyebrow>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-sand">Compare two markets</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Picker
            label="Concept A"
            fantasy={a.f}
            gameplay={a.g}
            onFantasy={(f) => setA({ ...a, f })}
            onGameplay={(g) => setA({ ...a, g })}
          />
          <Picker
            label="Concept B"
            fantasy={b.f}
            gameplay={b.g}
            onFantasy={(f) => setB({ ...b, f })}
            onGameplay={(g) => setB({ ...b, g })}
          />
        </div>
        {winner ? (
          <p className="mt-5 rounded-lg bg-panel2 p-3 text-[13px] text-sand ring-1 ring-line">
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber">Verdict </span>
            {winner.title} carries the larger unserved market at {winner.gapScore}/100.
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Column id={a} />
        <Column id={b} />
      </div>
    </AppShell>
  );
}
