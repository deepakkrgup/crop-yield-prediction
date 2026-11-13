"""
Generate comprehensive, agronomically realistic agricultural dataset for Big Data processing.
Generates 30,000 records containing:
State, District, Crop, Season, Soil_Type, Soil_pH, Temperature_C, Rainfall_mm,
Humidity_pct, Area_Hectares, Fertilizer_kg_ha, Nitrogen_N, Phosphorus_P, Potassium_K,
Yield_tonnes_per_hectare, Production_tonnes
"""

import os
import random
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Geographic hierarchy
STATE_DISTRICTS = {
    "Punjab": ["Ludhiana", "Amritsar", "Patiala", "Jalandhar", "Bathinda", "Firozpur", "Gurdaspur"],
    "Haryana": ["Karnal", "Hisar", "Rohtak", "Ambala", "Sirsa", "Kurukshetra", "Sonipat"],
    "Uttar Pradesh": ["Meerut", "Varanasi", "Lucknow", "Kanpur", "Bareilly", "Agra", "Gorakhpur", "Aligarh"],
    "Maharashtra": ["Pune", "Nashik", "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Ahmednagar"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain", "Jabalpur", "Gwalior", "Sagar", "Dewas"],
    "Gujarat": ["Ahmedabad", "Rajkot", "Surat", "Vadodara", "Junagadh", "Bhavnagar", "Mehsana"],
    "Karnataka": ["Bengaluru", "Mysuru", "Belagavi", "Dharwad", "Mandya", "Shimoga", "Ballari"],
    "Andhra Pradesh": ["Guntur", "Krishna", "West Godavari", "Kurnool", "Visakhapatnam", "Nellore", "Chittoor"],
    "Tamil Nadu": ["Thanjavur", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Erode", "Tirunelveli"],
    "West Bengal": ["Burdwan", "Hooghly", "Murshidabad", "Nadia", "Birbhum", "Midnapore", "Malda"],
    "Rajasthan": ["Jaipur", "Kota", "Sri Ganganagar", "Jodhpur", "Alwar", "Bikaner", "Nagaur"],
    "Bihar": ["Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga", "Rohtas", "Samastipur"],
    "Kerala": ["Palakkad", "Wayanad", "Idukki", "Alappuzha", "Thrissur", "Kottayam"],
    "Assam": ["Nagaon", "Kamrup", "Dibrugarh", "Jorhat", "Cachar", "Sonitpur"],
    "Telangana": ["Warangal", "Karimnagar", "Nalgonda", "Khammam", "Nizamabad", "Mahabubnagar"]
}

# State infrastructure & irrigation productivity index (scale 0.90 - 1.25)
STATE_PRODUCTIVITY_INDEX = {
    "Punjab": 1.22,
    "Haryana": 1.18,
    "Uttar Pradesh": 1.05,
    "Maharashtra": 1.02,
    "Madhya Pradesh": 0.98,
    "Gujarat": 1.08,
    "Karnataka": 1.04,
    "Andhra Pradesh": 1.06,
    "Tamil Nadu": 1.10,
    "West Bengal": 1.03,
    "Rajasthan": 0.94,
    "Bihar": 0.93,
    "Kerala": 1.00,
    "Assam": 0.96,
    "Telangana": 1.03
}

# Crop Agronomic Profiles
# base_yield (t/ha), optimal_temp [min, opt, max], optimal_rainfall [min, opt, max],
# optimal_humidity [min, opt, max], optimal_pH [min, opt, max],
# NPK ideal [N, P, K], primary_soils, primary_seasons
CROP_PROFILES = {
    "Rice": {
        "base_yield": 3.8,
        "temp": (20, 28, 38),
        "rainfall": (800, 1400, 2600),
        "humidity": (60, 80, 95),
        "ph": (5.2, 6.5, 7.8),
        "npk": (100, 45, 45),
        "fertilizer": (120, 180, 240),
        "soils": ["Alluvial", "Clay Loam", "Black Soil"],
        "seasons": ["Kharif", "Whole Year"]
    },
    "Wheat": {
        "base_yield": 4.2,
        "temp": (10, 18, 28),
        "rainfall": (250, 500, 850),
        "humidity": (40, 60, 75),
        "ph": (6.0, 6.8, 8.0),
        "npk": (110, 50, 40),
        "fertilizer": (130, 190, 250),
        "soils": ["Alluvial", "Sandy Loam", "Clay Loam"],
        "seasons": ["Rabi"]
    },
    "Maize": {
        "base_yield": 3.2,
        "temp": (16, 25, 35),
        "rainfall": (450, 750, 1200),
        "humidity": (45, 68, 85),
        "ph": (5.5, 6.5, 7.5),
        "npk": (90, 45, 35),
        "fertilizer": (100, 150, 210),
        "soils": ["Alluvial", "Red Soil", "Black Soil"],
        "seasons": ["Kharif", "Rabi", "Whole Year"]
    },
    "Cotton": {
        "base_yield": 2.1,
        "temp": (21, 28, 39),
        "rainfall": (450, 750, 1100),
        "humidity": (45, 65, 80),
        "ph": (6.0, 7.0, 8.2),
        "npk": (80, 40, 40),
        "fertilizer": (90, 140, 200),
        "soils": ["Black Soil", "Alluvial"],
        "seasons": ["Kharif"]
    },
    "Sugarcane": {
        "base_yield": 78.0,
        "temp": (20, 30, 40),
        "rainfall": (1100, 1750, 2800),
        "humidity": (55, 75, 90),
        "ph": (6.0, 6.8, 8.2),
        "npk": (180, 75, 90),
        "fertilizer": (220, 320, 450),
        "soils": ["Alluvial", "Black Soil", "Clay Loam"],
        "seasons": ["Whole Year", "Kharif"]
    },
    "Soybean": {
        "base_yield": 1.9,
        "temp": (18, 26, 35),
        "rainfall": (500, 800, 1200),
        "humidity": (50, 70, 85),
        "ph": (6.0, 6.7, 7.5),
        "npk": (35, 65, 45),  # Legume, fixes N
        "fertilizer": (70, 110, 160),
        "soils": ["Black Soil", "Clay Loam", "Alluvial"],
        "seasons": ["Kharif"]
    },
    "Groundnut": {
        "base_yield": 2.2,
        "temp": (20, 28, 36),
        "rainfall": (400, 650, 950),
        "humidity": (45, 65, 80),
        "ph": (5.8, 6.5, 7.4),
        "npk": (30, 55, 45),
        "fertilizer": (60, 100, 150),
        "soils": ["Sandy Loam", "Red Soil", "Alluvial"],
        "seasons": ["Kharif", "Rabi"]
    },
    "Pulses": {
        "base_yield": 1.3,
        "temp": (15, 24, 33),
        "rainfall": (350, 600, 900),
        "humidity": (40, 60, 75),
        "ph": (6.0, 7.0, 8.0),
        "npk": (25, 50, 30),
        "fertilizer": (50, 85, 130),
        "soils": ["Alluvial", "Black Soil", "Red Soil"],
        "seasons": ["Rabi", "Kharif"]
    },
    "Mustard": {
        "base_yield": 1.7,
        "temp": (10, 20, 28),
        "rainfall": (200, 400, 650),
        "humidity": (40, 58, 75),
        "ph": (6.0, 7.0, 7.8),
        "npk": (75, 40, 30),
        "fertilizer": (80, 125, 175),
        "soils": ["Alluvial", "Sandy Loam"],
        "seasons": ["Rabi"]
    },
    "Barley": {
        "base_yield": 3.4,
        "temp": (12, 19, 29),
        "rainfall": (250, 450, 750),
        "humidity": (35, 55, 70),
        "ph": (6.2, 7.2, 8.4),
        "npk": (70, 35, 30),
        "fertilizer": (90, 135, 185),
        "soils": ["Alluvial", "Sandy Loam"],
        "seasons": ["Rabi"]
    },
    "Potato": {
        "base_yield": 24.5,
        "temp": (12, 18, 26),
        "rainfall": (350, 550, 850),
        "humidity": (55, 75, 90),
        "ph": (5.0, 5.8, 6.8),
        "npk": (120, 70, 110),
        "fertilizer": (180, 260, 360),
        "soils": ["Sandy Loam", "Alluvial"],
        "seasons": ["Rabi"]
    },
    "Tomato": {
        "base_yield": 21.0,
        "temp": (18, 25, 34),
        "rainfall": (400, 650, 1000),
        "humidity": (50, 70, 85),
        "ph": (5.8, 6.5, 7.2),
        "npk": (110, 60, 90),
        "fertilizer": (160, 230, 320),
        "soils": ["Red Soil", "Sandy Loam", "Alluvial"],
        "seasons": ["Kharif", "Rabi", "Zaid"]
    },
    "Onion": {
        "base_yield": 17.5,
        "temp": (15, 23, 32),
        "rainfall": (350, 600, 900),
        "humidity": (45, 65, 80),
        "ph": (6.0, 6.8, 7.8),
        "npk": (90, 50, 80),
        "fertilizer": (130, 190, 270),
        "soils": ["Alluvial", "Black Soil", "Red Soil"],
        "seasons": ["Rabi", "Kharif"]
    },
    "Tea": {
        "base_yield": 2.2,
        "temp": (16, 24, 32),
        "rainfall": (1400, 2100, 3200),
        "humidity": (70, 85, 98),
        "ph": (4.5, 5.2, 6.0),
        "npk": (90, 30, 60),
        "fertilizer": (110, 160, 220),
        "soils": ["Laterite Soil", "Red Soil"],
        "seasons": ["Whole Year"]
    },
    "Coffee": {
        "base_yield": 1.8,
        "temp": (16, 23, 30),
        "rainfall": (1300, 1900, 2800),
        "humidity": (65, 82, 95),
        "ph": (5.0, 5.8, 6.5),
        "npk": (80, 40, 70),
        "fertilizer": (100, 150, 210),
        "soils": ["Laterite Soil", "Red Soil"],
        "seasons": ["Whole Year"]
    }
}

ALL_SOILS = ["Alluvial", "Black Soil", "Red Soil", "Laterite Soil", "Sandy Loam", "Clay Loam"]
ALL_SEASONS = ["Kharif", "Rabi", "Zaid", "Whole Year"]

def bell_curve_response(val, min_v, opt_v, max_v):
    """Calculates biological response curve between 0.1 and 1.0"""
    if val <= min_v or val >= max_v:
        # Penalized heavily outside thresholds
        dist = min(abs(val - min_v), abs(val - max_v))
        return max(0.15, 0.4 - 0.05 * dist)
    if val < opt_v:
        return 0.4 + 0.6 * ((val - min_v) / (opt_v - min_v)) ** 1.3
    else:
        return 0.4 + 0.6 * ((max_v - val) / (max_v - opt_v)) ** 1.3

def generate_agricultural_record(row_id):
    # Select state and district
    state = random.choice(list(STATE_DISTRICTS.keys()))
    district = random.choice(STATE_DISTRICTS[state])
    
    # State-biased crop selection for realism
    if state in ["Punjab", "Haryana"]:
        crop_choices = ["Wheat", "Rice", "Cotton", "Mustard", "Barley", "Potato", "Maize"]
    elif state in ["Assam"]:
        crop_choices = ["Tea", "Rice", "Pulses", "Mustard"]
    elif state in ["Kerala", "Karnataka"]:
        crop_choices = ["Coffee", "Tea", "Rice", "Sugarcane", "Tomato", "Maize", "Groundnut"]
    elif state in ["Maharashtra", "Gujarat"]:
        crop_choices = ["Cotton", "Sugarcane", "Soybean", "Groundnut", "Onion", "Wheat", "Pulses"]
    elif state in ["Uttar Pradesh", "Bihar"]:
        crop_choices = ["Sugarcane", "Wheat", "Rice", "Potato", "Maize", "Pulses", "Mustard"]
    elif state in ["West Bengal"]:
        crop_choices = ["Rice", "Potato", "Tea", "Mustard", "Pulses", "Tomato"]
    elif state in ["Rajasthan"]:
        crop_choices = ["Mustard", "Barley", "Pulses", "Wheat", "Groundnut"]
    else:
        crop_choices = list(CROP_PROFILES.keys())

    crop = random.choice(crop_choices)
    profile = CROP_PROFILES[crop]
    
    # Season (80% favored season, 20% others)
    if random.random() < 0.85:
        season = random.choice(profile["seasons"])
    else:
        season = random.choice(ALL_SEASONS)

    # Soil type (80% favored soils, 20% others)
    if random.random() < 0.82:
        soil_type = random.choice(profile["soils"])
    else:
        soil_type = random.choice(ALL_SOILS)

    # Realistic environmental values with variance
    # Temperature (°C)
    t_min, t_opt, t_max = profile["temp"]
    temp = round(np.clip(np.random.normal(t_opt, (t_max - t_min) / 4.0), 8.0, 45.0), 1)

    # Rainfall (mm)
    r_min, r_opt, r_max = profile["rainfall"]
    rainfall = round(np.clip(np.random.normal(r_opt, (r_max - r_min) / 3.8), 120.0, 3600.0), 1)

    # Humidity (%)
    h_min, h_opt, h_max = profile["humidity"]
    humidity = round(np.clip(np.random.normal(h_opt, (h_max - h_min) / 4.0), 20.0, 99.0), 1)

    # Soil pH
    p_min, p_opt, p_max = profile["ph"]
    soil_ph = round(np.clip(np.random.normal(p_opt, (p_max - p_min) / 3.5), 4.0, 9.2), 2)

    # Area of Cultivation (hectares)
    # Log-normal distribution typical of farm parcel sizes: mostly 0.5 to 50 ha, occasionally up to 500 ha
    area = round(float(np.clip(np.random.lognormal(mean=2.2, sigma=1.1), 0.5, 450.0)), 2)

    # Fertilizer usage (kg/ha)
    f_min, f_opt, f_max = profile["fertilizer"]
    fertilizer = round(np.clip(np.random.normal(f_opt, (f_max - f_min) / 3.5), 25.0, 550.0), 1)

    # NPK values
    ideal_n, ideal_p, ideal_k = profile["npk"]
    nitrogen_n = round(np.clip(np.random.normal(ideal_n, ideal_n * 0.28), 10.0, 260.0), 1)
    phosphorus_p = round(np.clip(np.random.normal(ideal_p, ideal_p * 0.28), 5.0, 140.0), 1)
    potassium_k = round(np.clip(np.random.normal(ideal_k, ideal_k * 0.28), 5.0, 160.0), 1)

    # Biological response factors
    f_temp = bell_curve_response(temp, t_min - 4, t_opt, t_max + 4)
    f_rain = bell_curve_response(rainfall, r_min * 0.6, r_opt, r_max * 1.35)
    f_hum = bell_curve_response(humidity, h_min - 10, h_opt, h_max + 10)
    f_ph = bell_curve_response(soil_ph, p_min - 0.7, p_opt, p_max + 0.7)
    
    # Soil match factor
    soil_factor = 1.05 if soil_type in profile["soils"] else 0.88
    
    # Season match factor
    season_factor = 1.04 if season in profile["seasons"] else 0.84

    # Nutrient balance factor
    n_ratio = min(nitrogen_n / ideal_n, 1.3)
    p_ratio = min(phosphorus_p / ideal_p, 1.3)
    k_ratio = min(potassium_k / ideal_k, 1.3)
    fert_factor = (n_ratio * 0.4 + p_ratio * 0.3 + k_ratio * 0.3)
    f_fert = np.clip(fert_factor * 0.7 + (fertilizer / f_opt) * 0.3, 0.45, 1.25)

    # State productivity multiplier
    state_factor = STATE_PRODUCTIVITY_INDEX.get(state, 1.0)

    # Base yield computation
    combined_factor = (
        f_temp * 0.22 +
        f_rain * 0.25 +
        f_hum * 0.12 +
        f_ph * 0.13 +
        f_fert * 0.18 +
        soil_factor * 0.05 +
        season_factor * 0.05
    )

    # Stochastic variance (weather shocks, pest incidence, soil micro-variation)
    shock = np.random.normal(1.0, 0.07)
    
    yield_val = profile["base_yield"] * combined_factor * state_factor * shock
    # Clip to realistic lower and upper bounds
    min_possible = profile["base_yield"] * 0.3
    max_possible = profile["base_yield"] * 1.55
    yield_val = round(float(np.clip(yield_val, min_possible, max_possible)), 2)

    # Total production in tonnes = Area * Yield
    production = round(float(area * yield_val), 2)

    return {
        "Record_ID": f"CY-{row_id:06d}",
        "State": state,
        "District": district,
        "Crop": crop,
        "Season": season,
        "Soil_Type": soil_type,
        "Soil_pH": soil_ph,
        "Temperature_C": temp,
        "Rainfall_mm": rainfall,
        "Humidity_pct": humidity,
        "Area_Hectares": area,
        "Fertilizer_kg_ha": fertilizer,
        "Nitrogen_N": nitrogen_n,
        "Phosphorus_P": phosphorus_p,
        "Potassium_K": potassium_k,
        "Yield_tonnes_per_hectare": yield_val,
        "Production_tonnes": production
    }

def main():
    target_count = 30000
    print(f"Generating {target_count} agricultural records for Big Data analytics...")
    records = [generate_agricultural_record(i + 1) for i in range(target_count)]
    df = pd.DataFrame(records)

    output_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data"
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "crop_yield_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Successfully generated {len(df)} rows and saved to: {csv_path}")
    print("\nDataset Summary Preview:")
    print(df.head(3).to_string())
    print("\nCrop Yield Means (t/ha):")
    print(df.groupby("Crop")["Yield_tonnes_per_hectare"].agg(["count", "mean", "min", "max"]).to_string())

if __name__ == "__main__":
    main()
