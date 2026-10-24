"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Incident, decide, getIncidents } from "@/lib/api";
import { Notice, Panel, RiskBar, SeverityTag, Skeleton, StatusPill } from "@/components/ui";

type Decision = "approve" | "reject";

export default function Approvals() {
  const [list, setList] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: number; decision: Decision } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    const data = await getIncidents();
    setList([...data]); // naya array, taaki React re-render kare
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load approvals"))
      .finally(() => setLoading(false));
  }, []);

  const pending = useMemo(
    () => list.filter((i) => i.status === "awaiting_approval").sort((a, b) => b.risk - a.risk),
    [list]
  );
  const decided = useMemo(
    () => list.filter((i) => i.status === "approved" || i.status === "rejected"),
    [list]
  );

  async function act(inc: Incident, d: Decision) {
    setBusyId(inc.id);
    setActionError(null);
    try {
      await decide(inc.id, d);
      await load();
      setConfirming(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-xl font-semibold">Approvals</h1>
        <p className="mono text-xs" style={{ color: "var(--muted)" }}>
          {loading ? "Loading…" : `${pending.length} pending`}
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          AI ne ye actions recommend kiye hain. Koi bhi action tab tak execute nahi hoga jab tak aap approve na karein.
        </p>
      </div> */
      <div>
  <h1 className="text-xl font-semibold">Approvals</h1>
  <p className="mono text-xs" style={{ color: "var(--muted)" }}>
    {loading ? "Loading…" : `${pending.length} pending`}
  </p>
</div>}

      {error && <Notice kind="error">Could not load approvals: {error}</Notice>}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      )}

      {!loading && !error && pending.length === 0 && (
        <Panel><Notice>No pending approvals. All incidents have been handled.</Notice></Panel>
      )}

      <div className="space-y-4">
        {pending.map((inc) => {
          const isConfirming = confirming?.id === inc.id;
          const d = confirming?.decision;
          const color = d === "approve" ? "var(--accent)" : "var(--critical)";
          return (
            <Panel
              key={inc.id}
              title={`Incident #${inc.id}`}
              action={<StatusPill s={inc.status} />}
            >
              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/incidents/${inc.id}`} className="font-medium hover:underline">
                  {inc.title}
                </Link>
                <SeverityTag s={inc.severity} />
                <RiskBar value={inc.risk} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {inc.assets.map((a) => (
                  <span key={a} className="mono border px-2 py-0.5 text-xs" style={{ borderColor: "var(--border)" }}>
                    {a}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>AI recommendation</p>
              <p className="mt-1 text-sm">{inc.ai.recommendation}</p>

              <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>Evidence</p>
              <ul className="mt-1 space-y-1">
                {inc.ai.evidence.map((e) => (
                  <li key={e} className="mono text-xs">– {e}</li>
                ))}
              </ul>

              <div className="mt-5">
                {!isConfirming ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { setConfirming({ id: inc.id, decision: "approve" }); setActionError(null); }}
                      className="border px-5 py-2 text-sm font-medium"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setConfirming({ id: inc.id, decision: "reject" }); setActionError(null); }}
                      className="border px-5 py-2 text-sm font-medium"
                      style={{ borderColor: "var(--critical)", color: "var(--critical)" }}
                    >
                      Reject
                    </button>
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="border px-5 py-2 text-sm"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      View details
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 border p-3" style={{ borderColor: color }}>
                    <p className="text-sm">
                      {d === "approve"
                        ? `Approve: "${inc.ai.recommendation}" Ye action execute hoga aur audit trail me log hoga.`
                        : "Reject karne par koi action execute nahi hoga. Decision log hoga."}
                    </p>
                    <div className="flex gap-3">
                      <button
                        disabled={busyId === inc.id}
                        onClick={() => act(inc, d!)}
                        className="border px-5 py-2 text-sm font-medium disabled:opacity-50"
                        style={{ borderColor: color, color }}
                      >
                        {busyId === inc.id ? "Working…" : `Confirm ${d}`}
                      </button>
                      <button
                        disabled={busyId === inc.id}
                        onClick={() => { setConfirming(null); setActionError(null); }}
                        className="border px-5 py-2 text-sm disabled:opacity-50"
                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                      >
                        Cancel
                      </button>
                    </div>
                    {actionError && <Notice kind="error">{actionError}</Notice>}
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {decided.length > 0 && (
        <Panel title="Recent decisions">
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {decided.map((inc) => (
              <li key={inc.id} className="flex flex-wrap items-center gap-4 py-2.5 text-sm">
                <Link href={`/incidents/${inc.id}`} className="mono hover:underline" style={{ color: "var(--data)" }}>
                  #{inc.id}
                </Link>
                <span className="flex-1">{inc.title}</span>
                <SeverityTag s={inc.severity} />
                <StatusPill s={inc.status} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}