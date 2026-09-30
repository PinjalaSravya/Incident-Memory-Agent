'use client';

import { HeaderBar } from '@/components/HeaderBar';
import { HeroComparison } from '@/components/HeroComparison';
import { IncidentForm } from '@/components/IncidentForm';
import { MemoryExplorer } from '@/components/MemoryExplorer';
import { NutriHeroBanner } from '@/components/NutriHeroBanner';
import { PostMortemModal } from '@/components/PostMortemModal';
import { ScenariosView } from '@/components/ScenariosView';
import { SettingsView } from '@/components/SettingsView';
import { Sidebar } from '@/components/Sidebar';
import { SystemHealthView } from '@/components/SystemHealthView';
import { SYNTHETIC_INCIDENTS } from '@/data/incidents';
import { AgentAnalysis, HealthStatus, HindsightMemory, Incident } from '@/types';
import { Brain, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [presets, setPresets] = useState<Incident[]>(SYNTHETIC_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident>(
    SYNTHETIC_INCIDENTS.find((inc) => inc.incidentId === 'INC-1201') || SYNTHETIC_INCIDENTS[0]
  );
  const [activeTab, setActiveTab] = useState<string>('command_center');

  const [memoryOffResult, setMemoryOffResult] = useState<AgentAnalysis | null>(null);
  const [memoryOnResult, setMemoryOnResult] = useState<AgentAnalysis | null>(null);

  const [storedMemories, setStoredMemories] = useState<HindsightMemory[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [isRetaining, setIsRetaining] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newIncidentNotification, setNewIncidentNotification] = useState<{ incident: Incident } | null>(null);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [memoryEvolution, setMemoryEvolution] = useState<{ beforeCount: number; afterCount: number; lesson: string } | null>(null);

  // Derived arrays
  const activeIncidents = presets.filter((inc) => !inc.rootCause || inc.rootCause.includes('Pending'));
  const resolvedIncidents = presets.filter((inc) => inc.rootCause && !inc.rootCause.includes('Pending'));

  // Initial load: Fetch health check and stored memories
  useEffect(() => {
    fetchHealth();
    fetchMemories();
    // Auto-investigate initial incident
    handleAnalyze(selectedIncident);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error('Failed to fetch health check:', e);
    }
  };

  const fetchMemories = async () => {
    setIsLoadingMemories(true);
    try {
      const res = await fetch('/api/memory/recall');
      if (res.ok) {
        const data = await res.json();
        setStoredMemories(data.memories || []);
      }
    } catch (e) {
      console.error('Failed to fetch memories:', e);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  // Automatic Incident Investigation: Fetches BOTH Memory OFF & With Hindsight concurrently
  const handleAnalyze = async (incident: Incident) => {
    setIsAnalyzing(true);
    showToast('info', `Automated investigation running for ${incident.incidentId}...`);
    try {
      const [resOff, resOn] = await Promise.all([
        fetch('/api/incidents/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident, useMemory: false }),
        }),
        fetch('/api/incidents/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident, useMemory: true }),
        }),
      ]);

      const [dataOff, dataOn] = await Promise.all([resOff.json(), resOn.json()]);

      if (resOff.ok) setMemoryOffResult(dataOff.analysis);
      if (resOn.ok) setMemoryOnResult(dataOn.analysis);
      showToast('success', `Investigation complete for ${incident.incidentId}.`);
    } catch (e: any) {
      showToast('error', e.message || 'Error analyzing incident.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create Real New Incident (Part 10: Similar Incident Intercept)
  const handleCreateIncident = async (newInc: Incident, usePreviousMemory?: HindsightMemory) => {
    if (usePreviousMemory) {
      // User clicked [ USE PREVIOUS SOLUTION ]: Populate incident with precedent & open resolution modal for review!
      const incidentWithPrecedent: Incident = {
        ...newInc,
        rootCause: usePreviousMemory.rootCause,
        resolution: usePreviousMemory.resolution,
      };
      setPresets((prev) => [incidentWithPrecedent, ...prev]);
      setSelectedIncident(incidentWithPrecedent);
      setActiveTab('command_center');
      handleAnalyze(incidentWithPrecedent);
      setIsModalOpen(true);
      showToast(
        'info',
        `🧠 Precedent [${usePreviousMemory.incidentId}] loaded. Please review and confirm resolution.`
      );
      return;
    }

    setPresets((prev) => [newInc, ...prev]);
    setSelectedIncident(newInc);
    setNewIncidentNotification({ incident: newInc });
    setActiveTab('command_center');
    handleAnalyze(newInc);
  };

  // Select existing incident
  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setActiveTab('command_center');
    handleAnalyze(inc);
  };

  // Human Resolution & Retain (Section 11 #7)
  const handleSaveAndRetain = async (updatedIncident: Incident) => {
    setIsRetaining(true);
    const beforeCount = storedMemories.length;
    try {
      const res = await fetch('/api/memory/retain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: updatedIncident }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state
        setPresets((prev) =>
          prev.map((i) => (i.incidentId === updatedIncident.incidentId ? updatedIncident : i))
        );
        setSelectedIncident(updatedIncident);
        setIsModalOpen(false);

        // Fetch updated memories from real persistent store
        const recallRes = await fetch('/api/memory/recall');
        let newCount = beforeCount + 1;
        if (recallRes.ok) {
          const recallData = await recallRes.json();
          const fetched = recallData.memories || [];
          setStoredMemories(fetched);
          newCount = fetched.length;
        }

        const lessonText = updatedIncident.rootCause || 'Verified solution retained into team memory.';
        setMemoryEvolution({
          beforeCount,
          afterCount: newCount,
          lesson: lessonText,
        });

        showToast(
          'success',
          `✓ INCIDENT RESOLVED | ✓ VERIFIED SOLUTION SAVED | 🧠 INCIDENTIQ LEARNED FROM THIS INCIDENT (${beforeCount} → ${newCount} memories)`
        );
      } else {
        showToast('error', data.error || 'Failed to retain memory.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Failed to retain memory.');
    } finally {
      setIsRetaining(false);
    }
  };

  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setToastNotification({ type, message });
    setTimeout(() => setToastNotification(null), 5000);
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'command_center':
        return 'IncidentIQ Workspace';
      case 'new_incident':
        return 'Report New Incident';
      case 'scenarios':
        return 'Active Production Incidents';
      case 'history':
        return 'Incident History & Resolved Post-Mortems';
      case 'hindsight_bank':
        return 'Team Incident Memory';
      case 'health':
        return 'System Health';
      case 'settings':
        return 'Settings';
      default:
        return 'IncidentIQ Workspace';
    }
  };

  const getActiveTabSubtitle = () => {
    switch (activeTab) {
      case 'command_center':
        return "AI incident response that learns from your team's operational experience.";
      case 'new_incident':
        return 'Report an operational incident and trigger team memory search and AI investigation.';
      case 'scenarios':
        return 'Active unresolved production incidents requiring engineering investigation.';
      case 'history':
        return 'Historical incidents resolved by team engineers with retained operational knowledge.';
      case 'hindsight_bank':
        return 'Verified incident post-mortems retained in team persistent memory (prod-incidents).';
      case 'health':
        return 'Live operational health across Gemini AI, Hindsight Memory, and ML services.';
      case 'settings':
        return 'System preferences and persistent memory bank configurations.';
      default:
        return '';
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        memoryCount={storedMemories.length}
      />

      {/* Main Right Content Shell */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header Bar */}
        <HeaderBar
          health={health}
          activeTitle={getActiveTabTitle()}
          activeSubtitle={getActiveTabSubtitle()}
        />

        {/* TOP NEW INCIDENT NOTIFICATION BANNER */}
        {newIncidentNotification && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-6 py-3.5 flex items-center justify-between shadow-lg z-40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0 animate-ping">
                🔴
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase text-xs tracking-wider bg-white/20 px-2 py-0.5 rounded font-mono">
                    NEW INCIDENT CREATED: {newIncidentNotification.incident.severity}
                  </span>
                  <span className="font-bold text-xs underline">
                    {newIncidentNotification.incident.service}
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium">
                  {newIncidentNotification.incident.title} — {newIncidentNotification.incident.symptoms}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleSelectIncident(newIncidentNotification.incident);
                  setNewIncidentNotification(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-white text-red-700 hover:bg-red-50 shadow-md transition-all cursor-pointer"
              >
                VIEW INCIDENT
              </button>
              <button
                onClick={() => setNewIncidentNotification(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastNotification && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 ${
                toastNotification.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : toastNotification.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                  : 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              }`}
            >
              <span>{toastNotification.message}</span>
            </div>
          </div>
        )}

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* PAGE 1: INCIDENT DASHBOARD */}
          {activeTab === 'command_center' && (
            <div className="space-y-6">
              {/* Real Memory Evolution Banner */}
              {memoryEvolution && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/70 dark:via-teal-950/70 dark:to-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      +1
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">
                          Memory Retained into Hindsight (prod-incidents)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono">
                          {memoryEvolution.beforeCount} → {memoryEvolution.afterCount} Memories Stored
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                        <strong className="text-emerald-900 dark:text-emerald-100">Verified Solution:</strong> "{memoryEvolution.lesson}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMemoryEvolution(null)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Dashboard Hero Banner & Active Incidents Grid */}
              <NutriHeroBanner
                onReportNewIncident={() => setActiveTab('new_incident')}
                activeIncidents={activeIncidents}
                onSelectIncident={handleSelectIncident}
                isAnalyzing={isAnalyzing}
                health={health}
                memoryCount={storedMemories.length}
              />

              {/* Active Incident Investigation View with Memory OFF vs With Hindsight */}
              <HeroComparison
                memoryOffResult={memoryOffResult}
                memoryOnResult={memoryOnResult}
                onResolveIncident={() => setIsModalOpen(true)}
                isAnalyzing={isAnalyzing}
                selectedIncident={selectedIncident}
              />
            </div>
          )}

          {/* PAGE 2: REPORT NEW INCIDENT */}
          {activeTab === 'new_incident' && (
            <IncidentForm
              onCreateIncident={handleCreateIncident}
              onCancel={() => setActiveTab('command_center')}
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* PAGE 3: ACTIVE INCIDENTS LIST */}
          {activeTab === 'scenarios' && (
            <ScenariosView
              presets={activeIncidents}
              selectedIncident={selectedIncident}
              onSelectAndInvestigate={handleSelectIncident}
            />
          )}

          {/* PAGE 4: INCIDENT HISTORY (RECENTLY RESOLVED) */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recently Resolved Incidents</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operational incidents resolved by engineers and remembered by IncidentIQ in Hindsight vector memory.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedIncidents.map((inc) => (
                  <div
                    key={inc.incidentId}
                    className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{inc.incidentId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-mono">
                        ✓ Resolved
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{inc.service} — {inc.title}</h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <strong className="text-slate-700 dark:text-slate-300 block text-[10px] uppercase">Confirmed Root Cause:</strong>
                        <p className="text-slate-800 dark:text-slate-200 font-mono text-xs">{inc.rootCause}</p>
                      </div>

                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <strong className="text-emerald-800 dark:text-emerald-300 block text-[10px] uppercase">Verified Solution:</strong>
                        <p className="text-emerald-900 dark:text-emerald-200 font-mono text-xs font-bold">{inc.resolution}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Brain className="h-3.5 w-3.5" /> Remembered by IncidentIQ
                      </span>
                      <button
                        onClick={() => setActiveTab('hindsight_bank')}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                      >
                        View Memory →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 5: TEAM INCIDENT MEMORY */}
          {activeTab === 'hindsight_bank' && (
            <MemoryExplorer
              memories={storedMemories}
              onRefresh={fetchMemories}
              isLoading={isLoadingMemories}
            />
          )}

          {/* PAGE 6: SYSTEM HEALTH */}
          {activeTab === 'health' && (
            <SystemHealthView
              health={health}
              onRefresh={fetchHealth}
            />
          )}

          {/* PAGE 7: SETTINGS */}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto shrink-0">
          IncidentIQ — AI Incident Response Agent • Built with Next.js, Hindsight Memory Bank (prod-incidents) &amp; Google Gemini API
        </footer>
      </div>

      {/* Post-Mortem Resolution Modal */}
      <PostMortemModal
        incident={selectedIncident}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveAndRetain={handleSaveAndRetain}
        isRetaining={isRetaining}
      />
    </div>
  );
}
