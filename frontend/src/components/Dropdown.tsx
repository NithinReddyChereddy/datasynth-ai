import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  disabledOptions?: string[];
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  icon, 
  className,
  disabledOptions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full min-w-[160px]", className)} ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200",
          "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] shadow-xl backdrop-blur-[var(--backdrop-blur)] hover:border-emerald-500/40",
          isOpen && "ring-2 ring-emerald-500/20 border-emerald-500/50"
        )}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-emerald-500">{icon}</span>}
          <span className="text-xs font-black uppercase tracking-widest">{value}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-emerald-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[100] w-full mt-2 rounded-xl overflow-hidden shadow-2xl border",
              "bg-[var(--card-bg)] border-[var(--card-border)] backdrop-blur-[var(--backdrop-blur)] dark:bg-[#0b0b0b]/95"
            )}
          >
            <div className="p-1.5 space-y-0.5">
              {options.map((option) => {
                const isActive = value === option;
                const isDisabled = disabledOptions.includes(option);
                
                return (
                  <button
                    key={option}
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 group",
                      isActive 
                        ? "bg-emerald-500/20 text-emerald-500 font-bold" 
                        : "text-[var(--subtext)] hover:bg-emerald-500/10 hover:text-emerald-500",
                      isDisabled && "text-gray-400 cursor-not-allowed opacity-50 grayscale hover:bg-transparent"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{option}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
