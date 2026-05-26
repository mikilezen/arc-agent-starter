import { NextResponse } from "next/server";

import { usdcAddress } from "@/lib/arc";

function buildTxHash() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function POST(request: Request) {
  const paymentTx = request.headers.get("X-Payment-Tx");

  if (!paymentTx) {
    return NextResponse.json(
      {
        amount: 1,
        recipient: "0xDEMO",
        token: usdcAddress,
        message: "Payment required",
      },
      { status: 402 }
    );
  }

  return NextResponse.json({ success: true, txHash: buildTxHash() });
}