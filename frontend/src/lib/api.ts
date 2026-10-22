export type Severity = "critical" | "high" | "medium" | "low";
export type Alert = { id: string; type: string; severity: Severity; source_ip: string; timestamp: string; incident_id: number };
export type Incident = {
  id: number; title: string; severity: Severity;
  status: "open" | "awaiting_approval" | "approved" | "rejected";
  risk: number; assets: string[]; created: string; mitre: string[];
  intel: { ip: string; verdict: string; reports: number }[];
  timeline: { time: string; event: string }[];
  ai: { summary: string; evidence: string[]; recommendation: string };
};
export type Stats = {
  alerts_today: number; open_incidents: number; critical_incidents: number; mttr_min: number;
  timeline: { hour: string; alerts: number }[]; types: { type: string; count: number }[];
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/alerts";
const MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

const incidents: Incident[] = [
  {
    id: 42, title: "SSH brute force leading to admin compromise", severity: "critical",
    status: "awaiting_approval", risk: 92, assets: ["linux-srv-01", "user: admin"], created: "2026-10-15 10:02",
    mitre: ["T1046 Network Service Discovery", "T1110 Brute Force", "T1078 Valid Accounts"],
    intel: [{ ip: "203.0.113.9", verdict: "Malicious", reports: 40 }],
    timeline: [
      { time: "10:02", event: "Port scan from 203.0.113.9 (rule + CICIDS ML)" },
      { time: "10:05", event: "214 failed SSH logins for 'admin'" },
      { time: "10:09", event: "Successful SSH login as 'admin'" },
      { time: "10:12", event: "Suspicious process started on linux-srv-01" },
    ],
    ai: {
      summary: "An external IP scanned the server, brute-forced the admin password and logged in. A suspicious process started minutes later, so the account is likely compromised.",
      evidence: ["auth.log: 214 failures between 10:05-10:08", "auth.log: Accepted password for admin at 10:09", "OTX: 203.0.113.9 seen in 40 campaigns"],
      recommendation: "Block IP 203.0.113.9 at the firewall and disable the 'admin' account.",
    },
  },
  {
    id: 43, title: "Suspicious encoded PowerShell on workstation", severity: "high",
    status: "open", risk: 71, assets: ["win-ws-07", "user: priya"], created: "2026-10-15 09:41",
    mitre: ["T1059.001 PowerShell"], intel: [{ ip: "198.51.100.23", verdict: "Suspicious", reports: 6 }],
    timeline: [{ time: "09:41", event: "powershell.exe -enc ... launched by winword.exe" }],
    ai: { summary: "Word spawned an encoded PowerShell command, a common phishing-payload pattern.", evidence: ["Sysmon event 1 at 09:41"], recommendation: "Isolate win-ws-07 and reset user credentials." },
  },
  {
    id: 44, title: "Port scan from internal host", severity: "medium",
    status: "open", risk: 45, assets: ["10.0.0.15"], created: "2026-10-15 08:20",
    mitre: ["T1046 Network Service Discovery"], intel: [],
    timeline: [{ time: "08:20", event: "100 ports probed in 9 seconds" }],
    ai: { summary: "Likely a vulnerability scanner or a misbehaving device.", evidence: ["Firewall log: 100 SYN packets"], recommendation: "Verify with IT whether this is an approved scan." },
  },
];

// These stay fixed placeholders (not derived from incidents) since nothing
// else in the mock tracks raw alert volume or resolution duration yet.
// const baseMockStats = {
//   alerts_today: 128, mttr_min: 14,
//   timeline: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"].map((hour, i) => ({ hour, alerts: [8, 15, 22, 31, 85, 40][i] })),
//   types: [
//     { type: "Brute Force", count: 214 }, { type: "Port Scan", count: 97 },
//     { type: "PowerShell", count: 31 }, { type: "Malware", count: 12 },
//   ],
// };

const baseMockStats = {
  alerts_today: 201, mttr_min: 14,
  timeline: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"].map((hour, i) => ({ hour, alerts: [8, 15, 22, 31, 85, 40][i] })),
  types: [
    { type: "Brute Force", count: 110 }, { type: "Port Scan", count: 56 },
    { type: "PowerShell", count: 24 }, { type: "Malware", count: 11 },
  ],
};
// open_incidents and critical_incidents are COMPUTED from the live incidents
// list every time stats are requested, so Approve/Reject on one page is
// reflected on the dashboard the next time it loads — the two never drift
// out of sync, which is the real-world behavior a live DB query gives you.
// function computeStats(): Stats {
//   const open = incidents.filter((i) => i.status !== "approved" && i.status !== "rejected").length;
//   const critical = incidents.filter((i) => i.severity === "critical" && i.status !== "approved" && i.status !== "rejected").length;
//   return { ...baseMockStats, open_incidents: open, critical_incidents: critical };
// }

// Last n ghanton ke labels, jaise ["16:00", "17:00", ..., "21:00"]
function lastHours(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(now.getHours() - (n - 1 - i));
    return `${String(d.getHours()).padStart(2, "0")}:00`;
  });
}

function computeStats(): Stats {
  const open = incidents.filter((i) => i.status !== "approved" && i.status !== "rejected").length;
  const critical = incidents.filter((i) => i.severity === "critical" && i.status !== "approved" && i.status !== "rejected").length;
  const counts = [8, 15, 22, 31, 85, 40];
  const timeline = lastHours(6).map((hour, i) => ({ hour, alerts: counts[i] }));
  return { ...baseMockStats, timeline, open_incidents: open, critical_incidents: critical };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const getStats = async (): Promise<Stats> => (MOCK ? computeStats() : call("/api/stats/overview"));
export const getIncidents = async (): Promise<Incident[]> => (MOCK ? incidents : call("/api/incidents"));
export const getIncident = async (id: number): Promise<Incident | undefined> =>
  MOCK ? incidents.find((i) => i.id === id) : call(`/api/incidents/${id}`);

export async function decide(id: number, decision: "approve" | "reject") {
  if (!MOCK) return call(`/api/incidents/${id}/${decision}`, { method: "POST" });
  const inc = incidents.find((i) => i.id === id);
  if (inc) inc.status = decision === "approve" ? "approved" : "rejected";
}

export function subscribeAlerts(onAlert: (a: Alert) => void): () => void {
  if (MOCK) {
    const types = ["SSH Brute Force", "Port Scan", "Suspicious PowerShell", "Malware Signature"];
    const sev: Severity[] = ["low", "medium", "high", "critical"];
    const t = setInterval(() => {
      onAlert({
        id: crypto.randomUUID().slice(0, 6), type: types[Math.floor(Math.random() * 4)],
        severity: sev[Math.floor(Math.random() * 4)],
        source_ip: `203.0.113.${Math.floor(Math.random() * 254)}`,
        timestamp: new Date().toISOString(), incident_id: [42, 43, 44][Math.floor(Math.random() * 3)],
      });
    }, 4000);
    return () => clearInterval(t);
  }
  const ws = new WebSocket(WS);
  ws.onmessage = (e) => onAlert(JSON.parse(e.data));
  return () => ws.close();
}

export type AnalystReply = { answer: string; evidence: string[]; incident_id?: number };

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

export async function askAnalyst(question: string): Promise<AnalystReply> {
  if (!MOCK) {
    return call("/api/analyst/ask", { method: "POST", body: JSON.stringify({ question }) });
  }
  await new Promise((r) => setTimeout(r, 700)); // thinking delay

  const q = question.toLowerCase();
  const inc = incidents.find((i) => q.includes(`#${i.id}`) || q.includes(`incident ${i.id}`));

  if (inc) {
    if (has(q, ["recommend", "action", "respond", "block", "should we", "what to do"])) {
      return { answer: `Recommended action for incident #${inc.id}: ${inc.ai.recommendation}`, evidence: inc.ai.evidence, incident_id: inc.id };
    }
    if (has(q, ["mitre", "technique", "tactic"])) {
      return { answer: `Incident #${inc.id} maps to ${inc.mitre.length} MITRE ATT&CK technique(s).`, evidence: inc.mitre, incident_id: inc.id };
    }
    if (has(q, ["asset", "affected", "host", "user", "impact"])) {
      return { answer: `Incident #${inc.id} affects: ${inc.assets.join(", ")}.`, evidence: inc.timeline.map((t) => `${t.time} ${t.event}`), incident_id: inc.id };
    }
    if (has(q, ["timeline", "happened", "sequence", "when", "story"])) {
      return { answer: `Here is the sequence of events for incident #${inc.id}.`, evidence: inc.timeline.map((t) => `${t.time} ${t.event}`), incident_id: inc.id };
    }
    if (has(q, ["ip", "intel", "malicious", "reputation"])) {
      return {
        answer: inc.intel.length ? `Threat intelligence found ${inc.intel.length} known indicator(s) for incident #${inc.id}.` : `No known indicators for incident #${inc.id}.`,
        evidence: inc.intel.map((t) => `${t.ip}: ${t.verdict}, ${t.reports} reports`),
        incident_id: inc.id,
      };
    }
    if (has(q, ["evidence", "why", "proof"])) {
      return { answer: `Evidence supporting the analysis of incident #${inc.id}:`, evidence: inc.ai.evidence, incident_id: inc.id };
    }
    return { answer: `${inc.ai.summary} Risk score: ${inc.risk}/100.`, evidence: inc.ai.evidence, incident_id: inc.id };
  }

  const open = incidents.filter((i) => i.status !== "approved" && i.status !== "rejected");
  if (has(q, ["open", "pending", "awaiting", "approval"])) {
    return {
      answer: `There are ${open.length} open incident(s).`,
      evidence: open.map((i) => `#${i.id} [${i.severity}] ${i.title}`),
    };
  }
  if (has(q, ["critical", "highest", "worst", "priority", "urgent", "first"])) {
    const top = [...open].sort((a, b) => b.risk - a.risk)[0];
    if (top) {
      return { answer: `Highest priority: incident #${top.id} (risk ${top.risk}). ${top.ai.summary}`, evidence: top.ai.evidence, incident_id: top.id };
    }
    return { answer: "There are no open incidents right now.", evidence: [] };
  }

  return {
    answer: "I can help with a specific incident or with the overall queue. Try asking about an incident by number, for example “What happened in incident #42?”",
    evidence: [],
  };
}
