# 🐳 CAREX Docker Deployment & Quickstart Guide

This document explains how to launch the complete **CAREX Sepsis Monitoring & Clinical Intelligence System** (AIIMS Hospital Edition) using Docker & Docker Compose with a single command.

---

## ⚡ Single-Command Startup

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running, then execute at the project root:

```bash
docker-compose up --build
```

---

## 🛰️ Accessing Portals & APIs

Once the containers are built and healthy, access the platform at:

- 🏥 **CAREX Frontend Application**: [`http://localhost:5173`](http://localhost:5173)
  - Access all 4 Portals: Doctor (`/doctor`), Nurse (`/nurse`), Hospital Management (`/hospital-management`), and Patient (`/patient/dashboard`).
- ⚡ **FastAPI Backend Health Check**: [`http://localhost:8000/api/health`](http://localhost:8000/api/health)
- 📊 **FastAPI Interactive Swagger Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- 📡 **Real-Time Telemetry WebSocket Stream**: `ws://localhost:8000/ws/telemetry`

---

## 🏗️ Architecture Overview

```
                      ┌─────────────────────────────────┐
                      │    Docker Compose Orchestrator  │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│   Backend Service (Python 3.10)│                     │  Frontend Service (Node 20)   │
│  - FastAPI Framework          │                     │  - React 18 + Vite            │
│  - LightGBM + TreeSHAP Engine │ ◄── WebSocket/API── │  - Tailwind CSS Aesthetics    │
│  - Port 8000                  │                     │  - Port 5173                  │
└───────────────────────────────┘                     └───────────────────────────────┘
```

### Services Defined in `docker-compose.yml`:
1. `backend`: Built from Python 3.10-slim with C/OpenMP dependencies (`libgomp1`) for LightGBM inference, loading models from `backend/models/sepsis_lgbm.joblib`.
2. `frontend`: Built from Node 20-alpine running Vite dev server exposed on port `5173`, automatically proxying requests to `backend:8000`.

---

## 🛠️ Management Commands

### Stop All Containers
```bash
docker-compose down
```

### View Live Container Logs
```bash
docker-compose logs -f
```

### Rebuild Containers After Modifying Code
```bash
docker-compose up --build -d
```
