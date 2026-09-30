# INCIDENT MEMORY AGENT — IMPLEMENTATION PLAN

## Overview & Goals
Build an AI-powered SRE Co-Pilot for **HackWithHyderabad 3.0** under the theme *"AI Agents That Learn Using Hindsight"*. The agent leverages **Hindsight** (by Vectorize.io) to recall past incident post-mortems, root causes, verified fixes, and failed attempts, ensuring the organization continuously learns from past production failures.

---

## Phase 1: Environment Setup & Project Foundation
- [ ] Initialize Python backend structure in `backend/` with FastAPI, Pydantic, and `httpx`.
- [ ] Create synthetic incident seed dataset in `backend/data/synthetic_incidents.json` containing 12 realistic incidents across database, cache, network, queue, and API failure modes.
- [ ] Implement `backend/config.py` to support environment variables (`HINDSIGHT_API_KEY`, `HINDSIGHT_BASE_URL`, `HINDSIGHT_BANK_ID`, `LLM_API_KEY`, `LLM_PROVIDER`).

---

## Phase 2: Hindsight Memory Service & LLM Integration
- [ ] Build `backend/services/hindsight_service.py` to wrap Hindsight REST API operations:
  - `retain()`: Store post-mortems with structured entity tags into bank `prod-incidents`.
  - `recall()`: Fetch top-K relevant historical memories based on current incident symptoms & logs.
  - `reflect()`: Perform pattern synthesis across recalled organizational memories.
  - Graceful fallback mock if API key is not present.
- [ ] Build `backend/services/llm_service.py` for LLM prompt orchestration:
  - Baseline response generator (Current incident only, zero memory).
  - Hindsight Agent response generator (Current incident + Recalled historical evidence).

---

## Phase 3: FastAPI REST API Endpoints
- [ ] `GET /api/scenarios`: Deliver list of 12 synthetic incident scenarios.
- [ ] `POST /api/incidents`: Load or create active incident.
- [ ] `POST /api/incidents/{incident_id}/analyze`: Execute current incident triage using Hindsight memory recall.
- [ ] `POST /api/incidents/{incident_id}/compare`: Run side-by-side baseline vs memory-augmented inference.
- [ ] `POST /api/incidents/{incident_id}/simulate-action`: Execute mock action approval.
- [ ] `POST /api/incidents/{incident_id}/resolve`: Submit post-mortem and trigger `hindsight_service.retain()`.
- [ ] `GET /api/memory/explorer`: Fetch current Hindsight memory bank state.

---

## Phase 4: Frontend Development (React + Vite)
- [ ] Initialize Vite + React frontend in `frontend/`.
- [ ] Build core design system in `index.css` featuring dark-mode SRE dashboard aesthetics (slate/emerald/crimson accents, clean typography, badge indicators).
- [ ] Build main layout components:
  - `Header`: Preset loader & custom incident trigger modal.
  - `IncidentSignals`: Live error logs, affected microservice, severity, and timeline.
  - `TriagePlan`: Diagnostic hypotheses, current vs historical evidence badges, and action recommendations.
  - `HindsightPanel`: Recalled memories with relevance scores, historical root cause, and failed attempts.
  - `ComparisonView`: Live side-by-side split screen showing **BASELINE (NO MEMORY)** vs **HINDSIGHT AGENT**.
  - `PostMortemModal`: Form to capture confirmed root cause, effective fix, and learnings.
  - `MemoryExplorer`: Live viewer for stored Hindsight memory bank entries.

---

## Phase 5: Verification, Verification Script & Demo Preparation
- [ ] Test Hindsight `retain` and `recall` pipeline end-to-end.
- [ ] Verify 60–90 second hackathon demo flow:
  1. Trigger `INC-102` (Payment Gateway HTTP 504).
  2. Show Baseline Agent providing generic advice.
  3. Show Hindsight Agent recalling past incident, identifying root cause, and warning against container restart.
  4. Simulate approved retry backoff fix.
  5. Submit post-mortem & retain learning into Hindsight memory bank.
  6. Open Memory Explorer to confirm live retention.

---

## Acceptance Criteria
1. **Memory Centrality**: Hindsight memory retrieval is the primary driver of agent intelligence.
2. **Comparison Functionality**: Clear visual proof contrasting generic baseline guidance against Hindsight-augmented guidance.
3. **Evidence Distinction**: Clear separation between Current Incident Signals (🔴) and Historical Hindsight Evidence (🟢).
4. **Safety Compliance**: All remediation actions are presented as advisory with human-in-the-loop simulation cards.
5. **Continuous Learning**: Post-incident learnings are successfully ingested via Hindsight `retain` and become immediately recallable for subsequent incidents.
