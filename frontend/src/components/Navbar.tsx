import React from 'react';
import { Bell, Moon, Sun, Plus, Settings } from 'lucide-react';

interface NavbarProps {
  title: string;
  onUploadClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  notificationCount: number;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  onUploadClick, 
  isDarkMode, 
  toggleTheme, 
  notificationCount,
  onNotificationsClick,
  onSettingsClick
}) => {
  return (
    <header className="sticky top-0 z-[90] h-16 border-b border-[var(--card-border)] bg-[var(--bg-main)]/50 backdrop-blur-[var(--backdrop-blur)] flex items-center justify-between px-8 transition-colors duration-300 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black rounded-lg font-bold text-xs hover:opacity-90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={onNotificationsClick}
            className="p-2 rounded-lg text-[var(--subtext)] hover:text-[var(--text-main)] hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[var(--bg-main)]" />
            )}
          </button>

          <button 
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-[var(--subtext)] hover:text-[var(--text-main)] hover:bg-white/5 transition-all"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--subtext)] hover:text-[var(--text-main)] hover:bg-white/5 transition-all"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <div className="h-6 w-[1px] bg-[var(--card-border)] mx-1" />

          <button className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-[var(--card-border)]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-black font-black text-[10px] shadow-sm">
              AD
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

