/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Layers, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Sparkles, 
  FolderKanban, 
  Terminal, 
  User as UserIcon, 
  Activity, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  workspaceName: string;
  activeMainView: 'dashboard' | 'projects' | 'onboarding';
  onSelectView: (view: 'dashboard' | 'projects' | 'onboarding') => void;
  onLogout: () => void;
  projectCount: number;
  onOpenNewProject?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  user,
  workspaceName,
  activeMainView,
  onSelectView,
  onLogout,
  projectCount,
  onOpenNewProject,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  let displayName = 'Active Member';
  let roleName = 'Glacier Engineer';

  if (user && user.email) {
    const prefix = user.email.split('@')[0];
    if (prefix.toLowerCase().startsWith('anuj')) {
      displayName = 'Anuj Kumar';
      roleName = 'Glacier Director';
    } else if (prefix.toLowerCase() === 'admin') {
      displayName = 'Administrator';
      roleName = 'System Architect';
    } else {
      displayName = prefix.split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      roleName = 'Lead PM Architect';
    }
  }

  const navigationItems = [
    {
      id: 'dashboard' as const,
      label: 'Triage Dashboard',
      subtitle: 'Celery & PM Agent Feed',
      icon: Layers,
      badge: (
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-400 border border-sky-400/15">
          Active
        </span>
      )
    },
    {
      id: 'projects' as const,
      label: 'Workspace Timelines',
      subtitle: 'Interactive Gantt & Projects',
      icon: FolderKanban,
      badge: (
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/10">
          {projectCount}
        </span>
      )
    },
    {
      id: 'onboarding' as const,
      label: 'Bot Onboarding',
      subtitle: 'Wizard Provisioning Portal',
      icon: Sparkles,
      badge: (
        <span className="text-[9px] font-mono leading-none bg-sky-500/20 px-1.5 py-1 rounded font-bold text-sky-200 uppercase tracking-wide border border-sky-400/10">
          New
        </span>
      )
    }
  ];

  const sidebarContent = (isMobile = false) => {
    // Determine active collapse state
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 font-sans border-r border-slate-800/80 shadow-[4px_0_24px_rgba(0,0,0,0.12)] relative">
        
        {/* Branding and Title */}
        <div className={`p-6 border-b border-slate-800/60 shrink-0 ${collapsed ? 'flex justify-center px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-sky-500 rounded-2xl text-white shadow-lg shadow-sky-400/30 relative shrink-0">
              <Layers className="w-5.5 h-5.5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#38bdf8] block font-mono animate-pulse">
                  Glacier PM Engine
                </span>
                <h2 className="text-sm font-extrabold text-white tracking-tight mt-0.5 truncate">
                  {workspaceName}
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} py-6 space-y-7 overflow-y-auto`}>
          <div className="space-y-1.5">
            {!collapsed && (
              <span className="px-3 text-[9px] font-bold font-mono tracking-widest text-slate-505 uppercase block mb-3">
                Principal Navigation
              </span>
            )}

            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMainView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    if (isMobile) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center transition-all text-left outline-none cursor-pointer group relative rounded-xl ${
                    collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                  } ${
                    isActive 
                      ? 'bg-sky-500/10 text-sky-400 font-bold shadow-[0_2px_8px_rgba(56,189,248,0.03)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-sky-400 rounded-r-md" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent className={`w-4.5 h-4.5 shrink-0 transition-transform ${
                      isActive ? 'scale-105 text-sky-400' : 'group-hover:scale-105 text-slate-500'
                    }`} />
                    {!collapsed && (
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold leading-tight">{item.label}</span>
                        <span className={`block text-[9.5px] truncate ${isActive ? 'text-sky-305/80' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                  {!collapsed && item.badge}
                </button>
              );
            })}
          </div>

          {/* Quick Operations panel in Sidebar */}
          {onOpenNewProject && (
            <div className="pt-2">
              {collapsed ? (
                <button
                  onClick={onOpenNewProject}
                  className="w-10 h-10 mx-auto bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white rounded-xl border border-sky-400/20 hover:border-sky-400 flex items-center justify-center transition-all cursor-pointer"
                  title="Create New Timeline Workspace"
                >
                  <Plus className="w-5 h-5" />
                </button>
              ) : (
                <div className="bg-slate-900/35 rounded-2xl p-4 border border-slate-800/65">
                  <span className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase block mb-3">
                    QUICK ACTIONS
                  </span>
                  <button
                    onClick={() => {
                      onOpenNewProject();
                      if (isMobile) setIsMobileOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-transparent hover:bg-slate-800/50 text-slate-200 hover:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-slate-700/60 hover:border-sky-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Timeline</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Session Profile details footer */}
        <div className={`p-4 border-t border-slate-800/50 bg-[#060a14] shrink-0 ${collapsed ? 'flex flex-col items-center gap-3.5' : ''}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-3.5">
              <div 
                className="w-9 h-9 rounded-full bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-xs font-bold uppercase text-sky-400 shadow-inner shrink-0 font-mono"
                title={`${displayName} - ${roleName}`}
              >
                {displayName.substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="p-2.5 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-red-500/20"
                title="Disconnect Workspace Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5 bg-[#0e1628]/80 border border-slate-800/40 rounded-2xl p-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-xs font-bold uppercase text-sky-400 shadow-inner shrink-0 font-mono">
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-[11px] font-bold text-slate-200 truncate leading-tight">
                    {displayName}
                  </span>
                  <span className="block text-[9px] text-sky-400 font-semibold truncate mt-0.5 leading-none">
                    {roleName}
                  </span>
                  <span className="block text-[8px] text-slate-500 truncate mt-1 leading-none font-mono">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-red-500/20"
                title="Disconnect Workspace Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Toggle handle button for desktop width manipulation */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#0a0f1d] border border-slate-700/80 hover:bg-slate-800 hover:border-sky-400 text-slate-350 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg z-50"
            title={isCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}

      </div>
    );
  };

  return (
    <>
      {/* DESKTOP VIEWPORT SIDEBAR CONTAINER */}
      <aside 
        className={`hidden md:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* MOBILE DESKTOP FLOATING TOGGLE MENU */}
      <div className="md:hidden fixed top-4 left-4 z-45">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-[#0a0f1d] border border-slate-800 text-white rounded-2xl shadow-xl hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* MOBILE TRANSPARENT COLLAPSIBLE OVERLAY DRAWERS */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-45 md:hidden"
            />

            {/* Sidebar drawer body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 z-45 md:hidden shadow-2xl"
            >
              {/* Close Button floating helper */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {sidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
