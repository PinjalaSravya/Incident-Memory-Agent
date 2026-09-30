# INCIDENTIQ — ARCHITECTURE SPECIFICATION & MERMAID DIAGRAMS

## 1. System Overview

IncidentIQ is a persistent-memory incident response agent engineered for SRE and DevOps teams. It bridges the gap between raw incident logs and organizational memory by utilizing **Hindsight** (by Vectorize.io) to retain post-mortem learnings and recall verified resolutions during active production outages.

```mermaid
graph TD
    User([SRE / DevOps Engineer]) -->|Interacts with UI| NextJS[Next.js App Router]
    
    subgraph Frontend Layer
        NextJS --> Dashboard[Incident Dashboard & Scenario Selector]
        NextJS --> HeroComparison[Before / After Hero Demo Panel]
        NextJS --> MemoryExplorer[Hindsight Memory Explorer]
        NextJS --> PostMortemModal[Resolve & Retain Modal]
    end

    subgraph Server API Layer
        NextJS -->|POST /api/incidents/analyze| AnalyzeRoute[Analyze Endpoint]
        NextJS -->|POST /api/memory/retain| RetainRoute[Retain Endpoint]
        NextJS -->|POST /api/memory/recall| RecallRoute[Recall Endpoint]
        NextJS -->|POST /api/demo/seed| SeedRoute[Demo Seeding Endpoint]
        NextJS -->|GET /api/health| HealthRoute[Health Check Endpoint]
    end

    subgraph Agent Reasoning & Memory
        AnalyzeRoute -->|Query Symptoms| HindsightService[Hindsight Client Service]
        HindsightService -->|Recall Top-K Memories| HindsightCloud[Hindsight Cloud API]
        HindsightCloud -->|Relevant Historical Post-Mortems| HindsightService
        
        HindsightService -->|Enrich System Prompt| GeminiAgent[Google Gemini 2.5 Flash]
        GeminiAgent -->|Structured JSON Diagnosis| AnalyzeRoute
    end

    subgraph Continuous Learning Loop
        PostMortemModal -->|Submit Verified Post-Mortem| RetainRoute
        RetainRoute -->|POST /v1/default/banks/prod-incidents/memories| HindsightCloud
    end
```

---

## 2. The Persistent Memory Learning Loop

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as SRE Engineer
    participant UI as Next.js Dashboard
    participant API as Server API Routes
    participant Hindsight as Hindsight Cloud (prod-incidents)
    participant Gemini as Google Gemini API

    Note over Engineer, Gemini: STEP 1: HISTORICAL SEEDING
    Engineer->>UI: Click "Seed Demo Memory"
    UI->>API: POST /api/demo/seed
    API->>Hindsight: Retain INC-1042 (Payment API DB Connection Leak Post-Mortem)
    Hindsight-->>API: Memory Retained Successfully

    Note over Engineer, Gemini: STEP 2: RECURRING INCIDENT DISCOVERY
    Engineer->>UI: Load New Incident INC-1097 (Payment API Timeout)
    Engineer->>UI: Click "RUN HERO DEMO"

    Note over UI, Gemini: BASELINE (MEMORY OFF) EXECUTION
    API->>Gemini: Prompt with INC-1097 (Zero Memory)
    Gemini-->>API: Generic Troubleshooting Advice ("Restart container, check logs")

    Note over UI, Gemini: HINDSIGHT-AUGMENTED EXECUTION
    API->>Hindsight: Recall(INC-1097 symptoms, service: "Payment API")
    Hindsight-->>API: Recalled INC-1042 Post-Mortem (Relevance: 95%)
    API->>Gemini: Prompt with INC-1097 + Recalled INC-1042 Post-Mortem Context
    Gemini-->>API: Specific Diagnosis & Verified Resolution ("Rollback deployment, increase Hikari pool")

    UI->>Engineer: Render Side-by-Side Comparison (Generic vs Hindsight Memory)

    Note over Engineer, Gemini: STEP 3: RESOLUTION & CONTINUOUS RETENTION
    Engineer->>UI: Click "Resolve & Remember Learning"
    UI->>API: POST /api/memory/retain (INC-1097 Verified Fix)
    API->>Hindsight: Retain INC-1097 Post-Mortem
    Hindsight-->>API: Memory Persisted
    UI-->>Engineer: Memory Explorer Updates Live
```

---

## 3. Data Flow & Security Model

1. **Server-Side API Keys**: `GEMINI_API_KEY` and `HINDSIGHT_API_KEY` are read exclusively in Next.js Route Handlers (`app/api/*`). Secrets are never exposed to browser client bundles.
2. **Normalized Memory Format**: All memories retrieved from Hindsight Cloud are normalized into a typed `HindsightMemory` interface (`incidentId`, `service`, `symptoms`, `rootCause`, `resolution`, `relevanceScore`).
3. **Mock Fallback Resilience**: If API keys are unpopulated during local dev, IncidentIQ falls back to an in-memory store while maintaining exact API interfaces and displaying transparent health status badges.
