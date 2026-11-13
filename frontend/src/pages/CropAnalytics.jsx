import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  BarChart3,
  CloudRain,
  Thermometer,
  Layers,
  MapPin,
  TrendingUp,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { fetchAnalytics } from '../services/api';

export default function CropAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');

  useEffect(() => {
    fetchAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading Big Data Analytics from Spark SQL cache...</p>
      </div>
    );
  }

  const allCrops = analytics?.crop_yield_chart || [];
  const filteredCrops = selectedCropFilter === 'All'
    ? allCrops
    : allCrops.filter((c) => c.crop === selectedCropFilter);

  const yearTrends = analytics?.year_trends || [];
  const rainfallData = analytics?.rainfall_vs_yield || [];
  const tempData = analytics?.temperature_vs_yield || [];
  const soilData = analytics?.soil_productivity_chart || [];
  const stateData = analytics?.state_production_chart || [];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Analytics Filters:
          </span>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="All">All Crops (Overview)</option>
            {allCrops.map((c) => (
              <option key={c.crop} value={c.crop}>{c.crop}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Engine: Apache Spark SQL DataFrames (30,000 Ingested Records)
        </div>
      </div>

      {/* Row 1: Crop-wise Yield Comparison & Year-wise Production Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Crop-wise Yield Comparison */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Crop-wise Yield Comparison (t/ha)</h3>
              <p className="text-xs text-slate-400">Comparing min, average, and peak yield by crop</p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCrops.slice(0, 10)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="crop" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val} t/ha`, 'Yield']}
                />
                <Bar dataKey="avg_yield" fill="#10b981" radius={[4, 4, 0, 0]} name="Avg Yield" />
                <Bar dataKey="max_yield" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Max Potential" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Year-wise Production Trends */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Year-wise Agricultural Production Index</h3>
              <p className="text-xs text-slate-400">Macro technological yield gains & multi-year trends</p>
            </div>
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearTrends} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val} (Base 100)`, 'Production Index']}
                />
                <Line
                  type="monotone"
                  dataKey="production_index"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Production Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Meteorological Correlations (Rainfall vs Yield & Temperature vs Yield) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Rainfall vs Crop Yield */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Rainfall (mm) vs Crop Yield Analysis</h3>
              <p className="text-xs text-slate-400">Precipitation response curves across varied soil biomes</p>
            </div>
            <CloudRain className="w-5 h-5 text-blue-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" dataKey="rainfall" name="Rainfall" unit="mm" stroke="#94a3b8" fontSize={11} />
                <YAxis type="number" dataKey="yield" name="Yield" unit="t/ha" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Scatter name="Farms" data={rainfallData} fill="#38bdf8" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Temperature vs Crop Yield */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Temperature (°C) vs Crop Yield</h3>
              <p className="text-xs text-slate-400">Thermal response thresholds and heat tolerance</p>
            </div>
            <Thermometer className="w-5 h-5 text-amber-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" stroke="#94a3b8" fontSize={11} />
                <YAxis type="number" dataKey="yield" name="Yield" unit="t/ha" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Scatter name="Farms" data={tempData} fill="#f59e0b" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Soil Quality Productivity & State Agricultural Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Soil Quality and Crop Productivity Analysis */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Soil Quality & Productivity Analysis</h3>
              <p className="text-xs text-slate-400">Mean yield capability by soil category</p>
            </div>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={soilData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="soil_type" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val} t/ha`, 'Avg Yield']}
                />
                <Bar dataKey="avg_yield" fill="#a855f7" radius={[4, 4, 0, 0]} name="Avg Yield" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. State-wise Agricultural Performance */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">State-wise Agricultural Output</h3>
              <p className="text-xs text-slate-400">Total production and average productivity by state</p>
            </div>
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData.slice(0, 8)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val} t/ha`, 'Avg Yield']}
                />
                <Bar dataKey="avg_yield" fill="#10b981" radius={[4, 4, 0, 0]} name="Avg Yield" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
