import React from 'react';
import { X, HelpCircle, Mail, MessageCircle, FileText, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatClick?: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, onChatClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="dashboard-card relative w-full max-w-xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--bg-main)]/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <HelpCircle className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">Support Center</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Status: Neural Hub Online</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--subtext)] hover:text-[var(--text-main)] transition-all border border-[var(--card-border)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 grid grid-cols-2 gap-6">
              {[
                { icon: MessageCircle, label: 'AI Chatbot', desc: 'Real-time Assistance', color: 'primary', action: onChatClick },
                { icon: Globe, label: 'System Status', desc: 'Status: Optimal', color: 'secondary' },
                { icon: FileText, label: 'Documentation', desc: 'Protocol Guides', color: 'text-main' },
                { icon: HelpCircle, label: 'Knowledge Base', desc: 'Core Wiki', color: 'primary' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={item.action}
                  className="p-8 rounded-[2rem] bg-[var(--bg-main)]/50 border border-[var(--card-border)] hover:border-primary/30 text-left transition-all group shadow-sm hover:shadow-md"
                >
                  <item.icon className={`w-8 h-8 mb-4 ${item.color === 'primary' ? 'text-primary' : item.color === 'secondary' ? 'text-secondary' : 'text-[var(--text-main)]'}`} />
                  <h4 className="font-black text-sm uppercase tracking-tight">{item.label}</h4>
                  <p className="text-[10px] text-[var(--subtext)] font-bold uppercase tracking-widest mt-1.5 opacity-80">{item.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

