"use client";

import { useState } from "react";

import { AgentExecutionFlow } from "@/components/AgentExecutionFlow";
import { SessionKeyPanel } from "@/components/SessionKeyPanel";
import { X402Demo } from "@/components/X402Demo";

const tabs = [
  { id: "session-keys", label: "Session Keys" },
  { id: "x402-payments", label: "x402 Payments" },
  { id: "execution-flow", label: "Agent Execution Flow" },
] as const;

export function ArcPrimitivesDashboard() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("session-keys");

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-balance text-3xl font-semibold leading-tight">Arc Primitives</h1>
        <p className="text-sm text-muted-foreground">
          Session keys, x402 payments, and policy checks wired together in one place.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${activeTab === tab.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "session-keys" ? <SessionKeyPanel /> : null}
      {activeTab === "x402-payments" ? <X402Demo /> : null}
      {activeTab === "execution-flow" ? <AgentExecutionFlow /> : null}
    </section>
  );
}
