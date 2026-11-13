import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import PredictYield from './pages/PredictYield';
import CropAnalytics from './pages/CropAnalytics';
import GraphAnalysis from './pages/GraphAnalysis';
import PredictionHistory from './pages/PredictionHistory';
import AboutProject from './pages/AboutProject';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [presetToLoad, setPresetToLoad] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setPresetToLoad={setPresetToLoad} />;
      case 'predict':
        return <PredictYield setActivePage={setActivePage} preloadedPreset={presetToLoad} />;
      case 'analytics':
        return <CropAnalytics />;
      case 'graph':
        return <GraphAnalysis />;
      case 'history':
        return <PredictionHistory setActivePage={setActivePage} />;
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard setActivePage={setActivePage} setPresetToLoad={setPresetToLoad} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>CropYield AI – Intelligent Crop Yield Prediction Platform</span>
            <span className="font-mono text-[11px] text-emerald-500/80">
              Apache Spark • Spark MLlib • GraphX • FastAPI • React
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
