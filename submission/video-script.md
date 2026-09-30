# IncidentIQ — Video Script (3-Minute Breakdown)

## Video Structure
- **Length**: 3 Minutes (180 Seconds)
- **Target Audience**: SREs, AI Engineers, Systems Architects
- **Core Message**: Why stateless AI agents fail in production SRE workflows and how persistent memory via Hindsight Cloud fixes it.

---

## Breakdown & Teleprompter Text

### 0:00 – 0:30 | The SRE Memory Problem
**Visual**: Host on camera / Screen displaying high-volume PagerDuty alerts spiking.
**Audio**:
> "When a major production outage hits at 2 AM, every minute matters. But today, SRE teams face a frustrating reality: we spend hours debugging incidents that have already happened before. The post-mortems exist in Notion or Confluence, but when the pressure is on, nobody has time to search static docs.
> 
> Current AI agents don't solve this because LLMs are inherently stateless. Each prompt starts with zero memory of your infrastructure's history. 
> 
> Meet **IncidentIQ**—an AI incident response agent powered by **Hindsight Cloud** that gives AI persistent operational memory."

### 0:30 – 1:00 | Architecture & The Hindsight Memory Model
**Visual**: Diagram showing Next.js App Router -> Hindsight Cloud (retain/recall) -> Google Gemini 2.5 Flash.
**Audio**:
> "IncidentIQ uses a simple but powerful architecture. When a new incident occurs, before generating any diagnostic guidance, the system executes a semantic Hindsight `recall()` operation against our organizational memory bank `prod-incidents`.
> 
> Hindsight retrieves relevant past post-mortems based on error signatures, microservice tags, and symptoms. We then feed this historical context into Google Gemini 2.5 Flash to produce a precise, evidence-backed triage plan."

### 1:00 – 2:15 | Live Hero Demo (Before vs After)
**Visual**: Live screen recording of IncidentIQ dashboard executing `INC-1097`.
**Audio**:
> "Let's look at a live example. Here is incident INC-1097: HTTP 504 gateway timeouts on our Payment API following a v2.5.0 deployment.
> 
> Watch what happens when we run the analysis **Without Memory**:
> Gemini gives standard, generic troubleshooting advice: 'Check network logs, verify CPU metrics, or try restarting the payment pod.' In production, restarting that pod blindly could corrupt active transaction states.
> 
> Now let's look at **Hindsight Memory Mode**:
> IncidentIQ queries Hindsight and recalls incident INC-1042 from three months ago. Look at the difference:
> First, it identifies the exact root cause: unclosed database audit logger connections.
> Second, it displays an explicit warning: 'Restarting pods in INC-1042 failed to clear connection leaks and dropped active checkouts.'
> Third, it gives the exact verified resolution: 'Roll back v2.5.0 immediately and increase Hikari pool size.'
> 
> This isn't generic guessing—this is organizational memory in action."

### 2:15 – 2:45 | Resolving & The Retain Loop
**Visual**: Clicking "Resolve & Remember Learning", filling post-mortem modal, showing Memory Explorer.
**Audio**:
> "Once the SRE resolves the incident, we click 'Resolve & Remember'. We input the confirmed root cause and verified fix, and IncidentIQ calls Hindsight `retain()`. 
> 
> As you can see in the Hindsight Memory Explorer, this post-mortem is now persisted in our cloud memory bank. The next time a database connection leak strikes any microservice, the agent will remember this exact solution."

### 2:45 – 3:00 | Key Takeaways & Conclusion
**Visual**: Summary slide with code repo link.
**Audio**:
> "Stateless AI gives you generic advice. Persistent memory gives you operational intelligence. With IncidentIQ and Hindsight Cloud, your engineering organization never has to solve the same production bug twice. Thank you!"
