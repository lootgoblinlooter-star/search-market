import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, OpportunityCard, Panel } from "@/components/ui-bits";
import { buildOpportunity } from "@/lib/market-data";
import { useWatchlist } from "@/lib/watchlist";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — Loot Scope" },
      {
        name: "description",
        content: "Your saved Roblox market gaps, kept on this device for quick comparison.",
      },
      { property: "og:title", content: "Watchlist — Loot Scope" },
      {
        property: "og:description",
        content: "Track the Roblox opportunities you are seriously considering building.",
      },
    ],
  }),
  component: Watchlist,
});

function Watchlist() {
  const { ids, hydrated, clear } = useWatchlist();
  const opps = ids
    .map((id) => {
      const [f, g] = id.split("-");
      return f && g ? buildOpportunity(f, g) : null;
    })
    .filter((o): o is NonNullable<typeof o> => Boolean(o))
    .sort((a, b) => b.gapScore - a.gapScore);

  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Saved on this device</Eyebrow>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-sand">
              Watchlist {hydrated ? `· ${opps.length}` : ""}
            </h1>
          </div>
          {opps.length > 0 ? (
            <button
              onClick={clear}
              className="rounded-md bg-panel2 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-warm ring-1 ring-line hover:text-sand"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </Panel>

      {hydrated && opps.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-warm">
            Nothing saved yet. Open any market report and hit Watch to keep it here.
          </p>
          <Link
            to="/opportunities"
            className="mt-4 inline-block rounded-md bg-amber px-4 py-2 text-sm font-semibold text-ink"
          >
            Find opportunities
          </Link>
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {opps.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} index={i + 1} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
