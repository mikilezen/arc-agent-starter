"use client";

import Link from "next/link";
import { ArrowRightIcon, DollarSign, FileWarning, Sparkles, Users } from "lucide-react";
import { useAccount } from "wagmi";

import { AgentsTable } from "@/components/agents-table";
import { RecentViolations } from "@/components/recent-violations";
import { Button } from "@/components/ui/button";
import { useArcDashboard } from "@/hooks/useArcDashboard";
import { Agent } from "@/lib/types";
import { StatCard } from "@/components/stat-card";

export function DemoFlowDashboard() {
  const { isConnected } = useAccount();
  const { agents, violations } = useArcDashboard();

  const stats = [
    {
      label: "Total Agents",
      value: `${agents.length}`,
      tone: "success" as const,
      delta: "in-memory starter state",
      icon: Users,
    },
    {
      label: "Total Staked",
      value: `${agents.reduce((sum, agent) => sum + agent.stakedUsdc, 0).toFixed(2)} USDC`,
      tone: "success" as const,
      icon: DollarSign,
    },
    {
      label: "Violations Reported",
      value: `${violations.length}`,
      tone: "warning" as const,
      delta: "live audit trail",
      icon: FileWarning,
    },
    {
      label: "Wallet Status",
      value: isConnected ? "Connected" : "Disconnected",
      tone: isConnected ? "success" as const : "warning" as const,
      icon: Sparkles,
    },
  ];

  const topAgents = [...agents].sort((left, right) => right.reputation - left.reputation).slice(0, 5);

  return (
    <>
      <section className="panel overflow-hidden">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_280px]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight md:text-5xl">
                Arc Agent Starter.
                <span className="block text-primary">Build agent flows with local policy and payment primitives.</span>
              </h1>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                Keep the dashboard, add session keys, pay-per-call x402 flows, and inspect the resulting audit trail.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/register">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Register an Agent
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/arc-primitives">
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                  Open Arc Primitives
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="grid h-[210px] w-[280px] place-items-center rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-accent/20 shadow-[0_0_80px_-10px_hsl(var(--primary)/0.3)]">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Arc</p>
                <p className="mt-2 text-3xl font-semibold">Starter Kit</p>
                <p className="mt-2 text-sm text-muted-foreground">Session keys + x402 payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} delta={stat.delta} tone={stat.tone} icon={stat.icon} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-0">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-xl font-semibold leading-snug">Top Agents</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/agents" className="text-primary">
                View all <ArrowRightIcon />
              </Link>
            </Button>
          </div>
          <div className="px-6 pb-6">
            <AgentsTable agents={topAgents as Agent[]} limit={5} />
          </div>
        </div>
        <RecentViolations violations={violations} />
      </section>
    </>
  );
}
