// "use client";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Incident, decide, getIncident } from "@/lib/api";
// import { Panel, RiskBar, SeverityTag, StatusPill } from "@/components/ui";

// export default function IncidentDetail() {
//   const { id } = useParams<{ id: string }>();
//   const [inc, setInc] = useState<Incident | null>(null);
//   const [busy, setBusy] = useState(false);

//   useEffect(() => { getIncident(Number(id)).then((i) => setInc(i ?? null)); }, [id]);
//   if (!inc) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

//   async function act(d: "approve" | "reject") {
//     setBusy(true);
//     await decide(inc!.id, d);
//     setInc(await getIncident(inc!.id).then((i) => (i ? { ...i } : null)));
//     setBusy(false);
//   }

//   return (
//     <div className="space-y-5">
//       <div>
//         <div className="flex flex-wrap items-center gap-4">
//           <h1 className="text-xl font-semibold">Incident #{inc.id}</h1>
//           <SeverityTag s={inc.severity} />
//           <RiskBar value={inc.risk} />
//           <StatusPill s={inc.status} />
//         </div>
//         <p className="mt-1" style={{ color: "var(--muted)" }}>{inc.title}</p>
//       </div>

//       <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
//         <div className="space-y-5">
//           <Panel title="Attack timeline">
//             <ol className="space-y-3 border-l pl-4 text-sm" style={{ borderColor: "var(--border)" }}>
//               {inc.timeline.map((t) => (
//                 <li key={t.time + t.event}>
//                   <span className="mono mr-2" style={{ color: "var(--data)" }}>{t.time}</span>{t.event}
//                 </li>
//               ))}
//             </ol>
//           </Panel>

//           <Panel title="MITRE ATT&CK">
//             <div className="flex flex-wrap gap-2">
//               {inc.mitre.map((m) => (
//                 <span key={m} className="mono border px-2 py-1 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>{m}</span>
//               ))}
//             </div>
//           </Panel>

//           <Panel title="Threat intelligence — OTX">
//             {inc.intel.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>No known indicators.</p>}
//             {inc.intel.map((t) => (
//               <p key={t.ip} className="text-sm">
//                 <span className="mono" style={{ color: "var(--data)" }}>{t.ip}</span>
//                 <span style={{ color: "var(--muted)" }}> — {t.verdict}, {t.reports} reports</span>
//               </p>
//             ))}
//           </Panel>

//           <Panel title="Affected assets">
//             <p className="mono text-sm">{inc.assets.join(", ")}</p>
//           </Panel>
//         </div>

//         <Panel title="AI analyst" className="h-fit" action={<span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}>
//           <p className="text-sm leading-relaxed">{inc.ai.summary}</p>

//           <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Evidence</p>
//           <ul className="mt-1.5 space-y-1 text-sm">
//             {inc.ai.evidence.map((e) => (
//               <li key={e} className="flex gap-2">
//                 <span style={{ color: "var(--muted)" }}>–</span><span className="mono text-xs" style={{ color: "var(--text)" }}>{e}</span>
//               </li>
//             ))}
//           </ul>

//           <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Recommended action</p>
//           <p className="mt-1.5 text-sm">{inc.ai.recommendation}</p>

//           {inc.status === "awaiting_approval" ? (
//             <div className="mt-5 flex gap-3">
//               <button disabled={busy} onClick={() => act("approve")}
//                 className="flex-1 border px-4 py-2 text-sm font-medium disabled:opacity-50"
//                 style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
//                 Approve
//               </button>
//               <button disabled={busy} onClick={() => act("reject")}
//                 className="flex-1 border px-4 py-2 text-sm font-medium disabled:opacity-50"
//                 style={{ borderColor: "var(--critical)", color: "var(--critical)" }}>
//                 Reject
//               </button>
//             </div>
//           ) : (
//             <p className="mt-5 text-sm capitalize" style={{ color: "var(--muted)" }}>Status: {inc.status.replace("_", " ")}</p>
//           )}
//         </Panel>
//       </div>
//     </div>
//   );
// }



"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Incident, decide, getIncident, outcomeOf } from "@/lib/api";
import { ConfusionTag, Notice, Panel, PredictionTag, RiskBar, SeverityTag, Skeleton, StatusPill } from "@/components/ui";

// "T1059.001 PowerShell" -> { id: "T1059.001", name: "PowerShell", url }
function parseMitre(raw: string) {
  const [id, ...rest] = raw.split(" ");
  return { id, name: rest.join(" "), url: `https://attack.mitre.org/techniques/${id.replace(".", "/")}/` };
}

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const [inc, setInc] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<"approve" | "reject" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getIncident(Number(id))
      .then((i) => { if (!cancelled) setInc(i ?? null); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load incident"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function act(d: "approve" | "reject") {
    if (!inc) return;
    setBusy(true);
    setActionError(null);
    try {
      await decide(inc.id, d);
      const fresh = await getIncident(inc.id);
      setInc(fresh ? { ...fresh } : null);
      setConfirming(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <Link href="/incidents" className="mono text-xs hover:underline" style={{ color: "var(--muted)" }}>
      ← All incidents
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-80" />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }
  if (error) return <div className="space-y-3">{back}<Notice kind="error">Could not load incident: {error}</Notice></div>;
  if (!inc) return <div className="space-y-3">{back}<Notice>Incident #{id} not found.</Notice></div>;

  return (
    <div className="space-y-5">
      {back}
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-semibold">Incident #{inc.id}</h1>
          <SeverityTag s={inc.severity} />
          <RiskBar value={inc.risk} />
          <PredictionTag prediction={inc.prediction} />
          <StatusPill s={inc.status} />
          {outcomeOf(inc) !== "unverified" && <ConfusionTag outcome={outcomeOf(inc)} />}
        </div>
        <p className="mt-1" style={{ color: "var(--muted)" }}>{inc.title}</p>
        <p className="mono mt-1 text-xs" style={{ color: "var(--muted)" }}>Created {inc.created}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel title="Attack timeline">
            <ol className="space-y-4 border-l pl-4 text-sm" style={{ borderColor: "var(--border)" }}>
              {inc.timeline.map((t) => (
                <li key={t.time + t.event} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full" style={{ background: "var(--data)" }} aria-hidden="true" />
                  <span className="mono mr-2" style={{ color: "var(--data)" }}>{t.time}</span>{t.event}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="MITRE ATT&CK">
            <div className="flex flex-wrap gap-2">
              {inc.mitre.map((m) => {
                const t = parseMitre(m);
                return (
                  <a key={m} href={t.url} target="_blank" rel="noopener noreferrer"
                     className="mono border px-2 py-1 text-xs hover:bg-[var(--panel-raised)]"
                     style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                     title="Open on attack.mitre.org">
                    <span style={{ color: "var(--data)" }}>{t.id}</span> {t.name} ↗
                  </a>
                );
              })}
            </div>
          </Panel>

          <Panel title="Threat intelligence — OTX">
            {inc.intel.length === 0 && <Notice>No known indicators.</Notice>}
            {inc.intel.map((t) => (
              <p key={t.ip} className="text-sm">
                <span className="mono" style={{ color: "var(--data)" }}>{t.ip}</span>
                <span style={{ color: "var(--muted)" }}> — {t.verdict}, {t.reports} reports</span>
              </p>
            ))}
          </Panel>

          <Panel title="Affected assets">
            <div className="flex flex-wrap gap-2">
              {inc.assets.map((a) => (
                <span key={a} className="mono border px-2 py-1 text-xs" style={{ borderColor: "var(--border)" }}>{a}</span>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="AI analyst" className="h-fit" action={<span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} aria-hidden="true" />}>
          <p className="text-sm leading-relaxed">{inc.ai.summary}</p>

          <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Evidence</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {inc.ai.evidence.map((e) => (
              <li key={e} className="flex gap-2">
                <span style={{ color: "var(--muted)" }}>–</span>
                <span className="mono text-xs" style={{ color: "var(--text)" }}>{e}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Recommended action</p>
          <p className="mt-1.5 text-sm">{inc.ai.recommendation}</p>

          {inc.status === "awaiting_approval" ? (
            <div className="mt-5">
              {confirming === null ? (
                <div className="flex gap-3">
                  <button onClick={() => setConfirming("approve")}
                    className="flex-1 border px-4 py-2 text-sm font-medium"
                    style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                    Approve
                  </button>
                  <button onClick={() => setConfirming("reject")}
                    className="flex-1 border px-4 py-2 text-sm font-medium"
                    style={{ borderColor: "var(--critical)", color: "var(--critical)" }}>
                    Reject
                  </button>
                </div>
              ) : null}
              <p className="mono mt-2 text-[11px]" style={{ color: "var(--muted)" }}>
                Approve confirms the AI was right (True Positive). Reject marks it a false alarm (False Positive).
              </p>
              {confirming !== null && (
                <div className="space-y-3 border p-3" style={{ borderColor: confirming === "approve" ? "var(--accent)" : "var(--critical)" }}>
                  <p className="text-sm">
                    {confirming === "approve"
                      ? "Approve this action? It will be executed automatically and logged in the audit trail."
                      : "Reject this recommendation? No action will be executed. The decision is logged."}
                  </p>
                  <div className="flex gap-3">
                    <button disabled={busy} onClick={() => act(confirming)}
                      className="flex-1 border px-4 py-2 text-sm font-medium disabled:opacity-50"
                      style={{ borderColor: confirming === "approve" ? "var(--accent)" : "var(--critical)", color: confirming === "approve" ? "var(--accent)" : "var(--critical)" }}>
                      {busy ? "Working…" : `Confirm ${confirming}`}
                    </button>
                    <button disabled={busy} onClick={() => { setConfirming(null); setActionError(null); }}
                      className="flex-1 border px-4 py-2 text-sm disabled:opacity-50"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {actionError && <div className="mt-2"><Notice kind="error">{actionError}</Notice></div>}
            </div>
          ) : (
            <p className="mt-5 text-sm capitalize" style={{ color: "var(--muted)" }}>
              Status: {inc.status.replaceAll("_", " ")}
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}