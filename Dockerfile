# ==============================================================================
# CAREX — AIIMS Hospital Sepsis Monitoring System
# Multi-Stage Dockerfile (Backend FastAPI + Frontend React/Vite)
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: CAREX Clinical Inference Backend (FastAPI + LightGBM + TreeSHAP)
# ------------------------------------------------------------------------------
FROM python:3.10-slim AS backend

# Install system dependencies required by LightGBM, SHAP, and C++ extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy requirements file first to leverage Docker layer caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code and models
COPY backend /app/backend

# Expose FastAPI backend port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000

# Start FastAPI server via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


# ------------------------------------------------------------------------------
# STAGE 2: CAREX Frontend (React + Vite + TypeScript + Tailwind)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy package descriptors first to optimize caching
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci

# Copy full application code
COPY . .

# Expose Vite development / preview port
EXPOSE 5173

# Set environment variables
ENV HOST=0.0.0.0 \
    PORT=5173

# Launch Vite development server bound to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
