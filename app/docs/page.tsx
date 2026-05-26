"use client";

import { useState } from "react";

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-balance text-3xl font-semibold leading-tight">Arc Agent Starter Guide</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build on the dashboard, session-key primitive, x402 payment flow, and local policy checks.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Session Keys" code="useSessionKey().createSession(50, 30)" body="Create an ephemeral keypair with a budget and expiry window." />
        <Card title="x402 Payments" code="useX402Payment().fetchWithPayment('/api/paid-action')" body="Pay the 402 challenge, retry the request, and store the tx hash." />
        <Card title="Policy Checks" code="policyCheck(action, amount)" body="Block expired sessions, over-budget calls, unsafe actions, and large spends." />
      </section>

      <section className="panel space-y-3">
        <h2 className="text-xl font-semibold">Quickstart</h2>
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>git clone &lt;repo&gt;
cd arc-agent-starter
npm install
cp .env.example .env.local
npm run dev</code></pre>
      </section>

      <section className="panel space-y-3 text-sm text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">Build on top of this</h2>
        <ul className="space-y-2">
          <li>Add a persistence layer if you need shared state across sessions.</li>
          <li>Add your own policy rules before any risky agent action.</li>
          <li>Swap the in-memory register flow for your own backend when ready.</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ title, code, body }: { title: string; code: string; body: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="panel space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          type="button"
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => void handleCopy()}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"><code>{code}</code></pre>
      <p className="text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
