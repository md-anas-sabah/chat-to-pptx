'use client';

import { useState } from 'react';
import { Send, Paperclip, CheckCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'thinking' | 'action' | 'normal';
  actionDetails?: string;
}

interface Slide {
  title: string;
  content: string;
  layout?: string;
  backgroundColor?: string;
  image?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [username] = useState('piyuindia4');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, slides }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error}`
        }]);
      } else {
        if (data.thoughts) {
          setMessages(prev => [...prev, ...data.thoughts]);
        }

        if (data.slides) {
          setSlides(data.slides);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'An error occurred while processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPPT = async () => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.pptx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PPT:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Chat */}
      <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
        {/* AI Badge */}
        <div className="flex justify-end p-4">
          <div className="bg-black text-white px-3 py-1.5 rounded-md text-sm font-medium">
            AI
          </div>
        </div>

        {/* Messages Container */}
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
              {message.role === 'assistant' && message.type === 'thinking' && (
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

              {message.role === 'assistant' && message.type === 'action' && (
                <div className="mb-4">
                  <div className="text-gray-900 mb-3">{message.content}</div>
                  {message.actionDetails && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="text-gray-500 mt-1">🔍</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {message.actionDetails.split('\n')[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {message.actionDetails.split('\n')[1]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message.role === 'assistant' && !message.type && (
                <div className="text-gray-700">{message.content}</div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-pulse">Generating...</div>
            </div>
          )}
        </div>

        {/* Input Area */}
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
                  if (e.key === 'Enter' && !e.shiftKey) {
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

      {/* Right Panel - Presentation Preview */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {slides.length > 0 ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{slides.length} slides generated</span>
              </div>
              <button
                onClick={downloadPPT}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Edit Presentation</span>
              </button>
            </div>

            {/* Slides Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="w-full aspect-[16/9] flex flex-col items-center justify-center p-8 text-white relative"
                      style={{
                        backgroundColor: slide.backgroundColor || '#6B7B7F',
                      }}
                    >
                      {slide.image && (
                        <div className="absolute left-8 top-1/2 -translate-y-1/2">
                          <div className="w-48 h-48 bg-gray-800 rounded-lg" />
                        </div>
                      )}
                      <div className={slide.image ? 'ml-auto mr-8' : 'text-center'}>
                        <h2 className="text-4xl font-bold mb-4">
                          {slide.title}
                        </h2>
                        {slide.content && (
                          <div className="text-lg opacity-90">
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

            {/* Download Button */}
            <div className="p-6 bg-white border-t border-gray-200">
              <button
                onClick={downloadPPT}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Download Presentation
              </button>
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
    </div>
  );
}
