import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Panel, ScoreBar, VerdictTag } from "@/components/ui-bits";
import { allOpportunities, buildOpportunity } from "@/lib/market-data";
import { useWatchlist } from "@/lib/watchlist";

export const Route = createFileRoute("/opportunity/$id")({
  loader: ({ params }) => {
    const [fantasyId, gameplayId] = params.id.split("-");
    const opp = fantasyId && gameplayId ? buildOpportunity(fantasyId, gameplayId) : null;
    if (!opp) throw notFound();
    return { opp };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Opportunity not found — Loot Scope" }, { name: "robots", content: "noindex" }],
      };
    }
    const { opp } = loaderData;
    const title = `${opp.title} — gap ${opp.gapScore}/100 | Loot Scope`;
    const description = `Demand ${opp.demand}, competition ${opp.competition}. Full Roblox market report and concept briefs for ${opp.title}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: OpportunityDetail,
  notFoundComponent: OpportunityMissing,
});

function OpportunityMissing() {
  return (
    <AppShell>
      <Panel>
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-1 text-xl font-semibold text-sand">That combination doesn&apos;t exist</h1>
        <Link to="/opportunities" className="mt-4 inline-block font-mono text-[12px] text-amber hover:underline">
          ← Back to opportunities
        </Link>
      </Panel>
    </AppShell>
  );
}

function OpportunityDetail() {
  const { opp } = Route.useLoaderData();
  const { has, toggle, hydrated } = useWatchlist();
  const related = allOpportunities()
    .filter((o) => o.id !== opp.id && (o.fantasy.id === opp.fantasy.id || o.gameplay.id === opp.gameplay.id))
    .slice(0, 4);

  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Eyebrow>Market report</Eyebrow>
              <VerdictTag verdict={opp.verdict} />
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-sand">{opp.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-warm">{opp.rationale}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="rounded-xl bg-amber/15 px-5 py-3 text-center ring-1 ring-amber/30">
              <p className="font-mono text-3xl font-semibold leading-none text-amber">{opp.gapScore}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-amber/70">Gap score</p>
            </div>
            <button
              onClick={() => toggle(opp.id)}
              className="rounded-md bg-panel2 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-sand ring-1 ring-line transition-colors hover:bg-panel"
            >
              {hydrated && has(opp.id) ? "★ On watchlist" : "☆ Watch"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Panel className="bg-panel2 p-4">
            <ScoreBar label="Demand" value={opp.demand} />
          </Panel>
          <Panel className="bg-panel2 p-4">
            <ScoreBar label="Competition" value={opp.competition} tone="ember" />
          </Panel>
          <Panel className="bg-panel2 p-4">
            <ScoreBar label="Audience opportunity" value={opp.audienceOpportunity} />
          </Panel>
          <Panel className="bg-panel2 p-4">
            <ScoreBar label="Novelty" value={opp.novelty} tone="sand" />
          </Panel>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <Eyebrow>Who already owns this fantasy</Eyebrow>
          <div className="mt-4 space-y-3">
            {opp.competitors.length === 0 ? (
              <p className="text-sm text-muted-warm">
                No meaningful incumbent in our index — an unusually open field.
              </p>
            ) : (
              opp.competitors.map((c) => (
                <div key={c.name} className="rounded-lg bg-panel2 p-4 ring-1 ring-line">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-sand">{c.name}</p>
                    <p className="font-mono text-[11px] text-muted-warm">
                      {c.ccu.toLocaleString()} CCU · {(c.visits / 1_000_000).toFixed(0)}M visits ·{" "}
                      {Math.round(c.likeRatio * 100)}% liked
                    </p>
                  </div>
                  <p className="mt-2 text-[12px] leading-snug text-sand/85">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber">Strength </span>
                    {c.strength}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-sand/85">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ember">Weakness </span>
                    {c.weakness}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <Eyebrow>Concept briefs</Eyebrow>
            <ul className="mt-4 space-y-2">
              {opp.concepts.map((c) => (
                <li key={c.title} className="rounded-lg bg-panel2 p-3 ring-1 ring-line">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-amber">{c.tag}</span>
                  <p className="mt-1 text-[13px] leading-snug text-sand">{c.title}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <Eyebrow>Execution notes</Eyebrow>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-warm">
              <li>
                • Ship the {opp.gameplay.name.toLowerCase()} loop first; the {opp.fantasy.name} theming is
                acquisition, the loop is retention.
              </li>
              <li>• Fix the incumbents&apos; weaknesses above — that is your entire differentiation pitch.</li>
              <li>
                • Competition sits at {opp.competition}/100, so paid discovery should stay cheap for the first
                60 days.
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <section>
        <Eyebrow>Adjacent moves</Eyebrow>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r) => (
            <Link
              key={r.id}
              to="/opportunity/$id"
              params={{ id: r.id }}
              className="rounded-lg bg-panel p-3 ring-1 ring-line transition-transform hover:-translate-y-0.5"
            >
              <p className="text-[13px] font-semibold text-sand">{r.title}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-warm">
                Gap {r.gapScore} · Comp {r.competition}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
