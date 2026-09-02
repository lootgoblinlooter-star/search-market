import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GapMatrix, MatrixLegend } from "@/components/GapMatrix";
import { GapRadar } from "@/components/GapRadar";
import { Eyebrow, OpportunityCard, Panel, ScoreBar } from "@/components/ui-bits";
import { allOpportunities, FANTASIES, GAMES, RESEARCH_SIGNALS } from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loot Scope — Roblox Market Gap Finder" },
      {
        name: "description",
        content:
          "Find Roblox game ideas with high demand and low competition. Gap-scored opportunities, competitor breakdowns and concept briefs.",
      },
      { property: "og:title", content: "Loot Scope — Roblox Market Gap Finder" },
      {
        property: "og:description",
        content:
          "Demand vs competition intelligence for Roblox developers. Spot underserved fantasy x gameplay combinations before anyone else.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const opps = allOpportunities();
  const top = opps.slice(0, 6);
  const radar = opps.filter((o) => o.demand > 60).slice(0, 26);
  const avgGap = Math.round(opps.reduce((s, o) => s + o.gapScore, 0) / opps.length);

  return (
    <AppShell>
      <Panel className="relative overflow-hidden">
        <Eyebrow>Roblox · Market gap engine</Eyebrow>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-sand sm:text-4xl">
          Popular is easy. <span className="text-amber">Underserved</span> is where the money is.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-warm">
          Loot Scope scores every fantasy x gameplay combination on the platform against demand,
          audience reach, novelty and competition — then ranks the combinations nobody has built
          properly yet.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/opportunities"
            className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            Browse opportunities
          </Link>
          <Link
            to="/research"
            className="rounded-md bg-panel2 px-4 py-2 text-sm font-semibold text-sand ring-1 ring-line transition-transform hover:-translate-y-px"
          >
            See the signals
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Combinations scored", v: opps.length },
            { k: "Open gaps", v: opps.filter((o) => o.verdict === "gap").length },
            { k: "Titles analysed", v: GAMES.length },
            { k: "Mean gap score", v: avgGap },
          ].map((s) => (
            <div key={s.k} className="rounded-lg bg-panel2 p-3 ring-1 ring-line">
              <p className="font-mono text-xl font-semibold text-amber">{s.v}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-warm">
                {s.k}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <Eyebrow>Demand vs competition radar</Eyebrow>
            <span className="font-mono text-[10px] text-muted-warm">Top 26 by demand</span>
          </div>
          <GapRadar points={radar} />
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Competition matrix</Eyebrow>
            <MatrixLegend />
          </div>
          <div className="mt-4">
            <GapMatrix />
          </div>
        </Panel>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <Eyebrow>Ranked by gap score</Eyebrow>
            <h2 className="text-lg font-semibold tracking-tight text-sand">Biggest opportunities</h2>
          </div>
          <Link to="/opportunities" className="font-mono text-[11px] text-amber hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {top.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} index={i + 1} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <Eyebrow>Fantasy demand index</Eyebrow>
          <div className="mt-4 space-y-3">
            {[...FANTASIES]
              .sort((a, b) => b.demand - a.demand)
              .slice(0, 6)
              .map((f) => (
                <ScoreBar key={f.id} label={f.name} value={f.demand} />
              ))}
          </div>
        </Panel>
        <Panel>
          <Eyebrow>Fresh signals</Eyebrow>
          <ul className="mt-4 space-y-3">
            {RESEARCH_SIGNALS.slice(0, 4).map((s) => (
              <li key={s.quote} className="border-l-2 border-amber/40 pl-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-warm">
                  {s.source} · weight {s.weight}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-sand/90">{s.quote}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
