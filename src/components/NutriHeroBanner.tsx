'use client';

import { HealthStatus, Incident } from '@/types';
import { Activity, Clock, Plus } from 'lucide-react';

interface NutriHeroBannerProps {
  onReportNewIncident: () => void;
  activeIncidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  isAnalyzing: boolean;
  health: HealthStatus | null;
  memoryCount?: number;
}

export function NutriHeroBanner({
  onReportNewIncident,
  activeIncidents,
  onSelectIncident,
  isAnalyzing,
  health,
  memoryCount = 7,
}: NutriHeroBannerProps) {
  return (
    <div className="space-y-6">
      {/* Product Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-3">
              <span>IncidentIQ</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 font-semibold font-mono">
                Team Memory Active ({health?.hindsight?.bankId || 'prod-incidents'})
              </span>
            </h1>
            <p className="text-sm font-semibold text-slate-300">
              AI incident response that learns from your team's operational experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onReportNewIncident}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              + Report New Incident
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE INCIDENTS Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight uppercase">
              🔴 Active Incidents ({activeIncidents.length})
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Real operational incidents requiring response
          </span>
        </div>

        {activeIncidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeIncidents.map((inc) => {
              const statusText = inc.rootCause && !inc.rootCause.includes('Pending') ? 'Investigated' : 'Investigating';
              const createdTime = inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';

              return (
                <div
                  key={inc.incidentId}
                  className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-5 space-y-3 shadow-xs relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono border border-red-200 dark:border-red-800">
                        🔴 {inc.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {createdTime}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                          {inc.incidentId}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[150px]">
                          {inc.service}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-bold line-clamp-1">{inc.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium line-clamp-2">{inc.symptoms}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Status: <strong className="text-amber-600 dark:text-amber-400">{statusText}</strong>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        AI investigation ready
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer text-center"
                  >
                    View Incident
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active incidents</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">All systems are operational or incidents resolved.</p>
            <button
              onClick={onReportNewIncident}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer"
            >
              + Report New Incident
            </button>
          </div>
        )}
      </div>

      {/* Factual Team Memory Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {memoryCount} verified memories in team memory
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-mono">({health?.hindsight?.bankId || 'prod-incidents'})</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
          <span>• Active Incidents: <strong className="text-slate-900 dark:text-slate-100">{activeIncidents.length}</strong></span>
          <span>• Persistent Store: <strong className="text-blue-600 dark:text-blue-400">Hindsight Active</strong></span>
        </div>
      </div>
    </div>
  );
}


