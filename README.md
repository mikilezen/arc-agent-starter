# arc-agent-starter

> React/Next.js + wagmi/viem starter kit for Arc builders.  
> Session keys + x402 client-side payments + policy enforcement — wired together and ready to fork.

Most Arc examples show you how to move USDC.  
This shows you how to decide **whether the agent should be allowed to move it at all** — then execute autonomously if it passes.

---

## What this is

A standalone starter kit built on top of the ArcOSS primitives emerging in the ecosystem — specifically the patterns around **agent accountability, staking, and autonomous execution**.

Clone it. Run it in 5 minutes. Strip what you don't need. Build your own agent on top.

---

## The loop

```
Agent Action Requested
        │
        ▼
  Policy Check ──── BLOCKED ──→ Violation logged (evidence hash)
        │
     ALLOWED
        │
        ▼
  Session Key Signs
        │
        ▼
  x402 Pays USDC on Arc
        │
        ▼
  Action Executes ✓
```


## Quickstart

```bash
git clone https://github.com/mikilezen/arc-agent-starter
cd arc-agent-starter
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`, connect a wallet on Arc testnet, run the demo.

---

## Environment variables

```bash
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_CHAIN_ID=5042002
```

Get test USDC: https://faucet.testnet.arc.network

---

## Stack

- Next.js 14 (App Router)
- TypeScript strict
- wagmi v2 + viem
- Tailwind CSS + shadcn/ui
- Arc testnet — EVM, USDC settlement

---

## The primitives

### 1. Session Keys — `hooks/useSessionKey.ts`

Temporary signing key so an agent acts autonomously within a USDC budget and time limit. No wallet popup per action.

```ts
const { createSession, spend, isExpired, remainingBudget } = useSessionKey()

// Agent gets $50 budget, 30 minute window
const session = createSession(50, 30)

// Check before every action
if (isExpired()) throw new Error('Session expired')
if (!spend(actionAmount)) throw new Error('Over budget')
```

### 2. x402 Client-Side Payments — `hooks/useX402Payment.ts`

When an agent hits a paid endpoint and gets a 402, this hook pays USDC on Arc and retries — no user interaction.

```ts
const { fetchWithPayment } = useX402Payment()

// Drop-in replacement for fetch()
const result = await fetchWithPayment('/api/paid-action', {
  method: 'POST',
  body: JSON.stringify({ action: 'arc.transfer_usdc', amount: 1 })
})

// What happens internally:
// 1. Request → endpoint
// 2. 402 received → parse { amount, recipient, token }
// 3. Check session budget
// 4. writeContract → ERC20 transfer on Arc
// 5. waitForTransactionReceipt
// 6. Retry with X-Payment-Tx: <txHash>
// 7. 200 ✓
```

### 3. Policy Check — `hooks/usePolicyCheck.ts`

Runs before anything executes. No external dependency — pure local logic you can extend.

```ts
const { check } = usePolicyCheck()

const result = check({ action: 'arc.transfer_usdc', amount: 25, session })

// result.allowed       → boolean
// result.reason        → string  
// result.severity      → 'low' | 'medium' | 'high'
// result.evidenceHash  → SHA-256(action + amount + timestamp)
```

Default rules:
- ✗ Session expired
- ✗ Amount exceeds remaining budget
- ✗ Amount > 500 USDC (trade limit)
- ✗ Action name contains `private_key` or `drain`
- ⚠ Amount > 100 USDC — warn, allow

Add your own rules directly in `hooks/usePolicyCheck.ts`.

### 4. Agent Execution Flow — `components/AgentExecutionFlow.tsx`

The hero component. Wires all three primitives into a step-by-step UI:

1. Create session key (budget + TTL)
2. Define action + amount
3. Policy check → ALLOWED or BLOCKED
4. If allowed → x402 pays → session key signs
5. Full audit trail displayed

---

## Project structure

```
arc-agent-starter/
├── app/
│   ├── page.tsx                     # Wallet connect + overview
│   ├── demo/page.tsx                # Full interactive demo
│   └── api/
│       ├── paid-action/route.ts     # Mock x402 endpoint
│       └── policy-check/route.ts   # Policy check endpoint
├── components/
│   ├── SessionKeyPanel.tsx
│   ├── X402PaymentDemo.tsx
│   ├── PolicyCheckDemo.tsx
│   └── AgentExecutionFlow.tsx       # Full loop wired together
├── hooks/
│   ├── useSessionKey.ts
│   ├── useX402Payment.ts
│   └── usePolicyCheck.ts
├── lib/
│   ├── arc.ts                       # Arc testnet chain config
│   └── wagmi.ts                     # wagmi setup
└── .env.example
```

---

## Build on top of this

**Add persistent violation logging**  
Replace in-memory state with Supabase. Insert to a `violations` table on every blocked action.

**Add onchain slashing**  
Wire the AgentCourt SDK to record violations onchain. Agents with bad records lose staked USDC.

```bash
npm i agentcourt
```

```ts
import { AgentCourt } from 'agentcourt'
const court = new AgentCourt({ agentId: 'your-agent-id' })
await court.reportViolation({ action, amount, evidenceHash })
```

**Add yield routing**  
Route idle session budget USDC to a yield source between actions.

**Add escrow**  
Hold USDC until the agent completes a task. Release on success, slash on failure.

**Add your own policy rules**  
Open `hooks/usePolicyCheck.ts`, add cases to `check()`. Rate limits, allowlists, multi-sig thresholds — any logic you need.

---

## Related

- [agentcourt-arc](https://github.com/mikilezen/Agentcourt-arc) — full onchain reputation dashboard built on these primitives
- [agentcourt-sdk](https://github.com/mikilezen/agentcourt-sdk) — `npm i agentcourt` policy engine + onchain violation logging
- [Arc testnet docs](https://docs.arc.network)
- [Live demo](https://agentcourt-arc.vercel.app)

---

## License

MIT
````