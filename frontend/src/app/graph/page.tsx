// "use client";
// import "@xyflow/react/dist/style.css";
// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// // import { Background, Controls, Edge, Node, Position, ReactFlow } from "@xyflow/react";
// import { Background, Controls, Edge, MarkerType, Node, Position, ReactFlow } from "@xyflow/react";
// import { Incident, Severity, getIncidents } from "@/lib/api";
// import { Notice, Panel, Skeleton } from "@/components/ui";

// const SEV_COLOR: Record<Severity, string> = {
//   critical: "var(--critical)",
//   high: "var(--high)",
//   medium: "var(--medium)",
//   low: "var(--low)",
// };
// const SEV_HEX: Record<Severity, string> = {
//   critical: "#FF5C72",
//   high: "#FF9A3C",
//   medium: "#F5D547",
//   low: "#5B9BD5",
// };
// const COL_X = { ip: 0, incident: 340, target: 700 };
// const ROW_GAP = 96;

// function nodeStyle(color: string, width: number) {
//   return {
//     width,
//     background: "var(--panel)",
//     color: "var(--text)",
//     border: `1px solid ${color}`,
//     borderRadius: 2,
//     padding: "8px 10px",
//     fontSize: 12,
//   };
// }

// function buildGraph(incidents: Incident[]): { nodes: Node[]; edges: Edge[] } {
//   const ips = new Map<string, string>();
//   const targets = new Map<string, { label: string; kind: "host" | "user" }>();
//   const edges: Edge[] = [];

//   for (const inc of incidents) {
//     const incId = `inc:${inc.id}`;
//     const color = SEV_COLOR[inc.severity];
//     const hot = inc.severity === "critical";

//     for (const t of inc.intel) {
//       ips.set(`ip:${t.ip}`, t.ip);
//     //   edges.push({
//     //     id: `e:${t.ip}:${incId}`,
//     //     source: `ip:${t.ip}`,
//     //     target: incId,
//     //     animated: hot,
//     //     style: { stroke: color },
//     //   });

//         const hex = SEV_HEX[inc.severity];

//     for (const t of inc.intel) {
//       ips.set(`ip:${t.ip}`, t.ip);
//       edges.push({
//         id: `e:${t.ip}:${incId}`,
//         source: `ip:${t.ip}`,
//         target: incId,
//         animated: hot,
//         style: { stroke: color },
//         markerEnd: { type: MarkerType.ArrowClosed, color: hex },
//       });
//     }

//     for (const a of inc.assets) {
//       const isUser = a.startsWith("user:");
//       const label = isUser ? a.replace("user:", "").trim() : a;
//       const id = `${isUser ? "user" : "host"}:${label}`;
//       targets.set(id, { label, kind: isUser ? "user" : "host" });
//       edges.push({
//         id: `e:${incId}:${id}`,
//         source: incId,
//         target: id,
//         animated: hot,
//         style: { stroke: color },
//         markerEnd: { type: MarkerType.ArrowClosed, color: hex },
//       });
//     }
//     }

//     for (const a of inc.assets) {
//       const isUser = a.startsWith("user:");
//       const label = isUser ? a.replace("user:", "").trim() : a;
//       const id = `${isUser ? "user" : "host"}:${label}`;
//       targets.set(id, { label, kind: isUser ? "user" : "host" });
//     //   edges.push({
//     //     id: `e:${incId}:${id}`,
//     //     source: incId,
//     //     target: id,
//     //     animated: hot,
//     //     style: { stroke: color },
//     //   });
//         const hex = SEV_HEX[inc.severity];

//     for (const t of inc.intel) {
//       ips.set(`ip:${t.ip}`, t.ip);
//       edges.push({
//         id: `e:${t.ip}:${incId}`,
//         source: `ip:${t.ip}`,
//         target: incId,
//         animated: hot,
//         style: { stroke: color },
//         markerEnd: { type: MarkerType.ArrowClosed, color: hex },
//       });
//     }

//     for (const a of inc.assets) {
//       const isUser = a.startsWith("user:");
//       const label = isUser ? a.replace("user:", "").trim() : a;
//       const id = `${isUser ? "user" : "host"}:${label}`;
//       targets.set(id, { label, kind: isUser ? "user" : "host" });
//       edges.push({
//         id: `e:${incId}:${id}`,
//         source: incId,
//         target: id,
//         animated: hot,
//         style: { stroke: color },
//         markerEnd: { type: MarkerType.ArrowClosed, color: hex },
//       });
//     }
//     }
//   }

//   const rows = Math.max(ips.size, incidents.length, targets.size, 1);
//   const height = rows * ROW_GAP;
//   const offset = (count: number) => (height - count * ROW_GAP) / 2;

//   const nodes: Node[] = [];

//   [...ips.entries()].forEach(([id, label], i) => {
//     nodes.push({
//       id,
//       position: { x: COL_X.ip, y: offset(ips.size) + i * ROW_GAP },
//       data: { label: `Attacker IP\n${label}` },
//       style: { ...nodeStyle("var(--critical)", 170), whiteSpace: "pre-line", fontFamily: "var(--font-mono, monospace)" },
//       sourcePosition: Position.Right,
//       targetPosition: Position.Left,
//     });
//   });

//   incidents.forEach((inc, i) => {
//     nodes.push({
//       id: `inc:${inc.id}`,
//       position: { x: COL_X.incident, y: offset(incidents.length) + i * ROW_GAP },
//       data: { label: `Incident #${inc.id} · ${inc.severity}\n${inc.title}` },
//       style: { ...nodeStyle(SEV_COLOR[inc.severity], 240), whiteSpace: "pre-line", cursor: "pointer" },
//       sourcePosition: Position.Right,
//       targetPosition: Position.Left,
//     });
//   });

//   [...targets.entries()].forEach(([id, t], i) => {
//     nodes.push({
//       id,
//       position: { x: COL_X.target, y: offset(targets.size) + i * ROW_GAP },
//       data: { label: `${t.kind === "user" ? "User" : "Host"}\n${t.label}` },
//       style: {
//         ...nodeStyle(t.kind === "user" ? "var(--medium)" : "var(--data)", 170),
//         whiteSpace: "pre-line",
//         fontFamily: "var(--font-mono, monospace)",
//       },
//       sourcePosition: Position.Right,
//       targetPosition: Position.Left,
//     });
//   });

//   return { nodes, edges };
// }

// const LEGEND = [
//   { color: "var(--critical)", label: "Attacker IP" },
//   { color: "var(--high)", label: "Incident (border = severity)" },
//   { color: "var(--data)", label: "Host" },
//   { color: "var(--medium)", label: "User" },
// ];

// export default function AttackGraph() {
//   const router = useRouter();
//   const [list, setList] = useState<Incident[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     getIncidents()
//       .then((d) => setList([...d]))
//       .catch((e) => setError(e instanceof Error ? e.message : "Failed to load graph data"))
//       .finally(() => setLoading(false));
//   }, []);

//   const { nodes, edges } = useMemo(() => buildGraph(list), [list]);

//   return (
//     <div className="space-y-4">
//       <div>
//         <h1 className="text-xl font-semibold">Attack graph</h1>
//         <p className="mono text-xs" style={{ color: "var(--muted)" }}>
//           {loading ? "Loading…" : `${nodes.length} entities · ${edges.length} relationships`}
//         </p>
//       </div>

//       <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--muted)" }}>
//         {LEGEND.map((l) => (
//           <span key={l.label} className="inline-flex items-center gap-1.5">
//             <span className="h-2 w-2 rounded-full" style={{ background: l.color }} aria-hidden="true" />
//             {l.label}
//           </span>
//         ))}
//       </div>

//       {error ? (
//         <Panel><Notice kind="error">Could not load graph: {error}</Notice></Panel>
//       ) : loading ? (
//         <Skeleton className="h-[560px]" />
//       ) : nodes.length === 0 ? (
//         <Panel><Notice>No entities to display yet.</Notice></Panel>
//       ) : (
//         // <div className="h-[560px] border" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
//         //   <ReactFlow
//         //     nodes={nodes}
//         //     edges={edges}
//         //     colorMode="dark"
//         //     fitView
//         //     fitViewOptions={{ padding: 0.2 }}
//         //     nodesConnectable={false}
//         //     onNodeClick={(_, node) => {
//         //       if (node.id.startsWith("inc:")) router.push(`/incidents/${node.id.replace("inc:", "")}`);
//         //     }}
//         //   >

//                 <div className="h-[calc(100vh-300px)] min-h-[440px] border" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             colorMode="dark"
//             style={{ background: "var(--panel)" }}
//             fitView
//             fitViewOptions={{ padding: 0.2 }}
//             nodesConnectable={false}
//             onNodeClick={(_, node) => {
//               if (node.id.startsWith("inc:")) router.push(`/incidents/${node.id.replace("inc:", "")}`);
//             }}
//           >
//             <Background color="var(--border)" gap={24} />
//             <Controls showInteractive={false} />
//           </ReactFlow>
//         </div>
//       )}
//       <p className="text-xs" style={{ color: "var(--muted)" }}>
//         Click an incident to open its details. Drag nodes to rearrange, scroll to zoom.
//       </p>
//     </div>
//   );
// }

"use client";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background, Controls, Edge, MarkerType, Node, Position, ReactFlow } from "@xyflow/react";
import { Incident, Severity, getIncidents } from "@/lib/api";
import { Notice, Panel, Skeleton } from "@/components/ui";

const SEV_COLOR: Record<Severity, string> = {
  critical: "var(--critical)",
  high: "var(--high)",
  medium: "var(--medium)",
  low: "var(--low)",
};

// Arrow markers need real hex colours (CSS variables don't work inside SVG markers)
const SEV_HEX: Record<Severity, string> = {
  critical: "#FF5C72",
  high: "#FF9A3C",
  medium: "#F5D547",
  low: "#5B9BD5",
};

const COL_X = { ip: 0, incident: 340, target: 700 };
const ROW_GAP = 96;

function nodeStyle(color: string, width: number) {
  return {
    width,
    background: "var(--panel)",
    color: "var(--text)",
    border: `1px solid ${color}`,
    borderRadius: 2,
    padding: "8px 10px",
    fontSize: 12,
  };
}

function buildGraph(incidents: Incident[]): { nodes: Node[]; edges: Edge[] } {
  const ips = new Map<string, string>();
  const targets = new Map<string, { label: string; kind: "host" | "user" }>();
  // Keyed by edge id, so the same edge can never be added twice
  const edgeMap = new Map<string, Edge>();

  // Duplicate incidents (same id) are ignored
  const unique = [...new Map(incidents.map((i) => [i.id, i])).values()];

  for (const inc of unique) {
    const incId = `inc:${inc.id}`;
    const color = SEV_COLOR[inc.severity];
    const hex = SEV_HEX[inc.severity];
    const hot = inc.severity === "critical";

    for (const t of inc.intel) {
      const id = `e:${t.ip}:${incId}`;
      ips.set(`ip:${t.ip}`, t.ip);
      edgeMap.set(id, {
        id,
        source: `ip:${t.ip}`,
        target: incId,
        animated: hot,
        style: { stroke: color },
        markerEnd: { type: MarkerType.ArrowClosed, color: hex },
      });
    }

    for (const a of inc.assets) {
      const isUser = a.startsWith("user:");
      const label = isUser ? a.replace("user:", "").trim() : a;
      const targetId = `${isUser ? "user" : "host"}:${label}`;
      const id = `e:${incId}:${targetId}`;
      targets.set(targetId, { label, kind: isUser ? "user" : "host" });
      edgeMap.set(id, {
        id,
        source: incId,
        target: targetId,
        animated: hot,
        style: { stroke: color },
        markerEnd: { type: MarkerType.ArrowClosed, color: hex },
      });
    }
  }

  const rows = Math.max(ips.size, unique.length, targets.size, 1);
  const height = rows * ROW_GAP;
  const offset = (count: number) => (height - count * ROW_GAP) / 2;

  const nodes: Node[] = [];

  [...ips.entries()].forEach(([id, label], i) => {
    nodes.push({
      id,
      position: { x: COL_X.ip, y: offset(ips.size) + i * ROW_GAP },
      data: { label: `Attacker IP\n${label}` },
      style: { ...nodeStyle("var(--critical)", 170), whiteSpace: "pre-line", fontFamily: "var(--font-mono, monospace)" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  unique.forEach((inc, i) => {
    nodes.push({
      id: `inc:${inc.id}`,
      position: { x: COL_X.incident, y: offset(unique.length) + i * ROW_GAP },
      data: { label: `Incident #${inc.id} · ${inc.severity}\n${inc.title}` },
      style: { ...nodeStyle(SEV_COLOR[inc.severity], 240), whiteSpace: "pre-line", cursor: "pointer" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  [...targets.entries()].forEach(([id, t], i) => {
    nodes.push({
      id,
      position: { x: COL_X.target, y: offset(targets.size) + i * ROW_GAP },
      data: { label: `${t.kind === "user" ? "User" : "Host"}\n${t.label}` },
      style: {
        ...nodeStyle(t.kind === "user" ? "var(--medium)" : "var(--data)", 170),
        whiteSpace: "pre-line",
        fontFamily: "var(--font-mono, monospace)",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  return { nodes, edges: [...edgeMap.values()] };
}

const LEGEND = [
  { color: "var(--critical)", label: "Attacker IP" },
  { color: "var(--high)", label: "Incident (border = severity)" },
  { color: "var(--data)", label: "Host" },
  { color: "var(--medium)", label: "User" },
];

export default function AttackGraph() {
  const router = useRouter();
  const [list, setList] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getIncidents()
      .then((d) => setList([...d]))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load graph data"))
      .finally(() => setLoading(false));
  }, []);

  const { nodes, edges } = useMemo(() => buildGraph(list), [list]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Attack graph</h1>
        <p className="mono text-xs" style={{ color: "var(--muted)" }}>
          {loading ? "Loading…" : `${nodes.length} entities · ${edges.length} relationships`}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--muted)" }}>
        {LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} aria-hidden="true" />
            {l.label}
          </span>
        ))}
      </div>

      {error ? (
        <Panel><Notice kind="error">Could not load graph: {error}</Notice></Panel>
      ) : loading ? (
        <Skeleton className="h-[560px]" />
      ) : nodes.length === 0 ? (
        <Panel><Notice>No entities to display yet.</Notice></Panel>
      ) : (
        <div
          className="h-[calc(100vh-300px)] min-h-[440px] border"
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            colorMode="dark"
            // style={{ background: "var(--panel)" }}
            style={{ "--xy-background-color": "var(--panel)" } as React.CSSProperties}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesConnectable={false}
            onNodeClick={(_, node) => {
              if (node.id.startsWith("inc:")) router.push(`/incidents/${node.id.replace("inc:", "")}`);
            }}
          >
            <Background color="var(--border)" gap={24} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Click an incident to open its details. Drag nodes to rearrange, scroll to zoom.
      </p>
    </div>
  );
}