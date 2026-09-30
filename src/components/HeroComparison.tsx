'use client';

import { AgentAnalysis, Incident } from '@/types';
import { AlertCircle, AlertTriangle, Brain, CheckCircle2, Database, ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface HeroComparisonProps {
  memoryOffResult: AgentAnalysis | null;
  memoryOnResult: AgentAnalysis | null;
  onResolveIncident: () => void;
  isAnalyzing?: boolean;
  selectedIncident?: Incident | null;
}

export function HeroComparison({
  memoryOffResult,
  memoryOnResult,
  onResolveIncident,
  isAnalyzing = false,
  selectedIncident,
}: HeroComparisonProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/80 rounded-3xl p-8 text-center space-y-5 shadow-md">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            AUTOMATIC INVESTIGATION IN PROGRESS
          </h3>
        </div>

        <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 font-semibold text-left">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>✓ Incident received ({selectedIncident?.incidentId || 'INC'})</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>✓ Current evidence &amp; error signatures analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>✓ Team memory searched (prod-incidents)</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse font-bold">
            <span className="h-3 w-3 rounded-full bg-blue-600 animate-ping" />
            <span>● Generating Memory OFF vs With Hindsight AI comparison...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!memoryOnResult && !memoryOffResult) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xs">
        <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          IncidentIQ Automated Investigation Workspace
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Select or report an incident above to trigger automatic investigation with memory comparison.
        </p>
      </div>
    );
  }

  const recalledMemories = memoryOnResult?.recalledMemories || [];
  const memoryFound = recalledMemories.length > 0;
  const primaryMemory = recalledMemories[0];

  const mlSignal = memoryOnResult?.anomalyAnalysis || memoryOffResult?.anomalyAnalysis;

  return (
    <div className="space-y-6">
      {/* 1. INCIDENT HEADER (Section 11) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {selectedIncident?.incidentId}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedIncident?.service}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono">
                  {selectedIncident?.severity}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  Status: INVESTIGATING / OPEN
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {selectedIncident?.title}
              </p>
            </div>
          </div>

          {/* HUMAN VERIFICATION BUTTON */}
          <button
            onClick={onResolveIncident}
            className="flex items-center gap-2 px-6 py-3 text-xs font-extrabold rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            RESOLVE INCIDENT
          </button>
        </div>
      </div>

      {/* 2. CURRENT INCIDENT EVIDENCE (Section 11) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Current Incident Evidence
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 md:col-span-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Observed Symptoms</span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedIncident?.symptoms}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Recent Deployment / Change</span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedIncident?.recentDeployment || 'No recent deployment'}</p>
          </div>
        </div>

        {selectedIncident?.errorSignature && (
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider block">Error Signature</span>
            <p className="text-slate-800 dark:text-slate-200 font-semibold">{selectedIncident.errorSignature}</p>
          </div>
        )}
      </div>

      {/* 3. INCIDENT SIGNAL (compact supporting signal) */}
      {mlSignal && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Incident Signal
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
            <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
              <span>🔴</span>
              <span>
                {mlSignal.anomalyLevel
                  ? mlSignal.anomalyLevel.charAt(0).toUpperCase() + mlSignal.anomalyLevel.slice(1).toLowerCase()
                  : 'High'}{' '}
                — Anomaly detected in current incident
              </span>
            </div>
          </div>
          <div className="font-mono text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
            Signal strength: {Math.round(mlSignal.anomalyScore * 100)}/100
          </div>
        </div>
      )}

      {/* 4. HOW INCIDENTIQ INVESTIGATES: SIDE-BY-SIDE COMPARISON (Sections 3, 4, 5, 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <span>HOW INCIDENTIQ INVESTIGATES THIS INCIDENT</span>
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Comparing current evidence only vs precedent-backed investigation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL: WITHOUT TEAM MEMORY (BASELINE) */}
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 space-y-4 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                    WITHOUT TEAM MEMORY
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    "IncidentIQ investigates using only what is happening now."
                  </p>
                </div>
              </div>

              {/* Evidence available */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Evidence Available</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">• Current incident evidence only</p>
                <p className="font-semibold text-amber-700 dark:text-amber-400">• Historical context: None</p>
              </div>

              {/* Memory OFF Gemini Output */}
              {memoryOffResult ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                      Possible Root Cause (Initial Hypothesis)
                    </h5>
                    <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed font-mono">
                      {memoryOffResult.likelyRootCause}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                      Why this may be happening
                    </h5>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                      {memoryOffResult.summary}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                      Recommended Investigation
                    </h5>
                    <ul className="space-y-1.5 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      {memoryOffResult.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">Baseline investigation loading...</div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 mt-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Based on current incident evidence only</span>
            </div>
          </div>

          {/* RIGHT PANEL: WITH HINDSIGHT (MEMORY-AWARE) */}
          <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-blue-50/70 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border-2 border-blue-300 dark:border-blue-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="pb-3 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    WITH HINDSIGHT
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    "IncidentIQ also uses what your team has already learned."
                  </p>
                </div>
              </div>

              {/* Evidence available */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">Evidence Available</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">• Current incident evidence</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  • Historical context: {memoryFound ? `Recalled precedent ${primaryMemory.incidentId}` : 'None found in team memory'}
                </p>
              </div>

              {/* SECTION 9: RECALLED HISTORICAL KNOWLEDGE */}
              {memoryFound ? (
                <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-extrabold">
                    <span className="flex items-center gap-1.5">
                      🧠 PREVIOUS TEAM SOLUTION FOUND
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {primaryMemory.incidentId}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider block">Previous Root Cause:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-mono">{primaryMemory.rootCause}</p>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider block">Verified Solution:</span>
                      <p className="text-emerald-900 dark:text-emerald-200 font-mono font-bold">{primaryMemory.resolution}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">NO RELEVANT PREVIOUS SOLUTION FOUND</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">No historical precedent exists for this incident signature.</p>
                </div>
              )}

              {/* Memory ON Gemini Output */}
              {memoryOnResult ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h5 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-[10px] tracking-wider mb-1">
                      {memoryFound ? 'Precedent-Backed Root Cause' : 'Possible Root Cause'}
                    </h5>
                    <p className="text-blue-950 dark:text-blue-100 bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-blue-200 dark:border-blue-800 leading-relaxed font-mono">
                      {memoryOnResult.likelyRootCause}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-[10px] tracking-wider mb-1">
                      AI Reasoning (Precedent-Aware)
                    </h5>
                    <p className="text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-blue-200 dark:border-blue-800 leading-relaxed">
                      {memoryOnResult.summary}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-[10px] tracking-wider mb-1">
                      Recommended Investigation &amp; Remediation
                    </h5>
                    <ul className="space-y-1.5 bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200 font-medium">
                      {memoryOnResult.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">Precedent investigation loading...</div>
              )}
            </div>

            <div className="pt-3 border-t border-blue-200 dark:border-blue-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-4">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{memoryFound ? `Precedent-backed AI reasoning incorporating ${primaryMemory.incidentId}` : 'Current evidence investigation (No precedent)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
