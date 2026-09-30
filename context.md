# INCIDENT MEMORY AGENT — CONTEXT & ARCHITECTURE SPECIFICATION
**HackWithHyderabad 3.0 Project Specification**
**Theme:** AI Agents That Learn Using Hindsight

---

## 1. Executive Summary & Core Objective

Production incidents in modern software organizations are frequently repetitive, yet knowledge remains fragmented across past post-mortems, chat logs, and developer memory. When a new incident occurs, SREs and DevOps engineers often re-investigate from scratch.

**Incident Memory Agent** is an AI-powered SRE Co-Pilot built around **Hindsight** (by Vectorize.io). It establishes persistent organizational memory for production incidents. As incidents are investigated, resolved, and documented via post-mortems, Hindsight stores structured learnings. When new incidents occur, the agent recalls past root causes, verified resolutions, and failed attempts to deliver immediate, context-aware diagnostic guidance.

### Primary Hackathon Goal
Demonstrate that:
- **WITHOUT Accumulated Memory (Baseline)**: The agent provides generic, standard troubleshooting steps (e.g., *"Check logs, check network connectivity, restart container"*).
- **WITH Accumulated Memory (Hindsight Agent)**: The agent identifies exact historical precedents, recalls confirmed root causes, warns against misleading symptoms/failed attempts, recommends verified fixes, and continuously retains new learnings.

---

## 2. System Architecture

```
                                  +---------------------------------------+
                                  |         React + Vite Frontend         |
                                  |  (Incident Command, Comparison,       |
                                  |   Post-Mortem Form, Memory Explorer)  |
                                  +-------------------+-------------------+
                                                      |
                                                      | REST API (JSON)
                                                      v
                                  +---------------------------------------+
                                  |           FastAPI Backend             |
                                  |                                       |
                                  |  +---------------------------------+  |
                                  |  |   Incident Management Engine    |  |
                                  |  +---------------------------------+  |
                                  |  |   Agent Orchestration & Prompt  |  |
                                  |  +---------------------------------+  |
                                  |  |   Hindsight Client Service      |  |
                                  |  +---------------------------------+  |
                                  +---------+-------------------+---------+
                                            |                   |
                     Hindsight API (REST)   |                   |  LLM Completion API
                     (retain / recall /     |                   |  (OpenAI / Gemini /
                      reflect)              v                   v   LiteLLM)
                               +------------------+       +-------------------+
                               | Hindsight Cloud  |       |   LLM Provider    |
                               | (Memory Bank:    |       | (gpt-4o / gemini) |
                               |  prod-incidents) |       +-------------------+
                               +------------------+
```

### Component Breakdown
1. **Frontend (React + Vite + Vanilla CSS / Modern UI)**
   - Dark-mode SRE Dashboard optimized for fast incident triage and clear demonstration.
   - Live Split-Screen Comparison Mode (Baseline vs Hindsight).
   - Post-Mortem Retain Modal & Live Memory Explorer.
2. **Backend (Python 3.11+ + FastAPI)**
   - Asynchronous REST endpoints managing synthetic scenario loading, incident triage, side-by-side comparison, simulated action approvals, and memory retention.
3. **Memory Layer (Hindsight API Client)**
   - Interacts with Hindsight Memory Bank `prod-incidents`.
   - Performs `recall` during incident triage to fetch relevant past memories.
   - Performs `reflect` to extract broader organizational patterns.
   - Performs `retain` to save post-mortems after incident resolution.
4. **LLM Reasoning Layer**
   - Configurable LLM adapter (OpenAI / Gemini / Anthropic / LiteLLM) initialized via environment variables.

---

## 3. Hindsight Memory Architecture & Schema

### Bank Configuration
- **Bank ID**: `prod-incidents`
- **Scope**: Single unified organizational bank to enable cross-service pattern recognition.

### Structured Memory Retain Format
When retaining a post-mortem, information is formatted as high-quality structured natural language:

```text
Incident ID: INC-204
Service: Payment Gateway
Severity: SEV-2
Environment: Production
Category: API Timeout / Retry Amplification
Timestamp: 2026-09-28T10:30:00Z

Symptoms:
Payment requests returned HTTP 504 Gateway Timeouts during peak traffic spikes.

Relevant Evidence & Logs:
Third-party webhook requests timed out after 5000ms. Client retry count increased exponentially from 1 to 10 retries per request.

Confirmed Root Cause:
Third-party payment provider latency coupled with unthrottled client retry amplification caused DB connection pool exhaustion on Payment Gateway.

Effective Resolution:
1. Configured exponential backoff with jitter on webhook retries and capped max retries to 3.
2. Increased max connection pool size from 20 to 50.

Failed Attempts:
Restarting the Payment Gateway service container failed to resolve the issue and temporarily dropped in-flight checkout transactions.

Key Learnings:
When 504 timeouts coincide with exponential retry volume spikes, inspect retry amplification before attempting service restarts.

Context: Production post-mortem verified by SRE team.
```

---

## 4. Synthetic Incident Seed Dataset (12 Scenarios)

| Scenario ID | Service | Category | Symptoms | Confirmed Root Cause | Verified Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **INC-101** | `auth-service` | DB Connection Leak | HTTP 500 on login, DB pool timeout | Unclosed DB sessions in OAuth token refreshing loop | Patched connection release block & increased pool |
| **INC-102** | `payment-gateway` | Retry Storm | HTTP 504 Gateway Timeout | Unthrottled exponential retries on 3rd-party webhook latency | Added retry jitter, capped retries to 3, resized pool |
| **INC-103** | `redis-cache` | Cache Memory Eviction | High cache latency, high DB load | Redis OOM due to missing TTL on user session keys | Set TTL of 24h on session keys & flushed expired keys |
| **INC-104** | `order-processor` | Consumer Lag Spike | Order queue growing exponentially | Deadlock in inventory lock acquiring thread | Refactored inventory lock acquiring order |
| **INC-105** | `notification-svc` | Thread Starvation | Email notifications delayed by 45m | Synchronous HTTP calls inside async thread pool worker | Converted SMTP client calls to non-blocking async IO |
| **INC-106** | `inventory-svc` | DB Lock Contention | Timeout on checkout inventory update | Bulk catalog update script running during peak hours | Rescheduled catalog update script to off-peak cron |
| **INC-107** | `api-gateway` | NGINX Exhaustion | 502 Bad Gateway under flash sale | `worker_connections` limit hit on edge proxy | Scaled worker connections limit and open file descriptors |
| **INC-108** | `analytics-pipe` | Memory Leak | Worker pods OOMKilled every 2h | DataFrame accumulation in memory during batch aggregation | Implemented streaming chunk processing |
| **INC-109** | `billing-service` | Third-Party Throttling | HTTP 429 Too Many Requests | Uncached token verification requests to auth vendor | Implemented local token caching with 5-minute TTL |
| **INC-110** | `search-service` | Elastic GC Spikes | Search queries timing out | Unaggregated wildcard queries causing long GC pauses | Restricted wildcard query length & added cache layer |
| **INC-111** | `customer-portal` | TLS Latency Spike | Handshake delays on mobile clients | Outdated TLS cipher suite causing CPU bound negotiation | Updated TLS config to modern ECDHE ciphers |
| **INC-112** | `logging-agent` | Disk Space Exhaustion | Disk full alerts on log collector | Debug logging left enabled after previous incident | Reverted log level to WARN and purged debug logs |

---

## 5. API Contracts (FastAPI Backend)

### 1. Preset Scenarios
- `GET /api/scenarios`: Returns array of 12 preset synthetic incidents.

### 2. Incident Triggering & Management
- `POST /api/incidents`: Create a new active incident (from preset or custom input).
- `GET /api/incidents/{incident_id}`: Fetch detailed incident state.

### 3. Triage & Reasoning
- `POST /api/incidents/{incident_id}/analyze`: Triggers current evidence analysis, Hindsight recall, hypothesis generation, and investigation plan.
- `POST /api/incidents/{incident_id}/compare`: Runs dual-execution:
  - **Baseline**: Prompt without Hindsight memory.
  - **Hindsight Agent**: Prompt enriched with recalled historical memories.

### 4. Human-in-the-Loop & Resolution
- `POST /api/incidents/{incident_id}/simulate-action`: Simulates execution of an approved diagnostic/remediation step.
- `POST /api/incidents/{incident_id}/resolve`: Submit confirmed root cause, effective fix, failed attempts, and key learnings. Automatically invokes Hindsight `retain`.

### 5. Memory Exploration
- `GET /api/memory/explorer`: Returns current Hindsight memory bank entries, total retained memories, and synthesized reflections.

---

## 6. Frontend Architecture & UI Specification

### Primary Views & Components
1. **Header & Preset Scenario Selector**: Dropdown to load pre-configured synthetic incidents or switch to custom input mode.
2. **Incident Command Center (Main View)**:
   - **Current Incident Signals Panel**: Displays current error logs, symptoms, affected service, and severity in clear red badge styling.
   - **Triage & Investigation Plan**: Steps recommended by agent, distinguished between current evidence and historical evidence.
   - **Simulated Action Controls**: Interactive cards with `[Simulate Approved Action]` and `[Reject]` buttons.
3. **Hindsight Memory Intelligence Panel**:
   - Displays recalled historical memories, similarity badges, matching past incident IDs, confirmed historical root causes, and previous failed attempts.
4. **Side-by-Side Comparison Screen (Demo Feature)**:
   - Split view contrasting **BASELINE (NO MEMORY)** vs **HINDSIGHT AGENT (WITH MEMORY)**.
5. **Post-Mortem & Retain Learning Modal**:
   - Form triggered upon incident resolution. Saves structured post-mortem into Hindsight bank `prod-incidents`.
6. **Memory Explorer**:
   - Visualizer for inspecting memories saved in Hindsight bank.

---

## 7. Safety & Human-in-the-Loop Architecture

- **No Live Production Mutations**: All actions recommended by the agent are advisory.
- **Action Simulation**: Clicking "Approve & Execute" updates the UI incident log with a simulated success result (e.g., *"Simulated execution: Adjusted retry backoff configuration to 300ms with jitter"*).
- **Clear Evidence Labeling**: Current incident logs are highlighted with 🔴 **Current Incident Evidence**, while Hindsight recalls are tagged with 🟢 **Historical Hindsight Evidence**.
- **Uncertainty Communication**: If no relevant memory matches are found, the agent explicitly displays: *"No historical precedent found in organizational memory. Recommendation based on standard zero-knowledge triage."*

---

## 8. Demo Script (60–90 Seconds)

1. **0:00 – 0:10 | Trigger Incident**: SRE selects preset scenario `INC-102` (Payment Gateway HTTP 504 errors).
2. **0:10 – 0:25 | Show Baseline (No Memory)**: Click **Compare Modes**. Baseline agent suggests generic advice: *"Check network connectivity, check CPU metrics, try restarting the Payment container."*
3. **0:25 – 0:45 | Show Hindsight Agent**: Hindsight Agent recalls `INC-102` from 3 months ago. Pinpoints root cause: *"Third-party webhook timeout causing exponential retry storm."* Highlights past failed attempt: *"Warning: Restarting container failed in INC-102."*
4. **0:45 – 1:05 | Approve Action**: SRE clicks **[Approve Simulated Fix: Adjust Retry Backoff & Jitter]**. Incident status changes to `Resolved`.
5. **1:05 – 1:25 | Retain Learning**: SRE fills brief post-mortem form and submits. Backend calls Hindsight `retain`.
6. **1:25 – 1:30 | Verify Memory**: SRE opens **Memory Explorer** to show the newly retained memory live in Hindsight!

---

## 9. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Hindsight Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=prod-incidents

# LLM Provider Configuration (Choose OpenAI, Gemini, or LiteLLM)
LLM_PROVIDER=openai
LLM_API_KEY=your_llm_api_key_here
LLM_MODEL=gpt-4o-mini

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

*Note: The application includes a graceful mock fallback for Hindsight and LLM if API keys are not provided during offline local development.*

---

## 10. Folder Structure

```
Incident Memory Agent/
├── context.md                          # Comprehensive project & architecture spec
├── .env.example                        # Template environment variables
├── backend/
│   ├── main.py                         # FastAPI application entry point
│   ├── config.py                       # Settings & env variable parser
│   ├── models/
│   │   ├── incident.py                 # Pydantic schemas for incidents & post-mortems
│   │   └── memory.py                   # Schemas for Hindsight retain/recall payloads
│   ├── services/
│   │   ├── hindsight_service.py        # Hindsight API integration (retain/recall/reflect)
│   │   ├── llm_service.py              # LLM client wrapper & baseline generation
│   │   └── incident_service.py         # Incident lifecycle & synthetic dataset manager
│   ├── data/
│   │   └── synthetic_incidents.json    # Seed dataset (12 pre-configured scenarios)
│   └── routes/
│       ├── incidents.py                # Incident CRUD & triage endpoints
│       ├── memory.py                   # Recall, reflect & explorer endpoints
│       └── demo.py                     # Side-by-side comparison endpoint
└── frontend/
    ├── index.html                      # Entry HTML point
    ├── package.json                    # React + Vite dependencies
    ├── vite.config.js                  # Vite configuration & backend proxy
    └── src/
        ├── main.jsx                    # React app entry point
        ├── App.jsx                     # Core application view switcher
        ├── index.css                   # Global styling system & dark mode tokens
        ├── components/
        │   ├── Header.jsx              # Navigation & scenario selector
        │   ├── Incident signals.jsx    # Current incident logs & details
        │   ├── TriagePlan.jsx          # Agent hypotheses & recommended actions
        │   ├── HindsightPanel.jsx      # Recalled historical memories & evidence
        │   ├── ComparisonView.jsx      # Side-by-side Baseline vs Hindsight mode
        │   ├── PostMortemModal.jsx     # Learning capture form
        │   ├── MemoryExplorer.jsx      # Visualizer for stored Hindsight memories
        │   └── ActionSimulation.jsx    # Mock action execution cards
        └── services/
            └── api.js                  # Axios/Fetch API client wrapper
```
