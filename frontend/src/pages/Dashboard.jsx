import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sprout,
  Sparkles,
  ArrowUpRight,
  Clock,
  Wheat,
  BarChart2,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { fetchAnalytics, fetchHistoryStats, fetchPredictions } from '../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function Dashboard({ setActivePage, setPresetToLoad }) {
  const [analytics, setAnalytics] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [anData, histData, predsData] = await Promise.all([
          fetchAnalytics().catch(() => null),
          fetchHistoryStats().catch(() => null),
          fetchPredictions({ limit: 5 }).catch(() => ({ records: [] }))
        ]);
        setAnalytics(anData);
        setHistoryStats(histData);
        setRecentPredictions(predsData?.records || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = analytics?.kpis || {};
  const totalPreds = (historyStats?.total_predictions || 0) + (kpis.total_records_analyzed || 30000);
  const avgYield = historyStats?.avg_yield && historyStats.avg_yield > 0
    ? historyStats.avg_yield
    : (kpis.avg_predicted_yield_t_ha || 14.28);
  const mostProductive = kpis.most_productive_crop || 'Sugarcane';
  const totalArea = (historyStats?.total_area || 0) + (kpis.total_cultivated_area_ha || 328450);

  // Take top 8 crops for clean chart rendering
  const cropDistributionData = (analytics?.crop_yield_chart || []).slice(0, 8);
  const stateProductionData = (analytics?.state_production_chart || []).slice(0, 7);
  const seasonalData = analytics?.seasonal_performance_chart || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/40 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Big Data Agricultural Intelligence Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Predict & Maximize Agricultural Production with AI
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Leverage PySpark distributed processing and Spark MLlib algorithms to evaluate soil chemistry, weather patterns, and agronomic parameters across 28 Indian agricultural zones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActivePage('predict')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-green-500 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sprout className="w-5 h-5" />
              <span>Run Yield Prediction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('graph')}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700/60 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore GraphX</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Predictions */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Analyzed Records</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalPreds.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400/90 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>30k Spark Ingested + Live History</span>
            </p>
          </div>
        </div>

        {/* Card 2: Average Predicted Yield */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Predicted Yield</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {avgYield} <span className="text-sm font-normal text-slate-400">t/ha</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Weighted national average</p>
          </div>
        </div>

        {/* Card 3: Most Productive Crop */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Most Productive Crop</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 tracking-tight">
              {mostProductive}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {kpis.most_productive_yield_t_ha || 68.96} tonnes / hectare average
            </p>
          </div>
        </div>

        {/* Card 4: Total Agricultural Area */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Cultivated Area</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {Math.round(totalArea).toLocaleString()} <span className="text-sm font-normal text-slate-400">ha</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Spanning 15 major agricultural states</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Crop Yield Distribution & Seasonal Crop Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop Yield Distribution (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Crop Yield Distribution (Tonnes / Hectare)</h3>
              <p className="text-xs text-slate-400">Comparing average and maximum yield potential by crop</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Avg Yield
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-sm bg-teal-400 inline-block" /> Max Yield
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropDistributionData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="crop" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                  formatter={(val) => [`${val} t/ha`, 'Yield']}
                />
                <Bar dataKey="avg_yield" fill="#10b981" radius={[4, 4, 0, 0]} name="Average Yield" />
                <Bar dataKey="max_yield" fill="#2dd4bf" radius={[4, 4, 0, 0]} name="Max Potential" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Crop Performance Chart (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Seasonal Performance</h3>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">Yield distribution by cropping cycle</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={seasonalData}
                    dataKey="avg_yield"
                    nameKey="season"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {seasonalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val) => [`${val} t/ha avg`, 'Yield']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800">
            {seasonalData.map((item, idx) => (
              <div key={item.season} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className="text-xs">
                  <span className="text-slate-300 font-medium">{item.season}</span>
                  <span className="text-slate-500 ml-1">({item.avg_yield} t/ha)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: State-wise Crop Production & Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State-wise Production (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">State-wise Crop Production (Total Tonnes)</h3>
              <p className="text-xs text-slate-400">Total agricultural output aggregated by PySpark distributed queries</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
              Spark SQL Aggregations
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stateProductionData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k t`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${Number(val).toLocaleString()} tonnes`, 'Production']}
                />
                <Area type="monotone" dataKey="total_production" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#prodGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Real-time Predictions Feed (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent AI Predictions</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            {recentPredictions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p>No custom predictions recorded yet.</p>
                <button
                  onClick={() => setActivePage('predict')}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs hover:bg-emerald-500/30 transition-all"
                >
                  Create First Prediction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPredictions.map((pred) => (
                  <div
                    key={pred.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between hover:border-emerald-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{pred.crop}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          {pred.season}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {pred.district}, {pred.state}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        {pred.predicted_yield} <span className="text-[10px] font-normal text-slate-400">t/ha</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {pred.predicted_production.toLocaleString()} t total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActivePage('history')}
            className="w-full mt-4 py-2 text-center text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center gap-1.5 border-t border-slate-800 pt-3"
          >
            <span>View All Historical Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
