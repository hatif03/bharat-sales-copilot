import { NextResponse } from "next/server";
import { z } from "zod";
import { getKippsClient } from "@/lib/kipps/client";

const Body = z.object({ chatbotId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await getKippsClient().createChatSession(parsed.data.chatbotId);
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 502 });
  }
}
