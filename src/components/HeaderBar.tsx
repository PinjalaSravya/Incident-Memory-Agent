'use client';

import { useTheme } from '@/context/ThemeContext';
import { HealthStatus } from '@/types';
import { Cpu, Database, Moon, Sparkles, Sun } from 'lucide-react';

interface HeaderBarProps {
  health: HealthStatus | null;
  activeTitle: string;
  activeSubtitle: string;
}

export function HeaderBar({ health, activeTitle, activeSubtitle }: HeaderBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs transition-colors duration-200">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {activeTitle}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {activeSubtitle}
        </p>
      </div>

      {/* Health Status Badges, Theme Toggle & User Profile */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* ML Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Cpu className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span className="text-slate-500 dark:text-slate-400">ML:</span>
          {health?.ml?.status === 'connected' ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {health.ml.trainedMachinesCount || 28} Models
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Offline</span>
          )}
        </div>

        {/* Gemini Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-slate-500 dark:text-slate-400">Gemini:</span>
          {health?.gemini?.status === 'connected' ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Fallback</span>
          )}
        </div>

        {/* Hindsight Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-500 dark:text-slate-400">Hindsight:</span>
          {health?.hindsight?.status === 'connected' ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Fallback</span>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-blue-400" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Ops Profile Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
            IQ
          </div>
          <span>IncidentIQ Ops</span>
        </div>
      </div>
    </header>
  );
}
