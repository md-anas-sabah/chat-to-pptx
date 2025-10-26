"use client";

import { History, X } from "lucide-react";
import { ChatHistory } from "@/types";

interface HistorySidebarProps {
  showHistory: boolean;
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  onClose: () => void;
  onLoadChat: (chat: ChatHistory) => void;
  onNewChat: () => void;
}

export default function HistorySidebar({
  showHistory,
  chatHistory,
  currentChatId,
  onClose,
  onLoadChat,
  onNewChat,
}: HistorySidebarProps) {
  return (
    <div
      className={`absolute lg:relative z-20 h-full bg-white border-r border-gray-200 transition-transform duration-300 ${
        showHistory ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${showHistory ? "w-80" : "w-0 lg:w-16"}`}
    >
      {showHistory ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-col p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-lg text-black">Chat History</h2>
              <button
                onClick={onClose}
                className="cursor-pointer lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Last 5 conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={onNewChat}
              className="cursor-pointer w-full mb-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              + New Chat
            </button>
            {chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onLoadChat(chat)}
                  className={`cursor-pointer w-full text-left p-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors border ${
                    currentChatId === chat.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-medium text-sm mb-1 truncate text-black">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {chat.timestamp.toLocaleDateString()} •{" "}
                    {chat.slides.length} slides
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs mt-1">
                  Start a conversation to see it here
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-col items-center p-2 space-y-4">
          <button
            onClick={() => onClose()}
            className="p-3 text-black hover:bg-gray-100 rounded-lg transition-colors"
            title="Chat History"
          >
            <History className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
