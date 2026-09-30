'use client';

import { HindsightMemory, Incident, SeverityLevel } from '@/types';
import { AlertTriangle, Brain, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';

interface IncidentFormProps {
  onCreateIncident: (inc: Incident, autoResolveWithMemory?: HindsightMemory) => void;
  onCancel?: () => void;
  isAnalyzing: boolean;
}

export function IncidentForm({
  onCreateIncident,
  onCancel,
  isAnalyzing,
}: IncidentFormProps) {
  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('P1');
  const [symptoms, setSymptoms] = useState('');
  const [errorSignature, setErrorSignature] = useState('');
  const [recentDeployment, setRecentDeployment] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const [isCheckingMemory, setIsCheckingMemory] = useState(false);
  const [similarMemory, setSimilarMemory] = useState<HindsightMemory | null>(null);
  const [pendingIncident, setPendingIncident] = useState<Incident | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uniqueId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInc: Incident = {
      incidentId: uniqueId,
      timestamp: new Date().toISOString(),
      service: service.trim() || 'Checkout API',
      environment: 'production',
      severity: severity,
      title: title.trim() || 'Checkout API returning 504 errors',
      symptoms: symptoms.trim() || 'Checkout requests are returning HTTP 504 errors.',
      errorSignature: errorSignature.trim() || 'HikariPool connection timeout',
      recentDeployment: recentDeployment.trim() || 'checkout-v3.0.2',
      metrics: {
        cpuUsage: '82%',
        memoryUsage: '74%',
        errorRate: '38.5%',
        latencyP99: '30,000ms',
        activeConnections: '250/250 (Exhausted)',
      },
      rootCause: 'Pending investigation',
      resolution: 'Pending investigation',
      tags: ['production', (service || 'Checkout API').toLowerCase().replace(/\s+/g, '-'), severity.toLowerCase()],
    };

    // PART 1 — SIMILAR INCIDENT DETECTION: Check existing memory FIRST!
    setIsCheckingMemory(true);
    try {
      const res = await fetch('/api/memory/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${newInc.title} ${newInc.symptoms} ${newInc.errorSignature}`,
          service: newInc.service,
          topK: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const memories: HindsightMemory[] = data.memories || [];
        if (memories.length > 0) {
          // Found similar resolved precedent! Show intercept modal
          setSimilarMemory(memories[0]);
          setPendingIncident(newInc);
          setIsCheckingMemory(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Memory check failed, proceeding as new incident:', e);
    } finally {
      setIsCheckingMemory(false);
    }

    // No similar memory found -> proceed as new incident
    onCreateIncident(newInc);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 relative">
      {/* SIMILAR INCIDENT PRECEDENT INTERCEPT MODAL (Part 1) */}
      {similarMemory && pendingIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-blue-950 dark:text-blue-100 uppercase tracking-tight">
                  🧠 SIMILAR HISTORICAL INCIDENT FOUND
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  IncidentIQ searched team memory before creating a new incident.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/80 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                <span>Matched Memory: <strong className="font-mono text-blue-600 dark:text-blue-400">{similarMemory.incidentId}</strong></span>
                <span>Service: <strong className="text-slate-800 dark:text-slate-200">{similarMemory.service}</strong></span>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider block">Previous Verified Root Cause:</span>
                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  {similarMemory.rootCause}
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider block">Verified Solution:</span>
                <p className="text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-bold">
                  {similarMemory.resolution}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300">
              <strong>Recommendation:</strong> This report matches a previously resolved incident. You can apply the verified solution immediately or proceed with a full new AI investigation.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const incToCreate = pendingIncident;
                  setSimilarMemory(null);
                  setPendingIncident(null);
                  onCreateIncident(incToCreate);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                CONTINUE AS NEW INCIDENT
              </button>

              <button
                type="button"
                onClick={() => {
                  const precedentMem = similarMemory;
                  const incToPrepopulate = pendingIncident;
                  setSimilarMemory(null);
                  setPendingIncident(null);
                  onCreateIncident(incToPrepopulate, precedentMem);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                USE PREVIOUS SOLUTION
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Report New Incident</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Checks existing team memory before creating a new incident investigation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Incident Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              placeholder='e.g. Checkout API returning 504 errors'
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              placeholder='e.g. Checkout API'
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
            >
              <option value="P1">🔴 P1 — Critical Outage</option>
              <option value="P2">🟡 P2 — High Severity</option>
              <option value="P3">🔵 P3 — Moderate Impact</option>
              <option value="P4">⚪ P4 — Low Severity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Error Signature
            </label>
            <input
              type="text"
              value={errorSignature}
              onChange={(e) => setErrorSignature(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              placeholder='e.g. HikariPool connection timeout'
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Recent Deployment / Change
            </label>
            <input
              type="text"
              value={recentDeployment}
              onChange={(e) => setRecentDeployment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              placeholder='e.g. checkout-v3.0.2'
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Symptoms <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            placeholder='e.g. Checkout requests are returning HTTP 504 errors.'
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Additional Context (Optional)
          </label>
          <textarea
            rows={2}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            placeholder="Any extra infrastructure notes, client regions impacted, or dependent services..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isAnalyzing || isCheckingMemory}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${isCheckingMemory ? 'animate-spin' : ''}`} />
            {isCheckingMemory ? 'Searching Team Memory...' : 'CREATE & INVESTIGATE INCIDENT'}
          </button>
        </div>
      </form>
    </div>
  );
}


