"""
Comprehensive End-to-End Test Suite for CropYield AI Platform
Tests all REST API endpoints, Database persistence, and ML predictions.
"""

import sys
import os

# Add root directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from starlette.testclient import TestClient
from backend.app.main import app

def run_tests():
    print("==========================================================")
    print("           CropYield AI – Full Test Suite Execution       ")
    print("==========================================================")
    
    with TestClient(app) as client:
        # 1. Healthcheck test
        print("\n[Test 1] Health Endpoint: GET /api/health")
        res = client.get("/api/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        print(" -> Healthcheck Response:", res.json())

        # 2. Crops & Presets Metadata
        print("\n[Test 2] Metadata Endpoint: GET /api/crops")
        res = client.get("/api/crops")
        assert res.status_code == 200
        meta = res.json()
        assert "crops" in meta and len(meta["crops"]) > 0
        assert "states" in meta and len(meta["states"]) > 0
        assert "presets" in meta and len(meta["presets"]) > 0
        print(f" -> Found {len(meta['crops'])} crops, {len(meta['states'])} states, {len(meta['presets'])} presets.")

        # 3. Model Prediction Test
        print("\n[Test 3] Yield Prediction: POST /api/predict (Punjab Wheat)")
        payload = {
            "state": "Punjab",
            "district": "Ludhiana",
            "crop": "Wheat",
            "season": "Rabi",
            "soil_type": "Alluvial",
            "soil_ph": 6.8,
            "temperature": 18.2,
            "rainfall": 480.0,
            "humidity": 62.0,
            "area": 5.0,
            "fertilizer": 195.0,
            "nitrogen": 115.0,
            "phosphorus": 52.0,
            "potassium": 42.0
        }
        res = client.post("/api/predict", json=payload)
        assert res.status_code == 200, f"Predict failed: {res.text}"
        pred = res.json()
        print(" -> Prediction Result:")
        print(f"    Record ID: #{pred['id']}")
        print(f"    Predicted Yield: {pred['predicted_yield']} tonnes/ha")
        print(f"    Predicted Total Production: {pred['predicted_production']} tonnes")
        print(f"    Confidence: {pred['confidence_score']}% ({pred['uncertainty_range']})")
        print(f"    Model Used: {pred['model_used']}")
        print(f"    Recommendations generated: {len(pred['recommendations'])}")
        created_id = pred["id"]

        # 4. Predictions History
        print("\n[Test 4] History Endpoint: GET /api/predictions")
        res = client.get("/api/predictions?limit=10")
        assert res.status_code == 200
        history = res.json()
        assert history["total"] >= 1
        print(f" -> Found {history['total']} persisted prediction records in DB.")

        # 5. Predictions Stats
        print("\n[Test 5] Stats Endpoint: GET /api/predictions/stats")
        res = client.get("/api/predictions/stats")
        assert res.status_code == 200
        stats = res.json()
        print(" -> History Stats:", stats)

        # 6. Analytics Endpoint
        print("\n[Test 6] Analytics Endpoint: GET /api/analytics")
        res = client.get("/api/analytics")
        assert res.status_code == 200
        analytics = res.json()
        assert "crop_yield_chart" in analytics
        assert "state_production_chart" in analytics
        print(f" -> Ingested Records in Analytics: {analytics['kpis']['total_records_analyzed']}")
        print(f" -> Crops Analyzed: {len(analytics['crop_yield_chart'])}")
        print(f" -> States Analyzed: {len(analytics['state_production_chart'])}")

        # 7. Model Performance Benchmarks
        print("\n[Test 7] Model Performance: GET /api/model-performance")
        res = client.get("/api/model-performance")
        assert res.status_code == 200
        m_perf = res.json()
        print(f" -> Best Model: {m_perf['best_model']}")
        for m in m_perf["models_comparison"]:
            print(f"    * {m['name']}: R² = {m['r2_score']}, MAE = {m['mae']}, RMSE = {m['rmse']}")

        # 8. Graph Analysis Endpoint
        print("\n[Test 8] GraphX Analysis: GET /api/graph-analysis")
        res = client.get("/api/graph-analysis")
        assert res.status_code == 200
        graph = res.json()
        print(f" -> Graph Nodes: {graph['total_nodes']}, Edges: {graph['total_edges']}, Clusters: {graph['number_of_clusters']}")

        # 9. Test Second Prediction (Maharashtra Cotton)
        print("\n[Test 9] Second Prediction: POST /api/predict (Maharashtra Cotton)")
        cotton_payload = {
            "state": "Maharashtra",
            "district": "Nagpur",
            "crop": "Cotton",
            "season": "Kharif",
            "soil_type": "Black Soil",
            "soil_ph": 7.2,
            "temperature": 28.5,
            "rainfall": 780.0,
            "humidity": 68.0,
            "area": 10.0,
            "fertilizer": 140.0,
            "nitrogen": 85.0,
            "phosphorus": 42.0,
            "potassium": 38.0
        }
        res_cotton = client.post("/api/predict", json=cotton_payload)
        assert res_cotton.status_code == 200
        cotton_pred = res_cotton.json()
        print(f" -> Cotton Yield: {cotton_pred['predicted_yield']} t/ha, Total: {cotton_pred['predicted_production']} tonnes")

        # 10. Delete Test
        print(f"\n[Test 10] Deletion: DELETE /api/predictions/{created_id}")
        del_res = client.delete(f"/api/predictions/{created_id}")
        assert del_res.status_code == 200
        print(" -> Deletion Response:", del_res.json())

    print("\n==========================================================")
    print("      ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!      ")
    print("==========================================================")

if __name__ == "__main__":
    run_tests()
