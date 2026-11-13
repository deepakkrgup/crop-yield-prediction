"""
CropYield AI – FastAPI Server Launcher
Runs uvicorn on http://127.0.0.1:8000
"""

import sys
import os
import uvicorn

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if __name__ == "__main__":
    print("==========================================================")
    print("     CropYield AI – Intelligent Crop Yield Engine        ")
    print("       FastAPI Backend Server Starting on Port 8000       ")
    print("==========================================================")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
