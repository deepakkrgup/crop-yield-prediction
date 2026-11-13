import React, { useState, useEffect } from 'react';
import { Menu, Sprout, Activity, Calendar, Sparkles } from 'lucide-react';
import { fetchHealth } from '../services/api';

const PAGE_TITLES = {
  dashboard: {
    title: 'Agricultural Intelligence Dashboard',
    subtitle: 'Real-time crop yield analytics, regional benchmarks, and distributed Big Data insights',
  },
  predict: {
    title: 'AI Crop Yield Prediction Engine',
    subtitle: 'Multivariate environmental & soil parameter evaluation using Spark MLlib ensemble models',
  },
  analytics: {
    title: 'Macro Crop & Climate Analytics',
    subtitle: 'Comparative yield performance, meteorological correlations, and soil nutrient analyses',
  },
  graph: {
    title: 'Graph-Based Agricultural Relationship Analysis',
    subtitle: 'GraphX & Network analysis modeling relationships between crops, soil types, and climate zones',
  },
  history: {
    title: 'Prediction Audit & Historical Records',
    subtitle: 'Comprehensive audit trail of AI predictions with agronomic feedback and exports',
  },
  about: {
    title: 'Big Data Architecture & Project Overview',
    subtitle: 'PySpark cluster processing, Spark MLlib evaluation benchmarks, and system topology',
  },
};

export default function Header({ activePage, setActivePage, setIsMobileOpen }) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchHealth()
      .then(() => setIsHealthy(true))
      .catch(() => setIsHealthy(false));
  }, []);

  const meta = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {meta.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block mt-0.5">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions and status */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {isHealthy ? 'Backend Connected' : 'Connecting API...'}
            </span>
          </div>

          {/* Quick Predict Button */}
          {activePage !== 'predict' && (
            <button
              onClick={() => setActivePage('predict')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-green-500 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Predict Yield</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
