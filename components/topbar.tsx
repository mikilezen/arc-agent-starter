"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Menu, PlugZap, Wallet } from "lucide-react";

import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi";

import { Button } from "@/components/ui/button";
import { useArcDashboard } from "@/hooks/useArcDashboard";
import { truncateAddress } from "@/lib/format";

function walletErrorMessage(caughtError: unknown) {
  const message = caughtError instanceof Error ? caughtError.message : String(caughtError);
  const cause =
    caughtError instanceof Error && caughtError.cause instanceof Error
      ? caughtError.cause.message
      : "";
  const combined = `${message} ${cause}`;

  if (
    combined.includes("MetaMask extension not found") ||
    combined.includes("Failed to connect to MetaMask") ||
    combined.includes("Connector not found") ||
    combined.includes("Provider not found")
  ) {
    return "The browser wallet is not available. Unlock it, refresh, or use another connector.";
  }

  if (combined.includes("User rejected") || combined.includes("rejected")) {
    return "Connection request was rejected in the wallet.";
  }

  return "Connection failed. Try again from the wallet menu.";
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const connectRef = useRef<HTMLDivElement | null>(null);
  const { updateWalletAddress } = useArcDashboard();

  useEffect(() => {
    updateWalletAddress(isConnected && address ? address : null);
  }, [address, isConnected, updateWalletAddress]);

  useEffect(() => {
    if (!menuOpen && !connectOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (connectRef.current && !connectRef.current.contains(event.target)) {
        setConnectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [connectOpen, menuOpen]);

  const displayedConnectors = useMemo(() => {
    if (connectors.length <= 1) {
      return connectors;
    }

    const hasSpecific = connectors.some((connector) => connector.id !== "injected");
    return hasSpecific ? connectors.filter((connector) => connector.id !== "injected") : connectors;
  }, [connectors]);

  const connectWalletByConnector = async (connector: Connector) => {
    setError(null);
    connect(
      { connector },
      {
        onSuccess: () => {
          setConnectOpen(false);
        },
        onError: (caughtError) => {
          setError(walletErrorMessage(caughtError));
        },
      }
    );
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectAsync();
      updateWalletAddress(null);
      setMenuOpen(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <div className="hidden md:block">
            <p className="text-xs text-muted-foreground">Arc Agent Starter</p>
            <p className="font-medium">Dashboard and primitives</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error ? <p className="hidden max-w-xs text-xs text-destructive md:block">{error}</p> : null}
          {isConnected && address ? (
            <div className="relative" ref={menuRef}>
              <Button variant="secondary" onClick={() => setMenuOpen((value) => !value)}>
                <Wallet className="size-4" aria-hidden="true" />
                {truncateAddress(address)}
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
              {menuOpen ? (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs text-muted-foreground">Connected wallet</p>
                  <p className="px-3 py-1 font-mono text-sm">{truncateAddress(address, 8, 6)}</p>
                  <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleDisconnect()}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative" ref={connectRef}>
              <Button variant="secondary" onClick={() => setConnectOpen((value) => !value)} disabled={isConnecting}>
                <PlugZap className="size-4" aria-hidden="true" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
              {connectOpen ? (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs text-muted-foreground">Choose a wallet</p>
                  {displayedConnectors.map((connector) => (
                    <button
                      key={connector.id}
                      className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => void connectWalletByConnector(connector)}
                    >
                      {connector.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
