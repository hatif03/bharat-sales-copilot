import { NextResponse } from "next/server";
import { CalculateEmiParams } from "@/lib/functions/schema";
import { handleCalculateEmiFunction } from "@/lib/functions/calculate-emi";

/**
 * Receiver for Kipps' "API Function" tool call (configured on both the
 * chatbot and voicebot as calculate_emi). See /api/functions/escalate for
 * the same defensive-unwrap rationale.
 */
export async function POST(request: Request) {
  const secret = process.env.KIPPS_FUNCTION_SECRET;
  if (secret && request.headers.get("x-function-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  console.log("[kipps-function:calculate-emi] raw payload:", JSON.stringify(raw));

  const candidate = raw?.parameters ?? raw?.arguments ?? raw?.input ?? raw;
  const parsed = CalculateEmiParams.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await handleCalculateEmiFunction(parsed.data);
    return NextResponse.json({ success: true, message: result.message, result });
  } catch (err) {
    console.error("[kipps-function:calculate-emi] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
