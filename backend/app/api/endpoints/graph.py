import os
import json
from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter()

@router.get("/graph-analysis")
def get_graph_analysis():
    if os.path.exists(settings.GRAPH_DATA_PATH):
        try:
            with open(settings.GRAPH_DATA_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass

    return {
        "graph_name": "Agricultural Crop-Soil-Climate Ecosystem Graph",
        "total_nodes": 0,
        "total_edges": 0,
        "number_of_clusters": 0,
        "nodes": [],
        "edges": [],
        "top_crop_soil_affinities": [],
        "cluster_summaries": []
    }
