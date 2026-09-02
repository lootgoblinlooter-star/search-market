import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Panel, ScoreBar } from "@/components/ui-bits";
import { FANTASIES, GAMEPLAYS, RESEARCH_SIGNALS, buildOpportunity } from "@/lib/market-data";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research signals — Loot Scope" },
      {
        name: "description",
        content:
          "Demand evidence from YouTube, Reddit and Roblox reviews, mapped to the fantasy and gameplay loop it points at.",
      },
      { property: "og:title", content: "Research signals — Loot Scope" },
      {
        property: "og:description",
        content: "The raw demand evidence behind every Loot Scope gap score, plus the scoring method.",
      },
    ],
  }),
  component: Research,
});

function Research() {
  return (
    <AppShell>
      <Panel>
        <Eyebrow>Evidence layer</Eyebrow>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-sand">
          Signals before scores
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-warm">
          Every gap score traces back to observable demand: what people watch, what they complain
          about, and what they ask for and can&apos;t find. Each signal below is mapped to the
          combination it points at.
        </p>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {RESEARCH_SIGNALS.map((s) => {
          const opp = buildOpportunity(s.fantasy, s.gameplay);
          return (
            <Panel key={s.quote}>
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-panel2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber ring-1 ring-line">
                  {s.source}
                </span>
                <span className="font-mono text-[11px] text-muted-warm">Weight {s.weight}</span>
              </div>
              <p className="mt-3 text-[14px] leading-snug text-sand">{s.quote}</p>
              {opp ? (
                <Link
                  to="/opportunity/$id"
                  params={{ id: opp.id }}
                  className="mt-3 inline-block font-mono text-[11px] text-amber hover:underline"
                >
                  → {opp.title} · gap {opp.gapScore}
                </Link>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Panel>
          <Eyebrow>How the gap score works</Eyebrow>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-panel2 p-4 font-mono text-[11px] leading-relaxed text-sand/90 ring-1 ring-line">
{`demand   = 0.50·search + 0.32·youtube + 0.18·growth
novelty  = 0.72·(100 − competition) + 0.28·loop_proven
audience = 0.60·reach + 0.40·(100 − competition)

gap = 100 · (1 − e^(−1.15 · D·A·N / competition))`}
          </pre>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-warm">
            The saturating curve stops thin-but-empty markets from outranking large ones. Anything
            above 70 competition is flagged saturated regardless of score — a crowded loop is not a
            gap, no matter how loud the demand.
          </p>
        </Panel>

        <Panel>
          <Eyebrow>Loop proven-ness across the platform</Eyebrow>
          <div className="mt-4 space-y-3">
            {[...GAMEPLAYS]
              .sort((a, b) => b.proven - a.proven)
              .map((g) => (
                <ScoreBar key={g.id} label={g.name} value={g.proven} tone="sand" />
              ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <Eyebrow>Market notes</Eyebrow>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FANTASIES.map((f) => (
            <div key={f.id} className="rounded-lg bg-panel2 p-4 ring-1 ring-line">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-semibold text-sand">{f.name}</p>
                <p className="font-mono text-[11px] text-amber">{f.demand}</p>
              </div>
              <p className="mt-2 text-[12px] leading-snug text-muted-warm">{f.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
