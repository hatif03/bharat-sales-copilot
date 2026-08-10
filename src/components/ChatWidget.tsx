"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";

interface ChatMessage {
  id: string;
  from: "agent" | "you";
  text: string;
}

const CHAT_TOPIC = "lk.chat";

export function ChatWidget({ chatbotId }: { chatbotId: string }) {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

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
    const room = new Room();
    roomRef.current = room;

    room.registerTextStreamHandler(CHAT_TOPIC, (reader, participantInfo) => {
      reader.readAll().then((text) => {
        setMessages((prev) => [
          ...prev,
          { id: `${participantInfo.identity}-${Date.now()}`, from: "agent", text },
        ]);
      });
    });

    room.on(RoomEvent.Disconnected, () => setStatus("idle"));

    try {
      await room.connect(session.livekitUrl, session.livekitToken);
      setStatus("connected");
      if (session.chatbot.initialMessage) {
        setMessages([{ id: "initial", from: "agent", text: session.chatbot.initialMessage }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to the chat room");
      setStatus("error");
    }
  }

  async function sendMessage() {
    if (!input.trim() || !roomRef.current) return;
    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { id: `you-${Date.now()}`, from: "you", text }]);
    await roomRef.current.localParticipant.sendText(text, { topic: CHAT_TOPIC });
  }

  function endChat() {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setStatus("idle");
    setMessages([]);
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
                className={`max-w-[80%] rounded-md px-sm py-xs font-body-sm text-body-sm ${
                  m.from === "you" ? "ml-auto bg-primary text-neutral" : "bg-surface text-primary"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-sm"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-sm border border-border bg-surface px-sm py-xs font-body-md text-body-md text-primary"
            />
            <button type="submit" className="rounded-full bg-primary px-md py-xs font-label-caps text-label-caps uppercase text-neutral">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
