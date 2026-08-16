import { NextResponse } from "next/server";
import { EscalateFunctionParams } from "@/lib/functions/schema";
import { handleEscalateFunction } from "@/lib/functions/escalate";

/**
 * Receiver for Kipps' "API Function" tool call (configured on the chatbot
 * as an escalation action). Exact request wrapper shape isn't confirmed
 * yet, so this unwraps a few plausible shapes defensively and logs the raw
 * body — tighten once we've seen a real invocation.
 */
export async function POST(request: Request) {
  const secret = process.env.KIPPS_FUNCTION_SECRET;
  if (secret && request.headers.get("x-function-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  console.log("[kipps-function:escalate] raw payload:", JSON.stringify(raw));

  const candidate = raw?.parameters ?? raw?.arguments ?? raw?.input ?? raw;
  const parsed = EscalateFunctionParams.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await handleEscalateFunction(parsed.data);
    return NextResponse.json({ success: true, message: result.message, result });
  } catch (err) {
    console.error("[kipps-function:escalate] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
