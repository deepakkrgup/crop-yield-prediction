import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Database,
  GitBranch,
  Network,
  CheckCircle2,
  Server,
  Zap,
  Award,
  BookOpen,
  ArrowRight,
  Code2,
  Workflow
} from 'lucide-react';
import { fetchModelPerformance } from '../services/api';

export default function AboutProject() {
  const [modelPerf, setModelPerf] = useState(null);

  useEffect(() => {
    fetchModelPerformance().then(setModelPerf).catch(console.error);
  }, []);

  const models = modelPerf?.models_comparison || [
    { name: 'Random Forest Regression', r2_score: 0.9921, mae: 0.6206, rmse: 1.6125, is_best: true },
    { name: 'Linear Regression', r2_score: 0.9875, mae: 0.9778, rmse: 2.0220, is_best: false },
    { name: 'Decision Tree Regression', r2_score: 0.9867, mae: 0.8035, rmse: 2.0910, is_best: false },
  ];

  const featureImportances = modelPerf?.feature_importances || [
    { feature: 'Crop Type', importance: 72.4 },
    { feature: 'Fertilizer (kg/ha)', importance: 6.8 },
    { feature: 'Rainfall (mm)', importance: 5.4 },
    { feature: 'Soil pH', importance: 3.9 },
    { feature: 'Temperature (°C)', importance: 3.5 },
    { feature: 'Nitrogen (N)', importance: 2.8 },
    { feature: 'Potassium (K)', importance: 1.9 },
    { feature: 'Phosphorus (P)', importance: 1.5 },
    { feature: 'State & Geography', importance: 0.9 },
    { feature: 'Soil Type', importance: 0.5 },
    { feature: 'Season', importance: 0.4 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Big Data Analytics & Machine Learning Architecture</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            CropYield AI – Intelligent Crop Yield Prediction System
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            A production-grade agricultural decision support platform engineered using Apache Spark distributed dataframes, Spark SQL, Spark MLlib regression pipelines, and GraphX heterogeneous network analytics.
          </p>
        </div>
      </div>

      {/* Model Benchmark Comparison (Evaluation on R², MAE, RMSE) */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Machine Learning Model Evaluation & Benchmarks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trained and evaluated on 30,000 agricultural records (80/20 train/test split)
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 w-fit">
            Best Model: Random Forest Regression (R² = 99.21%)
          </span>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.name}
              className={`p-5 rounded-2xl border transition-all ${
                model.is_best
                  ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/60 glow-emerald'
                  : 'bg-slate-800/50 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white tracking-tight">{model.name}</span>
                {model.is_best ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase">
                    Winner
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Evaluated</span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">R² Score (Accuracy):</span>
                  <span className="font-bold text-emerald-400">{(model.r2_score * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">MAE (Mean Absolute Error):</span>
                  <span className="font-mono text-slate-200">{model.mae} t/ha</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">RMSE (Root Mean Sq Error):</span>
                  <span className="font-mono text-slate-200">{model.rmse} t/ha</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Importances */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Random Forest Gini Feature Importances (%)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureImportances.slice(0, 6).map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{feat.feature}</span>
                  <span className="text-emerald-400 font-bold">{feat.importance}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, feat.importance * 1.3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive System Architecture Topology */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Workflow className="w-5 h-5 text-teal-400" />
          End-to-End System Architecture
        </h3>

        {/* Architectural Layers Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Layer 1: Data Ingestion */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-white text-sm">Ingestion & Spark SQL</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests 30,000 historical agronomic records into distributed Spark DataFrames with schema inference, null imputation, and Catalyst query optimization.
            </p>
          </div>

          {/* Layer 2: Feature Pipeline */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-white text-sm">MLlib Feature Assembly</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Categorical encoding with StringIndexer and OneHotEncoder; vectorization with VectorAssembler and standardization with StandardScaler.
            </p>
          </div>

          {/* Layer 3: Model & Graph Analytics */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-white text-sm">MLlib & GraphX Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensemble Random Forest regression model evaluation, accompanied by GraphX PageRank and community clustering of crop-soil-climate relationships.
            </p>
          </div>

          {/* Layer 4: Modern Web Services */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h4 className="font-bold text-white text-sm">FastAPI & React UI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Asynchronous REST APIs with SQLAlchemy ORM and a modern React.js + Tailwind CSS SaaS dashboard with interactive Recharts visualizations.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Specs Table */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Technical Stack & Environment Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="font-bold text-emerald-400 uppercase tracking-wider">Big Data & Machine Learning</div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Distributed Engine:</span><span className="text-white font-mono">Apache Spark 3.5.9 (PySpark)</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">ML Pipeline:</span><span className="text-white font-mono">Spark MLlib + Scikit-Learn Bridge</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Graph Processing:</span><span className="text-white font-mono">GraphX / NetworkX Heterogeneous Topology</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-400">Query Engine:</span><span className="text-white font-mono">Spark SQL (Catalyst Optimizer)</span></div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="font-bold text-teal-400 uppercase tracking-wider">Full-Stack Application</div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Backend Framework:</span><span className="text-white font-mono">Python FastAPI 0.162+</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Database Layer:</span><span className="text-white font-mono">SQLAlchemy + SQLite / PostgreSQL</span></div>
            <div className="flex justify-between py-1 border-b border-slate-800"><span className="text-slate-400">Frontend Framework:</span><span className="text-white font-mono">React 19 + Vite 8 + Tailwind CSS</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-400">Visualizations:</span><span className="text-white font-mono">Recharts & Lucide React</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
