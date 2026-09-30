# IncidentIQ — AI Incident Investigation Platform
**Powered by Real ML (IsolationForest), Hindsight Memory & Google Gemini**

IncidentIQ is an enterprise AI Incident Investigation Platform that combines three distinct intelligence layers to solve complex production incidents:

1. **ML Layer (Scikit-Learn IsolationForest)**: Numerical scoring & anomaly detection trained on the **Server Machine Dataset (SMD)** across 28 machine entities (38 continuous features).
2. **Memory Layer (Hindsight Cloud)**: Persistent historical memory bank (`prod-incidents`) preserving verified root causes and resolution learnings.
3. **Reasoning Layer (Google Gemini)**: Natural language explanation and action synthesis connecting telemetry signals and past precedents.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────┐
                               │           Telemetry Signals              │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       INCIDENTIQ CORE AGENT                                              │
│                                                                                                         │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌───────────────────────────────┐  │
│  │     1. ML ANOMALY SCORING   │   │  2. HINDSIGHT MEMORY BANK   │   │  3. GEMINI REASONING ENGINE   │  │
│  │                             │   │                             │   │                               │  │
│  │   FastAPI Python Inference  │   │   Hindsight Cloud API       │   │   Google Gemini 2.5 / 1.5     │  │
│  │   28 Isolation Forest Models│   │   Persistent Vector Store   │   │   Structured Reasoning        │  │
│  │   Server Machine Dataset    │   │   Historical Post-Mortems   │   │   Actionable Guidelines       │  │
│  └──────────────┬──────────────┘   └──────────────┬──────────────┘   └──────────────┬────────────────┘  │
└─────────────────┼─────────────────────────────────┼─────────────────────────────────┼───────────────────┘
                  │                                 │                                 │
                  ▼                                 ▼                                 ▼
         Real Anomaly Score               Recalled Precedent                Structured Resolution
         (e.g., 0.87 CRITICAL)            (Cosine Similarity: 94.2%)        & Post-Mortem Retain
```

---

## 🚀 The Hero Demo: Before vs. After Hindsight Memory

The central demonstration proves the impact of persistent memory:

1. **WITHOUT MEMORY (Baseline Mode)**:
   - The agent receives incident `INC-1097` (*Payment API Database Connection Timeouts after v2.5.0 deployment*).
   - *Result*: The agent yields generic, zero-knowledge advice (*"Check logs, check network metrics, try restarting the container"*).
2. **WITH HINDSIGHT MEMORY (Memory-Augmented Mode)**:
   - The agent queries Hindsight Cloud and recalls historical incident `INC-1042` from 3 months ago.
   - *Result*: The agent pinpoints the exact root cause (*unclosed DB connections in audit logging*), warns against container restarts (*which previously dropped active transactions*), and provides the verified fix (*rollback deployment and adjust Hikari pool size*).
3. **RESOLVE & RETAIN**:
   - SRE marks the incident resolved and submits a verified post-mortem.
   - IncidentIQ calls Hindsight `retain()`, ensuring future incidents benefit from the new learning.

---

## 🤖 ML Anomaly Pipeline (Server Machine Dataset)

IncidentIQ trains 28 distinct `IsolationForest` models (one per machine entity) on `data/ServerMachineDataset/`:

- **Data Split**: Models are trained on `train/` data only with `StandardScaler` fitted exclusively on training distributions.
- **Evaluation**: Evaluated on ground-truth `test_label/` metrics. Results are persisted to `ml/evaluation_results.json` and `public/evaluation_results.json`.

### Python Commands

```bash
# 1. Install ML dependencies
pip install -r ml/requirements.txt

# 2. Inspect SMD Dataset
python ml/inspect_smd.py

# 3. Train all 28 Machine IsolationForest Models
python ml/train.py

# 4. Evaluate Models against Ground-Truth Test Labels
python ml/evaluate.py

# 5. Launch FastAPI Inference Server
python -m uvicorn ml.api:app --host 127.0.0.1 --port 8000
```

---

## 🛠️ Technology Stack

- **Frontend & App Framework**: Next.js 15 (App Router, TypeScript, React 19)
- **ML Anomaly Service**: Python 3, Scikit-Learn, FastAPI, Joblib, Pandas, NumPy
- **Styling**: Vanilla CSS / Tailwind CSS (SRE Dark Mode Interface)
- **AI / LLM**: Google Gemini API (`@google/genai` SDK)
- **Persistent Memory**: Hindsight Cloud API (`https://api.hindsight.vectorize.io`)
- **Icons**: Lucide React

---

## 📦 Local Setup & Configuration

### 1. Prerequisites
- Node.js 18.x or 20.x installed
- Python 3.10+ installed
- npm or pnpm

### 2. Environment Variables
Create `.env.local` in the root directory:

```env
# Google Gemini API Key (Required for AI Analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Hindsight Cloud Credentials (Required for Persistent Memory)
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BANK_ID=prod-incidents
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io

# ML Inference API Endpoint (Optional, default http://127.0.0.1:8000)
NEXT_PUBLIC_ML_API_URL=http://127.0.0.1:8000
```

### 3. Running Development Environment

```bash
# Terminal 1: Start ML FastAPI Service
python -m uvicorn ml.api:app --host 127.0.0.1 --port 8000

# Terminal 2: Start Next.js Development Server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📑 API Endpoints

- `GET /api/health`: Health status for Gemini API, Hindsight Cloud, and ML IsolationForest Service.
- `GET /api/incidents`: List preset synthetic incident scenarios.
- `POST /api/incidents/analyze`: Run 3-layer incident analysis (ML + Hindsight + Gemini).
- `POST /api/memory/recall`: Query Hindsight memory bank for relevant historical post-mortems.
- `POST /api/memory/retain`: Store a verified incident post-mortem into Hindsight.
- `POST /api/demo/seed`: Seed pre-built historical incident memories into Hindsight.
- `GET http://127.0.0.1:8000/health`: ML Inference Server health check.
- `POST http://127.0.0.1:8000/predict`: Run IsolationForest anomaly inference on 38 telemetry metrics.

---

## 🔒 Safety & Operational Guardrails

- **Human-in-the-Loop Advisory**: IncidentIQ provides diagnostic guidance and recommended steps. It does NOT autonomously execute production mutations or server restarts.
- **Strict Key Isolation**: Secrets (`GEMINI_API_KEY`, `HINDSIGHT_API_KEY`) are read strictly server-side inside Next.js API routes and are never bundled into client JS.
- **Graceful Fallback**: If API keys or ML server are unpopulated during evaluation, IncidentIQ gracefully operates with local fallback scoring and status badges.

---

## 📄 License & Credits
Built for **HackWithHyderabad 3.0** powered by **Vectorize.io Hindsight Cloud**, **Google Gemini**, and **Server Machine Dataset (SMD) IsolationForest ML**.
