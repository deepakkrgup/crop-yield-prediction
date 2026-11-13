import React, { useState, useEffect } from 'react';
import {
  Network,
  Share2,
  Layers,
  Sparkles,
  Info,
  Sprout,
  Filter,
  CheckCircle2,
  RefreshCw,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';
import { fetchGraphAnalysis } from '../services/api';

const TYPE_COLORS = {
  Crop: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40', fill: '#10b981' },
  Soil: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/40', fill: '#a855f7' },
  Climate: { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/40', fill: '#0ea5e9' },
  State: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40', fill: '#f59e0b' },
};

export default function GraphAnalysis() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGraphAnalysis()
      .then((data) => {
        setGraphData(data);
        if (data?.nodes?.length > 0) {
          // Select default primary crop node (e.g. Wheat or Rice)
          const defNode = data.nodes.find((n) => n.label === 'Wheat') || data.nodes[0];
          setSelectedNode(defNode);
        }
      })
      .catch((err) => console.error('Failed to load graph analysis:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading GraphX Agricultural Knowledge Network...</p>
      </div>
    );
  }

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const affinities = graphData?.top_crop_soil_affinities || [];
  const clusters = graphData?.cluster_summaries || [];

  // Filter nodes based on type and search query
  const filteredNodes = nodes.filter((node) => {
    const matchesType = filterType === 'All' || node.type === filterType;
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Find relationships for the selected node
  const activeEdges = selectedNode
    ? edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  const connectedNodeIds = new Set(
    activeEdges.map((e) => (e.source === selectedNode?.id ? e.target : e.source))
  );

  return (
    <div className="space-y-6">
      {/* Overview & GraphX Engine Specs Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apache Spark GraphX Network Analytics</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Heterogeneous Agricultural Relationship Graph
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Uncovers multi-dimensional compatibility between crop genetics, soil chemistry, regional biomes, and climatic zones via PageRank and community clustering algorithms.
          </p>
        </div>

        {/* Quick Graph Stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="p-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-lg font-bold text-emerald-400">{graphData?.total_nodes || 41}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Nodes</div>
          </div>
          <div className="p-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-lg font-bold text-teal-400">{graphData?.total_edges || 248}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Edges / Links</div>
          </div>
          <div className="p-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-lg font-bold text-purple-400">{graphData?.number_of_clusters || 3}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ecosystems</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph & Node Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Graph Network & Node Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Crop', 'Soil', 'State', 'Climate'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filterType === t
                      ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {t === 'All' ? 'All Types' : `${t}s`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Node Visual Matrix / Topology Board */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span>Click any node to inspect its agronomic graph neighborhood & PageRank</span>
              <div className="flex items-center gap-3">
                {Object.entries(TYPE_COLORS).map(([type, c]) => (
                  <span key={type} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                    <span className="text-slate-300">{type}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const colorConfig = TYPE_COLORS[node.type] || TYPE_COLORS.Crop;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 relative group ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-900/60 to-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : isConnected
                        ? 'bg-slate-800/80 border-emerald-500/50 hover:border-emerald-400'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${colorConfig.bg}/20 ${colorConfig.text} border ${colorConfig.border}`}>
                        {node.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        PR: {(node.pagerank * 100).toFixed(1)}
                      </span>
                    </div>

                    <div className="font-semibold text-white text-xs tracking-tight group-hover:text-emerald-300 transition-colors">
                      {node.label}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Deg: {node.degree}</span>
                      {node.avg_yield && (
                        <span className="text-emerald-400 font-medium">
                          {node.avg_yield} t/ha
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High-Yield Crop <-> Soil Affinities Table */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Highest-Yielding Crop & Soil Affinities (Spark GraphX Analysis)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Discovered associations with optimal productivity across historical records
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2.5 font-semibold">Crop</th>
                    <th className="pb-2.5 font-semibold">Compatible Soil Type</th>
                    <th className="pb-2.5 font-semibold text-right">Avg Productivity</th>
                    <th className="pb-2.5 font-semibold text-right">Sample Frequency</th>
                    <th className="pb-2.5 font-semibold text-center">Affinity Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {affinities.slice(0, 6).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-semibold text-white">{item.crop}</td>
                      <td className="py-2.5 text-slate-300">{item.soil}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">{item.avg_yield} t/ha</td>
                      <td className="py-2.5 text-right text-slate-400">{item.samples.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                          High Affinity
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Neighborhood Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 glow-emerald space-y-6">
              {/* Node Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      TYPE_COLORS[selectedNode.type]?.bg
                    }/20 ${TYPE_COLORS[selectedNode.type]?.text} border ${TYPE_COLORS[selectedNode.type]?.border}`}
                  >
                    {selectedNode.type} Node
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Cluster #{selectedNode.cluster}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {selectedNode.label}
                </h3>
              </div>

              {/* Spark GraphX Centrality Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400">PageRank:</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {(selectedNode.pagerank * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400">Degree Centrality:</span>
                  <div className="text-base font-bold text-teal-400 mt-0.5">
                    {selectedNode.degree} links
                  </div>
                </div>

                {selectedNode.avg_yield && (
                  <div className="col-span-2 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
                    <span className="text-emerald-300 font-medium">Mean Harvest Yield:</span>
                    <span className="text-base font-bold text-white">
                      {selectedNode.avg_yield} t/ha
                    </span>
                  </div>
                )}
              </div>

              {/* Connected Relationships List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Graph Neighborhood ({activeEdges.length})</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Active Edges</span>
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeEdges.slice(0, 15).map((edge, idx) => {
                    const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = nodes.find((n) => n.id === otherId) || { label: otherId, type: 'Unknown' };

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedNode(otherNode)}
                        className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: TYPE_COLORS[otherNode.type]?.fill || '#94a3b8' }}
                          />
                          <div>
                            <div className="font-semibold text-white">{otherNode.label}</div>
                            <div className="text-[10px] text-slate-400">{edge.relationship}</div>
                          </div>
                        </div>

                        {edge.weight && (
                          <span className="text-emerald-400 font-bold text-xs">
                            {edge.weight} t/ha
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 text-center text-xs text-slate-400">
              Select a node to inspect its graph metrics
            </div>
          )}

          {/* Discovered Communities / Ecosystems Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Graph Community Clusters
            </h4>

            <div className="space-y-3">
              {clusters.map((cluster) => (
                <div key={cluster.cluster_id} className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Ecosystem #{cluster.cluster_id + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {cluster.size} nodes
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    Key Entities: {cluster.key_nodes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
