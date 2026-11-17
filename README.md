<div align="center">

  <img src="./assets/banner.jpeg" alt="CAREX AI Healthcare Banner" width="100%" />

  <h1>🏥 CAREX</h1>
  <p><strong>AI-Powered Healthcare & ICU Safety Intelligence Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/🏆_FTL_5-Winner-gold?style=for-the-badge" alt="FTL 5 Winner" />
    <img src="https://img.shields.io/badge/React-18.3.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.7.2-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  </p>

  <p>
    <em>"CAREX does not only predict risk. It monitors whether the care process is responding to that risk."</em>
  </p>

</div>

---

> **⚠️ Clinical Validation Disclaimer**  
> CAREX is **NOT** a clinically validated medical device. It is an educational/final-year prototype platform built for research, simulation, and academic demonstration. It does not diagnose diseases, prescribe treatments, or make autonomous medical decisions. All clinical responsibilities remain with human practitioners.

---

## 🌟 Overview

**CAREX** is an ICU safety and clinical workflow intelligence platform designed to bridge the gap between patient deterioration alerts and timely medical action. By combining live telemetry visualization, explainable AI risk trajectories, and care-gap detection, CAREX ensures high-risk patient warnings lead to documented clinical intervention.

---

## ✨ Core Intelligence Features

| Feature | Description |
| :--- | :--- |
| **📈 Live Patient Monitoring** | Real-time telemetry grids visualizing heart rate, SpO₂, blood pressure, temperature, and live canvas ECG waveforms. |
| **🧠 Explainable AI Risk Intelligence** | Predicts silent patient deterioration and breaks down contributing physiological signals with confidence scoring. |
| **⏱️ Care Process & Gap Detection** | Tracks whether critical vitals warnings are followed by timely alert acknowledgment, reassessment, and escalation. |
| **🤖 LLM Clinical & Patient Assistants** | Context-aware AI chat for doctors and a floating recovery assistant for patients and families (`/api/chat`). |
| **📋 AI Shift Handoff (SBAR)** | Automated SBAR protocol generation (`/api/handoff`) to streamline nursing and physician shift transitions. |
| **🏥 Multi-Hospital & Resource Ops** | Monitors ICU bed availability, staff workload pressure, inter-hospital referrals, and localized Indian hospital rosters. |

---

## 👥 User Roles

CAREX consolidates hospital operations into **three unified workspaces**:

1. **🩺 Doctor**  
   Accesses the ICU Command Center, monitors live telemetry walls, reviews AI risk trajectories, generates SBAR shift handoffs, and manages inter-hospital patient referrals.
2. **🛌 Patient**  
   Reviews recovery trajectories, daily clinical logs, prescription history, visiting guidelines, and interacts with the AI recovery assistant.
3. **🏢 Hospital Admin**  
   Oversees clinical command metrics, ICU bed capacity, staff workload indexes, and consolidated reception check-in and pharmacy interaction workflows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React `18.3.1` + Vite `6.0.5`
- **Language:** TypeScript `5.7.2`
- **Styling:** Tailwind CSS `3.4.17` + `clsx` / `tailwind-merge`
- **Icons:** Lucide React `0.469.0`

### Backend & AI
- **API Layer:** FastAPI (`backend/main.py`)
- **AI Endpoints:** `/api/chat` (LLM Clinical & Patient Assistant) & `/api/handoff` (SBAR Shift Summary Generator)
- **Database (Planned):** PostgreSQL & Auth via Supabase with Row-Level Security (RLS)

---

## 📂 Project Architecture

```text
src/
├── features/
│   ├── role-selection/      # Portal landing screen & role cards
│   ├── auth/                # Login, Signup, Verification & Onboarding flows
│   └── doctor/              # ICU Command Center, ECG canvas, SimulationContext & mock rosters
├── types/                   # App-wide & clinical data interfaces
├── utils/                   # Tailwind class utilities & formatting helpers
├── App.tsx                  # Route registry & navigation controller
├── CAREX.tsx                # Root application wrapper
└── main.tsx                 # Client entry point
