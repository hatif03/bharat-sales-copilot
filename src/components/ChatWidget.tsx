"use client";

import { useRef, useState } from "react";

interface ChatMessage {
  id: string;
  from: "agent" | "you";
  text: string;
}

export function ChatWidget({ chatbotId }: { chatbotId: string }) {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const conversationIdRef = useRef<number | null>(null);

  async function startChat() {
    setStatus("connecting");
    setError(null);

    const res = await fetch("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatbotId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed to start chat (${res.status})`);
      setStatus("error");
      return;
    }

    const session = await res.json();
    conversationIdRef.current = session.conversationId;
    setStatus("connected");
    if (session.initialMessage) {
      setMessages([{ id: "initial", from: "agent", text: session.initialMessage }]);
    } else {
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || conversationIdRef.current == null || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { id: `you-${Date.now()}`, from: "you", text }]);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId,
          conversationId: conversationIdRef.current,
          message: text,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? `Reply failed (${res.status})`);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: `agent-${Date.now()}`, from: "agent", text: body.reply as string },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function endChat() {
    conversationIdRef.current = null;
    setStatus("idle");
    setMessages([]);
    setError(null);
  }

  return (
    <div className="rounded-md border border-border bg-surface p-md">
      <div className="mb-sm flex items-center justify-between">
        <span className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          Test the chat agent
        </span>
        {status === "connected" ? (
          <button onClick={endChat} className="font-body-sm text-body-sm text-danger">
            End chat
          </button>
        ) : (
          <button
            onClick={startChat}
            disabled={status === "connecting"}
            className="rounded-full bg-primary px-sm py-0.5 font-label-caps text-label-caps uppercase text-neutral disabled:opacity-50"
          >
            {status === "connecting" ? "Connecting…" : "Start chat"}
          </button>
        )}
      </div>

      {error && <p className="mb-sm font-body-sm text-body-sm text-danger">{error}</p>}

      {status === "connected" && (
        <>
          <div className="mb-sm flex max-h-80 flex-col gap-xs overflow-y-auto rounded-sm bg-neutral p-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] whitespace-pre-wrap rounded-md px-sm py-xs font-body-sm text-body-sm ${
                  m.from === "you" ? "ml-auto bg-primary text-neutral" : "bg-surface text-primary"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="max-w-[80%] rounded-md bg-surface px-sm py-xs font-body-sm text-body-sm text-secondary">
                Thinking…
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex gap-sm"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={sending}
              className="flex-1 rounded-sm border border-border bg-surface px-sm py-xs font-body-md text-body-md text-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-full bg-primary px-md py-xs font-label-caps text-label-caps uppercase text-neutral disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
