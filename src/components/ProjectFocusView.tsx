/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Plus, 
  Send, 
  Trash2, 
  Check, 
  Sparkles, 
  Clock, 
  Layers,
  Bot,
  UserCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { Project, Task, TaskStatus, TaskPriority } from '../types';

interface ProjectFocusViewProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updatedProject: Project) => void;
}

export default function ProjectFocusView({ project, onBack, onUpdateProject }: ProjectFocusViewProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'risks' | 'team'>('tasks');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: `Hi, I am PM Bot. I've analyzed **${project.name}**. Type an advice request below to streamline your sprint timelines!` }
  ]);
  const [isSending, setIsSending] = useState(false);
  
  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Core Dev');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDueDate, setNewDueDate] = useState('Week 2');
  const [showAddTask, setShowAddTask] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Recalculates and updates project progress on change
  const refreshProjectProgress = (updatedTasks: Task[]) => {
    if (updatedTasks.length === 0) return 0;
    const completed = updatedTasks.filter(t => t.status === 'Completed').length;
    return Math.round((completed / updatedTasks.length) * 100);
  };

  // Toggles completeness state and re-saves
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus: TaskStatus = t.status === 'Completed' ? 'Todo' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });

    const newProgress = refreshProjectProgress(updatedTasks);
    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      progress: newProgress
    });
  };

  // Deletes task from list
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    const newProgress = refreshProjectProgress(updatedTasks);
    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      progress: newProgress
    });
  };

  // Adds a custom task manually
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const added: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 6),
      title: newTitle,
      status: 'Todo',
      assignee: newAssignee,
      priority: newPriority,
      dueDate: newDueDate
    };

    const nextTasks = [...project.tasks, added];
    onUpdateProject({
      ...project,
      tasks: nextTasks,
      progress: refreshProjectProgress(nextTasks)
    });

    setNewTitle('');
    setShowAddTask(false);
  };

  // Handles chat with the AI PM Bot
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const res = await fetch('/api/pmbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          projectContext: project
        })
      });

      if (!res.ok) throw new Error('PM Bot API response failed.');
      const data = await res.json();
      
      if (data.success && data.reply) {
        setChatHistory(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        throw new Error('Incomplete data response.');
      }
    } catch (err) {
      console.error(err);
      // Beautiful smart sandbox advice if key fails
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: `***[SIMULATED ADVICE]***\n\nTo optimize allocation on **${project.name}**, distribute task weightings more evenly. Consider reassigning dependencies with **High priority** to available members to prevent delivery blocks.` 
          }
        ]);
      }, 605);
    } finally {
      setIsSending(false);
    }
  };

  // Priority color definitions
  const priorityColors = {
    High: 'bg-rose-50 border-rose-200 text-rose-700 font-semibold',
    Medium: 'bg-amber-50 border-amber-200 text-amber-700 font-semibold',
    Low: 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
  };

  const statusColors = {
    'On Track': 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'At Risk': 'border-red-200 bg-red-50 text-red-700',
    'Planning': 'border-blue-200 bg-blue-50 text-blue-700'
  };

  return (
    <div className="font-sans px-4 py-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb Navigation row */}
      <div className="flex justify-between items-center bg-blue-50/30 p-3 rounded-xl border border-slate-200/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1e40af] hover:text-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Operation ID: {project.id}
        </span>
      </div>

      {/* Main Grid: Left core detail panel / Right Conversation panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Project specifics, subtask lists, and schedules */}
        <section className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-200">
            {/* Background lighting flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Title & metadata bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className={`inline-block border rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest ${statusColors[project.status]}`}>
                  {project.status}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">{project.name}</h2>
                <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed font-semibold">{project.description}</p>
              </div>

              {/* Progress Dial Widget */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 min-w-[100px] shadow-sm">
                <strong className="text-2xl font-extrabold text-blue-600 tracking-tight font-mono">
                  {project.progress}%
                </strong>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1">Completeness</span>
              </div>
            </div>

            {/* Integrated micro progress line */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-6 border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
              />
            </div>

            {/* Target Deadline Tag */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-mono bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Target Scope Delivery: <strong className="text-slate-900 font-bold">{project.deadline}</strong></span>
            </div>
          </div>

          {/* Quick tab filters inside focus */}
          <div className="flex items-center gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'tasks' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Task Checklist ({project.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'risks' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              AI Risks ({project.risks.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'team' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Assigned Team ({project.team.length})
            </button>
          </div>

          <div className="min-h-[250px]">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                
                {/* Collapsible New Task Launcher */}
                <div>
                  <button
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddTask ? 'Collapse' : 'Append Task Item'}
                  </button>

                  <AnimatePresence>
                    {showAddTask && (
                      <motion.form
                        onSubmit={handleAddTaskSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5">Action Title</label>
                            <input
                              type="text"
                              required
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="E.g., Dockerize staging servers"
                              className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5">Assign To</label>
                            <input
                              type="text"
                              value={newAssignee}
                              onChange={(e) => setNewAssignee(e.target.value)}
                              placeholder="E.g., QA Specialist"
                              className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5">Priority</label>
                            <select
                              value={newPriority}
                              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                              className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5">Expected Due</label>
                            <input
                              type="text"
                              value={newDueDate}
                              onChange={(e) => setNewDueDate(e.target.value)}
                              placeholder="E.g. Week 4"
                              className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="submit"
                              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shadow-sm"
                            >
                              Add Workspace Task
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtask mapping list */}
                {project.tasks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center font-semibold">No task checkpoints configured.</p>
                ) : (
                  <div className="space-y-2.5">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          task.status === 'Completed'
                            ? 'bg-slate-100/55 border-slate-200 opacity-60'
                            : 'bg-white border-blue-100/60 hover:border-blue-300 shadow-xs'
                        }`}
                      >
                        {/* Title checkpoint toggle */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            {task.status === 'Completed' ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-350" />
                            )}
                          </button>
                          <div>
                            <span className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-550 font-semibold">Assigned: <strong className="text-slate-800 font-bold">{task.assignee}</strong></span>
                              <span className="text-[10px] text-slate-300 font-mono">•</span>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">Due: {task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right tags and delete option */}
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-wider ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove checkpoint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Risk mapping */}
            {activeTab === 'risks' && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Predictive Analysis Active</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-semibold">
                      Risks are generated automatically by PM Bot upon analyzing task completion delays and priority stacks. Click on any risk, then ask the PM Bot Assistant on the right for recovery frameworks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {project.risks.map((risk, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-white border border-red-100 hover:border-red-200 rounded-xl flex items-center gap-3 shadow-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        R{index + 1}
                      </span>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team listing */}
            {activeTab === 'team' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.team.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3.5 shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs uppercase tracking-wider">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight">{member.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column (5 cols): AI assistant chat interaction and prompt responses */}
        <section className="lg:col-span-5 h-[530px] flex flex-col justify-between glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200">
          
          {/* Conversational Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-blue-50/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">PM Bot Intelligence</h3>
                <span className="block text-[9px] text-[#16a34a] font-bold uppercase tracking-wider mt-0.5">● COGNITIVE ON SPRINT</span>
              </div>
            </div>
          </div>

          {/* Interactive scrolling answers feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {chatHistory.map((m, index) => (
              <div
                key={index}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed font-sans ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 font-medium'
                  }`}
                >
                  {/* Simplistic Markdown Support replacement */}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3 text-xs flex items-center gap-2 text-slate-500 font-semibold">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry block */}
          <form onSubmit={handleChatSend} className="p-4 border-t border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask advice: E.g., How can I mitigate R1?"
                className="w-full block pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 hover:border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800 rounded-xl placeholder-slate-400 font-semibold"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim() || isSending}
                className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-lg transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </section>

      </div>

    </div>
  );
}
