"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useX402Payment } from "@/hooks/useX402Payment";

export function X402Demo() {
  const { fetchWithPayment, phase, txHash } = useX402Payment();
  const [message, setMessage] = useState<string>("");

  const handleCall = async () => {
    setMessage("");
    try {
      const response = await fetchWithPayment("/api/paid-action", { method: "POST" });
      const data = await response.json();
      setMessage(data.success ? `Paid action completed. txHash ${data.txHash ?? txHash ?? "pending"}` : "Unexpected response.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment flow failed.");
    }
  };

  return (
    <section className="panel space-y-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">x402 Payments</h3>
        <p className="text-sm text-muted-foreground">
          Trigger a paid action. The client receives a 402 challenge, pays with the wallet, and retries with a payment header.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCall}>Call Paid Agent Action</Button>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          Status: {phase}
        </span>
      </div>

      {txHash ? <p className="font-mono text-xs text-muted-foreground break-all">Payment txHash: {txHash}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
