# IncidentIQ — Project Description

## Short Description
IncidentIQ is a persistent-memory incident response agent for DevOps/SRE teams built with Next.js, Google Gemini, and Hindsight Cloud. It recalls past production incident post-mortems, root causes, and verified resolutions to turn organizational history into instant operational intelligence.

## Problem Statement
Modern software systems generate complex, high-velocity incidents. When outages occur, SREs frequently spend critical minutes or hours re-investigating symptoms that have occurred before. Organizational knowledge remains trapped in static post-mortems, chat logs, and individual memories.

Stateless LLM agents cannot solve this problem because they lack persistent memory of an organization's specific system behaviors, past debugging attempts, and verified fixes.

## The Solution: IncidentIQ
IncidentIQ connects Google Gemini with **Hindsight Cloud** (by Vectorize.io) to create a persistent-memory SRE co-pilot:

1. **Hindsight Memory Recall**: Before analyzing a new incident, IncidentIQ queries Hindsight Cloud for past incidents with matching error signatures, symptoms, or service tags.
2. **Contextual Reasoning**: Gemini synthesizes current incident logs with recalled historical post-mortems—highlighting verified root causes and warning against past failed attempts (e.g., container restarts that caused data loss).
3. **Continuous Retain Loop**: Once resolved, the verified post-mortem is retained back into Hindsight Cloud, making the agent progressively smarter over time.

## Key Features
- **Hero Demo Split-Screen**: Side-by-side comparison proving the contrast between zero-memory baseline advice and Hindsight memory-augmented guidance.
- **Hindsight Memory Explorer**: Real-time visual browser for inspecting stored memory banks and retained post-mortems.
- **Advisory Guardrails**: Human-in-the-loop remediation recommendation engine ensuring safe production operation.
- **Realistic Synthetic Dataset**: Pre-configured with 18 realistic SRE incident scenarios spanning database leaks, cache evictions, queue deadlocks, and API gateway limits.
