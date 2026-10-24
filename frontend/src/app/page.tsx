// // "use client";
// // import { useEffect, useState } from "react";
// // import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// // import { Alert, Stats, getStats, subscribeAlerts } from "@/lib/api";
// // import { Panel, SeverityTag, StatCard } from "@/components/ui";

// // export default function Dashboard() {
// //   const [stats, setStats] = useState<Stats | null>(null);
// //   const [feed, setFeed] = useState<Alert[]>([]);

// //   useEffect(() => { getStats().then(setStats); }, []);
// //   useEffect(() => {
// //     return subscribeAlerts((a) => {
// //       setFeed((f) => [a, ...f].slice(0, 10));
// //       setStats((s) => (s ? { ...s, alerts_today: s.alerts_today + 1 } : s));
// //     });
// //   }, []);

// //   if (!stats) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-xl font-semibold">Overview</h1>
// //         <p className="mono text-xs" style={{ color: "var(--muted)" }}>Last updated {new Date().toLocaleTimeString()}</p>
// //       </div>

// //       <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
// //         <StatCard label="Alerts today" value={stats.alerts_today} />
// //         <StatCard label="Open incidents" value={stats.open_incidents} accent="var(--medium)" />
// //         <StatCard label="Critical incidents" value={stats.critical_incidents} accent="var(--critical)" />
// //         <StatCard label="Avg response time" value={stats.mttr_min} unit="min" accent="var(--accent)" />
// //       </div>

// //       <div className="grid gap-4 lg:grid-cols-2">
// //         <Panel title="Alerts over time">
// //           <ResponsiveContainer width="100%" height={200}>
// //             <AreaChart data={stats.timeline}>
// //               <XAxis dataKey="hour" stroke="var(--muted)" fontSize={11} />
// //               <YAxis stroke="var(--muted)" fontSize={11} />
// //               <Tooltip contentStyle={{ background: "var(--panel-raised)", border: "1px solid var(--border)", fontSize: 12 }} />
// //               <Area dataKey="alerts" stroke="var(--data)" fill="var(--data)" fillOpacity={0.15} strokeWidth={2} />
// //             </AreaChart>
// //           </ResponsiveContainer>
// //         </Panel>
// //         <Panel title="Attack types">
// //           <ResponsiveContainer width="100%" height={200}>
// //             <BarChart data={stats.types}>
// //               <XAxis dataKey="type" stroke="var(--muted)" fontSize={11} />
// //               <YAxis stroke="var(--muted)" fontSize={11} />
// //               <Tooltip contentStyle={{ background: "var(--panel-raised)", border: "1px solid var(--border)", fontSize: 12 }} />
// //               <Bar dataKey="count" fill="var(--accent)" />
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Panel>
// //       </div>

// //       <Panel title="Live alert feed">
// //         {feed.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>Waiting for alerts…</p>}
// //         <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
// //           {feed.map((a) => (
// //             <li key={a.id + a.timestamp} className="flex items-center gap-4 py-2.5 text-sm">
// //               <SeverityTag s={a.severity} />
// //               <span className="flex-1">{a.type}</span>
// //               <span className="mono" style={{ color: "var(--muted)" }}>{a.source_ip}</span>
// //               <span className="mono text-xs" style={{ color: "var(--muted)" }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
// //             </li>
// //           ))}
// //         </ul>
// //       </Panel>
// //     </div>
// //   );
// // }


// "use client";
// import { memo, useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { Alert, Severity, Stats, getStats, subscribeAlerts } from "@/lib/api";
// import { Panel, SeverityTag, StatCard } from "@/components/ui";

// const FEED_MAX = 50;   // feed me max itni alerts
// const FLUSH_MS = 1000; // alerts ko 1 sec ke batch me apply karo

// // alert ka naam -> bar chart ki category
// const TYPE_TO_BUCKET: Record<string, string> = {
//   "SSH Brute Force": "Brute Force",
//   "Port Scan": "Port Scan",
//   "Suspicious PowerShell": "PowerShell",
//   "Malware Signature": "Malware",
// };

// type Filter = "all" | Severity;
// const FILTERS: Filter[] = ["all", "critical", "high", "medium", "low"];

// function applyAlerts(s: Stats, batch: Alert[]): Stats {
//   const types = s.types.map((t) => ({ ...t }));
//   for (const a of batch) {
//     const row = types.find((t) => t.type === TYPE_TO_BUCKET[a.type]);
//     if (row) row.count += 1;
//   }
//   const last = s.timeline.length - 1;
//   const timeline = s.timeline.map((p, i) => (i === last ? { ...p, alerts: p.alerts + batch.length } : p));
//   return { ...s, alerts_today: s.alerts_today + batch.length, types, timeline };
// }

// const AlertRow = memo(function AlertRow({ a }: { a: Alert }) {
//   return (
//     <li>
//       <Link
//         href={`/incidents/${a.incident_id}`}
//         className="flex items-center gap-4 rounded px-2 py-2.5 text-sm hover:bg-[var(--panel-raised)]"
//       >
//         <SeverityTag s={a.severity} />
//         <span className="flex-1">{a.type}</span>
//         <span className="mono" style={{ color: "var(--muted)" }}>{a.source_ip}</span>
//         <span className="mono text-xs" style={{ color: "var(--muted)" }}>
//           {new Date(a.timestamp).toLocaleTimeString()}
//         </span>
//       </Link>
//     </li>
//   );
// });

// export default function Dashboard() {
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [feed, setFeed] = useState<Alert[]>([]);
//   const [filter, setFilter] = useState<Filter>("all");
//   const [paused, setPaused] = useState(false);
//   const [queued, setQueued] = useState(0);
//   const [updated, setUpdated] = useState("");

//   const incoming = useRef<Alert[]>([]); // abhi aayi, apply hona baaki
//   const held = useRef<Alert[]>([]);     // pause ke dauran roki gayi (newest first)
//   const pausedRef = useRef(false);

//   useEffect(() => {
//     getStats()
//       .then((s) => {
//         setStats(s);
//         setUpdated(new Date().toLocaleTimeString());
//       })
//       .catch((e) => setError(e instanceof Error ? e.message : "Failed to load stats"));
//   }, []);

//   useEffect(() => {
//     const unsubscribe = subscribeAlerts((a) => incoming.current.push(a));

//     const timer = setInterval(() => {
//       const batch = incoming.current;
//       if (batch.length === 0) return;
//       incoming.current = [];

//       // KPIs aur charts hamesha update hote hain
//       setStats((s) => (s ? applyAlerts(s, batch) : s));
//       setUpdated(new Date().toLocaleTimeString());

//       const newestFirst = batch.slice().reverse();
//       if (pausedRef.current) {
//         held.current = [...newestFirst, ...held.current];
//         setQueued(held.current.length);
//       } else {
//         setFeed((f) => [...newestFirst, ...f].slice(0, FEED_MAX));
//       }
//     }, FLUSH_MS);

//     return () => {
//       unsubscribe();
//       clearInterval(timer);
//     };
//   }, []);

//   function togglePause() {
//     const next = !pausedRef.current;
//     pausedRef.current = next;
//     setPaused(next);
//     if (!next) {
//       const h = held.current;
//       held.current = [];
//       setQueued(0);
//       setFeed((f) => [...h, ...f].slice(0, FEED_MAX));
//     }
//   }

//   if (error) return <p style={{ color: "var(--critical)" }}>Could not load dashboard: {error}</p>;
//   if (!stats) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

//   const visible = filter === "all" ? feed : feed.filter((a) => a.severity === filter);
//   const tooltipStyle = { background: "var(--panel-raised)", border: "1px solid var(--border)", fontSize: 12 };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-semibold">Overview</h1>
//         <p className="mono text-xs" style={{ color: "var(--muted)" }}>Last updated {updated}</p>
//       </div>

//       <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//         {/* <StatCard label="Alerts today" value={stats.alerts_today} />
//         <StatCard label="Open incidents" value={stats.open_incidents} accent="var(--medium)" />
//         <StatCard label="Critical incidents" value={stats.critical_incidents} accent="var(--critical)" />
//         <StatCard label="Avg response time" value={stats.mttr_min} unit="min" accent="var(--accent)" /> */
//         <StatCard label="Alerts today" value={stats.alerts_today} />
// <StatCard label="Open incidents" value={stats.open_incidents} accent="var(--medium)" href="/incidents" />
// <StatCard label="Critical incidents" value={stats.critical_incidents} accent="var(--critical)" href="/incidents" />
// <StatCard label="Avg response time" value={stats.mttr_min} unit="min" accent="var(--accent)" />}
//       </div>

//       <div className="grid gap-4 lg:grid-cols-2">
//         <Panel title="Alerts over time">
//           <ResponsiveContainer width="100%" height={200}>
//             <AreaChart data={stats.timeline}>
//               <XAxis dataKey="hour" stroke="var(--muted)" fontSize={11} />
//               <YAxis stroke="var(--muted)" fontSize={11} />
//               <Tooltip contentStyle={tooltipStyle} />
//               <Area dataKey="alerts" stroke="var(--data)" fill="var(--data)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </Panel>
//         <Panel title="Attack types">
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={stats.types}>
//               <XAxis dataKey="type" stroke="var(--muted)" fontSize={11} />
//               <YAxis stroke="var(--muted)" fontSize={11} />
//               <Tooltip contentStyle={tooltipStyle} />
//               <Bar dataKey="count" fill="var(--accent)" isAnimationActive={false} />
//             </BarChart>
//           </ResponsiveContainer>
//         </Panel>
//       </div>

//       <Panel title="Live alert feed">
//         <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
//           {FILTERS.map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               className="rounded border px-2.5 py-1 capitalize"
//               style={{
//                 borderColor: "var(--border)",
//                 background: filter === f ? "var(--panel-raised)" : "transparent",
//                 color: filter === f ? "var(--accent)" : "var(--muted)",
//               }}
//             >
//               {f}
//             </button>
//           ))}
//           <button
//             onClick={togglePause}
//             className="ml-auto rounded border px-2.5 py-1"
//             style={{ borderColor: "var(--border)", color: "var(--text)" }}
//           >
//             {paused ? (queued > 0 ? `Resume (${queued} new)` : "Resume") : "Pause"}
//           </button>
//         </div>

//         {visible.length === 0 && (
//           <p className="text-sm" style={{ color: "var(--muted)" }}>
//             {feed.length === 0 ? "Waiting for alerts…" : "No alerts match this filter."}
//           </p>
//         )}
//         <ul className="max-h-[420px] divide-y overflow-y-auto" style={{ borderColor: "var(--border)" }}>
//           {visible.map((a) => (
//             <AlertRow key={a.id + a.timestamp} a={a} />
//           ))}
//         </ul>
//       </Panel>
//     </div>
//   );
// }


"use client";
import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert, ConfusionStats, Severity, Stats, getConfusionStats, getStats, subscribeAlerts } from "@/lib/api";
import { Notice, Panel, SeverityTag, Skeleton, StatCard } from "@/components/ui";

const FEED_MAX = 50;   // feed me max itni alerts
const FLUSH_MS = 1000; // alerts ko 1 sec ke batch me apply karo

// alert ka naam -> bar chart ki category
const TYPE_TO_BUCKET: Record<string, string> = {
  "SSH Brute Force": "Brute Force",
  "Port Scan": "Port Scan",
  "Suspicious PowerShell": "PowerShell",
  "Malware Signature": "Malware",
};

type Filter = "all" | Severity;
const FILTERS: Filter[] = ["all", "critical", "high", "medium", "low"];

function applyAlerts(s: Stats, batch: Alert[]): Stats {
  const types = s.types.map((t) => ({ ...t }));
  for (const a of batch) {
    const row = types.find((t) => t.type === TYPE_TO_BUCKET[a.type]);
    if (row) row.count += 1;
  }
  const last = s.timeline.length - 1;
  const timeline = s.timeline.map((p, i) => (i === last ? { ...p, alerts: p.alerts + batch.length } : p));
  return { ...s, alerts_today: s.alerts_today + batch.length, types, timeline };
}

const AlertRow = memo(function AlertRow({ a }: { a: Alert }) {
  return (
    <li>
      <Link
        href={`/incidents/${a.incident_id}`}
        className="flex items-center gap-4 rounded px-2 py-2.5 text-sm hover:bg-[var(--panel-raised)]"
      >
        <SeverityTag s={a.severity} />
        <span className="flex-1">{a.type}</span>
        <span className="mono" style={{ color: "var(--muted)" }}>{a.source_ip}</span>
        <span className="mono text-xs" style={{ color: "var(--muted)" }}>
          {new Date(a.timestamp).toLocaleTimeString()}
        </span>
      </Link>
    </li>
  );
});

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [confusion, setConfusion] = useState<ConfusionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [paused, setPaused] = useState(false);
  const [queued, setQueued] = useState(0);
  const [updated, setUpdated] = useState("");

  const incoming = useRef<Alert[]>([]); // abhi aayi, apply hona baaki
  const held = useRef<Alert[]>([]);     // pause ke dauran roki gayi (newest first)
  const pausedRef = useRef(false);

  useEffect(() => {
    getStats()
      .then((s) => {
        setStats(s);
        setUpdated(new Date().toLocaleTimeString());
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load stats"));
    getConfusionStats().then(setConfusion);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAlerts((a) => incoming.current.push(a));

    const timer = setInterval(() => {
      const batch = incoming.current;
      if (batch.length === 0) return;
      incoming.current = [];

      // KPIs aur charts hamesha update hote hain
      setStats((s) => (s ? applyAlerts(s, batch) : s));
      setUpdated(new Date().toLocaleTimeString());

      const newestFirst = batch.slice().reverse();
      if (pausedRef.current) {
        held.current = [...newestFirst, ...held.current];
        setQueued(held.current.length);
      } else {
        setFeed((f) => [...newestFirst, ...f].slice(0, FEED_MAX));
      }
    }, FLUSH_MS);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) {
      const h = held.current;
      held.current = [];
      setQueued(0);
      setFeed((f) => [...h, ...f].slice(0, FEED_MAX));
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Overview</h1>
        <Notice kind="error">Could not load dashboard: {error}</Notice>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((n) => <Skeleton key={n} className="h-28" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  const visible = filter === "all" ? feed : feed.filter((a) => a.severity === filter);
  const tooltipStyle = { background: "var(--panel-raised)", border: "1px solid var(--border)", fontSize: 12 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="mono text-xs" style={{ color: "var(--muted)" }}>Last updated {updated}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Alerts today" value={stats.alerts_today} />
        <StatCard label="Open incidents" value={stats.open_incidents} accent="var(--medium)" href="/incidents" />
        <StatCard label="Critical incidents" value={stats.critical_incidents} accent="var(--critical)" href="/incidents" />
        <StatCard label="Avg response time" value={stats.mttr_min} unit="min" accent="var(--accent)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Alerts over time">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.timeline}>
              <XAxis dataKey="hour" stroke="var(--muted)" fontSize={11} />
              <YAxis stroke="var(--muted)" fontSize={11} />
              {/* <Tooltip contentStyle={tooltipStyle} /> */
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />}
              <Area dataKey="alerts" stroke="var(--data)" fill="var(--data)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Attack types">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.types}>
              <XAxis dataKey="type" stroke="var(--muted)" fontSize={11} />
              <YAxis stroke="var(--muted)" fontSize={11} />
              {/* <Tooltip contentStyle={tooltipStyle} /> */
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />}
              <Bar dataKey="count" fill="var(--accent)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {confusion && (
        <Panel title="Detection accuracy">
          <p className="mb-4 max-w-2xl text-xs" style={{ color: "var(--muted)" }}>
            Measured against what actually happened. True/False Positives come from your Approve/Reject
            decisions below; True/False Negatives can&apos;t be seen from alerts alone, since a miss never
            raises one — those two are tracked separately against known lab activity.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>True Positives</p>
              <p className="mono mt-1 text-2xl font-semibold" style={{ color: "var(--accent)" }}>{confusion.tp}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Alerts you approved — real attacks</p>
            </div>
            <div className="border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>False Positives</p>
              <p className="mono mt-1 text-2xl font-semibold" style={{ color: "var(--critical)" }}>{confusion.fp}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Alerts you rejected — false alarms</p>
            </div>
            <div className="border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>True Negatives</p>
              <p className="mono mt-1 text-2xl font-semibold" style={{ color: "var(--low)" }}>{confusion.tn}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Normal activity, correctly ignored</p>
            </div>
            <div className="border p-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>False Negatives</p>
              <p className="mono mt-1 text-2xl font-semibold" style={{ color: "var(--high)" }}>{confusion.fn}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Real attacks that slipped through</p>
            </div>
          </div>
          {confusion.precision !== null && (
            <p className="mono mt-4 text-xs" style={{ color: "var(--muted)" }}>
              Precision: {(confusion.precision * 100).toFixed(0)}% of escalated incidents were confirmed real
            </p>
          )}
        </Panel>
      )}

      <Panel title="Live alert feed">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className="rounded border px-2.5 py-1 capitalize"
              style={{
                borderColor: "var(--border)",
                background: filter === f ? "var(--panel-raised)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--muted)",
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={togglePause}
            className="ml-auto rounded border px-2.5 py-1"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            {paused ? (queued > 0 ? `Resume (${queued} new)` : "Resume") : "Pause"}
          </button>
        </div>

        {visible.length === 0 && (
          <Notice>{feed.length === 0 ? "Waiting for alerts…" : "No alerts match this filter."}</Notice>
        )}
        <ul className="max-h-[420px] divide-y overflow-y-auto" style={{ borderColor: "var(--border)" }}>
          {visible.map((a) => (
            <AlertRow key={a.id + a.timestamp} a={a} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}