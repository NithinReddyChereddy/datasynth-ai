import React from 'react';
import { X, CheckCheck, Trash2, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'info' | 'error';
}

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onClearAll
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for outside click */}
          <div className="fixed inset-0 z-50" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 right-8 w-96 bg-[var(--card-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--card-border)] rounded-3xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg tracking-tight uppercase italic">Notifications</h3>
                <p className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest mt-1">
                  {notifications.filter(n => !n.read).length} Unread Updates
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--subtext)] hover:text-[var(--text-main)] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-none">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                    <Info className="w-6 h-6 text-primary/40" />
                  </div>
                  <p className="text-sm font-bold text-[var(--subtext)]">No notifications yet</p>
                  <p className="text-[10px] text-[var(--subtext)] mt-1 uppercase tracking-widest opacity-60">System core is healthy</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-6 flex gap-4 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${!notification.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse' : 'bg-transparent'}`} />
                      <div className="space-y-1.5 flex-1">
                        <p className={`text-sm leading-relaxed ${!notification.read ? 'text-[var(--text-main)] font-bold' : 'text-[var(--subtext)]'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--subtext)] font-bold uppercase tracking-widest opacity-80">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--card-border)] flex gap-3">
                <button 
                  onClick={onMarkAllRead}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark Read
                </button>
                <button 
                  onClick={onClearAll}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

