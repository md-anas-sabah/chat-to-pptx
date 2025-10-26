"use client";

import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  username: string;
  isLoading: boolean;
  progress: number;
  progressMessage: string;
}

export default function MessageList({
  messages,
  username,
  isLoading,
  progress,
  progressMessage,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 pb-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Hello, {username}!
          </h1>
          <p className="text-xl text-gray-600">
            What do you want me to generate today?
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={index} className="mb-4">
          {message.role === "assistant" && message.type === "thinking" && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="text-purple-700 font-semibold">
                  Thinking...
                </div>
              </div>
              <div className="text-gray-900 font-medium mb-2">
                {message.content}
              </div>
              {message.actionDetails && (
                <div className="text-gray-700 text-sm leading-relaxed mt-2 pl-4 border-l-2 border-purple-200">
                  {message.actionDetails}
                </div>
              )}
            </div>
          )}

          {message.role === "assistant" && message.type === "action" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="text-blue-700 font-semibold">
                  Processing...
                </div>
              </div>
              <div className="text-gray-900 font-medium mb-2">{message.content}</div>
              {message.actionDetails && (
                <div className="bg-white border border-blue-200 rounded-lg p-3 flex items-start gap-3 mt-2">
                  <div className="text-blue-500 mt-1">🔍</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {message.actionDetails.split("\n")[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {message.actionDetails.split("\n")[1]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {message.role === "assistant" && message.type === "normal" && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-green-500">✓</div>
                <div className="text-green-700 font-semibold">
                  Completed
                </div>
              </div>
              <div className="text-gray-700">{message.content}</div>
            </div>
          )}

          {message.role === "assistant" && !message.type && (
            <div className="text-gray-700 bg-gray-50 rounded-lg p-3">
              {message.content}
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-pulse">Generating...</div>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">{progressMessage}</div>
        </div>
      )}
    </div>
  );
}
