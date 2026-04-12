import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="dashboard-card p-4 h-[100px]"
    >
      <div className="flex items-center gap-4 h-full">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest mb-0.5 truncate">
            {label}
          </p>
          <div className="flex items-baseline justify-between items-center">
            <h3 className="text-2xl font-black tracking-tight tabular-nums truncate">
              {value.toLocaleString()}
            </h3>
            {trend !== undefined && trend !== 0 && (
              <div className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md ${trend >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                {trend >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

