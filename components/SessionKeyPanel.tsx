"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSessionKey } from "@/hooks/useSessionKey";

function formatCountdown(target: number) {
  const remaining = Math.max(0, target - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function SessionKeyPanel() {
  const { session, createSession, clearSession, remainingBudget, isExpired } = useSessionKey();
  const [budgetInput, setBudgetInput] = useState("50");
  const [durationInput, setDurationInput] = useState("30");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expiryLabel = useMemo(() => {
    if (!session) {
      return "No active session";
    }

    if (isExpired()) {
      return "Expired";
    }

    return `${formatCountdown(session.expiresAt)} remaining`;
  }, [isExpired, session, tick]);

  const budgetProgress = session ? Math.min(100, (session.spentUSDC / Math.max(1, session.budgetUSDC)) * 100) : 0;

  return (
    <section className="panel space-y-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Session Keys</h3>
        <p className="text-sm text-muted-foreground">
          Create an ephemeral keypair for a single agent task. The key lives only in React state.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted-foreground">Budget USDC</span>
          <input
            type="number"
            min="1"
            step="1"
            value={budgetInput}
            onChange={(event) => setBudgetInput(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Duration minutes</span>
          <input
            type="number"
            min="1"
            step="1"
            value={durationInput}
            onChange={(event) => setDurationInput(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            const budgetUSDC = Number(budgetInput);
            const ttlMinutes = Number(durationInput);
            if (!Number.isFinite(budgetUSDC) || budgetUSDC <= 0 || !Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
              return;
            }
            createSession(budgetUSDC, ttlMinutes);
          }}
        >
          Create Session Key
        </Button>
        <Button variant="secondary" onClick={() => clearSession()} disabled={!session}>
          Clear Session
        </Button>
      </div>

      {session ? (
        <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Session Address" value={session.address} mono />
            <Field label="Expiry" value={expiryLabel} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Budget usage</span>
              <span>{session.spentUSDC.toFixed(2)} / {session.budgetUSDC.toFixed(2)} USDC</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${budgetProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              Remaining budget: {remainingBudget().toFixed(2)} USDC
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No session key has been created yet.</p>
      )}
    </section>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${mono ? "font-mono break-all" : ""}`}>{value}</p>
    </div>
  );
}
