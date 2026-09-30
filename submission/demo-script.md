# IncidentIQ — Live Demo Script (60–90 Seconds)

## Core Narrative
"An incident response agent is only as useful as the operational history it remembers. Stateless AI agents give generic advice. IncidentIQ remembers past production failures using Hindsight Cloud and uses that experience to resolve new outages faster."

---

## Step-by-Step Script

### 0:00 – 0:15 | Introduction & Seeding Memory
- **Speaker**: "Welcome to IncidentIQ. Today we are demonstrating how persistent agent memory dramatically changes incident response."
- **Action**: Click **"Seed Demo Memory"** in the header.
- **Screen**: Header status updates to show historical memories ingested into Hindsight bank `prod-incidents`.

### 0:15 – 0:35 | Loading the Target Incident
- **Speaker**: "A P1 production outage just occurred on our Payment API (INC-1097). Checkout requests are timing out following a v2.5.0 deployment."
- **Action**: Click **"Load INC-1097 (Target Demo)"**.
- **Screen**: Incident details populate showing symptoms (*HTTP 504 timeouts*) and error signature (*Hikari connection request timed out after 30000ms*).

### 0:35 – 0:55 | Running Hero Demo (Before vs After)
- **Speaker**: "Let me click 'RUN HERO DEMO' to analyze this incident in both Memory OFF and Hindsight Memory ON modes simultaneously."
- **Action**: Click **"RUN HERO DEMO (BEFORE / AFTER)"**.
- **Screen**: Split-screen comparison renders:
  - **Left (Memory OFF)**: Recommends generic steps (*"Inspect pod logs, check network metrics, try restarting the Payment container"*).
  - **Right (With Hindsight Memory)**: Recalls historical incident `INC-1042`. Pinpoints root cause (*audit logger connection leak*), warns against container restarts (*which dropped transactions in INC-1042*), and gives verified fix (*rollback deployment & increase pool size*).

### 0:55 – 1:15 | Resolving & Retaining Learning
- **Speaker**: "Our SRE applies the verified fix. Now we mark the incident resolved and capture our post-mortem."
- **Action**: Click **"Resolve & Remember Learning"**, enter post-mortem details, and click **"Retain Learning into Hindsight"**.
- **Screen**: Modal retains memory. Success toast pops up.

### 1:15 – 1:30 | Verifying Hindsight Explorer
- **Speaker**: "In the Memory Explorer below, we can see the new post-mortem stored live in Hindsight. The next time a connection leak strikes, IncidentIQ will be even smarter."
- **Action**: Scroll to **Hindsight Memory Explorer**.
