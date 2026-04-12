import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightSummaryCardProps {
  insights: string[];
  isLoading?: boolean;
}

export const InsightSummaryCard: React.FC<InsightSummaryCardProps> = ({ insights, isLoading }) => {
  const hasInsights = insights && insights.length > 0;
  
  if (!hasInsights && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card h-full min-h-[400px] overflow-hidden shadow-2xl border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col relative group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="w-32 h-32 text-primary" />
      </div>
      
      <div className="relative z-10 flex-1 p-8 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-[900] tracking-tighter uppercase italic flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                <Sparkles className={`w-5 h-5 text-primary ${isLoading ? 'animate-pulse' : ''}`} />
              </div>
              Insight Summary
            </h3>
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Analyzing</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[var(--subtext)] font-black uppercase tracking-[0.2em] mt-3 opacity-60">
            {isLoading ? 'Deep analysis in progress...' : 'Auto-generated findings from your dataset'}
          </p>
        </div>

        <div className="space-y-4 flex-1">
          {isLoading ? (
            // Shimmer / Skeleton state
            [1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="p-4 rounded-xl bg-[var(--bg-main)]/20 border border-[var(--card-border)] flex gap-4 items-start animate-pulse"
              >
                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-2 bg-white/5 rounded w-full" />
                  <div className="h-2 bg-white/5 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : (
            insights.map((insight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-[var(--bg-main)]/40 border border-[var(--card-border)] hover:border-primary/40 hover:bg-white/5 transition-all duration-300 flex gap-4 items-start"
              >
                <div className="shrink-0 mt-1">
                  {renderInsightIcon(insight)}
                </div>
                <p className="text-xs font-semibold leading-relaxed text-[var(--text-main)] overflow-hidden line-clamp-3">
                  {insight}
                </p>
              </motion.div>
            ))
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-[var(--card-border)] opacity-40">
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isLoading ? 'animate-pulse' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-widest italic">
                {isLoading ? 'Quantum Neural Core Processing' : 'Quantum Engine Active'}
              </span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

function renderInsightIcon(insight: string) {
  const lowered = insight.toLowerCase();
  if (lowered.includes('trend') || lowered.includes('increased') || lowered.includes('growth')) {
    return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  }
  if (lowered.includes('decreased') || lowered.includes('drop')) {
    return <TrendingUp className="w-4 h-4 text-rose-400 rotate-180" />;
  }
  if (lowered.includes('peak') || lowered.includes('highest') || lowered.includes('maximum')) {
    return <Sparkles className="w-4 h-4 text-amber-400" />;
  }
  if (lowered.includes('anomalies') || lowered.includes('outlier')) {
    return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  }
  return <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary" />;
}
