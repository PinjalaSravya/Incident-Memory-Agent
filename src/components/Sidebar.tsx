'use client';

import { useState } from 'react';
import {
  Activity,
  Archive,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Layers,
  LayoutDashboard,
  ListFilter,
  PlusCircle,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  memoryCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ activeTab, onTabChange, memoryCount }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: 'WORKSPACE',
      items: [
        { id: 'command_center', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'new_incident', label: 'New Incident', icon: PlusCircle },
        { id: 'scenarios', label: 'Active Incidents', icon: ListFilter },
        { id: 'history', label: 'Incident History', icon: Archive },
      ],
    },
    {
      label: 'KNOWLEDGE',
      items: [
        { id: 'hindsight_bank', label: 'Team Incident Memory', icon: Database, badge: `${memoryCount}` },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'health', label: 'System Health', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`h-full flex-none border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-300 z-30 shadow-xs relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Logo Header */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">IncidentIQ</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">AI Incident Command</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1">
                  {group.label}
                </span>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border-l-4 border-blue-600 dark:border-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Collapse Arrow Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer z-40"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Footer User Profile */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              IQ
            </div>
            <div className="flex flex-col truncate text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">DevOps Engineer</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">IncidentIQ Ops</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

