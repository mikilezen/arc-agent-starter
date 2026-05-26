"use client";

import { useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useArcDashboard } from "@/hooks/useArcDashboard";

export function RegisterForm() {
  const { registerAgent } = useArcDashboard();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState("");
  const [stake, setStake] = useState("1000");
  const [reputation, setReputation] = useState("85");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stakeValue = useMemo(() => Number(stake), [stake]);
  const reputationValue = useMemo(() => Number(reputation), [reputation]);

  const handleRegister = async () => {
    setFeedback(null);
    if (!name.trim() || !address.trim() || !owner.trim()) {
      setFeedback("Name, agent address, and owner address are required.");
      return;
    }

    setLoading(true);
    try {
      registerAgent({
        name: name.trim(),
        address: address.trim(),
        owner: owner.trim(),
        summary: summary.trim() || "Newly registered Arc agent.",
        stakedUsdc: Number.isFinite(stakeValue) ? stakeValue : 1000,
        reputation: Number.isFinite(reputationValue) ? reputationValue : 85,
      });
      setFeedback("Agent registered in starter-kit state.");
      setName("");
      setAddress("");
      setOwner("");
      setSummary("");
      setStake("1000");
      setReputation("85");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel">
      <h2 className="text-xl font-semibold">Register Agent</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a new Arc agent to the starter state. This does not touch a contract or backend.
      </p>

      <label className="mt-6 block">
        <span className="text-sm text-muted-foreground">Agent Name</span>
        <input className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Atlas" />
      </label>
      <label className="mt-4 block">
        <span className="text-sm text-muted-foreground">Agent Address</span>
        <input className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." />
      </label>
      <label className="mt-4 block">
        <span className="text-sm text-muted-foreground">Owner Address</span>
        <input className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="0x..." />
      </label>
      <label className="mt-4 block">
        <span className="text-sm text-muted-foreground">Summary</span>
        <textarea className="mt-2 min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="What does this agent do?" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="mt-4 block">
          <span className="text-sm text-muted-foreground">Stake USDC</span>
          <input className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" type="number" min="0" step="1" value={stake} onChange={(event) => setStake(event.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-muted-foreground">Reputation</span>
          <input className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" type="number" min="0" max="100" step="1" value={reputation} onChange={(event) => setReputation(event.target.value)} />
        </label>
      </div>

      {feedback ? <p className="mt-4 text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => void handleRegister()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
          {loading ? "Registering..." : "Register Agent"}
        </Button>
      </div>
    </form>
  );
}
