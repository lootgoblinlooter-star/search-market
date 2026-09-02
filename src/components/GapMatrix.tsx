import { Link } from "@tanstack/react-router";
import { FANTASIES, GAMEPLAYS, competitionFor } from "@/lib/market-data";

function cellClass(competition: number) {
  if (competition <= 32) return "bg-amber/80 font-semibold text-ink";
  if (competition <= 48) return "bg-amber/45 text-sand";
  if (competition <= 65) return "bg-ember/30 text-sand/80";
  return "bg-line/70 text-sand/50";
}

export function GapMatrix({ fantasyIds }: { fantasyIds?: string[] }) {
  const rows = fantasyIds ? FANTASIES.filter((f) => fantasyIds.includes(f.id)) : FANTASIES;

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[620px] grid-cols-[88px_repeat(8,1fr)] gap-1.5">
        <div />
        {GAMEPLAYS.map((g) => (
          <div
            key={g.id}
            className="pb-1 text-center font-mono text-[9px] uppercase tracking-wider text-muted-warm"
          >
            {g.short}
          </div>
        ))}

        {rows.map((f) => (
          <div key={f.id} className="contents">
            <div className="flex items-center font-mono text-[11px] text-sand/80">{f.short}</div>
            {GAMEPLAYS.map((g) => {
              const c = competitionFor(f.id, g.id);
              return (
                <Link
                  key={g.id}
                  to="/opportunity/$id"
                  params={{ id: `${f.id}-${g.id}` }}
                  title={`${f.name} x ${g.name} — competition ${c}/100`}
                  className={`grid h-10 place-items-center rounded-md font-mono text-[10px] transition-transform hover:-translate-y-0.5 ${cellClass(c)}`}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] text-muted-warm">
        Cells show competition. Lower = bigger gap. Amber cells are the unclaimed islands.
      </p>
    </div>
  );
}

export function MatrixLegend() {
  return (
    <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-muted-warm">
      <span className="flex items-center gap-1">
        <span className="size-2 rounded-[2px] bg-amber" />
        Gap
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2 rounded-[2px] bg-ember/70" />
        Moderate
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2 rounded-[2px] bg-line" />
        Saturated
      </span>
    </div>
  );
}
