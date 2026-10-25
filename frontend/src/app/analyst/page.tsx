"use client";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { askAnalyst } from "@/lib/api";
import { Panel } from "@/components/ui";

type Msg = {
  role: "user" | "analyst";
  text: string;
  evidence?: string[];
  incident_id?: number;
  error?: boolean;
};

const SUGGESTIONS = [
  "Which incident should I handle first?",
  "What happened in incident #42?",
  "What is the recommended action for #42?",
  "Show the MITRE techniques for #43",
  "Which incidents are awaiting approval?",
  "Which incidents did the model flag as false positive?",
];

const GREETING: Msg = {
  role: "analyst",
  text: "Hello. Ask me about any incident, for example its timeline, evidence, affected assets or recommended action.",
};

export default function Analyst() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await askAnalyst(q);
      setMessages((m) => [...m, { role: "analyst", text: r.answer, evidence: r.evidence, incident_id: r.incident_id }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "analyst", text: `Sorry, I could not process that request. ${e instanceof Error ? e.message : ""}`, error: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">AI analyst</h1>
        <p className="mono text-xs" style={{ color: "var(--muted)" }}>Answers are based on incident evidence</p>
      </div>

      <Panel>
        <div
          className="h-[calc(100vh-380px)] min-h-[320px] space-y-4 overflow-y-auto pr-1"
          role="log"
          aria-live="polite"
          aria-label="Conversation with the AI analyst"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] border px-3 py-2 text-sm"
                style={{
                  borderColor: m.error ? "var(--critical)" : m.role === "user" ? "var(--data)" : "var(--border)",
                  background: m.role === "user" ? "var(--panel-raised)" : "transparent",
                }}
              >
                <p className="leading-relaxed">{m.text}</p>

                {m.evidence && m.evidence.length > 0 && (
                  <>
                    <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>Evidence</p>
                    <ul className="mt-1 space-y-1">
                      {m.evidence.map((e) => (
                        <li key={e} className="mono text-xs">– {e}</li>
                      ))}
                    </ul>
                  </>
                )}

                {m.incident_id !== undefined && (
                  <Link
                    href={`/incidents/${m.incident_id}`}
                    className="mono mt-3 inline-block text-xs hover:underline"
                    style={{ color: "var(--data)" }}
                  >
                    Open incident #{m.incident_id} →
                  </Link>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="border px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                Analyzing…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => send(s)}
              className="border px-2.5 py-1 text-xs hover:bg-[var(--panel-raised)] disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-3 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about an incident…"
            aria-label="Your question"
            className="flex-1 border bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="border px-5 py-2 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Send
          </button>
        </form>
      </Panel>
    </div>
  );
}