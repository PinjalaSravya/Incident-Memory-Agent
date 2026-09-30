'use client';

import { Incident } from '@/types';
import { ArrowRight, Plus, Search, Zap } from 'lucide-react';
import { useState } from 'react';

interface ScenariosViewProps {
  presets: Incident[];
  selectedIncident: Incident;
  onSelectAndInvestigate: (inc: Incident) => void;
}

export function ScenariosView({
  presets,
  selectedIncident,
  onSelectAndInvestigate,
}: ScenariosViewProps) {
  const [search, setSearch] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customService, setCustomService] = useState('Payment API');
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [customError, setCustomError] = useState('');

  const filtered = presets.filter((inc) => {
    const text = `${inc.incidentId} ${inc.service} ${inc.title} ${inc.symptoms} ${inc.errorSignature}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customInc: Incident = {
      incidentId: `INC-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      service: customService,
      environment: 'production',
      severity: 'P1',
      title: customTitle || 'Custom Production Alert',
      symptoms: customSymptoms || 'Unexpected high error rate and timeout spike',
      errorSignature: customError || 'HTTP 500 Internal Server Error',
      metrics: { cpuUsage: '85%', memoryUsage: '75%' },
      tags: ['custom', customService.toLowerCase().replace(/\s+/g, '-')],
    };
    onSelectAndInvestigate(customInc);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Incident Scenario Catalog</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Preset production incident scenarios for 3-layer AI investigation.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scenarios..."
              className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {isCustomMode ? 'View Catalog' : 'Custom Scenario'}
          </button>
        </div>
      </div>

      {isCustomMode ? (
        <form onSubmit={handleCustomSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Custom Incident Scenario</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Service</label>
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                placeholder="e.g. Payment API"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                placeholder="e.g. Connection pool exhaustion on checkout"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Observed Symptoms</label>
            <textarea
              rows={2}
              value={customSymptoms}
              onChange={(e) => setCustomSymptoms(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              placeholder="e.g. HTTP 504 Gateway Timeout on payment checkout API"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Error Signature / Log Excerpt</label>
            <input
              type="text"
              value={customError}
              onChange={(e) => setCustomError(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              placeholder="e.g. HikariPool-1 - Connection is not available"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Investigate Custom Scenario
          </button>
        </form>
      ) : (
        /* Preset Scenarios Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inc) => {
            const isSelected = selectedIncident.incidentId === inc.incidentId;
            return (
              <div
                key={inc.incidentId}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all shadow-xs space-y-3 ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{inc.incidentId}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{inc.service}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      inc.severity === 'P1'
                        ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{inc.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{inc.symptoms}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  <strong className="text-slate-500 dark:text-slate-400 font-sans">Error Signature:</strong> {inc.errorSignature}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {inc.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectAndInvestigate(inc)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
