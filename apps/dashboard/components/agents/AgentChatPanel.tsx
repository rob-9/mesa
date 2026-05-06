"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string; // ISO-8601
}

export function AgentChatPanel({
  messages,
  onSend
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)",
        display: "flex",
        flexDirection: "column",
        height: 540,
        minWidth: 0
      }}
    >
      {/* header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--surface-2)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--fg-5)", letterSpacing: "0.06em" }}>
          NATURAL LANGUAGE
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>Configure with chat</div>
      </div>

      {/* message list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        {messages.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--fg-5)", lineHeight: 1.5 }}>
            Try: <span style={{ color: "var(--fg-3)" }}>raise the spend cap to $500k</span>,{" "}
            <span style={{ color: "var(--fg-3)" }}>add Snowflake</span>, or{" "}
            <span style={{ color: "var(--fg-3)" }}>set daily cap to 20</span>.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "8px 12px",
              borderRadius: 10,
              background: m.role === "user" ? "var(--surface-3)" : "var(--surface-2)",
              color: "var(--fg-1)",
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap"
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={submit}
        style={{
          padding: 12,
          borderTop: "1px solid var(--surface-2)",
          display: "flex",
          gap: 8
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell the agent what to change…"
          style={{
            flex: 1,
            height: 32,
            padding: "0 10px",
            background: "var(--surface-0)",
            border: "1px solid var(--surface-2)",
            borderRadius: 8,
            color: "var(--fg-1)",
            fontSize: 12,
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          style={{
            height: 32,
            padding: "0 14px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            borderRadius: "var(--r-pill)",
            fontSize: 12,
            fontWeight: 500,
            cursor: draft.trim() ? "pointer" : "default",
            opacity: draft.trim() ? 1 : 0.5
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
