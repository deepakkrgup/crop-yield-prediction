"""
Distributed Big Data Processing & Spark SQL Analytics.
Uses Apache Spark (PySpark) to ingest, clean, explore, and analyze the 30,000-row crop yield dataset.
"""

import os
import json
import time

def run_spark_processing():
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql import functions as F
        from pyspark.sql.window import Window
    except ImportError:
        print("PySpark is not installed or importing failed.")
        return None

    data_path = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\crop_yield_dataset.csv"
    output_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\metrics"
    os.makedirs(output_dir, exist_ok=True)

    print("==========================================================")
    print("      APACHE SPARK DISTRIBUTED DATA PROCESSING ENGINE     ")
    print("==========================================================")
    start_time = time.time()

    # Initialize SparkSession with local cluster configuration
    spark = SparkSession.builder \
        .appName("CropYield_BigData_Analytics") \
        .master("local[*]") \
        .config("spark.driver.memory", "2g") \
        .config("spark.sql.shuffle.partitions", "4") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")
    print("Spark Session initialized successfully.")
    print(f"Spark Version: {spark.version}")
    print(f"Master: {spark.sparkContext.master}")

    # 1. Ingestion
    print(f"\n1. Ingesting dataset from: {data_path}")
    df_raw = spark.read.option("header", "true").option("inferSchema", "true").csv(data_path)
    initial_count = df_raw.count()
    print(f"Ingested {initial_count} rows across {df_raw.rdd.getNumPartitions()} partitions.")

    # 2. Cleaning & Preprocessing
    print("\n2. Data Cleaning & Preprocessing:")
    # Drop duplicates
    df_clean = df_raw.dropDuplicates(["Record_ID"])
    # Handle missing / nulls if any
    df_clean = df_clean.na.drop(subset=["Crop", "State", "Yield_tonnes_per_hectare"])
    cleaned_count = df_clean.count()
    print(f"Retained {cleaned_count} valid records after deduplication and null validation.")

    # 3. Register as Spark SQL Temporary Table
    df_clean.createOrReplaceTempView("agricultural_records")
    print("\n3. Registered Spark SQL view: 'agricultural_records'")

    # 4. Spark SQL Exploratory Queries
    print("\n--- Running Spark SQL Query 1: Top 5 Highest Yielding Crops ---")
    q1 = spark.sql("""
        SELECT Crop, 
               ROUND(AVG(Yield_tonnes_per_hectare), 2) AS Avg_Yield,
               ROUND(MIN(Yield_tonnes_per_hectare), 2) AS Min_Yield,
               ROUND(MAX(Yield_tonnes_per_hectare), 2) AS Max_Yield,
               COUNT(*) as Sample_Count
        FROM agricultural_records
        GROUP BY Crop
        ORDER BY Avg_Yield DESC
        LIMIT 5
    """)
    q1.show()

    print("\n--- Running Spark SQL Query 2: State-wise Agricultural Production & Productivity ---")
    q2 = spark.sql("""
        SELECT State,
               ROUND(SUM(Production_tonnes), 2) AS Total_Production_Tonnes,
               ROUND(AVG(Yield_tonnes_per_hectare), 2) AS Avg_Productivity_t_ha,
               ROUND(SUM(Area_Hectares), 2) AS Total_Cultivated_Area_ha
        FROM agricultural_records
        GROUP BY State
        ORDER BY Total_Production_Tonnes DESC
    """)
    q2.show(15)

    print("\n--- Running Spark SQL Query 3: Seasonal Performance Across Soil Types ---")
    q3 = spark.sql("""
        SELECT Season, Soil_Type,
               ROUND(AVG(Yield_tonnes_per_hectare), 2) AS Avg_Yield,
               COUNT(*) AS Cultivation_Count
        FROM agricultural_records
        GROUP BY Season, Soil_Type
        ORDER BY Season, Avg_Yield DESC
    """)
    q3.show(12)

    print("\n--- Running Spark SQL Query 4: District Ranking by Yield (Window Function) ---")
    q4 = spark.sql("""
        WITH DistrictYields AS (
            SELECT State, District,
                   ROUND(AVG(Yield_tonnes_per_hectare), 2) as Avg_Yield,
                   ROUND(SUM(Production_tonnes), 2) as Total_Production
            FROM agricultural_records
            GROUP BY State, District
        )
        SELECT State, District, Avg_Yield, Total_Production,
               DENSE_RANK() OVER (PARTITION BY State ORDER BY Avg_Yield DESC) as District_Rank
        FROM DistrictYields
        ORDER BY State, District_Rank
    """)
    q4.show(15)

    # 5. Extract Analytics JSON for Backend and UI
    crop_stats = df_clean.groupBy("Crop").agg(
        F.round(F.avg("Yield_tonnes_per_hectare"), 2).alias("avg_yield"),
        F.round(F.min("Yield_tonnes_per_hectare"), 2).alias("min_yield"),
        F.round(F.max("Yield_tonnes_per_hectare"), 2).alias("max_yield"),
        F.count("Record_ID").alias("records_count")
    ).toPandas().to_dict(orient="records")

    state_stats = df_clean.groupBy("State").agg(
        F.round(F.sum("Production_tonnes"), 2).alias("total_production"),
        F.round(F.avg("Yield_tonnes_per_hectare"), 2).alias("avg_yield"),
        F.round(F.sum("Area_Hectares"), 2).alias("total_area"),
        F.count("Record_ID").alias("farm_count")
    ).toPandas().to_dict(orient="records")

    season_stats = df_clean.groupBy("Season").agg(
        F.round(F.avg("Yield_tonnes_per_hectare"), 2).alias("avg_yield"),
        F.round(F.sum("Production_tonnes"), 2).alias("total_production"),
        F.count("Record_ID").alias("count")
    ).toPandas().to_dict(orient="records")

    soil_stats = df_clean.groupBy("Soil_Type").agg(
        F.round(F.avg("Yield_tonnes_per_hectare"), 2).alias("avg_yield"),
        F.count("Record_ID").alias("count")
    ).toPandas().to_dict(orient="records")

    total_time = round(time.time() - start_time, 2)
    print(f"\nSpark processing completed in {total_time} seconds.")

    analytics_payload = {
        "spark_version": spark.version,
        "cluster_master": spark.sparkContext.master,
        "partitions_processed": df_clean.rdd.getNumPartitions(),
        "total_records": cleaned_count,
        "execution_time_seconds": total_time,
        "crop_yield_distribution": crop_stats,
        "state_production": state_stats,
        "seasonal_performance": season_stats,
        "soil_distribution": soil_stats,
        "generated_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    analytics_file = os.path.join(output_dir, "spark_analytics_summary.json")
    with open(analytics_file, "w") as f:
        json.dump(analytics_payload, f, indent=2)
    print(f"Exported Spark SQL analytics payload to: {analytics_file}")

    spark.stop()
    return analytics_payload

if __name__ == "__main__":
    run_spark_processing()
