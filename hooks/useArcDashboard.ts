"use client";

import { useSyncExternalStore } from "react";

import { INITIAL_AGENTS, INITIAL_VIOLATIONS } from "@/lib/demo-data";
import { Agent, Severity, Violation } from "@/lib/types";

type DashboardState = {
  agents: Agent[];
  violations: Violation[];
  walletAddress: string | null;
};

type AgentRegistration = {
  name: string;
  address: string;
  owner: string;
  summary: string;
  reputation?: number;
  stakedUsdc?: number;
};

type ViolationInput = {
  agentAddress: string;
  agentName?: string;
  reason: string;
  severity: Severity;
  slashAmount: number;
};

const listeners = new Set<() => void>();

const state: DashboardState = {
  agents: INITIAL_AGENTS.map((agent) => ({ ...agent })),
  violations: INITIAL_VIOLATIONS.map((violation) => ({ ...violation })),
  walletAddress: null,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot(): DashboardState {
  return {
    agents: state.agents.map((agent) => ({ ...agent })),
    violations: state.violations.map((violation) => ({ ...violation })),
    walletAddress: state.walletAddress,
  };
}

function recomputeStatus(violations: number): Agent["status"] {
  if (violations >= 8) return "slashed";
  if (violations >= 3) return "at-risk";
  return "active";
}

export function useArcDashboard() {
  const dashboard = useSyncExternalStore(subscribe, snapshot, snapshot);

  const registerAgent = (registration: AgentRegistration) => {
    const nextAgent: Agent = {
      address: registration.address,
      name: registration.name,
      owner: registration.owner,
      reputation: registration.reputation ?? 85,
      stakedUsdc: registration.stakedUsdc ?? 1000,
      violations: 0,
      status: "active",
      registeredAt: "just now",
      lastUpdated: "just now",
      summary: registration.summary,
    };

    state.agents = [nextAgent, ...state.agents];
    emit();
  };

  const reportViolation = (input: ViolationInput) => {
    const violation: Violation = {
      id: `vio-${Date.now()}`,
      agentAddress: input.agentAddress,
      agentName: input.agentName,
      reason: input.reason,
      severity: input.severity,
      reportedAt: "just now",
      txHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("")}`,
      slashAmount: input.slashAmount,
    };

    state.violations = [violation, ...state.violations];
    state.agents = state.agents.map((agent) => {
      if (agent.address !== input.agentAddress) return agent;

      const nextViolations = agent.violations + 1;
      return {
        ...agent,
        violations: nextViolations,
        status: recomputeStatus(nextViolations),
        lastUpdated: "just now",
      };
    });

    emit();
    return violation;
  };

  const updateWalletAddress = (walletAddress: string | null) => {
    state.walletAddress = walletAddress;
    emit();
  };

  return {
    ...dashboard,
    registerAgent,
    reportViolation,
    updateWalletAddress,
  };
}