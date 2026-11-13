"""
Spark MLlib Machine Learning Pipeline.
Trains and compares:
1. Linear Regression
2. Decision Tree Regression
3. Random Forest Regression
Using Spark MLlib Pipeline, VectorAssembler, StringIndexer, OneHotEncoder, and RegressionEvaluator.
"""

import os
import json
import time

def train_mllib_pipeline():
    try:
        from pyspark.sql import SparkSession
        from pyspark.ml import Pipeline
        from pyspark.ml.feature import StringIndexer, OneHotEncoder, VectorAssembler, StandardScaler
        from pyspark.ml.regression import LinearRegression, DecisionTreeRegressor, RandomForestRegressor
        from pyspark.ml.evaluation import RegressionEvaluator
    except ImportError as e:
        print(f"PySpark MLlib import failed: {e}")
        return None

    data_path = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\crop_yield_dataset.csv"
    metrics_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\metrics"
    models_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\models"
    os.makedirs(metrics_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    print("==========================================================")
    print("         APACHE SPARK MLLIB DISTRIBUTED ML PIPELINE       ")
    print("==========================================================")
    start_time = time.time()

    spark = SparkSession.builder \
        .appName("SparkMLlib_CropYield_Training") \
        .master("local[*]") \
        .config("spark.driver.memory", "3g") \
        .getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    print(f"Loading dataset from: {data_path}")
    df = spark.read.option("header", "true").option("inferSchema", "true").csv(data_path)
    total_count = df.count()
    print(f"Dataset rows loaded into Spark: {total_count}")

    categorical_cols = ["State", "District", "Crop", "Season", "Soil_Type"]
    numerical_cols = [
        "Soil_pH", "Temperature_C", "Rainfall_mm", "Humidity_pct",
        "Area_Hectares", "Fertilizer_kg_ha", "Nitrogen_N", "Phosphorus_P", "Potassium_K"
    ]
    target_col = "Yield_tonnes_per_hectare"

    # Split train/test (80/20)
    train_data, test_data = df.randomSplit([0.8, 0.2], seed=42)
    print(f"Train split: {train_data.count()} rows | Test split: {test_data.count()} rows")

    # 1. Feature Engineering Stages
    indexers = [
        StringIndexer(inputCol=col, outputCol=f"{col}_idx", handleInvalid="keep")
        for col in categorical_cols
    ]
    encoded_cols = [f"{col}_vec" for col in categorical_cols]
    encoder = OneHotEncoder(
        inputCols=[f"{col}_idx" for col in categorical_cols],
        outputCols=encoded_cols
    )

    assembler = VectorAssembler(
        inputCols=numerical_cols + encoded_cols,
        outputCol="raw_features",
        handleInvalid="keep"
    )

    scaler = StandardScaler(inputCol="raw_features", outputCol="features", withStd=True, withMean=True)

    # Preprocessing feature pipeline
    feature_pipeline = Pipeline(stages=indexers + [encoder, assembler, scaler])
    print("Fitting distributed Feature Engineering pipeline...")
    feature_model = feature_pipeline.fit(train_data)
    train_features = feature_model.transform(train_data).cache()
    test_features = feature_model.transform(test_data).cache()

    # Evaluators
    r2_evaluator = RegressionEvaluator(labelCol=target_col, predictionCol="prediction", metricName="r2")
    rmse_evaluator = RegressionEvaluator(labelCol=target_col, predictionCol="prediction", metricName="rmse")
    mae_evaluator = RegressionEvaluator(labelCol=target_col, predictionCol="prediction", metricName="mae")

    # Regressors to compare
    regressors = {
        "Spark MLlib Linear Regression": LinearRegression(featuresCol="features", labelCol=target_col, maxIter=100, regParam=0.1),
        "Spark MLlib Decision Tree": DecisionTreeRegressor(featuresCol="features", labelCol=target_col, maxDepth=12),
        "Spark MLlib Random Forest": RandomForestRegressor(featuresCol="features", labelCol=target_col, numTrees=40, maxDepth=14, seed=42)
    }

    mllib_results = []
    best_model = None
    best_r2 = -1.0
    best_name = ""

    for name, reg in regressors.items():
        print(f"\n--- Training {name} ---")
        t0 = time.time()
        model = reg.fit(train_features)
        train_duration = round(time.time() - t0, 2)
        print(f"Training completed in {train_duration}s. Generating predictions on test set...")

        predictions = model.transform(test_features)
        r2 = round(float(r2_evaluator.evaluate(predictions)), 4)
        rmse = round(float(rmse_evaluator.evaluate(predictions)), 4)
        mae = round(float(mae_evaluator.evaluate(predictions)), 4)

        print(f"Spark MLlib Evaluation -> R²: {r2}, RMSE: {rmse}, MAE: {mae}")
        item = {
            "name": name,
            "engine": "Apache Spark MLlib",
            "r2_score": r2,
            "rmse": rmse,
            "mae": mae,
            "training_time_s": train_duration,
            "is_best": False
        }
        mllib_results.append(item)

        if r2 > best_r2:
            best_r2 = r2
            best_model = model
            best_name = name

    # Mark best model
    for item in mllib_results:
        if item["name"] == best_name:
            item["is_best"] = True

    print(f"\n>>> Best Spark MLlib Model: {best_name} with R²: {best_r2}")

    # Export metrics to JSON
    total_time = round(time.time() - start_time, 2)
    export_data = {
        "engine": "Apache Spark 3.x/4.x MLlib",
        "dataset_size": total_count,
        "best_model": best_name,
        "total_execution_time_s": total_time,
        "models_comparison": mllib_results,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    metrics_file = os.path.join(metrics_dir, "spark_mllib_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(export_data, f, indent=2)
    print(f"Spark MLlib evaluation report saved to: {metrics_file}")

    spark.stop()
    return export_data

if __name__ == "__main__":
    train_mllib_pipeline()
