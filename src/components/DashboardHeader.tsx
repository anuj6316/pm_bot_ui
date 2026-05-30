/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bot, Bell, Search, Plus, Sparkles, LogOut, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface DashboardHeaderProps {
  user: User;
  workspaceName: string;
  onLogout: () => void;
  onOpenNewProject: () => void;
  onTriggerAutoScan: () => void;
  isLoadingScan: boolean;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  projectCount: number;
  onViewAgentDashboard?: () => void;
}

export default function DashboardHeader({
  user,
  workspaceName,
  onLogout,
  onOpenNewProject,
  onTriggerAutoScan,
  isLoadingScan,
  activeFilter,
  setActiveFilter,
  projectCount,
  onViewAgentDashboard
}: DashboardHeaderProps) {
  const tabs = ['All Projects', 'On Track', 'At Risk', 'Planning'];

  return (
    <header className="sticky top-0 z-35 bg-white/90 backdrop-blur-md border-b border-slate-200 pl-18 pr-6 md:px-6 py-4 flex flex-col gap-4 font-sans">
      
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left Area: Title branding and workspace context */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.06)]">
            <Bot className="w-6 h-6 rotate-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest font-mono">
                Active Workspace
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {workspaceName}
            </h1>
          </div>
        </div>

        {/* Right Area: Profile widget, Notification bells, and Action triggers */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Toggle to Agent Triage Dashboard */}
          {onViewAgentDashboard && (
            <button
              onClick={onViewAgentDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/60 rounded-full text-xs font-bold uppercase text-indigo-700 tracking-wider transition-all cursor-pointer shadow-[0_2px_10px_rgba(99,102,241,0.06)]"
              title="Switch to Agent Sessions Triage Dashboard"
            >
              <Bot className="w-4 h-4 text-indigo-650 animate-pulse" />
              <span>Agent Dashboard</span>
            </button>
          )}

          {/* Smart risk-scan Trigger */}
          <button
            onClick={onTriggerAutoScan}
            disabled={isLoadingScan}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 hover:border-emerald-350 hover:bg-emerald-100 rounded-full text-xs font-bold uppercase text-emerald-700 tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_2px_10px_rgba(22,197,94,0.06)]"
            title="Evaluate target deadline buffers across active models"
          >
            <Sparkles className={`w-4 h-4 text-emerald-600 ${isLoadingScan ? 'animate-spin' : ''}`} />
            {isLoadingScan ? 'AI Scanning...' : 'Evaluate Risks'}
          </button>

          {/* New Project trigger button */}
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            New Timeline
          </button>

          {/* Notification Alert center */}
          <div className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </div>

          <div className="h-6 w-[1px] bg-slate-200" />

          {/* Profile User block */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full pl-2.5 pr-3 py-1">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold uppercase text-blue-700">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-[10px] font-bold text-slate-800 tracking-tight leading-none">
                {user.email}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Sign Out of active Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Tabs navigation filters */}
      <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-1">
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 text-xs font-semibold tracking-wider transition-all rounded-lg uppercase cursor-pointer ${
                activeFilter === tab
                  ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        
        {/* Dynamic task count badge */}
        <span className="text-[10px] font-mono uppercase bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-slate-500">
          Showing <strong className="text-blue-600 font-bold">{projectCount}</strong> Operations
        </span>
      </div>

    </header>
  );
}
