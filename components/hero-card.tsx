import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroCard() {
  return (
    <section className="panel overflow-hidden">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight md:text-5xl">
              Build agent systems on Arc.
            </h1>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Use the starter dashboard to explore session keys, x402 payments, and policy enforcement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">
                <Sparkles className="size-4" aria-hidden="true" />
                Register Your Agent
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/arc-primitives">
                <Search className="size-4" aria-hidden="true" />
                Explore Primitives
              </Link>
            </Button>
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          <div className="grid h-[210px] w-[280px] place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-background to-accent/20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Arc</p>
              <p className="mt-2 text-3xl font-semibold">Starter Kit</p>
              <p className="mt-2 text-sm text-muted-foreground">Full dashboard shell included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
