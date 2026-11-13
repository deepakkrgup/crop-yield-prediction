import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Calendar,
  Layers,
  Sprout,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchPredictions, deletePrediction, fetchMetadata } from '../services/api';

export default function PredictionHistory({ setActivePage }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [page, setPage] = useState(0);
  const limit = 15;

  // Modal inspection state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchPredictions({
        crop: selectedCrop,
        state: selectedState,
        search,
        limit,
        offset: page * limit,
      });
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load predictions history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata().then(setMetadata).catch(console.error);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [selectedCrop, selectedState, page]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadRecords();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete prediction record #${id}?`)) {
      return;
    }
    try {
      setIsDeleting(id);
      await deletePrediction(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert('Failed to delete record: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  // Export records to CSV
  const exportToCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'ID', 'Date', 'State', 'District', 'Crop', 'Season', 'Soil_Type',
      'Soil_pH', 'Temperature_C', 'Rainfall_mm', 'Humidity_pct', 'Area_ha',
      'Fertilizer_kg_ha', 'Nitrogen', 'Phosphorus', 'Potassium',
      'Predicted_Yield_t_ha', 'Total_Production_t', 'Confidence_Score'
    ];
    const csvRows = records.map((r) => [
      r.id,
      r.created_at,
      r.state,
      r.district,
      r.crop,
      r.season,
      r.soil_type,
      r.soil_ph,
      r.temperature,
      r.rainfall,
      r.humidity,
      r.area,
      r.fertilizer,
      r.nitrogen,
      r.phosphorus,
      r.potassium,
      r.predicted_yield,
      r.predicted_production,
      r.confidence_score
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `crop_yield_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Prediction Audit Trail & Historical Archive
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted in SQLite/PostgreSQL with multi-parameter telemetry and agronomic advisories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActivePage('predict')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-green-500 transition-all flex items-center gap-2"
          >
            <Sprout className="w-4 h-4" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop, district, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Crop Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Crops</option>
              {(metadata?.crops || ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize']).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>State:</span>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All States</option>
              {(metadata?.states || ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Gujarat']).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadRecords}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Historical Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">ID</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Crop & Season</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Soil & pH</th>
                <th className="py-3.5 px-4 font-semibold text-right">Area</th>
                <th className="py-3.5 px-4 font-semibold text-right">Predicted Yield</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Production</th>
                <th className="py-3.5 px-4 font-semibold text-center">Confidence</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading historical records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <span>No prediction records match your query.</span>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-slate-400">#{r.id}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{r.crop}</div>
                      <div className="text-[10px] text-emerald-400">{r.season}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{r.district}</div>
                      <div className="text-[10px] text-slate-500">{r.state}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{r.soil_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">pH {r.soil_ph}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                      {r.area} ha
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {r.predicted_yield} t/ha
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-teal-300">
                      {r.predicted_production.toLocaleString()} t
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                        {r.confidence_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={isDeleting === r.id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {records.length} of {total} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page + 1} of {Math.max(1, Math.ceil(total / limit))}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= total}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-card rounded-3xl border border-emerald-500/30 glow-emerald p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Record #{selectedRecord.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedRecord.crop} Prediction Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yield & Output Hero */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div>
                <span className="text-xs text-slate-400">Predicted Yield:</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {selectedRecord.predicted_yield} t/ha
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {selectedRecord.uncertainty_range}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Total Production:</span>
                <div className="text-2xl font-bold text-teal-300">
                  {selectedRecord.predicted_production.toLocaleString()} tonnes
                </div>
                <div className="text-xs text-slate-500">
                  Across {selectedRecord.area} hectares
                </div>
              </div>
            </div>

            {/* All 12 Parameters Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Input Feature Tensors
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Location</div>
                  <div className="font-semibold text-white">{selectedRecord.district}, {selectedRecord.state}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Season</div>
                  <div className="font-semibold text-white">{selectedRecord.season}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Soil Type & pH</div>
                  <div className="font-semibold text-white">{selectedRecord.soil_type} (pH {selectedRecord.soil_ph})</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Temperature</div>
                  <div className="font-semibold text-white">{selectedRecord.temperature}°C</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Rainfall</div>
                  <div className="font-semibold text-white">{selectedRecord.rainfall} mm</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Humidity</div>
                  <div className="font-semibold text-white">{selectedRecord.humidity}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">Fertilizer</div>
                  <div className="font-semibold text-white">{selectedRecord.fertilizer} kg/ha</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="text-slate-500 text-[10px]">NPK Ratio</div>
                  <div className="font-semibold text-emerald-400">
                    {selectedRecord.nitrogen}:{selectedRecord.phosphorus}:{selectedRecord.potassium}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Recommendations */}
            {selectedRecord.recommendations && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Agronomic Advisories
                </h4>
                <div className="space-y-1.5 text-xs">
                  {(() => {
                    try {
                      const recs = JSON.parse(selectedRecord.recommendations);
                      return recs.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300">
                          <span className="font-semibold text-emerald-400 mr-1.5">[{r.category}]</span>
                          <span>{r.message}</span>
                        </div>
                      ));
                    } catch {
                      return <div className="text-slate-400">{selectedRecord.recommendations}</div>;
                    }
                  })()}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
