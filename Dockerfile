# =========================================================================
# Multi-Stage Production Dockerfile for CropYield AI Platform
# Combines React Frontend build + FastAPI Python ML Backend into 1 container
# =========================================================================

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.12-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend & ML models
COPY backend/ ./backend/
COPY data/ ./data/
COPY spark_pipeline/ ./spark_pipeline/
COPY run_backend.py .

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000

ENV PORT=8000
ENV PYTHONPATH=/app

# Start unified production server
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}
