"use client";

import { useSyncExternalStore } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export type SessionKey = {
  privateKey: `0x${string}`;
  address: `0x${string}`;
  budgetUSDC: number;
  spentUSDC: number;
  expiresAt: number;
};

const listeners = new Set<() => void>();
const state: { session: SessionKey | null } = { session: null };

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return state.session;
}

export function useSessionKey() {
  const session = useSyncExternalStore(subscribe, snapshot, snapshot);

  const createSession = (budgetUSDC: number, ttlMinutes: number) => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    state.session = {
      privateKey,
      address: account.address,
      budgetUSDC,
      spentUSDC: 0,
      expiresAt: Date.now() + ttlMinutes * 60_000,
    };

    emit();
    return state.session;
  };

  const isExpired = () => {
    if (!state.session) return true;
    return Date.now() >= state.session.expiresAt;
  };

  const isOverBudget = (amount: number) => {
    if (!state.session) return true;
    return state.session.spentUSDC + amount > state.session.budgetUSDC;
  };

  const spend = (amount: number) => {
    if (!state.session || isExpired() || isOverBudget(amount)) return false;
    state.session = { ...state.session, spentUSDC: state.session.spentUSDC + amount };
    emit();
    return true;
  };

  const remainingBudget = () => {
    if (!state.session) return 0;
    return Math.max(0, state.session.budgetUSDC - state.session.spentUSDC);
  };

  const clearSession = () => {
    state.session = null;
    emit();
  };

  return {
    session,
    createSession,
    spend,
    isExpired,
    isOverBudget,
    remainingBudget,
    clearSession,
  };
}