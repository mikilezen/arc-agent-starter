"use client";

import { AgentsPageClient } from "@/components/agents-page-client";
import { useArcDashboard } from "@/hooks/useArcDashboard";

export default function AgentsPage() {
  const { agents } = useArcDashboard();
  return <AgentsPageClient initialAgents={agents} />;
}
