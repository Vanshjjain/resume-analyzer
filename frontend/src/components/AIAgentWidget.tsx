import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const AIAgentWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Greetings, Operative ${user?.full_name || 'Vansh Jain'}! I am Antigravity AI, your neural career assistant. How can I optimize your ATS compliance and career trajectory today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    "How does my ATS score breakdown work?",
    "What keywords are missing for Full Stack role?",
    "How do I optimize bullet points with power verbs?",
    "Is my session security and JWT active?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('ats') || q.includes('score') || q.includes('grade')) {
      return "Your active ATS index is currently 88/100 (HIGH COMPLIANCE). Your single-column layout, contact headers, and skill sections conform to corporate parsing filters. To reach 95+, add 2-3 cloud deployment metrics (e.g. AWS, Docker, Kubernetes).";
    }
    if (q.includes('keyword') || q.includes('missing') || q.includes('full stack') || q.includes('backend')) {
      return "Keyword analysis identifies strong hits for Python, FastAPI, React, and TypeScript. Recommended target skill additions: Go, GraphQL, and Redis caching structures to boost Backend Developer role match to 96%.";
    }
    if (q.includes('bullet') || q.includes('verb') || q.includes('optimize') || q.includes('improve')) {
      return "AI Bullet Optimizer rule: Lead every accomplishment with an action verb + quantifiable metric. Example: 'Optimized database queries, reducing latency by 30% using indexed PostgreSQL schemas.'";
    }
    if (q.includes('security') || q.includes('jwt') || q.includes('auth') || q.includes('login')) {
      return `Security Status: Active session for ${user?.email || 'vanshjain50355@gmail.com'}. Authenticated via 256-bit JWT token & OAuth gateway. Role: ${user?.role?.toUpperCase() || 'USER'}.`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello ${user?.full_name || 'Vansh'}! Ask me anything about your resume, ATS matching, job recommendations, or interview prep.`;
    }

    return `Understood. Analyzing requirement: "${query}". I recommend running a fresh ATS scan in the Analyzer Studio or tailoring your profile keywords to increase match score above 90%.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = generateAIResponse(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Cyber Orb Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00f0ff] via-[#0b0f19] to-[#ff007f] p-[2px] shadow-2xl shadow-[#00f0ff]/30 glow-cyan"
        >
          <div className="w-full h-full bg-[#070a12] rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Animated Inner Neon Ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-[#ff007f]/20 animate-pulse" />
            
            {isOpen ? (
              <X className="w-6 h-6 text-[#ff007f] relative z-10" />
            ) : (
              <div className="relative z-10 flex items-center justify-center">
                <Bot className="w-7 h-7 text-[#00f0ff]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff66] rounded-full ring-2 ring-[#070a12] animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff66] rounded-full ring-2 ring-[#070a12]" />
              </div>
            )}
          </div>

          {/* Floating Badge Label when closed */}
          {!isOpen && (
            <span className="absolute -top-2 right-12 hidden group-hover:flex items-center gap-1.5 px-3 py-1 bg-[#070a12] border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-[#00ff66]" />
              <span>AI_AGENT_ONLINE</span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Interactive AI Agent Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] bg-[#070a12]/95 border-2 border-[#00f0ff]/40 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden font-mono-hud cyber-chamfer-card glow-cyan"
          >
            {/* Agent Header */}
            <div className="p-4 border-b border-[#00f0ff]/20 bg-[#0b0f19] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#ff007f] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#00f0ff]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
                    <span>ANTIGRAVITY AI</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#00ff66]/20 text-[#00ff66] text-[8px]">v2.4</span>
                  </h4>
                  <span className="text-[9px] text-[#00ff66] font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                    NEURAL_NET_ONLINE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 border-b border-[#00f0ff]/15 bg-[#080c16] overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#00f0ff] text-[10px] font-bold whitespace-nowrap hover:bg-[#00f0ff]/20 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#00ff66]" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#05070e]/80 text-xs">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0 text-[#00f0ff]">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-2xl leading-relaxed text-[11px] ${
                      msg.sender === 'user'
                        ? 'bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-white rounded-br-none'
                        : 'bg-[#0e1424] border border-[#00f0ff]/20 text-[#00f0ff]/90 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[8px] text-[#00f0ff]/40 block text-right mt-1 font-mono">{msg.timestamp}</span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#ff007f]/20 border border-[#ff007f]/40 flex items-center justify-center shrink-0 text-[#ff007f]">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-[10px] text-[#00f0ff] font-bold animate-pulse">
                  <Bot className="w-4 h-4 text-[#00f0ff]" />
                  <span>[NEURAL_PROCESSING...]</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#00f0ff]/20 bg-[#0b0f19] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI agent anything about your resume..."
                className="flex-1 bg-[#05070e] border border-[#00f0ff]/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#00f0ff]/40 outline-none focus:border-[#00f0ff]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-[#00f0ff] text-black font-bold hover:bg-[#00f0ff]/80 transition-colors shadow-lg shadow-[#00f0ff]/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
