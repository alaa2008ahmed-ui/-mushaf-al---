/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Layout, 
  MessageSquare,
  ChevronRight,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  role: 'user' | 'model';
  text: string;
  id: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      id: Date.now().toString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: input }] }],
      });
      const text = result.text;

      const aiMessage: Message = {
        role: 'model',
        text: text || "I'm sorry, I couldn't generate a response.",
        id: (Date.now() + 1).toString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage: Message = {
        role: 'model',
        text: "Error: Failed to connect to AI. Please check your API key.",
        id: (Date.now() + 1).toString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Zap size={18} className="text-black fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
          <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-rows-[auto_1fr] gap-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles size={12} />
              Powered by Gemini 3
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]"
            >
              Build the future <br />
              <span className="text-zinc-500">with intelligence.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
            >
              A minimalist workspace designed for creators. Chat with AI, 
              brainstorm features, and bring your ideas to life instantly.
            </motion.p>
          </div>

          {/* Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto w-full bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-300">Assistant Online</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <MessageSquare size={48} />
                  <p className="text-sm">Start a conversation to see the magic happen.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-zinc-800' : 'bg-emerald-500 text-black'
                      }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-zinc-800 text-zinc-200 rounded-tr-none' 
                          : 'bg-zinc-800/50 text-emerald-50 border border-emerald-500/10 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-2xl rounded-tl-none border border-emerald-500/10">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-zinc-900/80 border-t border-white/5">
              <div className="relative group">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-zinc-800 border border-white/5 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-[10px] text-center text-zinc-600 uppercase tracking-widest font-bold">
                AI can make mistakes. Check important info.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Built with AI Studio</span>
          </div>
          <div className="flex gap-6 text-zinc-500">
            <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Layout size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
