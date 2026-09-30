'use client';

import { HindsightMemory } from '@/types';
import { Database, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';

interface MemoryExplorerProps {
  memories: HindsightMemory[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function MemoryExplorer({ memories, onRefresh, isLoading }: MemoryExplorerProps) {
  const [search, setSearch] = useState('');

  const filtered = memories.filter((m) => {
    const text = `${m.incidentId} ${m.service} ${m.symptoms} ${m.rootCause} ${m.resolution}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hindsight Memory Explorer</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {memories.length} Memories Retained
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Persistent Vector Bank: <strong className="text-blue-600 dark:text-blue-400 font-bold">prod-incidents</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-44 focus:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Memories"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
          No memories retained in bank yet. Click <strong className="text-slate-800 dark:text-slate-200">"Seed Demo Memory"</strong> on the Incident Dashboard to populate historical incidents.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((mem, index) => {
            const isLatestRetained = mem.incidentId === 'INC-1201' || index === filtered.length - 1;
            return (
              <div
                key={mem.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 text-xs shadow-xs ${
                  isLatestRetained
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{mem.incidentId}</span>
                    {isLatestRetained && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white animate-pulse">
                        NEW LESSON
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    {mem.service}
                  </span>
                </div>

                <div>
                  <strong className="text-slate-500 dark:text-slate-400 text-[11px] block mb-0.5">Symptoms:</strong>
                  <p className="text-slate-800 dark:text-slate-200 line-clamp-2 text-[11px]">{mem.symptoms}</p>
                </div>

                {mem.rootCause && (
                  <div>
                    <strong className="text-amber-700 dark:text-amber-400 text-[11px] block mb-0.5">Root Cause:</strong>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2 text-[11px] bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/60">{mem.rootCause}</p>
                  </div>
                )}

                {mem.resolution && (
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-400 text-[11px] block mb-0.5">Verified Fix:</strong>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2 text-[11px] bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60">{mem.resolution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
