import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Key, Trash2, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
  onClearData
}) => {
  const [apiKey, setApiKey] = React.useState(localStorage.getItem('datasynth_api_key') || '');

  const handleSaveApiKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('datasynth_api_key', val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-6"
          >
            <div className="relative w-full max-w-lg mx-auto bg-[var(--card-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--card-border)] rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-[var(--card-border)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Console Settings</h2>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">System Preferences</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-[var(--card-border)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-10 space-y-10">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">Visual Interface</h3>
                    <p className="text-[11px] text-[var(--subtext)] font-medium mt-1 uppercase tracking-wide">Switch between Light and Dark modes</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-6 py-3 bg-[var(--bg-main)] border border-[var(--card-border)] rounded-2xl hover:border-primary/50 transition-all group shadow-sm"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 text-primary group-hover:-rotate-12 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Dark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* API Key */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-base">AI API Key</h3>
                  </div>
                  <div className="relative group">
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key..."
                      className="w-full bg-[var(--bg-main)] border border-[var(--card-border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-sm text-[var(--text-main)] placeholder:text-[var(--subtext)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--subtext)] uppercase tracking-[0.2em] font-bold opacity-60">Encrypted & locally persisted in Sandbox</p>
                </div>

                {/* Data Management */}
                <div className="pt-6 border-t border-[var(--card-border)]">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to purge all serialized data?')) {
                        onClearData();
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Purge All Dashboard Data
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

