import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDollarSign, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { useArcDashboard } from "@/hooks/useArcDashboard";
import { arcConfig } from "@/lib/arc";
import { navItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { address } = useAccount();
  const { agents, violations } = useArcDashboard();
  const totalStaked = agents.reduce((sum, agent) => sum + agent.stakedUsdc, 0);

  return (
    <aside className="flex h-full w-64 flex-col overflow-y-auto border-r border-border bg-background p-4 scrollbar-thin scrollbar-thumb-black">
      <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
        <Sparkles className="size-9 text-primary" aria-hidden="true" />
        <span>
          <span className="block text-md font-semibold text-card-foreground">
            Arc Agent <span className="text-primary">Starter</span>
          </span>
          <span className="block text-xs text-muted-foreground">Session keys, x402, and policy checks</span>
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "border border-primary/20 bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/15 hover:text-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" />
            <p className="text-xs text-muted-foreground">Arc Testnet</p>
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">Chain ID: {arcConfig.chainId}</p>
          <p className="mt-1 text-xs text-muted-foreground">Explorer: {arcConfig.blockExplorer}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CircleDollarSign className="size-5" aria-hidden="true" />
            <p className="text-xs">Starter metrics</p>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold">{totalStaked.toFixed(2)} USDC</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Agents: {agents.length}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Violations: {violations.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">Wallet: {address ? "connected" : "not connected"}</p>
        </div>

        <Button asChild variant="secondary">
          <Link href="/arc-primitives" onClick={onNavigate}>
            <Sparkles className="size-4" aria-hidden="true" />
            Explore Primitives
          </Link>
        </Button>
      </div>
    </aside>
  );
}
