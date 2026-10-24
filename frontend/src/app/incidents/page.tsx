"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Incident, getIncidents, outcomeOf } from "@/lib/api";
import { ConfusionTag, Panel, RiskBar, SeverityTag, StatusPill } from "@/components/ui";

export default function Incidents() {
  const [list, setList] = useState<Incident[]>([]);
  const [filter, setFilter] = useState("all");
  useEffect(() => { getIncidents().then(setList); }, []);
  const shown = list.filter((i) => filter === "all" || i.severity === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Incidents</h1>
          <p className="mono text-xs" style={{ color: "var(--muted)" }}>{list.length} total</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="mono border bg-[var(--panel)] px-3 py-1.5 text-xs" style={{ borderColor: "var(--border)" }}>
          {["all", "critical", "high", "medium", "low"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Panel>
        <table className="w-full text-left text-sm">
          <thead className="text-xs" style={{ color: "var(--muted)" }}>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th className="pb-3 font-normal">ID</th>
              <th className="font-normal">Title</th>
              <th className="font-normal">Severity</th>
              <th className="font-normal">Risk</th>
              <th className="font-normal">Status</th>
              <th className="font-normal">Outcome</th>
              <th className="font-normal">Remedy</th>
              <th className="font-normal">Created</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => (
              <tr key={i.id} className="border-b align-top hover:bg-[var(--panel-raised)]" style={{ borderColor: "var(--border)" }}>
                <td className="mono py-3" style={{ color: "var(--data)" }}>
                  <Link href={`/incidents/${i.id}`}>#{i.id}</Link>
                </td>
                <td className="max-w-[220px] py-3">
                  <Link href={`/incidents/${i.id}`} className="hover:underline">{i.title}</Link>
                </td>
                <td className="py-3"><SeverityTag s={i.severity} /></td>
                <td className="py-3"><RiskBar value={i.risk} /></td>
                <td className="py-3"><StatusPill s={i.status} /></td>
                <td className="py-3">
                  {outcomeOf(i) === "unverified"
                    ? <span className="mono text-xs" style={{ color: "var(--muted)" }}>—</span>
                    : <ConfusionTag outcome={outcomeOf(i)} />}
                </td>
                <td className="max-w-[260px] py-3 text-xs" style={{ color: "var(--muted)" }}>{i.ai.recommendation}</td>
                <td className="mono py-3 text-xs" style={{ color: "var(--muted)" }}>{i.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
