'use client';

import { HealthStatus } from '@/types';
import { Activity, Brain, Cpu, Database, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  health: HealthStatus | null;
  onSeedMemory: () => void;
  isSeeding: boolean;
}

export function Header({ health, onSeedMemory, isSeeding }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                IncidentIQ
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Hindsight Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Persistent-Memory Incident Response Agent
            </p>
          </div>
        </div>

        {/* System Health Badges & Actions */}
        <div className="flex items-center gap-3">
          {/* ML Anomaly Engine Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400">ML:</span>
            {health?.ml?.status === 'connected' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {health.ml.algorithm || 'IsolationForest'} ({health.ml.trainedMachinesCount || 28} models)
              </span>
            ) : (
              <span className="text-slate-400 font-semibold">
                Baseline Stats
              </span>
            )}
          </div>

          {/* Gemini Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Gemini:</span>
            {health?.gemini.status === 'connected' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            ) : health?.gemini.status === 'not_configured' ? (
              <span className="text-amber-400 font-semibold" title={health?.gemini.error}>
                Fallback Mode
              </span>
            ) : (
              <span className="text-red-400 font-semibold">Fallback Mode</span>
            )}
          </div>

          {/* Hindsight Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Hindsight:</span>
            {health?.hindsight.status === 'connected' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected ({health?.hindsight.bankId || 'prod-incidents'})
              </span>
            ) : (
              <span className="text-amber-400 font-semibold" title={health?.hindsight.error}>
                Fallback Mode
              </span>
            )}
          </div>

          {/* Seed Memory Quick Action */}
          <button
            onClick={onSeedMemory}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Activity className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Seeding Hindsight...' : 'Seed Demo Memory'}
          </button>
        </div>
      </div>
    </header>
  );
}

