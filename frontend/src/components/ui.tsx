// import { Severity } from "@/lib/api";

// const sevStyle: Record<Severity, { color: string; label: string }> = {
//   critical: { color: "var(--critical)", label: "Critical" },
//   high: { color: "var(--high)", label: "High" },
//   medium: { color: "var(--medium)", label: "Medium" },
//   low: { color: "var(--low)", label: "Low" },
// };

// export function SeverityTag({ s }: { s: Severity }) {
//   const { color, label } = sevStyle[s];
//   return (
//     <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
//       <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
//       {label}
//     </span>
//   );
// }

// const statusStyle: Record<string, { color: string; label: string }> = {
//   open: { color: "var(--muted)", label: "Open" },
//   awaiting_approval: { color: "var(--accent)", label: "Awaiting approval" },
//   approved: { color: "var(--low)", label: "Approved" },
//   rejected: { color: "var(--critical)", label: "Rejected" },
// };

// export function StatusPill({ s }: { s: string }) {
//   const { color, label } = statusStyle[s] ?? { color: "var(--muted)", label: s };
//   return (
//     <span className="inline-block border px-2 py-0.5 text-xs" style={{ borderColor: color, color }}>
//       {label}
//     </span>
//   );
// }

// export function RiskBar({ value }: { value: number }) {
//   const color = value >= 80 ? "var(--critical)" : value >= 55 ? "var(--high)" : value >= 30 ? "var(--medium)" : "var(--low)";
//   return (
//     <div className="flex items-center gap-2">
//       <div className="h-1.5 w-16 overflow-hidden" style={{ background: "var(--panel-raised)" }}>
//         <div className="h-full" style={{ width: `${value}%`, background: color }} />
//       </div>
//       <span className="mono text-xs tabular-nums" style={{ color: "var(--muted)" }}>{value}</span>
//     </div>
//   );
// }

// export function Panel({ title, children, className = "", action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
//   return (
//     <section className={`border bg-[var(--panel)] ${className}`} style={{ borderColor: "var(--border)" }}>
//       {title && (
//         <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
//           <h2 className="text-sm font-medium" style={{ color: "var(--muted)" }}>{title}</h2>
//           {action}
//         </div>
//       )}
//       <div className="p-4">{children}</div>
//     </section>
//   );
// }

// export function StatCard({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: string }) {
//   return (
//     <Panel>
//       <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
//       <p className="mono mt-2 text-4xl font-semibold tabular-nums" style={{ color: accent ?? "var(--text)" }}>
//         {value}{unit && <span className="ml-1 text-base font-normal" style={{ color: "var(--muted)" }}>{unit}</span>}
//       </p>
//     </Panel>
//   );
// }


import Link from "next/link";
import { Severity } from "@/lib/api";

const sevStyle: Record<Severity, { color: string; label: string }> = {
  critical: { color: "var(--critical)", label: "Critical" },
  high: { color: "var(--high)", label: "High" },
  medium: { color: "var(--medium)", label: "Medium" },
  low: { color: "var(--low)", label: "Low" },
};

export function SeverityTag({ s }: { s: Severity }) {
  const { color, label } = sevStyle[s];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

const statusStyle: Record<string, { color: string; label: string }> = {
  open: { color: "var(--muted)", label: "Open" },
  awaiting_approval: { color: "var(--accent)", label: "Awaiting approval" },
  approved: { color: "var(--low)", label: "Approved" },
  rejected: { color: "var(--critical)", label: "Rejected" },
};

export function StatusPill({ s }: { s: string }) {
  const { color, label } = statusStyle[s] ?? { color: "var(--muted)", label: s };
  return (
    <span className="inline-block whitespace-nowrap border px-2 py-0.5 text-xs" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
}

const outcomeStyle: Record<string, { color: string; label: string }> = {
  TP: { color: "var(--accent)", label: "True Positive" },
  FP: { color: "var(--critical)", label: "False Positive" },
  unverified: { color: "var(--muted)", label: "Unverified" },
};

// The ML model's own automatic guess (Phase 1), shown BEFORE any human has
// reviewed anything. Deliberately styled with a dashed border -- distinct
// from ConfusionTag's solid border below, which only appears once a human
// has actually confirmed the outcome. Dashed = prediction, solid = confirmed.
export function PredictionTag({ prediction }: { prediction: { label: "TP" | "FP"; confidence: number } }) {
  const color = prediction.label === "TP" ? "var(--high)" : "var(--low)";
  return (
    <span className="mono inline-flex items-center gap-1 whitespace-nowrap border border-dashed px-2 py-0.5 text-xs"
      style={{ borderColor: color, color }}
      title="Automatic ML classification, made before human review">
      ML: {prediction.label} {Math.round(prediction.confidence * 100)}%
    </span>
  );
}

export function ConfusionTag({ outcome }: { outcome: "TP" | "FP" | "unverified" }) {
  if (outcome === "unverified") return null; // nothing to show until a human has decided
  const { color, label } = outcomeStyle[outcome];
  return (
    <span className="mono inline-block whitespace-nowrap border px-2 py-0.5 text-xs" style={{ borderColor: color, color }}
      title={outcome === "TP" ? "Approved: the AI's call was confirmed correct" : "Rejected: the AI's call was a false alarm"}>
      {outcome} · {label}
    </span>
  );
}

export function RiskBar({ value }: { value: number }) {
  const color = value >= 80 ? "var(--critical)" : value >= 55 ? "var(--high)" : value >= 30 ? "var(--medium)" : "var(--low)";
  return (
    <div className="flex items-center gap-2" role="meter" aria-label="Risk score" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-1.5 w-16 overflow-hidden" style={{ background: "var(--panel-raised)" }}>
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mono text-xs tabular-nums" style={{ color: "var(--muted)" }}>{value}</span>
    </div>
  );
}

export function Panel({ title, children, className = "", action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`border bg-[var(--panel)] ${className}`} style={{ borderColor: "var(--border)" }}>
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-medium" style={{ color: "var(--muted)" }}>{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

// href dene pe card clickable ho jaata hai, hint me chhota note (jaise "+12% vs yesterday")
export function StatCard({ label, value, unit, accent, href, hint }: {
  label: string; value: string | number; unit?: string; accent?: string; href?: string; hint?: string;
}) {
  const body = (
    <Panel className={href ? "transition-colors hover:bg-[var(--panel-raised)]" : ""}>
      <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="mono mt-2 text-4xl font-semibold tabular-nums" style={{ color: accent ?? "var(--text)" }}>
        {value}{unit && <span className="ml-1 text-base font-normal" style={{ color: "var(--muted)" }}>{unit}</span>}
      </p>
      {hint && <p className="mono mt-1 text-[11px]" style={{ color: "var(--muted)" }}>{hint}</p>}
    </Panel>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse ${className}`} style={{ background: "var(--panel-raised)" }} aria-hidden="true" />;
}

export function Notice({ kind = "muted", children }: { kind?: "muted" | "error"; children: React.ReactNode }) {
  return (
    <p className="text-sm" role={kind === "error" ? "alert" : undefined}
       style={{ color: kind === "error" ? "var(--critical)" : "var(--muted)" }}>
      {children}
    </p>
  );
}