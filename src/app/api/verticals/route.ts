import { NextResponse } from "next/server";
import { z } from "zod";
import { createVerticalWithKipps } from "@/lib/verticals/provision";

const Body = z.object({
  whatYouSell: z.string().min(1),
  whoYouSellTo: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const vertical = await createVerticalWithKipps(parsed.data.whatYouSell, parsed.data.whoYouSellTo);
    return NextResponse.json(vertical, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 502 });
  }
}
