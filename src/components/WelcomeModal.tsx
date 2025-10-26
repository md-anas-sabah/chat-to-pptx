"use client";

import { useState } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
}

export default function WelcomeModal({ isOpen, onSubmit }: WelcomeModalProps) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSubmit(nameInput.trim());
      setNameInput("");
    }
  };

  if (!isOpen) return null;

  return (
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

        <form onSubmit={handleSubmit}>
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
  );
}
