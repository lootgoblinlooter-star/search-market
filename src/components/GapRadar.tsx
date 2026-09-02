import { Link } from "@tanstack/react-router";
import type { Opportunity } from "@/lib/market-data";

/** Quadrant scatter: x = competition, y = demand. Top-left is the opportunity zone. */
export function GapRadar({ points }: { points: Opportunity[] }) {
  return (
    <div>
      <div className="relative mt-5 h-[280px]">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-px bg-line/60" />
          <div className="absolute inset-y-0 right-0 w-px bg-line/60" />
          <div className="absolute inset-x-0 top-0 h-px bg-line/60" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-line/60" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        </div>

        <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.15em] text-amber/80">
          Opportunity
        </span>
        <span className="absolute right-2 top-2 font-mono text-[9px] uppercase tracking-[0.15em] text-ember/80">
          Saturated
        </span>
        <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-warm/70">
          Low demand
        </span>
        <span className="absolute bottom-2 right-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-warm/70">
          Overserved
        </span>

        {points.map((p) => {
          // Stretch the plotted ranges (competition 15-95, demand 55-95) across the full chart.
          const left = Math.min(94, Math.max(3, ((p.competition - 15) / 80) * 100));
          const top = Math.min(90, Math.max(4, 100 - ((p.demand - 55) / 40) * 100));
          const hot = p.verdict === "gap";
          const dead = p.demand < 55;
          return (
            <Link
              key={p.id}
              to="/opportunity/$id"
              params={{ id: p.id }}
              className="group absolute"
              style={{ left: `${left}%`, top: `${top}%` }}
              title={`${p.title} — gap ${p.gapScore}`}
            >
              <span
                className={`block rounded-full ring-4 ${
                  dead
                    ? "size-2.5 bg-sand/40 ring-sand/10"
                    : hot
                      ? "size-3 bg-amber ring-amber/20"
                      : "size-3 bg-ember ring-ember/20"
                }`}
              />
              <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-sand/70 group-hover:text-amber">
                {p.fantasy.short}·{p.gameplay.short}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-muted-warm">
        <span>Low competition</span>
        <span>High competition</span>
      </div>
    </div>
  );
}
