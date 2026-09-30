'use client';

import { HealthStatus } from '@/types';
import { Activity, Cpu, Database, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SystemHealthViewProps {
  health: HealthStatus | null;
  onRefresh: () => void;
}

export function SystemHealthView({ health, onRefresh }: SystemHealthViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">System Health & Microservice Diagnostics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live operational status across ML inference, vector memory, and AI reasoning pipelines.</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Health Check</span>
        </button>
      </div>

      {/* Microservices Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ML Inference Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">FastAPI ML Service</h4>
            </div>

            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                health?.ml?.status === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${health?.ml?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {health?.ml?.status === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Endpoint:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">http://127.0.0.1:8000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Algorithm:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">IsolationForest</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Trained Models:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{health?.ml?.trainedMachinesCount || 28} Machines</span>
            </div>
          </div>
        </div>

        {/* Gemini API Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Google Gemini API</h4>
            </div>

            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                health?.gemini?.status === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${health?.gemini?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {health?.gemini?.status === 'connected' ? 'Connected' : 'Fallback Active'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">SDK:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">@google/genai</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Model Tier:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">gemini-3.6-flash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Mode:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Server-side Isolated</span>
            </div>
          </div>
        </div>

        {/* Hindsight Cloud Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Database className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hindsight Cloud</h4>
            </div>

            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                health?.hindsight?.status === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${health?.hindsight?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {health?.hindsight?.status === 'connected' ? 'Connected' : 'Fallback Active'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Memory Bank:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{health?.hindsight?.bankId || 'prod-incidents'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Base URL:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">hindsight.vectorize.io</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Persistence:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Vector Store Retain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Health JSON Diagnostic Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Raw Health Check Output (`/api/health`)</h4>
        <pre className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
          {JSON.stringify(health, null, 2)}
        </pre>
      </div>
    </div>
  );
}
