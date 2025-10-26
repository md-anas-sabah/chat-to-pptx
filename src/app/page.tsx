/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Paperclip, History, Download, Menu, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "thinking" | "action" | "normal";
  actionDetails?: string;
}

interface Slide {
  title: string;
  content: string;
  layout?: string;
  backgroundColor?: string;
  image?: string;
}

interface ChatHistory {
  id: string;
  timestamp: Date;
  title: string;
  messages: Message[];
  slides: Slide[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [username, setUsername] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setShowNameModal(true);
    }

    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setChatHistory(
        parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }))
      );
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const name = nameInput.trim();
      setUsername(name);
      localStorage.setItem("username", name);
      setShowNameModal(false);
      setNameInput("");
    }
  };

  const saveToHistory = useCallback(() => {
    if (messages.length === 0) return;

    const chatId = currentChatId || Date.now().toString();
    const userMessage = messages.find((m) => m.role === "user");
    const title = userMessage?.content.slice(0, 50) || "Untitled";

    const newChat: ChatHistory = {
      id: chatId,
      timestamp: new Date(),
      title,
      messages,
      slides,
    };

    const updatedHistory = chatHistory.filter((h) => h.id !== chatId);
    updatedHistory.unshift(newChat);

    const limitedHistory = updatedHistory.slice(0, 5);

    setChatHistory(limitedHistory);
    setCurrentChatId(chatId);
    localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
  }, [messages, slides, chatHistory, currentChatId]);

  // Auto-save to history when slides are generated
  useEffect(() => {
    if (slides.length > 0 && messages.length > 0) {
      const timer = setTimeout(() => {
        saveToHistory();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [slides, messages, saveToHistory]);

  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages);
    setSlides(chat.slides);
    setCurrentChatId(chat.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setSlides([]);
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setProgress(0);
    setProgressMessage("Initializing AI...");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const progressSteps = [
        { progress: 20, message: "Analyzing your request..." },
        { progress: 40, message: "Researching content..." },
        { progress: 60, message: "Generating slides structure..." },
        { progress: 80, message: "Creating presentation..." },
        { progress: 95, message: "Finalizing..." },
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep].progress);
          setProgressMessage(progressSteps[currentStep].message);
          currentStep++;
        }
      }, 800);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, slides }),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage("Complete!");

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
          },
        ]);
      } else {
        if (data.thoughts) {
          setMessages((prev) => [...prev, ...data.thoughts]);
        }

        if (data.slides) {
          setSlides(data.slides);
        }

        // History will be auto-saved by useEffect
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred while processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadPPT = async () => {
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, format: "pptx" }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "presentation.pptx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PPT:", error);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, format: "pdf" }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "presentation.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`absolute lg:relative z-20 h-full bg-white border-r border-gray-200 transition-transform duration-300 ${
          showHistory ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${showHistory ? "w-80" : "w-0 lg:w-16"}`}
      >
        {showHistory ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-col p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-lg text-black">
                  Chat History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="cursor-pointer lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <button
                onClick={startNewChat}
                className="cursor-pointer w-full mb-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                + New Chat
              </button>
              {chatHistory.length > 0 ? (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
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
          <div className="hidden  lg:flex flex-col items-center p-2 space-y-4">
            <button
              onClick={() => setShowHistory(true)}
              className="p-3 text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Chat History"
            >
              <History className="w-6 h-6 cursor-pointer text-black" />
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => setShowHistory(true)}
        className="lg:hidden fixed top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-6 h-6 cursor-pointer" />
      </button>

      <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-gray-200">
        <div className="flex justify-end p-4">
          {/* <div className="bg-black text-white px-3 py-1.5 rounded-md text-sm font-medium">
            AI
          </div> */}
        </div>

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
            <div key={index} className="mb-6">
              {message.role === "assistant" && message.type === "thinking" && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="text-purple-600 font-semibold mb-2">
                    Thinking...
                  </div>
                  <div className="text-gray-900 font-medium mb-2">
                    {message.content}
                  </div>
                  {message.actionDetails && (
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {message.actionDetails}
                    </div>
                  )}
                </div>
              )}

              {message.role === "assistant" && message.type === "action" && (
                <div className="mb-4">
                  <div className="text-gray-900 mb-3">{message.content}</div>
                  {message.actionDetails && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="text-gray-500 mt-1">🔍</div>
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

              {message.role === "assistant" && !message.type && (
                <div className="text-gray-700">{message.content}</div>
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

        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 focus-within:border-gray-400 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Start with a topic, we'll turn it into slides!"
                className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 text-base"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
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
      </div>

      <div className="hidden lg:flex w-1/2 flex-col bg-gray-50">
        {slides.length > 0 ? (
          <>
            <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2 text-green-600"></div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
                <button
                  onClick={downloadPPT}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors"
                  title="Download as PPTX"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">PPTX</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="w-full aspect-video flex flex-col items-center justify-center p-8 text-white relative"
                      style={{
                        backgroundColor: slide.backgroundColor || "#6B7B7F",
                      }}
                    >
                      {slide.image && (
                        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2">
                          <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-800 rounded-lg" />
                        </div>
                      )}
                      <div
                        className={
                          slide.image
                            ? "ml-auto mr-4 md:mr-8 max-w-[55%] md:max-w-[60%]"
                            : "text-center max-w-full px-4"
                        }
                      >
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 wrap-break-words">
                          {slide.title}
                        </h2>
                        {slide.content && (
                          <div className="text-sm md:text-base lg:text-lg opacity-90 wrap-break-words">
                            {slide.content}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                      Slide {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">Your presentation will appear here</p>
            </div>
          </div>
        )}
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to AI Slide Generator!
              </h2>
              <p className="text-gray-600">
                Let&apos;s get started by knowing your name
              </p>
            </div>

            <form onSubmit={handleNameSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
