# PROJECT SHIKHAR (शिखर)
### Unified Predictive Logistics and Intelligent Supply Chain Management
**Northern Command Defense Logistics Operational System**

---

## 📌 Executive Overview
**PROJECT SHIKHAR** is a full-stack, enterprise-grade predictive logistics and supply chain intelligence platform designed specifically for high-altitude defense environments (Northern Command: Leh/Ladakh, Siachen Base Camp, Kargil, Zojila Pass).

The system integrates military-grade operational requirements with real-time predictive analytics, dynamic shelf-life estimation (Arrhenius kinetics), isolation-adjusted days of supply, multi-modal transport optimization, and challenger-AI recommendation verification.

---

## 🎖️ 18 Tactical Decision Units (U1 – U18)

| Unit | Codename | Purpose & Operational Function |
|------|----------|---------------------------------|
| **U1** | **Isolation-Adjusted Days of Supply** | Computes forward supply coverage factoring in pass closures, avalanche risks, and temperature extremes. |
| **U2** | **Corridor Reliability Graph** | Real-time transit probability scoring across high-altitude corridors (Zojila, Rohtang, Khardung La). |
| **U3** | **Physics-Informed Shelf Life** | Arrhenius degradation kinetics for cold-chain pharmaceuticals, rations, and perishables under sub-zero thermal stress. |
| **U4** | **Forecast Router** | Dynamic demand model routing (Holt-Winters, moving averages, consumption shock detection). |
| **U5** | **Last-Mile Mode-Mix Optimizer** | Solves vehicle allocation (4x4 Stallion trucks, ALS, ATV, animal transport corps, tactical UAVs). |
| **U6** | **Lift-Per-KG Prioritizer** | Maximizes payload utility under strict high-altitude air-drop weight constraints. |
| **U7** | **Zero-Network Offline Ledger** | IndexedDB / local transaction store enabling uninterrupted logging during tactical satellite blackouts. |
| **U8** | **Sensor Fusion Ingestion** | Aggregates temperature, humidity, vibration, and shock metrics from edge IoT devices. |
| **U9** | **Stock Truth Score** | Probabilistic cross-verification of physical depot counts vs book values. |
| **U10** | **Cold-Chain Breach Early Warning** | Alerts before thermal thresholds breach critical spoilage activation energies. |
| **U11** | **Supply Vulnerability Index** | Identifies single-supplier and bottleneck-corridor dependencies. |
| **U12** | **Dynamic Safety Buffer Sizing** | Auto-scales reserve stocks based on impending weather fronts and pass blockage forecasts. |
| **U13** | **Dynamic Remaining Shelf Life (RSL)** | Real-time degradation trajectory calculation per batch. |
| **U14** | **Cross-Echelon Redistribution** | Identifies optimal lateral stock transfers between depots prior to procurement orders. |
| **U15** | **Capability-Readiness Graph** | Maps depot cold-storage, hazmat, and fuel storage readiness against requirements. |
| **U16** | **Digital Twin Simulation Engine** | Monte Carlo shock simulations (snowstorms, enemy interdiction, supply shocks). |
| **U17** | **Grounding & Audit Logging** | Tamper-evident operational audit trail and strict RAG grounding for AI outputs. |
| **U18** | **Challenger AI Verification** | Dual-AI verification framework requiring human authorization for critical automated recommendations. |

---

## 🏛️ System Architecture

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite (Pre-seeded `shikhar.db`), bcrypt, JWT authentication.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet GIS Maps, Zustand, TanStack Query, IndexedDB.
- **Design Language:** Tactical Dark Command Aesthetic (Olive Drab, Khaki, Charcoal, Radar Green, Alert Amber, Critical Red).

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Python 3.10+** (with pip)
2. **Node.js 18+** (with npm)

---

### Step 1: Run the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend Swagger Docs will be available at:* `http://localhost:8000/docs`

---

### Step 2: Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will be accessible at:* `http://localhost:5173`

---

## 🔐 Default Access Credentials

| Role | Username / Call-sign | Password | Echelon Level |
|------|----------------------|----------|---------------|
| **Commanding Officer** | `commander.shikhar` | `Shikhar2026!` | Strategic Command (Full Clearance) |
| **Logistics Officer** | `logistics.officer` | `Shikhar2026!` | Tactical Echelon (Operational) |

---

## 📂 Project Directory Structure

```
PROJECT_SHIKHAR/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # 15+ REST and WebSocket endpoints
│   │   ├── core/                # Config, Database engine, Security (Bcrypt/JWT)
│   │   ├── ml/                  # Arrhenius Shelf-Life, Pure Python Forecaster
│   │   ├── models/              # SQLAlchemy ORM models (Inventory, Corridors, IoT)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Decision Engine, U1 Isolation, U18 Challenger AI
│   │   ├── main.py              # FastAPI application entrypoint
│   │   └── seed_data.py         # Northern Command tactical database seeder
│   ├── requirements.txt         # Backend Python dependencies
│   └── shikhar.db               # Seeded tactical database
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, Header, StatCards, Modals, Badges
│   │   ├── pages/               # 17 Functional Pages (Command Dashboard to Admin)
│   │   ├── services/            # ShikharApi client (40+ endpoints), IndexedDB ledger
│   │   ├── store/               # Zustand authStore and state management
│   │   ├── App.tsx              # Router setup for all 17 tactical views
│   │   ├── main.tsx             # React entrypoint
│   │   └── index.css            # Military tactical grid theme & styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── shikhar.db                   # Root backup of pre-seeded SQLite database
├── start_shikhar.bat            # Windows 1-click batch launcher
├── start_shikhar.ps1            # Windows PowerShell launch script
└── README.md                    # Project documentation
```

---

## 🛡️ Security & Compliance
- Passwords hashed using standard `bcrypt` with salt rounds.
- Session tokens signed with HS256 JWT.
- Strict Role-Based Access Control (RBAC) across Depot, Brigade, and Division commands.
- Challenger AI (U18) enforcement prevents autonomous non-authorized dispatches.
