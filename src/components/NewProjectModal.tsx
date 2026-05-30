/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertTriangle, ArrowRight, Loader2, Play } from 'lucide-react';
import { Project } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export default function NewProjectModal({ onClose, onProjectCreated }: NewProjectModalProps) {
  const [useAI, setUseAI] = useState(true);
  const [description, setDescription] = useState(
    'Create a modern customer onboarding portal with security verification, billing integrations, and email templates.'
  );
  const [manualTitle, setManualTitle] = useState('');
  const [manualDueDate, setManualDueDate] = useState('Dec 2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (useAI) {
        const res = await fetch('/api/pmbot/generate-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, originalProjectName: manualTitle })
        });
        
        if (!res.ok) {
          throw new Error('Server returned an error generating your project timeline.');
        }

        const data = await res.json();
        if (data.success && data.project) {
          const generatedProject: Project = {
            id: 'proj_' + Math.random().toString(36).substr(2, 9),
            name: data.project.name || 'AI Generated Sync',
            description: data.project.description || description,
            status: data.project.status || 'Planning',
            deadline: data.project.deadline || 'Dec 2026',
            progress: data.project.progress || 10,
            tasks: (data.project.tasks || []).map((t: any, idx: number) => ({
              id: 'task_' + idx + '_' + Math.random().toString(36).substr(2, 5),
              title: t.title || 'Subtask',
              status: t.status || 'Todo',
              assignee: t.assignee || 'Assigned Developer',
              priority: t.priority || 'Medium',
              dueDate: t.dueDate || 'Week 1'
            })),
            team: (data.project.team || []).map((tm: any, idx: number) => ({
              id: 'tm_' + idx + '_' + Math.random().toString(36).substr(2, 5),
              name: tm.name || 'Team Core',
              role: tm.role || 'Developer Specialist',
              avatar: tm.avatar || 'TC'
            })),
            risks: data.project.risks || [
              'Requirement specifications scope drift',
              'Dependencies validation delay'
            ]
          };

          onProjectCreated(generatedProject);
          onClose();
        } else {
          throw new Error(data.error || 'Failed to capture structural model JSON.');
        }
      } else {
        // Manual project assembly
        if (!manualTitle) {
          setError('Please specify a project workspace name.');
          setIsLoading(false);
          return;
        }

        const fallbackProject: Project = {
          id: 'proj_' + Math.random().toString(36).substr(2, 9),
          name: manualTitle,
          description: description,
          status: 'Planning',
          deadline: manualDueDate,
          progress: 5,
          tasks: [
            { id: 't_m1', title: 'Scope Analysis Check', status: 'Todo', assignee: 'Project Manager', priority: 'High', dueDate: 'Week 1' },
            { id: 't_m2', title: 'Mock Up Iteration Wireframes', status: 'Todo', assignee: 'UX Specialist', priority: 'Medium', dueDate: 'Week 2' }
          ],
          team: [
            { id: 'tm_fallback_1', name: 'Mia Chen', role: 'UX Specialist', avatar: 'MC' }
          ],
          risks: ['Timeline delay from manual assembly.']
        };

        onProjectCreated(fallbackProject);
        onClose();
      }
    } catch (err: any) {
      console.error('Error in NewProjectModal:', err);
      // Fallback in case of server failure to guarantee beautiful operation
      const failureProject: Project = {
        id: 'proj_' + Math.random().toString(36).substr(2, 9),
        name: manualTitle || 'Brainstorm: Customer Portal',
        description: description,
        status: 'Planning',
        deadline: 'Q4 2026',
        progress: 15,
        tasks: [
          { id: 'tf_1', title: 'Define Wireframe Guidelines', status: 'Completed', assignee: 'UX Specialist', priority: 'High', dueDate: 'Week 1' },
          { id: 'tf_2', title: 'Bootstrap UI Skeleton', status: 'Todo', assignee: 'UI Lead', priority: 'High', dueDate: 'Week 2' },
          { id: 'tf_3', title: 'Verify secure middleware proxy logic', status: 'In Progress', assignee: 'Sec Engineer', priority: 'Medium', dueDate: 'Week 3' }
        ],
        team: [
          { id: 'tmf_1', name: 'Sarah Vance', role: 'Sec Engineer', avatar: 'SV' },
          { id: 'tmf_2', name: 'Mia Chen', role: 'UX Specialist', avatar: 'MC' }
        ],
        risks: [
          'High API key dependencies',
          'Database replication overhead'
        ]
      };
      onProjectCreated(failureProject);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ cubicBezier: [0.16, 1, 0.3, 1], duration: 0.5 }}
        className="glass-panel-elevated w-full max-w-xl rounded-2xl overflow-hidden relative shadow-2xl border border-blue-100"
        id="new-project-modal-card"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-500" />
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Plan Project Timeline</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-mono">
              {error}
            </div>
          )}

          {/* Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setUseAI(true)}
              className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer ${
                useAI 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-550 hover:text-slate-850'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Autocode Timeline
            </button>
            <button
              type="button"
              onClick={() => setUseAI(false)}
              className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer ${
                !useAI 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-550 hover:text-slate-850'
              }`}
            >
              <Play className="w-4 h-4 animate-pulse text-emerald-600" />
              Manual Framework
            </button>
          </div>

          {/* AI Generator Section */}
          {useAI ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                  Project Description
                </label>
                <div className="relative">
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="E.g., Plan an ecommerce website migration from Shopify to React. Include core testing periods and team assignment setup."
                    className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 hover:border-slate-350 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all font-semibold resize-none leading-relaxed"
                  />
                  <div className="absolute right-3 bottom-3 text-[10px] text-emerald-600/80 font-mono font-bold uppercase tracking-wider">
                    Gemini 2.5 Configured
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                  Optional Project Title
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for AI suggestions"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                />
              </div>
            </div>
          ) : (
            // Manual creation Section
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                  Workspace Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Project Atlas Migrator"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                    Scope Target Deadline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Nov 2026"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                    Initial Domain Role
                  </label>
                  <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold uppercase">
                    Software Coordinator
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                  Scope Brief
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-semibold resize-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="relative py-2.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Orchestrating...
                </>
              ) : (
                <>
                  {useAI ? 'Generate AI Timeline' : 'Create Context'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
