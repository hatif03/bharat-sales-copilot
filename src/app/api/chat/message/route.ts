import { NextResponse } from "next/server";
import { z } from "zod";
import { getKippsClient } from "@/lib/kipps/client";

const Body = z.object({
  chatbotId: z.string().uuid(),
  conversationId: z.number().int().positive(),
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reply = await getKippsClient().sendChatReply(parsed.data);
    return NextResponse.json(reply);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = /402|Insufficient credits/i.test(message) ? 402 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
