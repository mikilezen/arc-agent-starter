import { Agent, AgentStatus, Severity, Transaction, Violation } from "@/lib/types";

const now = Date.now();

export const INITIAL_AGENTS: Agent[] = [
  {
    address: "0x7A1e000000000000000000000000000000000001",
    name: "Atlas",
    owner: "0x1111000000000000000000000000000000000001",
    reputation: 96,
    stakedUsdc: 12450,
    violations: 1,
    status: "active" as AgentStatus,
    registeredAt: "2d ago",
    lastUpdated: "just now",
    summary: "Reliable general-purpose agent with a clean execution record.",
  },
  {
    address: "0x7A1e000000000000000000000000000000000002",
    name: "Beacon",
    owner: "0x1111000000000000000000000000000000000002",
    reputation: 91,
    stakedUsdc: 9800,
    violations: 2,
    status: "active" as AgentStatus,
    registeredAt: "5d ago",
    lastUpdated: "4h ago",
    summary: "Observation agent used for market monitoring and alerts.",
  },
  {
    address: "0x7A1e000000000000000000000000000000000003",
    name: "Cipher",
    owner: "0x1111000000000000000000000000000000000003",
    reputation: 78,
    stakedUsdc: 5300,
    violations: 4,
    status: "at-risk" as AgentStatus,
    registeredAt: "1w ago",
    lastUpdated: "12m ago",
    summary: "Policy-aware automation agent with a few recent warnings.",
  },
  {
    address: "0x7A1e000000000000000000000000000000000004",
    name: "Drift",
    owner: "0x1111000000000000000000000000000000000004",
    reputation: 67,
    stakedUsdc: 2200,
    violations: 7,
    status: "at-risk" as AgentStatus,
    registeredAt: "2w ago",
    lastUpdated: "8h ago",
    summary: "Exploratory agent with a narrower operating envelope.",
  },
  {
    address: "0x7A1e000000000000000000000000000000000005",
    name: "Echo",
    owner: "0x1111000000000000000000000000000000000005",
    reputation: 55,
    stakedUsdc: 600,
    violations: 9,
    status: "slashed" as AgentStatus,
    registeredAt: "3w ago",
    lastUpdated: "just now",
    summary: "Legacy agent kept for testing violation and slashing flows.",
  },
];

export const INITIAL_VIOLATIONS: Violation[] = [
  {
    id: "vio-1",
    agentAddress: INITIAL_AGENTS[2].address,
    agentName: INITIAL_AGENTS[2].name,
    reason: "Requested a transfer above its approved budget.",
    severity: "medium" as Severity,
    reportedAt: `${Math.max(1, Math.round((now - 12 * 60 * 1000) / 1000))}m ago`,
    txHash: "0x9f3b000000000000000000000000000000000001",
    slashAmount: 50,
  },
  {
    id: "vio-2",
    agentAddress: INITIAL_AGENTS[4].address,
    agentName: INITIAL_AGENTS[4].name,
    reason: "Attempted to expose sensitive runtime state.",
    severity: "high" as Severity,
    reportedAt: "1h ago",
    txHash: "0x9f3b000000000000000000000000000000000002",
    slashAmount: 100,
  },
  {
    id: "vio-3",
    agentAddress: INITIAL_AGENTS[3].address,
    agentName: INITIAL_AGENTS[3].name,
    reason: "Exceeded the recommended action threshold.",
    severity: "low" as Severity,
    reportedAt: "4h ago",
    txHash: "0x9f3b000000000000000000000000000000000003",
    slashAmount: 10,
  },
];

export function fetchAgents(): Promise<Agent[]> {
  return Promise.resolve(INITIAL_AGENTS.map((agent) => ({ ...agent })));
}

export function fetchAgentById(id: string): Promise<Agent | null> {
  return Promise.resolve(INITIAL_AGENTS.find((agent) => agent.address === decodeURIComponent(id)) ?? null);
}

export function fetchViolations(): Promise<Violation[]> {
  return Promise.resolve(INITIAL_VIOLATIONS.map((violation) => ({ ...violation })));
}

export function fetchViolationsByAgent(agentId: string): Promise<Violation[]> {
  const decoded = decodeURIComponent(agentId);
  return Promise.resolve(INITIAL_VIOLATIONS.filter((violation) => violation.agentAddress === decoded).map((violation) => ({ ...violation })));
}

export function buildTransactionsFromViolations(violations: Violation[]): Transaction[] {
  return violations
    .filter((violation) => Boolean(violation.txHash))
    .map((violation) => ({
      hash: violation.txHash,
      agentAddress: violation.agentAddress,
      type: "Slash",
      value: violation.slashAmount,
      time: violation.reportedAt,
    }));
}
