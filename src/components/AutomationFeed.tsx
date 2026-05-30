/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Clock, AlertTriangle, Layers, Cpu, Check } from 'lucide-react';
import { Automation } from '../types';

interface AutomationFeedProps {
  automations: Automation[];
  onTriggerSingleAutomation: (type: 'report' | 'allocation') => void;
  isTriggering: boolean;
}

export default function AutomationFeed({
  automations,
  onTriggerSingleAutomation,
  isTriggering
}: AutomationFeedProps) {
  
  const iconMap = {
    assignment: <Layers className="w-4 h-4 text-blue-600" />,
    report: <Cpu className="w-4 h-4 text-emerald-600" />,
    alert: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    system: <Check className="w-4 h-4 text-emerald-600" />
  };

  const borderColors = {
    assignment: 'border-blue-100 hover:border-blue-200 bg-blue-50/30',
    report: 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/20',
    alert: 'border-amber-100 hover:border-amber-200 bg-amber-50/20',
    system: 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/25'
  };

  return (
    <aside className="glass-panel rounded-2xl p-5 md:p-6 space-y-5 font-sans h-fit border border-slate-200/80">
      
      {/* Label and button block */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automations Feed</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Real-Time</span>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
        PM Bot monitors active sprint timelines continuously. Trigger operations on demand below to align developer allocations.
      </p>

      {/* Manual Action Triggers */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onTriggerSingleAutomation('report')}
          disabled={isTriggering}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase transition-all tracking-wider disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          A.I. Status Report
        </button>
        <button
          onClick={() => onTriggerSingleAutomation('allocation')}
          disabled={isTriggering}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-700 text-[10px] font-bold uppercase transition-all tracking-wider disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 animate-pulse" />
          A.I. Auto-assign
        </button>
      </div>

      {/* Live logging stream with exit/entered configurations */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {automations.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ duration: 0.35 }}
              className={`p-3 border rounded-xl flex items-start gap-3 transition-colors ${borderColors[item.type]}`}
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-100 flex-shrink-0 mt-0.5 shadow-sm">
                {iconMap[item.type]}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-[11px] font-bold text-slate-800 truncate leading-tight">{item.title}</h4>
                  <span className="text-[8px] font-mono font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.time}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-semibold">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </aside>
  );
}
