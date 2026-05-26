"use client";

import { LeaderboardsClient } from "@/components/leaderboards-client";
import { useArcDashboard } from "@/hooks/useArcDashboard";

export default function LeaderboardsPage() {
  const { agents } = useArcDashboard();
  return <LeaderboardsClient agents={agents} />;
}
