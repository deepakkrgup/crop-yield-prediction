from fastapi import APIRouter

router = APIRouter()

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

CROPS = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane",
    "Soybean", "Groundnut", "Pulses", "Mustard", "Barley",
    "Potato", "Tomato", "Onion", "Tea", "Coffee"
]

SEASONS = ["Kharif", "Rabi", "Zaid", "Whole Year"]

SOIL_TYPES = [
    "Alluvial", "Black Soil", "Red Soil", "Laterite Soil", "Sandy Loam", "Clay Loam"
]

SAMPLE_PRESETS = [
    {
        "name": "Punjab High-Yield Wheat",
        "description": "Fertile alluvial plains of Ludhiana during optimal Rabi winter",
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
    },
    {
        "name": "Maharashtra Black Soil Cotton",
        "description": "Nagpur cotton belt in Kharif monsoon season",
        "state": "Maharashtra",
        "district": "Nagpur",
        "crop": "Cotton",
        "season": "Kharif",
        "soil_type": "Black Soil",
        "soil_ph": 7.2,
        "temperature": 28.5,
        "rainfall": 780.0,
        "humidity": 68.0,
        "area": 8.0,
        "fertilizer": 140.0,
        "nitrogen": 85.0,
        "phosphorus": 42.0,
        "potassium": 38.0
    },
    {
        "name": "Uttar Pradesh Commercial Sugarcane",
        "description": "Irrigated Meerut sugarcane agro-climate",
        "state": "Uttar Pradesh",
        "district": "Meerut",
        "crop": "Sugarcane",
        "season": "Whole Year",
        "soil_type": "Alluvial",
        "soil_ph": 6.9,
        "temperature": 27.0,
        "rainfall": 1250.0,
        "humidity": 74.0,
        "area": 12.0,
        "fertilizer": 330.0,
        "nitrogen": 185.0,
        "phosphorus": 78.0,
        "potassium": 92.0
    },
    {
        "name": "Kerala Highland Plantation Tea",
        "description": "Acidic laterite soils in Wayanad with high precipitation",
        "state": "Kerala",
        "district": "Wayanad",
        "crop": "Tea",
        "season": "Whole Year",
        "soil_type": "Laterite Soil",
        "soil_ph": 5.1,
        "temperature": 21.0,
        "rainfall": 2100.0,
        "humidity": 86.0,
        "area": 15.0,
        "fertilizer": 165.0,
        "nitrogen": 92.0,
        "phosphorus": 32.0,
        "potassium": 62.0
    },
    {
        "name": "West Bengal Monsoon Rice",
        "description": "Burdwan delta paddy cultivation in Kharif",
        "state": "West Bengal",
        "district": "Burdwan",
        "crop": "Rice",
        "season": "Kharif",
        "soil_type": "Clay Loam",
        "soil_ph": 6.4,
        "temperature": 29.0,
        "rainfall": 1450.0,
        "humidity": 82.0,
        "area": 4.5,
        "fertilizer": 180.0,
        "nitrogen": 105.0,
        "phosphorus": 48.0,
        "potassium": 44.0
    }
]

@router.get("/crops")
def get_crop_metadata():
    return {
        "states": list(STATE_DISTRICTS.keys()),
        "districts_by_state": STATE_DISTRICTS,
        "crops": CROPS,
        "seasons": SEASONS,
        "soil_types": SOIL_TYPES,
        "presets": SAMPLE_PRESETS
    }
