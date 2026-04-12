import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Database, 
  Settings, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'charts', icon: BarChart3, label: 'Visuals' },
    { id: 'table', icon: Database, label: 'Data Bank' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card-bg)] border-r border-[var(--card-border)] backdrop-blur-[var(--backdrop-blur)] flex flex-col z-50 transition-colors duration-300">
      {/* Brand Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-5.5 h-5.5 text-black" />
          </div>
          <span className="font-black text-xl tracking-tighter text-[var(--text-main)]">
            DataSynth <span className="text-primary italic">AI</span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        <div className="px-4 mb-4 text-[10px] font-bold text-[var(--subtext)] uppercase tracking-[0.2em]">Core Console</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`
              relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group
              ${activeView === item.id 
                ? 'text-primary bg-primary/5 shadow-sm' 
                : 'text-[var(--subtext)] hover:text-[var(--text-main)] hover:bg-white/5'}
            `}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeView === item.id ? 'text-primary scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            
            {activeView === item.id && (
              <motion.div 
                layoutId="sidebar-active-indicator"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_#10b981]" 
              />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-8 border-t border-[var(--card-border)] space-y-1.5">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'support') setActiveView('support-modal');
              else if (item.id === 'settings') setActiveView('settings-modal');
              else setActiveView(item.id);
            }}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300
              ${activeView === item.id 
                ? 'text-primary bg-primary/5' 
                : 'text-[var(--subtext)] hover:text-[var(--text-main)] hover:bg-white/5'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};



