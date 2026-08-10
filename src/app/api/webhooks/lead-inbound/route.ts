import { NextResponse } from "next/server";
import { InboundLead } from "@/lib/leads/schema";
import { intakeLead } from "@/lib/leads/intake";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = InboundLead.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await intakeLead(parsed.data);
  return NextResponse.json(result, { status: 201 });
}
