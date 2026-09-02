import { Link } from "@tanstack/react-router";
import type { Opportunity } from "@/lib/market-data";

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl bg-panel p-5 ring-1 ring-line ${className}`}>{children}</section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber">{children}</p>
  );
}

export function ScoreBar({
  label,
  value,
  tone = "amber",
  suffix,
}: {
  label: string;
  value: number;
  tone?: "amber" | "ember" | "sand";
  suffix?: string;
}) {
  const bg = tone === "ember" ? "bg-ember" : tone === "sand" ? "bg-sand/60" : "bg-amber";
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px]">
        <span className="text-muted-warm">{label}</span>
        <span className="text-sand">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel2">
        <div className={`bar-fill h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function VerdictTag({ verdict }: { verdict: Opportunity["verdict"] }) {
  const map = {
    gap: { text: "Gap", cls: "bg-amber/15 text-amber ring-amber/30" },
    moderate: { text: "Moderate", cls: "bg-ember/15 text-ember ring-ember/30" },
    saturated: { text: "Saturated", cls: "bg-line/60 text-sand/60 ring-line" },
  } as const;
  const v = map[verdict];
  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ring-1 ${v.cls}`}>
      {v.text}
    </span>
  );
}

export function OpportunityCard({ opp, index }: { opp: Opportunity; index: number }) {
  return (
    <Link
      to="/opportunity/$id"
      params={{ id: opp.id }}
      className="block rounded-xl bg-panel p-4 ring-1 ring-line transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Opportunity {String(index).padStart(2, "0")}</Eyebrow>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug text-sand">{opp.title}</h3>
        </div>
        <div className="rounded-md bg-amber/15 px-2 py-1 text-right ring-1 ring-amber/30">
          <p className="font-mono text-lg font-semibold leading-none text-amber">{opp.gapScore}</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-amber/70">Gap</p>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <ScoreBar label="Demand" value={opp.demand} />
        <ScoreBar label="Competition" value={opp.competition} tone="ember" />
      </div>
      <p className="mt-3 line-clamp-2 text-[12px] leading-snug text-muted-warm">{opp.fantasy.note}</p>
    </Link>
  );
}
