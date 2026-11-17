// API client for CropYield AI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:8000/api' : '/api');

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function fetchMetadata() {
  const res = await fetch(`${API_BASE_URL}/crops`);
  if (!res.ok) throw new Error('Failed to fetch crop metadata');
  return res.json();
}

export async function predictYield(payload) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Prediction failed');
  }
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE_URL}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchPredictions({ crop, state, search, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (crop && crop !== 'All') params.append('crop', crop);
  if (state && state !== 'All') params.append('state', state);
  if (search) params.append('search', search);
  params.append('limit', limit);
  params.append('offset', offset);

  const res = await fetch(`${API_BASE_URL}/predictions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch predictions');
  return res.json();
}

export async function deletePrediction(id) {
  const res = await fetch(`${API_BASE_URL}/predictions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete prediction record');
  return res.json();
}

export async function fetchHistoryStats() {
  const res = await fetch(`${API_BASE_URL}/predictions/stats`);
  if (!res.ok) throw new Error('Failed to fetch history stats');
  return res.json();
}

export async function fetchModelPerformance() {
  const res = await fetch(`${API_BASE_URL}/model-performance`);
  if (!res.ok) throw new Error('Failed to fetch model performance');
  return res.json();
}

export async function fetchGraphAnalysis() {
  const res = await fetch(`${API_BASE_URL}/graph-analysis`);
  if (!res.ok) throw new Error('Failed to fetch graph analysis');
  return res.json();
}
