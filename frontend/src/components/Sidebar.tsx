"use client";

import { Conversation } from "@/lib/api";
import { useRouter } from "next/navigation";

interface SidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onDelete: (id: number) => void;
  userName: string;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  userName,
}: SidebarProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <aside className="w-64 flex flex-col bg-[#111111] border-r border-zinc-800 shrink-0">
      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors border border-zinc-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {conversations.length === 0 ? (
          <p className="text-zinc-600 text-xs px-3 py-4 text-center">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                activeId === conv.id
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <span className="text-sm truncate flex-1">{conv.title || "New Conversation"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center shrink-0 text-xs font-medium text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-300 truncate">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
