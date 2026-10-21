import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, ExternalLink, 
  Minimize2, ChevronDown, RotateCcw, Lightbulb, HelpCircle 
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
      text: 'Hello! I am your ReadWise AI Academic Tutor. You can ask me to explain difficult concepts, break down complex papers into simple analogies, or quiz your understanding without notes.',
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
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
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
    { label: 'Explain simply', prompt: 'Can you explain the core concept in very simple, intuitive terms with an analogy?' },
    { label: 'Quiz me', prompt: 'Ask me 2 challenging open-ended recall questions to test my memory.' },
    { label: 'Key takeaway', prompt: 'What is the single most important academic conclusion I should remember?' }
  ];

  return (
    <>
      {/* Floating Launcher Button in Bottom Right Corner */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-brand-400/40 group shadow-brand-500/25"
          title="Open AI Chat Tutor"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-64px)] bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-50 via-amber-50/70 to-orange-50 dark:from-navy-950 dark:via-brand-950 dark:to-navy-900 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    ReadWise AI Tutor
                  </h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    Gemini 3.8
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online Study Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noreferrer"
                title="Open ChatGPT in new tab"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-navy-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-navy-800 transition-colors"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Bar if reading is selected */}
          {activeReadingTitle && (
            <div className="px-4 py-1.5 bg-brand-50/90 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900/60 flex items-center gap-1.5 text-[11px] text-brand-800 dark:text-brand-300 truncate">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
              <span className="truncate">Context: <strong>{activeReadingTitle}</strong></span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-600/20'
                      : 'bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-navy-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-navy-950 text-slate-500 text-xs w-fit">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">AI Tutor is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-50/80 dark:bg-navy-950/60 border-t border-slate-100 dark:border-navy-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
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
                placeholder="Ask about this paper, concepts, analogies..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white shadow-md shadow-brand-600/30 transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Powered by Google Gemini 3.8 Flash</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">100% Free Tier</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
