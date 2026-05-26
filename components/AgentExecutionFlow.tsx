"use client";

import { useMemo, useState } from "react";

import { SessionKeyPanel } from "@/components/SessionKeyPanel";
import { Button } from "@/components/ui/button";
import { useArcDashboard } from "@/hooks/useArcDashboard";
import { useX402Payment } from "@/hooks/useX402Payment";

type AuditRow = {
  id: string;
  action: string;
  amount: number;
  verdict: "ALLOWED" | "BLOCKED";
  reason: string;
  evidenceHash: string;
  txHash?: string;
  createdAt: string;
};

async function hashEvidence(action: string, amount: number, timestamp: number) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${action}|${amount}|${timestamp}`)
  );
  return `0x${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function formatTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AgentExecutionFlow() {
  const { session } = useArcDashboard();
  const { fetchWithPayment, phase, txHash } = useX402Payment();
  const [action, setAction] = useState("Review customer support bundle");
  const [amount, setAmount] = useState("1");
  const [auditTrail, setAuditTrail] = useState<AuditRow[]>([]);
  const [status, setStatus] = useState<string>("Idle");
  const [reason, setReason] = useState<string>("Run policy check to see a verdict.");
  const [evidenceHash, setEvidenceHash] = useState<string>("");

  const allowed = useMemo(() => {
    const numericAmount = Number(amount);
    if (!session) {
      return { verdict: "BLOCKED" as const, reason: "Create a session key first." };
    }
    if (Date.now() >= session.expiresAt) {
      return { verdict: "BLOCKED" as const, reason: "Session key is expired." };
    }
    if (Number.isFinite(numericAmount) && numericAmount > session.budgetUSDC - session.spentUSDC) {
      return { verdict: "BLOCKED" as const, reason: "Amount exceeds remaining session budget." };
    }
    if (Number.isFinite(numericAmount) && numericAmount > 500) {
      return { verdict: "BLOCKED" as const, reason: "Amount exceeds the 500 USDC policy ceiling." };
    }
    if (/private_key|drain/i.test(action)) {
      return { verdict: "BLOCKED" as const, reason: "Action contains a blocked sensitive term." };
    }
    return { verdict: "ALLOWED" as const, reason: "Policy checks passed." };
  }, [action, amount, session]);

  const runFlow = async () => {
    const numericAmount = Number(amount);
    const stamp = Date.now();
    const hash = await hashEvidence(action, numericAmount, stamp);
    setEvidenceHash(hash);

    if (allowed.verdict === "BLOCKED") {
      setReason(allowed.reason);
      setStatus("BLOCKED");
      setAuditTrail((rows) => [
        {
          id: hash,
          action,
          amount: numericAmount,
          verdict: "BLOCKED",
          reason: allowed.reason,
          evidenceHash: hash,
          createdAt: formatTimeLabel(),
        },
        ...rows,
      ]);
      return;
    }

    setReason(allowed.reason);
    setStatus("PAYING");

    const response = await fetchWithPayment("/api/paid-action", { method: "POST" });
    const payload = await response.json();

    setStatus("SUCCESS");
    setAuditTrail((rows) => [
      {
        id: hash,
        action,
        amount: numericAmount,
        verdict: "ALLOWED",
        reason: allowed.reason,
        evidenceHash: hash,
        txHash: payload.txHash ?? txHash ?? undefined,
        createdAt: formatTimeLabel(),
      },
      ...rows,
    ]);
  };

  return (
    <section className="space-y-6">
      <SessionKeyPanel />

      <section className="panel space-y-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Execution Policy Check</h3>
          <p className="text-sm text-muted-foreground">
            The action is checked locally before the paid call is allowed to proceed.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs text-muted-foreground">Action</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="Describe the agent action"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Amount USDC</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Policy verdict</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${allowed.verdict === "ALLOWED" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {allowed.verdict}
            </span>
            <span className="text-sm text-muted-foreground">{reason}</span>
          </div>
          <p className="mt-3 font-mono text-xs break-all text-muted-foreground">
            Evidence hash: {evidenceHash || "Pending policy check"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void runFlow()}>Run Execution Flow</Button>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Status: {status}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            x402 phase: {phase}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold">Audit Trail</h3>
          <p className="text-sm text-muted-foreground">This table mirrors the violations history style from the dashboard.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="w-12 px-4 py-3">#</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Evidence Hash</th>
                  <th className="px-4 py-3">Tx Hash</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.length ? auditTrail.map((row, index) => (
                  <tr key={row.id} className="table-row">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3">{row.action}</td>
                    <td className="px-4 py-3 font-mono">{row.amount.toFixed(2)} USDC</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.verdict === "ALLOWED" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {row.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs break-all">{row.evidenceHash}</td>
                    <td className="px-4 py-3 font-mono text-xs break-all">{row.txHash ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.createdAt}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={7}>
                      Run the flow to generate the first audit entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}
