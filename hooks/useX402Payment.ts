"use client";

import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { Address, isAddress, parseAbi, parseUnits, zeroAddress } from "viem";

import { useSessionKey } from "@/hooks/useSessionKey";

type PaymentChallenge = {
  amount: number;
  recipient: string;
  token: string;
  message: string;
};

const erc20Abi = parseAbi([
  "function transfer(address to, uint256 value) returns (bool)",
]);

export function useX402Payment() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { session, spend, isExpired, isOverBudget, remainingBudget } = useSessionKey();
  const [phase, setPhase] = useState<"idle" | "waiting" | "402 received" | "paying" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const fetchWithPayment = async (url: string, init?: RequestInit) => {
    setPhase("waiting");
    const response = await fetch(url, init);

    if (response.status !== 402) {
      setPhase("success");
      return response;
    }

    setPhase("402 received");
    const challenge = (await response.json()) as PaymentChallenge;

    if (!session) {
      setPhase("error");
      throw new Error("Create a session key before paying.");
    }

    if (isExpired()) {
      setPhase("error");
      throw new Error("Session key has expired.");
    }

    if (isOverBudget(challenge.amount)) {
      setPhase("error");
      throw new Error("Session key budget is too small for this payment.");
    }

    if (!walletClient || !publicClient) {
      setPhase("error");
      throw new Error("Connect a wallet to approve the payment.");
    }

    const recipient = isAddress(challenge.recipient) ? challenge.recipient : zeroAddress;
    const token = isAddress(challenge.token) ? challenge.token : zeroAddress;

    setPhase("paying");
    const hash = await walletClient.writeContract({
      address: token as Address,
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipient as Address, parseUnits(String(challenge.amount), 6)],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    spend(challenge.amount);
    setTxHash(hash);

    const retryHeaders = new Headers(init?.headers);
    retryHeaders.set("X-Payment-Tx", hash);

    const retry = await fetch(url, {
      ...init,
      headers: retryHeaders,
    });

    setPhase("success");
    return retry;
  };

  return {
    fetchWithPayment,
    phase,
    txHash,
    session,
    remainingBudget: remainingBudget(),
  };
}