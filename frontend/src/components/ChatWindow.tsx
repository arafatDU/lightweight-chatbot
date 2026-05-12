"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/api";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-4xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
        <p className="text-zinc-500 text-sm max-w-xs">
          Ask anything — your messages and the full conversation history are kept in context.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
              AI
            </div>
          )}
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-zinc-700 text-white rounded-br-sm"
                : "bg-[#1a1a1a] text-zinc-100 rounded-bl-sm border border-zinc-800"
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
            AI
          </div>
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
