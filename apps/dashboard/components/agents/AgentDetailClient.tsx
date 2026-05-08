"use client";

import { useState } from "react";
import { AgentHeader } from "./AgentHeader";
import { AgentActivityCard } from "./AgentActivityCard";
import { AgentConnectionsCard } from "./AgentConnectionsCard";
import { AgentPoliciesCard } from "./AgentPoliciesCard";
import { AgentReasoningCard } from "./AgentReasoningCard";
import { AgentChatPanel, type ChatMessage } from "./AgentChatPanel";
import { Tabs } from "./Tabs";
import { runScript } from "@/lib/agent-chat-script";
import type { AgentDetail } from "@/lib/types";

export function AgentDetailClient({ initialAgent }: { initialAgent: AgentDetail }) {
  const [agent, setAgent] = useState<AgentDetail>(initialAgent);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };
    const { reply, next } = runScript(text, agent);
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      text: reply,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (next) setAgent(next);
  };

  return (
    <>
      <AgentHeader agent={agent} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 18,
          alignItems: "flex-start"
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <Tabs
            height={540}
            tabs={[
              {
                id: "activity",
                label: "Activity",
                count: agent.activity.length,
                content: <AgentActivityCard items={agent.activity} />
              },
              {
                id: "connections",
                label: "Connected systems",
                count: agent.connections.length,
                content: <AgentConnectionsCard connections={agent.connections} />
              },
              {
                id: "reasoning",
                label: "Reasoning",
                count: agent.reasoning.length,
                content: (
                  <AgentReasoningCard reasoning={agent.reasoning} activity={agent.activity} />
                )
              },
              {
                id: "guardrails",
                label: "Guardrails",
                count: agent.policies.length,
                content: <AgentPoliciesCard policies={agent.policies} />
              }
            ]}
          />
        </div>
        <div style={{ width: "min(360px, 100%)", flexShrink: 0 }}>
          <AgentChatPanel messages={messages} onSend={handleSend} />
        </div>
      </div>
    </>
  );
}
