/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Clock, 
  User as UserIcon, 
  Wifi, 
  ChevronDown, 
  Cpu, 
  CheckCircle,
  FolderKanban,
  FileText,
  Activity,
  LogOut,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';

interface GlobalTopBarProps {
  user: User;
  workspaceName: string;
  activeMainView: 'dashboard' | 'projects' | 'onboarding';
  onSelectView: (view: 'dashboard' | 'projects' | 'onboarding') => void;
  onLogout: () => void;
  projectCount: number;
  onOpenNewProject: () => void;
  onTriggerAutoScan: () => void;
  isLoadingScan: boolean;
  onRefreshDiagnostics?: () => void;
  isRefreshingDiagnostics?: boolean;
  onInspectSpec?: () => void;
}

export default function GlobalTopBar({
  user,
  workspaceName,
  activeMainView,
  onSelectView,
  onLogout,
  projectCount,
  onOpenNewProject,
  onTriggerAutoScan,
  isLoadingScan,
  onRefreshDiagnostics,
  isRefreshingDiagnostics = false,
  onInspectSpec
}: GlobalTopBarProps) {
  const [timeStr, setTimeStr] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      // Format: Sat May 30 08:20:24 UTC
      const parts = d.toUTCString().split(' ');
      const formatted = `${parts[0]} ${parts[2]} ${parts[1]} ${parts[4]} UTC`;
      setTimeStr(formatted);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const currentAppTitle = {
    dashboard: 'Triage Dashboard',
    projects: 'Workspace Timelines',
    onboarding: 'Bot Onboarding'
  }[activeMainView];

  return (
    <div 
      ref={menuRef}
      className="sticky top-0 z-45 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/60 text-slate-200 h-10 px-4 flex items-center justify-between text-[11.5px] font-sans select-none tracking-wide"
    >
      {/* Left: Apple/Logo Symbol & Context Menus */}
      <div className="flex items-center gap-1.5 md:gap-3.5">
        
        {/* App Logo Indicator */}
        <div 
          onClick={() => onSelectView('dashboard')}
          className="p-1 bg-gradient-to-tr from-sky-400 to-sky-500 rounded-lg text-white shadow-sm shadow-sky-400/20 cursor-pointer hover:opacity-90 flex items-center justify-center mr-1"
        >
          <Layers className="w-3.5 h-3.5 animate-pulse" />
        </div>

        {/* Dynamic App Brand Swapper */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('app')}
            className="flex items-center gap-1 hover:bg-slate-800/60 px-2 py-1 rounded font-extrabold text-white transition-colors cursor-pointer"
          >
            <span>{currentAppTitle}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {activeMenu === 'app' && (
            <div className="absolute left-0 top-7 w-52 bg-[#0e1628] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-1">
              <span className="block px-2.5 py-1 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Switch Workspaces
              </span>
              <button
                onClick={() => { onSelectView('dashboard'); setActiveMenu(null); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  activeMainView === 'dashboard' 
                    ? 'bg-sky-500/10 text-sky-400 font-bold' 
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <span>Triage Dashboard</span>
                <Sliders className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button
                onClick={() => { onSelectView('projects'); setActiveMenu(null); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  activeMainView === 'projects' 
                    ? 'bg-sky-500/10 text-sky-400 font-bold' 
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <span>Workspace Timelines</span>
                <span className="text-[9.5px] font-mono bg-sky-500/15 border border-sky-400/10 text-sky-300 px-1 py-0.2 rounded-full font-bold">
                  {projectCount}
                </span>
              </button>
              <button
                onClick={() => { onSelectView('onboarding'); setActiveMenu(null); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  activeMainView === 'onboarding' 
                    ? 'bg-sky-500/10 text-sky-400 font-bold' 
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <span>Bot Onboarding</span>
                <Sparkles className="w-3.5 h-3.5 opacity-60 text-sky-400" />
              </button>
            </div>
          )}
        </div>

        {/* macOS Style Secondary Dropdown Menus */}
        <div className="hidden sm:flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('file')}
              className="px-2 py-1 hover:bg-slate-800/50 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-7 w-48 bg-[#0e1628] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-[#cbd5e1] text-left space-y-1">
                <button 
                  onClick={() => { onOpenNewProject(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>New Workflow Timeline</span>
                </button>
                <button 
                  onClick={() => { onTriggerAutoScan(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Evaluate Risk Scan</span>
                </button>
                <div className="h-[1px] bg-slate-800/60 my-1" />
                <button 
                  onClick={() => { onLogout(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-500/10 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-2 border border-transparent hover:border-red-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>

          {/* Diagnostics Menu */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('diagnostics')}
              className="px-2 py-1 hover:bg-slate-800/50 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Diagnostics
            </button>
            {activeMenu === 'diagnostics' && (
              <div className="absolute left-0 top-7 w-52 bg-[#0e1628] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-[#cbd5e1] text-left space-y-1">
                <button 
                  onClick={() => { 
                    if (onRefreshDiagnostics) onRefreshDiagnostics(); 
                    setActiveMenu(null); 
                  }}
                  disabled={isRefreshingDiagnostics}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshingDiagnostics ? 'animate-spin' : ''}`} />
                    <span>Refresh Worker Feeds</span>
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-500">Cmd R</span>
                </button>
                <button 
                  onClick={() => { if (onInspectSpec) onInspectSpec(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>Inspect Engine Spec</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Menus */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('actions')}
              className="px-2 py-1 hover:bg-slate-800/50 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Actions
            </button>
            {activeMenu === 'actions' && (
              <div className="absolute left-0 top-7 w-48 bg-[#0e1628] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-[#cbd5e1] text-left space-y-1">
                <button 
                  onClick={() => { onOpenNewProject(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add Timeline Workspace</span>
                </button>
                <button 
                  onClick={() => { onTriggerAutoScan(); setActiveMenu(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Global Security Audit</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right: Telemetry Widget, Time Clock, & User details */}
      <div className="flex items-center gap-3.5">
        
        {/* Latency Wifi Badge */}
        <div className="items-center gap-1.5 hidden md:flex font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-800/60 rounded-full px-2.5 py-0.5">
          <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>12ms Latency (RTT)</span>
        </div>

        {/* Real-time Dynamic Clock */}
        <div className="font-mono text-[10px] font-semibold text-slate-300 hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800/60 rounded-full px-2.5 py-0.5">
          <Clock className="w-3 w-3 text-sky-400" />
          <span>{timeStr}</span>
        </div>

        {/* User context capsule widget */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('profile')}
            className="flex items-center gap-1.5 bg-[#0e1628] hover:bg-sky-950/20 px-2 py-0.5 rounded-full border border-slate-800 text-slate-300 cursor-pointer transition-colors max-w-40 sm:max-w-none"
          >
            <div className="w-4.5 h-4.5 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center font-mono text-[8px] font-bold uppercase border border-sky-400/20">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-semibold max-w-24 truncate">{user.email.split('@')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          
          {activeMenu === 'profile' && (
            <div className="absolute right-0 top-7 w-52 bg-[#0e1628] border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 text-left space-y-2">
              <div className="px-1 text-[10px] text-slate-400 space-y-0.5 font-mono">
                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Active User Session</span>
                <span className="block text-slate-200 font-bold truncate leading-tight">{user.email}</span>
                <span className="block text-[8.5px] text-sky-400 font-semibold uppercase font-sans mt-1">Glacier Workspace Host</span>
              </div>
              <div className="h-[1px] bg-slate-800/60" />
              <button
                onClick={() => { onLogout(); setActiveMenu(null); }}
                className="w-full text-left px-2.5 py-1.5 bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-transparent hover:border-red-550/20 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Session</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
