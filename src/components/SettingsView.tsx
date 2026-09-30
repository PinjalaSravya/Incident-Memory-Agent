'use client';

import { Cpu, Database, Settings, ShieldCheck, Sparkles } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Application Settings & Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">IncidentIQ system configuration, memory settings, and operational guardrails.</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hindsight Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Persistent Memory Settings</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Target Hindsight Bank ID</label>
              <input
                type="text"
                readOnly
                value="prod-incidents"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Hindsight Base API Endpoint</label>
              <input
                type="text"
                readOnly
                value="https://api.hindsight.vectorize.io"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* ML Engine Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">ML Anomaly Engine Settings</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">FastAPI Inference Service URL</label>
              <input
                type="text"
                readOnly
                value="http://127.0.0.1:8000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Dataset & Model Type</label>
              <input
                type="text"
                readOnly
                value="Server Machine Dataset (SMD) • 28 Machine Entities"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Gemini Reasoning Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Gemini LLM Settings</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Primary Model Tier</label>
              <input
                type="text"
                readOnly
                value="gemini-3.6-flash (Fallback: gemini-3.5-flash)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Reasoning Temperature</label>
              <input
                type="text"
                readOnly
                value="0.2 (Low variance deterministic investigation)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Operational Guardrails */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Operational Guardrails & Safety</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="text-slate-900 dark:text-slate-100 font-bold block">Human-in-the-Loop Advisory Mode</strong>
              <p className="text-[11px] leading-relaxed">
                IncidentIQ provides diagnostic guidance and recommended steps. It does NOT autonomously execute production mutations or server restarts.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="text-slate-900 dark:text-slate-100 font-bold block">Server-Side Secret Isolation</strong>
              <p className="text-[11px] leading-relaxed">
                API keys (`GEMINI_API_KEY`, `HINDSIGHT_API_KEY`) are stored in `.env.local` and processed strictly server-side in Next.js API routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
