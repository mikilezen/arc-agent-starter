"use client";

import { ViolationsPageClient } from "@/components/violations-page-client";
import { useArcDashboard } from "@/hooks/useArcDashboard";

export default function ViolationsPage() {
  const { violations } = useArcDashboard();
  return <ViolationsPageClient violations={violations} />;
}
