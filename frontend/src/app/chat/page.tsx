"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Conversation, Message, ModelInfo, User } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import ModelSelector from "@/components/ModelSelector";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama3.2:1b");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
    loadConversations();
    loadModels();
  }, [router]);

  async function loadConversations() {
    try {
      const convs = await api.chat.getConversations();
      setConversations(convs);
    } catch {
      // token may have expired
    }
  }

  async function loadModels() {
    try {
      const res = await api.chat.getModels();
      setModels(res.models);
      const available = res.models.find((m) => m.available);
      if (available) setSelectedModel(available.name);
    } catch {
      // ignore
    }
  }

  const selectConversation = useCallback(async (id: number) => {
    setActiveConversationId(id);
    setError("");
    try {
      const conv = await api.chat.getConversation(id);
      setMessages(conv.messages);
    } catch {
      setMessages([]);
    }
  }, []);

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setError("");
    textareaRef.current?.focus();
  }

  async function deleteConversation(id: number) {
    try {
      await api.chat.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) startNewChat();
    } catch {
      // ignore
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setError("");

    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.chat.send(text, selectedModel, activeConversationId ?? undefined);

      if (!activeConversationId) {
        setActiveConversationId(res.conversation_id);
        await loadConversations();
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === res.conversation_id ? { ...c, updated_at: new Date().toISOString() } : c
          )
        );
      }

      const aiMsg: Message = {
        id: res.message_id,
        role: "assistant",
        content: res.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div className="h-full flex bg-[#0f0f0f]">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={selectConversation}
        onNewChat={startNewChat}
        onDelete={deleteConversation}
        userName={user?.full_name || user?.email || "User"}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <span className="text-sm text-zinc-500">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)?.title || "Conversation"
              : "New Chat"}
          </span>
          {models.length > 0 && (
            <ModelSelector
              models={models}
              selected={selectedModel}
              onChange={setSelectedModel}
            />
          )}
        </header>

        {/* Messages */}
        <ChatWindow messages={messages} loading={sending} />

        {/* Input */}
        <div className="px-4 pb-4 shrink-0">
          {error && (
            <p className="text-red-400 text-sm mb-2 px-1">{error}</p>
          )}
          <div className="flex gap-2 items-end bg-[#1a1a1a] border border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-zinc-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message LightChat..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight: "160px" }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center text-zinc-600 text-xs mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
