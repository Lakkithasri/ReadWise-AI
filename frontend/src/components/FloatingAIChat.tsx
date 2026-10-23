import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, ExternalLink, 
  RotateCcw, Lightbulb, HelpCircle, Heart 
} from 'lucide-react';
import { api } from '../api/client';

interface FloatingAIChatProps {
  activeReadingId?: number | null;
  activeReadingTitle?: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
  activeReadingId,
  activeReadingTitle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello, Scholar! 🌸 I am your ReadWise AI Companion. Ask me to break down complex papers, create intuitive analogies, or quiz your memory on any concept!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const response = await api.sendChatMessage({
        message: text,
        history,
        reading_id: activeReadingId || null
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Sorry, I encountered an issue: ${err.message || 'Unable to connect to AI'}. Please check your API key in Settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Explain simply 🌸', prompt: 'Can you explain the core concept in very simple, intuitive terms with an analogy?' },
    { label: 'Quiz me 🧠', prompt: 'Ask me 2 challenging open-ended recall questions to test my memory.' },
    { label: 'Key takeaway 💡', prompt: 'What is the single most important academic conclusion I should remember?' }
  ];

  return (
    <>
      {/* 3D Cartoony Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-peachy-600 via-blossom-500 to-peachy-400 text-white shadow-3d-pink hover:scale-110 active:scale-95 flex items-center justify-center transition-all cursor-pointer border-2 border-white/60 group animate-float"
          title="Open Peachy AI Companion"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7 text-white group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-butter-300 rounded-full border-2 border-white flex items-center justify-center text-[8px]">
              ✨
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window in 3D Peachy Blossom */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-64px)] clay-card flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-3 border-peachy-300 dark:border-rose-900 shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-peachy-100 via-blossom-100 to-butter-100 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b-2 border-peachy-200 dark:border-rose-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-peachy-500 to-blossom-500 text-white flex items-center justify-center shadow-3d-sm border border-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-slate-800 dark:text-rose-100">
                    ReadWise Companion
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blossom-200 text-blossom-800 border border-blossom-300">
                    Gemini 3.8
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-peachy-700 dark:text-blossom-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready to Explore 🌸</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-peachy-600 hover:text-peachy-900 hover:bg-white/80 dark:hover:bg-navy-800 transition-colors"
                title="Minimize Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Context Bar if reading is selected */}
          {activeReadingTitle && (
            <div className="px-4 py-1.5 bg-peachy-50 dark:bg-navy-950 border-b border-peachy-200 dark:border-rose-950 flex items-center gap-1.5 text-[11px] text-peachy-800 dark:text-rose-200 truncate font-semibold">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-butter-500" />
              <span className="truncate">Context: <strong>{activeReadingTitle}</strong></span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-peachy-50/40 dark:bg-navy-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-3xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-peachy-500 to-blossom-500 text-white rounded-br-none shadow-3d-sm font-semibold'
                      : 'bg-white dark:bg-navy-900 text-slate-800 dark:text-rose-100 border-2 border-peachy-200 dark:border-rose-950 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[10px] text-peachy-400 dark:text-rose-400 mt-1 px-1 font-bold">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-navy-900 text-peachy-600 text-xs w-fit border border-peachy-200">
                <div className="w-2 h-2 rounded-full bg-peachy-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blossom-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-butter-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1 font-bold">Peachy Companion thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-peachy-100/60 dark:bg-navy-950/60 border-t border-peachy-200 dark:border-rose-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-black whitespace-nowrap bg-white dark:bg-navy-900 border border-peachy-300 dark:border-rose-900 text-peachy-800 dark:text-rose-200 hover:bg-peachy-500 hover:text-white transition-colors shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t-2 border-peachy-200 dark:border-rose-950 bg-white dark:bg-navy-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about papers, concepts, analogies..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-xs rounded-2xl border-2 border-peachy-200 dark:border-rose-900 bg-peachy-50/70 dark:bg-navy-950 text-slate-800 dark:text-rose-100 placeholder:text-peachy-400 focus:outline-none focus:border-peachy-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-peachy-500 hover:bg-peachy-400 text-white shadow-3d-sm active:translate-y-0.5 disabled:opacity-40 transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
