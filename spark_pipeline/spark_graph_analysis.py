"""
Graph-Based Agricultural Relationship Analysis (GraphX / PySpark & NetworkX implementation).
Constructs heterogeneous agricultural graph connecting:
Crops <-> Soil Types <-> States/Districts <-> Climatic Zones.
Computes:
- Degree Centrality & PageRank
- High-yield compatibility clusters
- Soil-Crop affinity weights
- Exports node-link structure for frontend interactive visual graph
"""

import os
import json
import pandas as pd
import networkx as nx
import numpy as np

def build_agricultural_graph():
    data_path = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\crop_yield_dataset.csv"
    metrics_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\metrics"
    os.makedirs(metrics_dir, exist_ok=True)

    print("Building Agricultural Knowledge Graph...")
    df = pd.read_csv(data_path)

    # Initialize NetworkX graph
    G = nx.Graph()

    # Climate zone mapping helper based on rainfall and temperature
    def categorize_climate(row):
        rain = row["Rainfall_mm"]
        temp = row["Temperature_C"]
        if rain > 1500 and temp > 22:
            return "Tropical Wet / Monsoon"
        elif rain < 500 and temp > 24:
            return "Arid & Semi-Arid"
        elif temp < 20:
            return "Cool Temperate / Subtropical"
        elif rain > 1000:
            return "Humid Subtropical"
        else:
            return "Semi-Arid Moderate"

    df["Climate_Zone"] = df.apply(categorize_climate, axis=1)

    # 1. Define Nodes
    crops = df["Crop"].unique()
    soils = df["Soil_Type"].unique()
    states = df["State"].unique()
    climates = df["Climate_Zone"].unique()

    nodes_dict = {}

    for c in crops:
        node_id = f"crop_{c}"
        avg_y = float(df[df["Crop"] == c]["Yield_tonnes_per_hectare"].mean())
        tot_p = float(df[df["Crop"] == c]["Production_tonnes"].sum())
        G.add_node(node_id, label=c, type="Crop", avg_yield=round(avg_y, 2), production=round(tot_p, 2), size=35)
        nodes_dict[node_id] = G.nodes[node_id]

    for s in soils:
        node_id = f"soil_{s.replace(' ', '_')}"
        avg_y = float(df[df["Soil_Type"] == s]["Yield_tonnes_per_hectare"].mean())
        count = int(len(df[df["Soil_Type"] == s]))
        G.add_node(node_id, label=s, type="Soil", avg_yield=round(avg_y, 2), count=count, size=28)
        nodes_dict[node_id] = G.nodes[node_id]

    for st in states:
        node_id = f"state_{st.replace(' ', '_')}"
        tot_p = float(df[df["State"] == st]["Production_tonnes"].sum())
        avg_y = float(df[df["State"] == st]["Yield_tonnes_per_hectare"].mean())
        G.add_node(node_id, label=st, type="State", production=round(tot_p, 2), avg_yield=round(avg_y, 2), size=24)
        nodes_dict[node_id] = G.nodes[node_id]

    for cl in climates:
        node_id = f"climate_{cl.replace(' ', '_').replace('/', '_')}"
        count = int(len(df[df["Climate_Zone"] == cl]))
        G.add_node(node_id, label=cl, type="Climate", count=count, size=22)
        nodes_dict[node_id] = G.nodes[node_id]

    # 2. Add Weighted Edges
    # A. Crop <-> Soil edges (affinity and productivity)
    crop_soil_agg = df.groupby(["Crop", "Soil_Type"]).agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        count=("Record_ID", "count")
    ).reset_index()

    for _, row in crop_soil_agg.iterrows():
        u = f"crop_{row['Crop']}"
        v = f"soil_{row['Soil_Type'].replace(' ', '_')}"
        weight = float(row["avg_yield"])
        freq = int(row["count"])
        # Only add significant associations
        if freq > 50:
            G.add_edge(u, v, relationship="SUITABLE_SOIL", weight=round(weight, 2), frequency=freq)

    # B. Crop <-> State edges
    crop_state_agg = df.groupby(["Crop", "State"]).agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        total_prod=("Production_tonnes", "sum"),
        count=("Record_ID", "count")
    ).reset_index()

    for _, row in crop_state_agg.iterrows():
        u = f"crop_{row['Crop']}"
        v = f"state_{row['State'].replace(' ', '_')}"
        freq = int(row["count"])
        if freq > 40:
            G.add_edge(u, v, relationship="CULTIVATED_IN", weight=round(float(row["avg_yield"]), 2), production=round(float(row["total_prod"]), 2))

    # C. Crop <-> Climate edges
    crop_clim_agg = df.groupby(["Crop", "Climate_Zone"]).agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        count=("Record_ID", "count")
    ).reset_index()

    for _, row in crop_clim_agg.iterrows():
        u = f"crop_{row['Crop']}"
        v = f"climate_{row['Climate_Zone'].replace(' ', '_').replace('/', '_')}"
        freq = int(row["count"])
        if freq > 60:
            G.add_edge(u, v, relationship="ADAPTED_CLIMATE", weight=round(float(row["avg_yield"]), 2), count=freq)

    # 3. Compute Graph Metrics (PageRank, Degree Centrality, Communities)
    pagerank_scores = nx.pagerank(G, weight="weight")
    degree_centrality = nx.degree_centrality(G)
    
    # Community detection using greedy modularity
    communities = list(nx.community.greedy_modularity_communities(G))
    community_map = {}
    for comm_idx, comm in enumerate(communities):
        for node in comm:
            community_map[node] = comm_idx

    # Format nodes for JSON visualization
    nodes_list = []
    for node_id, data in G.nodes(data=True):
        nodes_list.append({
            "id": node_id,
            "label": data.get("label", node_id),
            "type": data.get("type", "Unknown"),
            "size": data.get("size", 20),
            "avg_yield": data.get("avg_yield", None),
            "production": data.get("production", None),
            "count": data.get("count", None),
            "pagerank": round(pagerank_scores.get(node_id, 0.0), 4),
            "degree": G.degree(node_id),
            "centrality": round(degree_centrality.get(node_id, 0.0), 4),
            "cluster": community_map.get(node_id, 0)
        })

    # Format edges
    edges_list = []
    for u, v, data in G.edges(data=True):
        edges_list.append({
            "source": u,
            "target": v,
            "relationship": data.get("relationship", "ASSOCIATED"),
            "weight": data.get("weight", 1.0),
            "frequency": data.get("frequency", None)
        })

    # High-Yield Patterns & Agronomic Insights
    # Find highest yielding crop-soil pairs
    top_crop_soils = crop_soil_agg.sort_values(by="avg_yield", ascending=False).head(10).to_dict(orient="records")

    graph_payload = {
        "graph_name": "Agricultural Crop-Soil-Climate Ecosystem Graph",
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "number_of_clusters": len(communities),
        "nodes": nodes_list,
        "edges": edges_list,
        "top_crop_soil_affinities": [
            {
                "crop": row["Crop"],
                "soil": row["Soil_Type"],
                "avg_yield": round(float(row["avg_yield"]), 2),
                "samples": int(row["count"])
            }
            for row in top_crop_soils
        ],
        "cluster_summaries": [
            {
                "cluster_id": idx,
                "size": len(comm),
                "key_nodes": [G.nodes[n].get("label", n) for n in list(comm)[:6]]
            }
            for idx, comm in enumerate(communities)
        ]
    }

    output_path = os.path.join(metrics_dir, "agricultural_graph_data.json")
    with open(output_path, "w") as f:
        json.dump(graph_payload, f, indent=2)

    print(f"Graph analysis complete: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} clusters.")
    print(f"Exported graph analysis payload to: {output_path}")

    return graph_payload

if __name__ == "__main__":
    build_agricultural_graph()
