import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  BarChart3,
  Network,
  History,
  Info,
  Layers,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Database,
  Wheat
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'predict', label: 'Predict Crop Yield', icon: Sprout, badge: 'AI Model' },
  { id: 'analytics', label: 'Crop Analytics', icon: BarChart3, badge: null },
  { id: 'graph', label: 'Graph Analysis', icon: Network, badge: 'GraphX' },
  { id: 'history', label: 'Prediction History', icon: History, badge: null },
  { id: 'about', label: 'About & Architecture', icon: Info, badge: null },
];

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">CropYield</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Agronomic Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 duration-200 ${
                      isActive ? 'text-white' : 'text-emerald-400/80 group-hover:text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ${
                      isActive ? 'opacity-100 translate-x-0 text-white' : 'text-slate-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Big Data & ML Cluster Badge */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-800/70 to-slate-900/90 border border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Spark MLlib Cluster
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>Trained Model:</span>
              <span className="font-semibold text-emerald-300">Random Forest</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Model Accuracy (R²):</span>
              <span className="font-semibold text-emerald-400">99.21%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Dataset Size:</span>
              <span className="font-semibold text-slate-200">30,000 records</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Distributed Engine:</span>
              <span className="font-semibold text-slate-200">PySpark / GraphX</span>
            </div>
          </div>
        </div>

        {/* User / Workspace info */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Cluster Computing Project</span>
          <span className="text-emerald-500 font-mono text-[11px]">Online</span>
        </div>
      </aside>
    </>
  );
}
