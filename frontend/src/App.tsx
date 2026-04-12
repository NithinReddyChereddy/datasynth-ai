import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Table,
  Database, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Zap,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from 'date-fns';

// Components
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MetricCard } from './components/MetricCard';
import { ChartCard } from './components/ChartCard';
import { FileUploader } from './components/FileUploader';
import { InsightSummaryCard } from './components/InsightSummaryCard';
import { ChatPanel } from './components/ChatPanel';
import { NotificationPanel } from './components/NotificationPanel';
import type { Notification } from './components/NotificationPanel';
import { SupportModal } from './components/SupportModal';
import { SettingsModal } from './components/SettingsModal';
import { Dropdown } from './components/Dropdown';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function App() {
  // --- STATE ---
  const [data, setData] = useState<any>(() => {
    const saved = localStorage.getItem('datasynth_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'uploading' | 'analyzing' | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'charts' | 'table' | 'settings-modal' | 'support-modal'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('datasynth_theme');
    return saved ? saved === 'dark' : true;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Full Range');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('datasynth_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>(() => {
    const saved = localStorage.getItem('datasynth_ai_insights');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    try {
      localStorage.setItem('datasynth_data', JSON.stringify(data));
    } catch (e) {
      console.error('Data too large for session storage');
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem('datasynth_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to sync notifications');
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('datasynth_ai_insights', JSON.stringify(aiInsights));
    } catch (e) {
      console.error('Failed to sync AI insights');
    }
  }, [aiInsights]);

  useEffect(() => {
    localStorage.setItem('datasynth_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- HANDLERS ---
  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // 1. File Format Validation
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileName = file.name.toLowerCase();
    const isExtensionValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isExtensionValid) {
       setLastError("Unsupported file format. Please upload CSV or Excel file.");
       addNotification('Unsupported file format. Please upload CSV or Excel file.', 'error');
       return;
    }

    setLoading(true);
    setLoadingPhase('uploading');
    setLastError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Step 2: Upload State (Backend will read and process)
      addNotification(`Uploading ${file.name}...`, 'info');
      
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (percentCompleted === 100) {
               setLoadingPhase('analyzing');
            }
          }
        }
      });
      
      // Step 3: Success
      setData(response.data);
      setActiveView('dashboard');
      addNotification(`Analysis complete: ${file.name}`, 'success');

      // Set intelligent default date range
      if (response.data.summary?.column_names) {
        const dateCol = response.data.summary.column_names.find((name: string) => 
          ['date', 'timestamp', 'time', 'readingdate', 'created_at'].some(k => name.toLowerCase().includes(k))
        );
        if (dateCol) {
          setDateRange('Full Range');
        }
      }

      // Step 4: Fetch AI Insights in background
      fetchAiInsights();
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = "Upload failed. Please try again.";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. File processing took too long.";
      } else if (error.response) {
        errorMessage = error.response.data?.detail || "Dataset structure not supported.";
      } else if (error.request) {
        errorMessage = "Network error. Connection to backend failed.";
      }
      
      setLastError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
      setLoadingPhase(null);
    }
  };

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    setAiInsights([]); // Clear previous
    try {
      const response = await axios.get(`${API_BASE}/analyze/ai-insights`);
      if (response.data.insights && response.data.insights.length > 0) {
        setAiInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChatMessage = async (msg: string) => {
    try {
      const response = await axios.post(`${API_BASE}/chat`, { message: msg });
      return response.data.response;
    } catch (error) {
       return "I'm having trouble connecting to the AI core. Please ensure the backend is active.";
    }
  };

  const handleClearData = async () => {
    try {
      await axios.post(`${API_BASE}/clear-context`);
    } catch (e) {
      console.error("Failed to clear backend context");
    }
    setData(null);
    setNotifications([]);
    setAiInsights([]);
    localStorage.removeItem('datasynth_data');
    localStorage.removeItem('datasynth_notifications');
    localStorage.removeItem('datasynth_ai_insights');
    addNotification('All data cleared successfully.', 'info');
  };

  // --- FILTER LOGIC ---
  const dateInfo = useMemo(() => {
    if (!data?.summary?.column_names) return null;
    const dateCol = data.summary.column_names.find((name: string) => 
      ['date', 'timestamp', 'time', 'readingdate', 'created_at'].some(k => name.toLowerCase().includes(k))
    );
    if (!dateCol) return null;

    // Find min/max from any visualization that has x as dates
    let allDates: number[] = [];
    data.visualizations?.forEach((viz: any) => {
      const temporalSource = viz.x || viz.labels;
      if (Array.isArray(temporalSource)) {
        temporalSource.forEach(val => {
          const d = parseISO(String(val));
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            if (year >= 1900 && year <= 2100) {
              allDates.push(d.getTime());
            }
          }
        });
      }
    });

    if (allDates.length === 0) return { column: dateCol, found: false };

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    return { 
      column: dateCol, 
      found: true, 
      minDate, 
      maxDate, 
      totalDays 
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!dateInfo?.found || dateRange === 'Full Range') return data;
    
    const threshold = getThreshold(dateRange, dateInfo.maxDate as Date);
    const isCustom = dateRange === 'Custom Range' && startDate && endDate;

    const newViz = data.visualizations?.map((viz: any) => {
      // Only filter charts that are likely to be temporal
      const labels = viz.x || viz.labels || viz.x_data;
      if (!Array.isArray(labels) || labels.length === 0) return viz;

      // Check if the labels look like dates (at least the first one)
      const firstLabel = labels[0];
      const firstDate = parseISO(String(firstLabel));
      const looksLikeDate = !isNaN(firstDate.getTime()) && String(firstLabel).length >= 4;
      
      if (!looksLikeDate && viz.type !== 'line') return viz;

      // Filter indices
      const validIndices = labels.map((l: any) => {
        const d = parseISO(String(l));
        if (isNaN(d.getTime())) return true;

        if (isCustom) {
          const startTime = startDate.getTime();
          const endTime = endDate.getTime();
          const dTime = d.getTime();
          return dTime >= startTime && dTime <= endTime;
        }
        
        if (threshold && d.getTime() < threshold) return false;
        return true;
      }).map((v: boolean, i: number) => v ? i : -1).filter((i: number) => i !== -1);

      // If everything is filtered out, return an empty state for this chart
      if (validIndices.length === 0) {
        return {
          ...viz,
          type: 'empty',
          title: viz.title,
          message: "No data available for the selected time range."
        };
      }

      // Reconstruct viz object with filtered arrays
      const filteredViz = { ...viz };
      ['x', 'y', 'labels', 'values', 'data', 'x_data', 'y_data'].forEach(key => {
        if (Array.isArray(viz[key])) {
          filteredViz[key] = validIndices.map(idx => viz[key][idx]);
        }
      });
      return filteredViz;
    });

    // Estimate new row count based on the first filtered temporal chart
    let filteredRowCount = data.summary?.rows ?? 0;
    const temporalViz = newViz?.find((v: any) => v.type === 'line' || (v.labels && v.labels[0] && !isNaN(parseISO(String(v.labels[0])).getTime())));
    if (temporalViz && temporalViz.labels) {
      filteredRowCount = temporalViz.labels.length;
    }

    return { 
      ...data, 
      visualizations: newViz,
      summary: {
        ...data.summary,
        rows: filteredRowCount
      }
    };
  }, [data, dateInfo, dateRange, startDate, endDate]);

  function getThreshold(range: string, maxDate: Date) {
    if (range === 'Full Range') return null;
    const maxTime = maxDate.getTime();
    if (range === 'Last 7 days') return maxTime - (7 * 24 * 60 * 60 * 1000);
    if (range === 'Last 30 days') return maxTime - (30 * 24 * 60 * 60 * 1000);
    if (range === 'Last 90 days') return maxTime - (90 * 24 * 60 * 60 * 1000);
    if (range === 'Yearly') return maxTime - (365 * 24 * 60 * 60 * 1000);
    return null;
  }

  // --- RENDERING HELPERS ---
  const renderDateFilter = () => {
    if (!dateInfo) {
      return (
        <div className="px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest shadow-xl">
          No time-based data detected
        </div>
      );
    }

    const options = ['Full Range'];
    if ((dateInfo.totalDays || 0) >= 7) options.push('Last 7 days');
    if ((dateInfo.totalDays || 0) >= 30) options.push('Last 30 days');
    if ((dateInfo.totalDays || 0) >= 90) options.push('Last 90 days');
    if ((dateInfo.totalDays || 0) >= 365) options.push('Yearly');
    options.push('Custom Range');

    const getRangeLabel = () => {
      if (dateRange === 'Custom Range') {
        if (startDate && endDate) {
          return `${format(startDate, 'MMM dd')} → ${format(endDate, 'MMM dd')}`;
        }
        return 'Select Range';
      }
      if (dateRange === 'Full Range') return 'Full Range';
      return dateRange;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
           <Calendar className="w-3.5 h-3.5 text-[var(--subtext)]" />
           <span className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest whitespace-nowrap">
             {dateInfo.minDate && dateInfo.maxDate ? `${format(dateInfo.minDate, 'MMM dd, yyyy')} — ${format(dateInfo.maxDate, 'MMM dd, yyyy')}` : 'Calculating range...'}
           </span>
        </div>

        {dateRange === 'Custom Range' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2 shadow-2xl backdrop-blur-[var(--backdrop-blur)]"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500 mr-2" />
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="START"
              className="bg-transparent text-[10px] font-black text-[var(--text-main)] outline-none cursor-pointer w-16 placeholder:text-[var(--subtext)]"
            />
            <span className="text-[10px] text-[var(--subtext)] font-bold px-1">→</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="END"
              className="bg-transparent text-[10px] font-black text-[var(--text-main)] outline-none cursor-pointer w-16 placeholder:text-[var(--subtext)]"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(null); setEndDate(null); }}
                className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                title="Clear Filter"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </motion.div>
        )}
        
        <Dropdown 
          options={options}
          value={getRangeLabel()}
          onChange={setDateRange}
          icon={<Filter className="w-3.5 h-3.5" />}
          className="w-56"
        />
      </div>
    );
  };

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-50">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Intelligence Hub</h2>
          <p className="text-[10px] text-[var(--subtext)] mt-2 font-bold uppercase tracking-[0.2em] opacity-60">
            Synthesized stream from {filteredData?.filename || 'the quantum core'}
          </p>
        </div>
        <div className="flex items-center gap-4">
           {renderDateFilter()}
           <button 
             onClick={() => setIsChatOpen(true)}
             className="px-6 py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-3 shadow-xl shadow-primary/20 border border-primary/20"
           >
             <Sparkles className="w-3.5 h-3.5" />
             AI Insights
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Records" value={filteredData?.summary?.rows ?? 0} icon={<Database className="w-5 h-5" />} trend={12.5} />
        <MetricCard label="Data Dimensions" value={filteredData?.summary?.columns ?? 0} icon={<Table className="w-5 h-5" />} trend={0} />
        <MetricCard label="Data Entropy" value={filteredData?.summary?.missing_values ? Object.values(filteredData.summary.missing_values as Record<string, number>).reduce((a, b) => a + b, 0) : 0} icon={<Zap className="w-5 h-5" />} trend={-4.2} />
        <MetricCard label="Anomalies" value={filteredData?.statistics?.outliers ? Object.values(filteredData.statistics.outliers as Record<string, number>).reduce((a, b) => a + b, 0) : 0} icon={<Activity className="w-5 h-5" />} trend={2.1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {(!filteredData?.visualizations || filteredData.visualizations.length === 0 || filteredData.visualizations[0]?.type === 'empty') ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-[var(--card-border)] rounded-[2rem] flex flex-col items-center justify-center text-center opacity-70 bg-[var(--card-bg)]">
              <Activity className="w-10 h-10 text-[var(--subtext)] mb-4" />
              <p className="font-bold text-lg">No meaningful visualization available.</p>
              <p className="text-[10px] text-[var(--subtext)] uppercase tracking-widest mt-2">Structure not supported for the selected filters.</p>
            </div>
          ) : (
            <ChartCard 
              title={filteredData.visualizations[0].title} 
              type={filteredData.visualizations[0].type} 
              data={filteredData.visualizations[0]} 
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <InsightSummaryCard 
            insights={aiInsights.length > 0 ? aiInsights : (filteredData?.statistical_insights ?? [])} 
            isLoading={isAiLoading}
          />
        </div>
      </div>

      {(filteredData?.visualizations?.length > 1) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredData.visualizations.slice(1).map((viz: any, idx: number) => {
            if (viz.type === 'empty') return null;
            const isFullWidth = viz.type === 'heatmap' || viz.type === 'scatter';
            return (
              <div key={idx} className={isFullWidth ? 'lg:col-span-2' : ''}>
                <ChartCard title={viz.title} type={viz.type} data={viz} />
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] font-sans text-[var(--text-main)] relative transition-colors duration-300">
      <div className="noise-texture opacity-[0.01]" />
      
      <Sidebar 
        activeView={activeView === 'settings-modal' ? 'settings' : activeView === 'support-modal' ? 'support' : activeView} 
        setActiveView={(v) => {
          if (v === 'support-modal') setIsSupportOpen(true);
          else if (v === 'settings-modal') setIsSettingsOpen(true);
          else setActiveView(v);
        }} 
      />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar 
          title={!data ? "Upload Dataset" : activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('-modal', '')}
          onUploadClick={() => setData(null)}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          notificationCount={notifications.filter(n => !n.read).length}
          onNotificationsClick={() => setIsNotificationsOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {!data ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-16"
                >
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                       <Zap className="w-3 h-3" />
                       Next-Gen Intelligence
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-br from-[var(--text-main)] to-[var(--subtext)]">
                      ANALYZE YOUR <br />
                      <span className="text-primary italic">DATA SYNTH.</span>
                    </h1>
                    
                    <p className="text-[var(--subtext)] text-lg max-w-xl mx-auto font-medium leading-relaxed">
                      Experience the next generation of AI-powered data processing and visual intelligence. Upload your dataset to begin.
                    </p>
                  </div>

                  <div className="w-full max-w-xl bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--card-border)] shadow-2xl relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-20 -z-10" />
                    <FileUploader onUpload={handleUpload} isUploading={loading} loadingPhase={loadingPhase} />
                    
                    {lastError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-left"
                      >
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-400 text-xs font-bold leading-tight">{lastError}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div key="content">
                  {activeView === 'dashboard' && renderDashboard()}
                  
                  {activeView === 'charts' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-10"
                    >
                      <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Visual Gallery</h2>
                        <p className="text-[var(--subtext)] mt-1 font-medium">Full spectrum analysis of your data dimensions.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {filteredData.visualizations?.map((viz: any, idx: number) => (
                          <ChartCard key={idx} title={viz.title} type={viz.type} data={viz} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeView === 'table' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="dashboard-card overflow-hidden shadow-2xl border-[var(--card-border)]"
                    >
                      <div className="p-8 border-b border-[var(--card-border)] flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight">Data Matrix</h2>
                          <p className="text-xs text-[var(--subtext)] mt-1 font-medium italic">Streaming raw data from {data.filename}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                           <div className="w-2 h-2 rounded-full bg-primary" />
                           <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{data.summary?.rows} RECORDS</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[var(--bg-main)] text-primary border-b border-[var(--card-border)] font-bold">
                              {data.summary?.column_names?.map((name: string) => (
                                <th key={name} className="px-8 py-5 uppercase tracking-widest text-[10px]">{name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--card-border)]">
                            {data.preview?.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-primary/5 transition-all group">
                                {data.summary?.column_names?.map((name: string) => (
                                  <td key={name} className="px-8 py-5 text-[var(--subtext)] group-hover:text-[var(--text-main)] transition-colors tabular-nums font-medium">
                                    {(() => {
                                      const val = row[name];
                                      if (val && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
                                        const d = parseISO(val);
                                        if (!isNaN(d.getTime())) return format(d, 'MMM dd, yyyy');
                                      }
                                      return val?.toString() ?? '—';
                                    })()}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <NotificationPanel 
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
        onClearAll={() => setNotifications([])}
      />

      <SupportModal 
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onChatClick={() => {
          setIsSupportOpen(false);
          setIsChatOpen(true);
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onClearData={handleClearData}
      />

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 w-full max-w-[450px] h-[700px] max-h-[85vh] z-[100] bg-[var(--card-bg)] backdrop-blur-[var(--backdrop-blur)] border border-[var(--card-border)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="relative h-full">
              <button 
                onClick={() => setIsChatOpen(false)}
                className="absolute top-6 right-6 z-[110] p-2 hover:bg-white/10 rounded-xl transition-colors text-[var(--subtext)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <ChatPanel onSendMessage={handleChatMessage} compact={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
