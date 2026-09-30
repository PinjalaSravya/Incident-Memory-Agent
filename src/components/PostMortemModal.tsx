'use client';

import { Incident } from '@/types';
import { CheckCircle2, Save, X } from 'lucide-react';
import { useState } from 'react';

interface PostMortemModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndRetain: (updatedIncident: Incident) => void;
  isRetaining: boolean;
}

export function PostMortemModal({
  incident,
  isOpen,
  onClose,
  onSaveAndRetain,
  isRetaining,
}: PostMortemModalProps) {
  const [rootCause, setRootCause] = useState(incident.rootCause || '');
  const [resolution, setResolution] = useState(incident.resolution || '');
  const [preventiveAction, setPreventiveAction] = useState(incident.preventiveAction || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Incident = {
      ...incident,
      rootCause: rootCause || 'Root cause confirmed during incident resolution.',
      resolution: resolution || 'Resolution applied successfully.',
      preventiveAction: preventiveAction || 'Preventive monitoring added.',
    };
    onSaveAndRetain(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Resolve & Remember Learning ({incident.incidentId})
          </h3>
        </div>

        {/* Gemini Hypothesis Reference */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
          <span className="font-bold text-amber-800 dark:text-amber-300 block">
            Gemini AI Hypothesis:
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {incident.rootCause && !incident.rootCause.includes('Pending')
              ? incident.rootCause
              : 'Connection pool leak / Hikari database connection saturation after release'}
          </p>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Document the confirmed root cause and verified resolution. This post-mortem will be retained into Hindsight persistent memory to assist future incidents.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirmed Root Cause (Engineer Verification)
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              placeholder="e.g. Unclosed DB connections outside transactional block"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verified Solution
            </label>
            <textarea
              rows={2}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              placeholder="e.g. Rollback deployment + fix connection handling"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preventive Actions & Lessons Learned
            </label>
            <input
              type="text"
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="e.g. Enforce async connection pool release linting in CI pipeline"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRetaining}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isRetaining ? 'Retaining to Hindsight...' : 'Retain Learning into Hindsight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
