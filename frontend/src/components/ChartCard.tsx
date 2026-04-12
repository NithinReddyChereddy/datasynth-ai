import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'histogram' | 'scatter' | 'pie' | 'heatmap' | 'boxplot' | 'empty';
  data: any;
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = typeof value === 'number' 
      ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
      : value;

    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl shadow-2xl backdrop-blur-[var(--backdrop-blur)]">
        <p className="text-[10px] font-bold text-[var(--subtext)] uppercase tracking-widest mb-1.5">
          {type === 'scatter' ? `X: ${payload[0].payload.x}` : label}
        </p>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-primary" />
           <p className="text-xl font-bold text-[var(--text-main)] tracking-tight">
             {type === 'scatter' ? `Y: ${formattedValue}` : formattedValue}
           </p>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartCard: React.FC<ChartCardProps> = ({ title, type, data }) => {
  const chartColor = "#10B981"; // Primary Emerald
  const secondaryColor = "#22D3EE"; // Secondary Cyan
  
  const commonAxisProps = {
    stroke: "var(--subtext)",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tick: { fill: "var(--subtext)", fontWeight: 500 },
    dy: 10
  };

  const renderChart = () => {
    if (!data || type === 'empty') return (
      <div className="h-[260px] flex flex-col items-center justify-center text-center space-y-3 px-8">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Activity className="w-6 h-6 text-[var(--subtext)] opacity-50" />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--text-main)] italic">
            {data?.title || "No suitable visualization available"}
          </p>
          <p className="text-[10px] text-[var(--subtext)] mt-1 max-w-[200px]">
            {data?.message || "We couldn't detect enough meaningful patterns to generate automated charts."}
          </p>
        </div>
      </div>
    );

    switch (type) {
      case 'pie':
        const pieData = data.labels?.map((label: any, i: number) => ({ name: label, value: data.values?.[i] })) || [];
        const COLORS = [chartColor, secondaryColor, '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        return (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
              >
                {pieData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        const columns = data.columns || [];
        const matrix = data.data || {};
        return (
          <div className="h-[260px] flex flex-col pt-4 overflow-auto scrollbar-none">
            <div className="grid gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-sm overflow-hidden" style={{ gridTemplateColumns: `repeat(${columns.length + 1}, minmax(0, 1fr))` }}>
              <div className="bg-[var(--card-bg)]" />
              {columns.map((c: string) => (
                <div key={c} className="text-[7px] font-black text-[var(--subtext)] truncate p-2 text-center uppercase bg-[var(--card-bg)]">{c}</div>
              ))}
              {columns.map((row: string) => (
                <React.Fragment key={row}>
                  <div className="text-[7px] font-black text-[var(--subtext)] truncate p-2 text-right uppercase bg-[var(--card-bg)]">{row}</div>
                  {columns.map((col: string) => {
                    const rowData = matrix[row] || {};
                    const val = rowData[col] ?? 0;
                    const opacity = Math.abs(val);
                    return (
                      <div 
                        key={`${row}-${col}`}
                        className="aspect-square flex items-center justify-center text-[8px] font-bold transition-all hover:brightness-110 cursor-help"
                        style={{ 
                          backgroundColor: val > 0 ? `rgba(16, 185, 129, ${opacity * 0.8 + 0.1})` : `rgba(239, 68, 68, ${opacity * 0.8 + 0.1})`,
                          color: opacity > 0.4 ? 'white' : 'var(--text-main)'
                        }}
                        title={`${row} vs ${col}: ${val.toFixed(2)}`}
                      >
                        {val.toFixed(1)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'boxplot':
        const stats = data.stats || {};
        const range = (stats.max - stats.min) || 1;
        const boxHeight = ((stats.q3 - stats.q1) / range) * 100;
        const boxBottom = ((stats.q1 - stats.min) / range) * 100;
        const medianTop = ((stats.q3 - stats.median) / (stats.q3 - stats.q1 || 1)) * 100;

        return (
          <div className="h-[260px] flex items-center justify-center p-8">
            <div className="relative w-full h-full border-l border-b border-[var(--card-border)] flex items-end justify-center pb-8">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${boxHeight}%` }}
                className="w-16 bg-primary/20 border-2 border-primary rounded-sm relative"
                style={{ bottom: `${boxBottom}%` }}
              >
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{ top: `${medianTop}%` }}
                />
              </motion.div>
              <div 
                className="absolute w-0.5 bg-[var(--card-border)]"
                style={{ 
                  height: '100%', 
                  left: '50%', 
                  bottom: '0',
                  transform: 'translateX(-50%)'
                }}
              />
              <div className="absolute left-0 top-0 text-[8px] font-bold text-[var(--subtext)]">{stats.max?.toFixed(1)}</div>
              <div className="absolute left-0 bottom-8 text-[8px] font-bold text-[var(--subtext)]">{stats.min?.toFixed(1)}</div>
            </div>
            <div className="ml-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--subtext)]">Statistics</div>
              <div className="text-xs font-black text-primary">Med: {stats.median?.toFixed(1)}</div>
              <div className="text-[8px] font-bold text-[var(--subtext)]">IQR: {stats.iqr?.toFixed(1)}</div>
            </div>
          </div>
        );

      case 'line':
        const lineData = (data.x || []).map((label: any, i: number) => ({ 
          x: label, 
          y: parseFloat(data.y?.[i]) || 0 
        }));
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis 
                dataKey="x" 
                type="category"
                {...commonAxisProps} 
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                type="number"
                {...commonAxisProps} 
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
              />
              <Tooltip content={<CustomTooltip type={type} />} cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke={chartColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorArea)" 
                animationDuration={1500}
                activeDot={{ r: 6, fill: chartColor, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        const barData = (data.labels || []).map((label: any, i: number) => ({ 
          name: label, 
          value: parseFloat(data.values?.[i]) || 0 
        }));
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                type="category"
                {...commonAxisProps} 
                interval={0}
                angle={barData.length > 5 ? -45 : 0}
                textAnchor={barData.length > 5 ? 'end' : 'middle'}
                height={60}
              />
              <YAxis 
                type="number"
                {...commonAxisProps} 
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
              />
              <Tooltip content={<CustomTooltip type={type} />} cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} />
              <Bar 
                dataKey="value" 
                fill={chartColor} 
                radius={[6, 6, 0, 0]} 
                animationDuration={1000}
                barSize={Math.min(40, 400 / barData.length)}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        const histData = (data.labels || []).map((label: any, i: number) => ({ name: label, value: data.values?.[i] }));
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={histData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} tick={{ fontSize: 9 }} />
              <YAxis {...commonAxisProps} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
              <Tooltip content={<CustomTooltip type={type} />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={secondaryColor} 
                strokeWidth={2}
                fill={secondaryColor} 
                fillOpacity={0.15}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        const scatterData = (data.x_data || []).map((x: any, i: number) => ({ x, y: data.y_data?.[i] }));
        return (
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis type="number" dataKey="x" name={data.x_label} {...commonAxisProps} />
              <YAxis type="number" dataKey="y" name={data.y_label} {...commonAxisProps} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip type={type} />} />
              <Scatter name="Data" data={scatterData} fill={chartColor} animationDuration={1800}>
                {scatterData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={chartColor} fillOpacity={0.6} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-[260px] flex items-center justify-center text-[var(--subtext)] italic px-8 text-center">
            {type === 'empty' ? data.title : "No suitable visualization available"}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dashboard-card p-6 h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          <p className="text-[10px] text-[var(--subtext)] font-semibold mt-1 uppercase tracking-wider">Dynamic Stream</p>
        </div>
        <div className="flex gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </div>
      
      <div className="relative z-10">
        {renderChart()}
      </div>
    </motion.div>
  );
};

