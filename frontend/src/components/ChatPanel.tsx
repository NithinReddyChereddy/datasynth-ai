import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, Brain } from 'lucide-react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  onSendMessage: (msg: string) => Promise<string>;
  compact?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage, compact = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await onSendMessage(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural core timeout. Connectivity to the AI stream was interrupted. Please re-establish protocol.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[var(--card-border)] bg-[var(--bg-main)]/40 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-xl shadow-primary/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Brain className="w-7 h-7 text-black" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border-2 border-[var(--bg-main)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-[900] uppercase tracking-[0.3em] text-[var(--text-main)] italic">AI Assistant</h2>
            </div>
            <p className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest mt-1 opacity-70">Core Synchronized</p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12"
            >
              <div className="relative group">
                <div className="absolute -inset-8 bg-primary/10 blur-[40px] rounded-full opacity-50" />
                <div className="relative w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="max-w-[400px] space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Data Intelligence</h3>
                <p className="text-[var(--subtext)] text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
                  Ask me anything about your dataset to begin.
                </p>
              </div>
            </motion.div>
          )}
          
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div 
                  className={`rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-black font-bold rounded-tr-none' 
                      : 'bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--card-border)] rounded-tl-none'
                  }`}
                >
                  <div 
                    className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-headings:text-black' : 'dark:prose-invert'}
                      prose-p:leading-normal prose-p:mb-3 prose-p:last:mb-0
                      prose-headings:font-bold prose-headings:tracking-tight
                      prose-strong:text-primary prose-strong:font-bold
                      prose-ul:my-2 prose-li:my-1 prose-li:marker:text-primary
                    `}
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content ? (marked.parse(msg.content) as string) : '' 
                    }}
                  />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--subtext)] mt-2 opacity-50 px-1">
                  {msg.role === 'user' ? 'You' : 'AI Response'} — {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-5 h-5 text-primary/80" />
                </div>
              )}
            </motion.div>
          ))}
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] px-8 py-5 flex items-center gap-4 rounded-tl-none shadow-2xl backdrop-blur-2xl border-l-primary/40 border-l-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-primary font-[900] uppercase tracking-[0.3em] animate-pulse italic">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-[var(--bg-main)]/50 backdrop-blur-2xl border-t border-[var(--card-border)]">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.75rem] py-6 px-10 pr-24 text-[var(--text-main)] placeholder-[var(--subtext)] focus:outline-none focus:border-primary/50 transition-all font-sans shadow-2xl text-sm font-medium"
              placeholder="Query the intelligence engine..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-4 bg-primary text-black rounded-2xl hover:opacity-90 disabled:opacity-20 transition-all shadow-xl shadow-primary/20 active:scale-95 group/btn"
              >
                <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-[var(--subtext)] mt-4 opacity-40">
          Neural Transmission Secured — AES-256 Encrypted
        </p>
      </div>
    </div>
  );
};

