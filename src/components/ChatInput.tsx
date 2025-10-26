"use client";

import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <div className="p-6 border-t border-gray-200">
      <form onSubmit={onSubmit}>
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 focus-within:border-gray-400 transition-colors">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Start with a topic, we'll turn it into slides!"
            className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 text-base"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            ></button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg p-2.5 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
