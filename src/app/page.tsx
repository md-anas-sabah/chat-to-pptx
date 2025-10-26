/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { Message, Slide, ChatHistory } from "@/types";
import WelcomeModal from "@/components/WelcomeModal";
import HistorySidebar from "@/components/HistorySidebar";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import SlidePreview from "@/components/SlidePreview";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [username, setUsername] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
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

  const handleNameSubmit = (name: string) => {
    setUsername(name);
    localStorage.setItem("username", name);
    setShowNameModal(false);
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
      <HistorySidebar
        showHistory={showHistory}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onClose={() => setShowHistory(!showHistory)}
        onLoadChat={loadChat}
        onNewChat={startNewChat}
      />

      <button
        onClick={() => setShowHistory(true)}
        className="lg:hidden fixed top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-6 h-6 cursor-pointer" />
      </button>

      <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-gray-200">
        <div className="flex justify-end p-4"></div>

        <MessageList
          messages={messages}
          username={username}
          isLoading={isLoading}
          progress={progress}
          progressMessage={progressMessage}
        />

        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="hidden lg:flex w-1/2 flex-col bg-gray-50">
        <SlidePreview
          slides={slides}
          onDownloadPPT={downloadPPT}
          onDownloadPDF={downloadPDF}
        />
      </div>

      <WelcomeModal isOpen={showNameModal} onSubmit={handleNameSubmit} />
    </div>
  );
}
