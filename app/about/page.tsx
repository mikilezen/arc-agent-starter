export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-balance text-3xl font-semibold leading-tight">About Arc Agent Starter</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This starter kit keeps the full dashboard shell and adds session keys, x402 payments, and policy checks for Arc builders.
        </p>
      </header>
      <section className="panel space-y-3 text-sm text-muted-foreground">
        <p>Use it as a neutral starting point for agent workflows.</p>
        <p>All dashboard state lives in React memory, so it resets on reload.</p>
        <p>The wallet connect flow remains available through wagmi and viem.</p>
      </section>
    </div>
  );
}
