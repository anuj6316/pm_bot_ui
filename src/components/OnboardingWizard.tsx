/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Key, 
  Layers, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Server, 
  Sparkles, 
  Info, 
  FolderCheck,
  Cpu,
  Bot,
  Terminal,
  Activity,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { User } from '../types';

interface ProjectOption {
  uuid: string;
  name: string;
}

interface UserOnboardingProps {
  currentUser: User | null;
  onBackToDashboard: () => void;
}

export default function OnboardingWizard({ currentUser, onBackToDashboard }: UserOnboardingProps) {
  // Current active step: 1 (Account details), 2 (Project access), 3 (LLM Key), 4 (Review)
  const [step, setStep] = useState(1);
  const [simulatedCreatorRole, setSimulatedCreatorRole] = useState<'admin' | 'consultant'>('admin');

  // Input states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'developer' | 'consultant'>('developer');
  
  // Project Options
  const [availableProjects, setAvailableProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectUuids, setSelectedProjectUuids] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState('');

  // LLM API code
  const [llmProvider, setLlmProvider] = useState<'openai' | 'google' | 'anthropic' | 'groq'>('google');
  const [llmKey, setLlmKey] = useState('');

  // Submission details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);

  // In-memory listed active bot users updated dynamically
  const [createdBotUsers, setCreatedBotUsers] = useState<any[]>([]);
  const [loadingBots, setLoadingBots] = useState(false);

  // Fetch projects list from '/user/projects/'
  const fetchProjects = async () => {
    setLoadingProjects(true);
    setProjectError('');
    try {
      const res = await fetch('/user/projects');
      if (!res.ok) {
        throw new Error(`Failed to load plane projects: status ${res.status}`);
      }
      const data = await res.json();
      setAvailableProjects(data || []);
    } catch (err: any) {
      setProjectError(err.message || 'Error occurred connecting to project service.');
      // Preload static fallbacks in case of network issue
      setAvailableProjects([
        { uuid: "plane-uuid-101a-83d4", name: "Starlight Core Platform" },
        { uuid: "plane-uuid-202b-92e1", name: "Hyperion Database Pipeline" },
        { uuid: "plane-uuid-303c-74f5", name: "Apollo Billing Gateway" },
        { uuid: "plane-uuid-404d-61c0", name: "Pegasus Web Dashboard" },
        { uuid: "plane-uuid-505e-50a9", name: "Polaris Telemetry Engine" }
      ]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch created bot list from '/user/list' for logs
  const fetchCreatedBots = async () => {
    setLoadingBots(true);
    try {
      const res = await fetch('/user/list');
      if (res.ok) {
        const data = await res.json();
        setCreatedBotUsers(data || []);
      }
    } catch (err) {
      console.warn('Could not fetch bot list', err);
    } finally {
      setLoadingBots(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCreatedBots();
  }, []);

  // Sync role selector defaults: when creator changes role, if admin is chosen but creator is consultant, auto-reset to developer 
  useEffect(() => {
    if (simulatedCreatorRole === 'consultant' && selectedRole === 'admin') {
      setSelectedRole('developer');
    }
  }, [simulatedCreatorRole]);

  // Handle Project Multi-Select Toggles
  const handleToggleProject = (uuid: string) => {
    setSelectedProjectUuids(prev => 
      prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
    );
  };

  // Check validation for each step before progressing
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!email.trim() || !email.includes('@')) {
        return 'Please input a valid corporate email.';
      }
      if (!username.trim() || username.length < 3) {
        return 'Username must be at least 3 characters.';
      }
      if (!password.trim() || password.length < 6) {
        return 'Password must be at least 6 characters.';
      }
      if (simulatedCreatorRole === 'consultant' && selectedRole === 'admin') {
        return 'Security Violation: Consultants are not authorized to create Admin accounts.';
      }
    }
    if (currentStep === 2 && selectedRole === 'developer') {
      if (selectedProjectUuids.length === 0) {
        return 'Please assign at least one active project to the Developer bot.';
      }
    }
    return '';
  };

  const handleNextStep = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      setSubmitError(errorMsg);
      // Fade out error automatically
      setTimeout(() => setSubmitError(''), 4500);
      return;
    }
    setSubmitError('');
    
    // Developer skips to Step 3, Admin / Consultant can go to Step 3 but step 2 is skipped for them, 
    // because project select is ONLY shown for Developer role. Let's make it intuitive:
    if (step === 1 && selectedRole !== 'developer') {
      setStep(3); // Skip project selection step since it does not apply
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setSubmitError('');
    if (step === 3 && selectedRole !== 'developer') {
      setStep(1); // Go back to step 1
    } else {
      setStep(prev => prev - 1);
    }
  };

  // Submit flow triggering real API call
  const handleCreateBotUser = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    setSubmitSuccess(null);

    const payload = {
      email,
      username,
      password,
      role: selectedRole,
      projectAccess: selectedRole === 'developer' ? selectedProjectUuids : [],
      llmKey: llmKey.trim() || undefined,
      creatorRole: simulatedCreatorRole // Pass along for backend restriction checks
    };

    try {
      const response = await fetch('/user/create-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Creator-Role': simulatedCreatorRole
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected bot account details.');
      }

      setSubmitSuccess(data);
      setStep(5); // Complete screen
      fetchCreatedBots(); // reload list
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during user provisioning.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start fresh wizard
  const resetWizardState = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setSelectedRole('developer');
    setSelectedProjectUuids([]);
    setLlmKey('');
    setStep(1);
    setSubmitSuccess(null);
    setSubmitError('');
  };

  // Pre-fill mock credentials for demonstration testing speed
  const handleQuickPrefill = (roleToSet: 'admin' | 'developer' | 'consultant') => {
    const randId = Math.floor(100 + Math.random() * 900);
    setEmail(`bot_${roleToSet}_${randId}@starlight.ai`);
    setUsername(`Bot_${roleToSet}_${randId}`);
    setPassword(`secretBotPwd${randId}`);
    setSelectedRole(roleToSet);
    if (roleToSet === 'developer' && availableProjects.length > 0) {
      setSelectedProjectUuids([availableProjects[0].uuid]);
    } else {
      setSelectedProjectUuids([]);
    }
    setLlmKey(`sk_google_${randId}xTestKey`);
  };

  // Dynamic preview helper of active permissions based on role
  const getRolePermissionsPreview = (role: string) => {
    switch(role) {
      case 'admin':
        return [
          { name: 'Full Automation Engine Command', desc: 'Can execute workspace scans, rebuild timetables, force retry enqueued tasks, and manage credentials.' },
          { name: 'Global Workspace Control', desc: 'Authorized to provision user profiles and modify core system priorities.' },
          { name: 'Direct System Logs Audit', desc: 'Unrestricted access to the primary real-time Celery diagnostic feed.' }
        ];
      case 'developer':
        return [
          { name: 'Targeted Project Timelines Access', desc: `Authorized to read/write timeline progress for assigned directories only.` },
          { name: 'Bot Execution Triggers', desc: 'Can manually launch individual workspace audits within assigned files.' }
        ];
      case 'consultant':
        return [
          { name: 'Workspace Read-Only Portals', desc: 'Read-only metrics analysis of the timeline charts, reports and active bot states.' },
          { name: 'Consultation Reviews Export', desc: 'Can export planning blueprints and view AI chatbot advice.' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-18 md:pt-6 pb-12 font-sans bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-8 w-full space-y-6">
        
        {/* Page Top Breadcrumb and Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
              <span className="hover:text-blue-600 cursor-pointer" onClick={onBackToDashboard}>Workspace</span>
              <span>/</span>
              <span className="text-blue-600">Bot Provisioning Suite</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-blue-600" />
              Bot User Onboarding
            </h1>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Provision autonomous agent instances with precise technical permissions, custom LLM key encryptions, and Plane workspace access.
            </p>
          </div>

          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Workspace</span>
          </button>
        </div>

        {/* SIMULATOR BAR: Essential for evaluating security restrictions instantly */}
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center relative overflow-hidden">
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Evaluation Controller (Step 1-4 Sandbox)
            </span>
            <p className="text-xs text-slate-350 font-medium">
              Toggle the acting user's workspace tier below to check live role authorization logic. 
            </p>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 relative z-10 shrink-0 self-stretch md:self-auto justify-center">
            <button
              onClick={() => {
                setSimulatedCreatorRole('admin');
                resetWizardState();
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                simulatedCreatorRole === 'admin' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${simulatedCreatorRole === 'admin' ? 'opacity-100' : 'opacity-0'}`} />
              Acting Admin
            </button>
            <button
              onClick={() => {
                setSimulatedCreatorRole('consultant');
                resetWizardState();
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                simulatedCreatorRole === 'consultant' 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${simulatedCreatorRole === 'consultant' ? 'opacity-100' : 'opacity-0'}`} />
              Acting Consultant
            </button>
          </div>
        </div>

        {/* Wizard Main Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Step-by-Step wizard container (8 columns) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 relative">
            
            {/* Steps Head Indicator Line */}
            {step <= 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="text-blue-600">Progress Tracker</span>
                  <span className="text-slate-500 font-mono">Step {step} of 4</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => {
                    // Decide if step is active or completed
                    let stateColor = 'bg-slate-100 border-slate-200';
                    if (step === i) {
                      stateColor = 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20';
                    } else if (step > i) {
                      stateColor = 'bg-emerald-500 border-emerald-500';
                    } else if (i === 2 && selectedRole !== 'developer') {
                      stateColor = 'bg-slate-100 border-slate-200 opacity-40'; // project choice is disabled for non-developers
                    }

                    return (
                      <div 
                        key={i} 
                        className={`h-2 flex-grow rounded-full border transition-all duration-300 ${stateColor}`} 
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-4 gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  <span className={step >= 1 ? 'text-blue-600 font-black' : ''}>Account</span>
                  <span className={`${selectedRole !== 'developer' ? 'opacity-40 line-through' : ''} ${step >= 2 ? 'text-blue-600 font-black' : ''}`}>Projects</span>
                  <span className={step >= 3 ? 'text-blue-600 font-black' : ''}>LLM Crypt</span>
                  <span className={step >= 4 ? 'text-blue-600 font-black' : ''}>Confirm</span>
                </div>
              </div>
            )}

            {/* ERROR DISPLAY BOX */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-800 text-xs font-semibold leading-relaxed"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="block uppercase font-bold tracking-wider font-mono text-[10px]">Authorization check failed</span>
                    <p>{submitError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN ROUTER SWITCH FOR THE WIZARD STEPS */}
            <div className="min-h-80 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Account credentials & tier */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Step 1 — Account & Role Credentials
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Specify unique system tags and login passwords. Configure secure authorization roles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      
                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono leading-none">
                          System Email Address
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input
                            type="email"
                            placeholder="botname@glacier.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50/85 border border-slate-200 px-10 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Username input */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono leading-none">
                          System Name / ID tag
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <UserIcon className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="BotCoordinatorAlpha"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-50/85 border border-slate-200 px-10 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Password password */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono leading-none">
                          Bot Storage Security Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Configure a strong internal access key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50/85 border border-slate-200 px-10 pr-12 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Role Selector with Security Constraint Verification */}
                    <div className="space-y-3.5 pt-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono leading-none">
                        Assign Authorization Tier
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* 1. Developer Role */}
                        <div
                          onClick={() => setSelectedRole('developer')}
                          className={`border-2 p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-36 ${
                            selectedRole === 'developer'
                              ? 'border-blue-500 bg-blue-50/40 shadow-sm shadow-blue-500/5'
                              : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/20'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="p-1 px-2.5 rounded-lg bg-blue-105 text-blue-700 text-[10px] font-bold uppercase tracking-wider font-mono">
                              Developer
                            </div>
                            <Check className={`w-4 h-4 text-blue-600 ${selectedRole === 'developer' ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight font-medium mt-4">
                            Assigned explicit Plane projects path locks. Recommended for modular automation triggers.
                          </p>
                        </div>

                        {/* 2. Consultant Role */}
                        <div
                          onClick={() => setSelectedRole('consultant')}
                          className={`border-2 p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-36 ${
                            selectedRole === 'consultant'
                              ? 'border-purple-500 bg-purple-50/45 shadow-sm'
                              : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/20'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="p-1 px-2.5 rounded-lg bg-purple-105 text-purple-700 text-[10px] font-bold uppercase tracking-wider font-mono">
                              Consultant
                            </div>
                            <Check className={`w-4 h-4 text-purple-600 ${selectedRole === 'consultant' ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight font-medium mt-4">
                            Provides analytical read-only insight dashboards, Gantt timelines, and chatbot advice.
                          </p>
                        </div>

                        {/* 3. Admin Account - MUST show disabled for Consultant with live banner */}
                        {simulatedCreatorRole === 'consultant' ? (
                          <div 
                            className="border-2 border-slate-200 bg-slate-100/70 p-4.5 rounded-2xl cursor-not-allowed opacity-55 relative flex flex-col justify-between h-36"
                            title="Consultants are unauthorized to create Admin accounts"
                          >
                            <div className="flex justify-between items-start">
                              <span className="p-1 px-2 text-red-700 bg-red-100/50 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono flex items-center gap-1 leading-none">
                                <ShieldAlert className="w-3 h-3" />
                                Locked (403)
                              </span>
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="mt-auto">
                              <span className="block text-[11px] font-bold text-slate-650 leading-none">Admin Account</span>
                              <p className="text-[10px] text-red-600 mt-1 leading-tight font-bold font-mono uppercase tracking-tight">
                                CONSULTANT CANNOT CREATE ADMIN
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedRole('admin')}
                            className={`border-2 p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-36 ${
                              selectedRole === 'admin'
                                ? 'border-red-500 bg-red-50/30'
                                : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/20'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="p-1 px-2.5 rounded-lg bg-red-105 text-red-600 text-[10px] font-bold uppercase tracking-wider font-mono">
                                Admin
                              </div>
                              <Check className={`w-4 h-4 text-red-500 ${selectedRole === 'admin' ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight font-medium mt-4">
                              Unrestricted master control. Access keys management, celery command logs, metrics creation.
                            </p>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Pre-fill Helpers row */}
                    <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Instant Credential Simulator:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickPrefill('developer')}
                        className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
                      >
                        Auto Developer Bot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPrefill('consultant')}
                        className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
                      >
                        Auto Consultant Bot
                      </button>
                      {simulatedCreatorRole === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleQuickPrefill('admin')}
                          className="p-1.5 px-3 bg-slate-105 hover:bg-red-50 hover:text-red-700 rounded-lg text-[10px] font-bold text-slate-650 transition-all cursor-pointer"
                        >
                          Auto Admin Bot
                        </button>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* STEP 2: Project access paths - ONLY shown for Developer role */}
                {step === 2 && selectedRole === 'developer' && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        Step 2 — Plane Project Access Partitioning
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Developers are secured within specified namespaces. Pulls live plane directory keys from <code className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono text-[10px]">/user/projects/</code>.
                      </p>
                    </div>

                    {loadingProjects ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-mono text-slate-400 tracking-widest uppercase font-bold">Querying Plane directories...</span>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                          <span>Target Workspace Repositories</span>
                          <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px]">
                            {selectedProjectUuids.length} of {availableProjects.length} Selected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                          {availableProjects.map((proj) => {
                            const isChecked = selectedProjectUuids.includes(proj.uuid);
                            return (
                              <div
                                key={proj.uuid}
                                onClick={() => handleToggleProject(proj.uuid)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 text-left group ${
                                  isChecked 
                                    ? 'border-blue-500 bg-blue-50/15 shadow-sm' 
                                    : 'border-slate-150 hover:border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-slate-50'
                                }`}>
                                  {isChecked && <Check className="w-3.5 h-3.5 font-bold" />}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <span className="block text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-700 truncate">
                                    {proj.name}
                                  </span>
                                  <span className="block text-[9.5px] font-mono text-slate-400 select-all truncate">
                                    {proj.uuid}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 flex gap-3 text-slate-650 text-xs font-medium">
                          <Info className="w-5 h-5 text-blue-600 shrink-0" />
                          <p>
                            <strong>Tip:</strong> The list reflects sandbox UUID values stored within the database. The developer bot will automatically listen only to triggers registered against these key identifiers.
                          </p>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

                {/* STEP 3: LLM Keys stored Fernet-encrypted */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-blue-600" />
                        Step 3 — Option LLM Engine Keys
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Enable autonomous summary logic. Secrets are encrypted symmetrically using Python-equivalent <strong className="text-slate-800">Fernet Cryptography specs</strong> before database writes.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono">
                          Select API provider engine
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { id: 'google', name: 'Google Gemini' },
                            { id: 'openai', name: 'OpenAI GPT' },
                            { id: 'anthropic', name: 'Anthropic' },
                            { id: 'groq', name: 'Groq Cloud' }
                          ].map((prov) => (
                            <button
                              key={prov.id}
                              type="button"
                              onClick={() => setLlmProvider(prov.id as any)}
                              className={`py-2.5 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                llmProvider === prov.id
                                  ? 'bg-blue-600 border-blue-600 text-white shadow'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {prov.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono">
                          API Key Token (Optional)
                        </label>
                        <textarea
                          placeholder={`Paste corporate secret token here (e.g. sk_${llmProvider === 'google' ? 'google' : 'live'}_key_hash...)`}
                          value={llmKey}
                          onChange={(e) => setLlmKey(e.target.value)}
                          className="w-full h-24 bg-slate-50/85 border border-slate-200 p-4 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900"
                        />
                      </div>

                      <div className="p-4.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/15 flex gap-3 text-slate-700 text-xs leading-relaxed font-semibold">
                        <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="block text-emerald-800 uppercase text-[10px] font-mono tracking-widest font-black">Zero-Knowledge Sandbox protection</span>
                          Upon post ingestion, the system derives an AES-256 binary initialization vector, merges it with SHA-256 HMAC tokens, and returns a secure Fernet string starting with <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-700 font-bold border border-emerald-500/10">gAAAAAB</code>.
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* STEP 4: Summary Review before creation */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FolderCheck className="w-5 h-5 text-blue-600" />
                        Step 4 — Review & Complete Provisions
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Confirm bot structural scope. Triggers immediate creation in the memory cache.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Identity Section */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono">
                          Agent Profile Identity
                        </span>
                        <div className="space-y-1.5 font-medium">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Username:</span>
                            <strong className="text-slate-800">{username || "Undefined"}</strong>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Email:</span>
                            <strong className="text-slate-800 truncate max-w-[180px]">{email || "Undefined"}</strong>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Security:</span>
                            <span className="text-slate-500 font-mono text-[10px] font-bold">••••••••</span>
                          </div>
                          <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                            <span className="text-slate-400">Profile Role:</span>
                            <strong className="uppercase text-blue-700 font-mono text-[11px] font-extrabold">
                              {selectedRole}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Technical Locks Section */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono">
                          Technical Access Paths
                        </span>
                        <div className="space-y-1.5 font-medium">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">LLM Integrations:</span>
                            <strong className="text-slate-800 uppercase font-mono text-[10.5px]">
                              {llmKey ? `${llmProvider} Key Connected` : 'None Provided'}
                            </strong>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Creator Role:</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[9px] uppercase font-bold font-mono">
                              {simulatedCreatorRole}
                            </span>
                          </div>
                          {selectedRole === 'developer' ? (
                            <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                              <span className="text-slate-400">Namespace Locks:</span>
                              <strong className="text-blue-700 text-[11px] font-bold uppercase font-mono">
                                {selectedProjectUuids.length} Plane Repos
                              </strong>
                            </div>
                          ) : (
                            <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                              <span className="text-slate-400">Workspace Scale:</span>
                              <strong className="text-emerald-700 text-[11px] font-bold uppercase font-mono">
                                Global Read/Write
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1e40af] font-mono block">
                        Assigned Permissions Preview
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {getRolePermissionsPreview(selectedRole).map((perm, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex gap-2.5 items-start">
                            <div className="p-1 rounded-full bg-blue-50 text-blue-600 mt-0.5 shrink-0">
                              <Check className="w-3 h-3 font-bold" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-[11px] font-bold text-slate-900 leading-tight">
                                {perm.name}
                              </span>
                              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                {perm.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* STEP 5: Success screen displaying payload info */}
                {step === 5 && submitSuccess && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center py-4"
                  >
                    <div className="flex justify-center">
                      <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-full shadow-inner animate-bounce text-emerald-600">
                        <Check className="w-10 h-10 font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Bot Account Created successfully!</h2>
                      <p className="text-xs text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                        The autonomous bot coordinates have been synchronized into the Glacier in-memory cache. Permissions are locked.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 text-left space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2 py-0.5 border border-emerald-900 rounded">
                        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                        POST SECURE STATUS: 201
                      </div>
                      
                      <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 leading-none">
                        Database Response JSON:
                      </span>
                      
                      <pre className="text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto p-4 bg-[#0a0e17] rounded-xl border border-slate-900 max-h-56">
                        {JSON.stringify(submitSuccess, null, 2)}
                      </pre>
                    </div>

                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={resetWizardState}
                        className="py-3 px-5 bg-slate-100 hover:bg-slate-205 text-slate-705 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                      >
                        Create another bot
                      </button>
                      <button
                        onClick={onBackToDashboard}
                        className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-lg shadow-blue-600/10 flex items-center gap-1.5"
                      >
                        Return to Workspace
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

              {/* Wizard Nav buttons footer (Steps 1 to 4 only) */}
              {step <= 4 && (
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-slate-250 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-50 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  {step === 4 ? (
                    <button
                      type="button"
                      onClick={handleCreateBotUser}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:scale-100 active:scale-97 disabled:opacity-45 h-11"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Bot Instance</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow px-6 h-11"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Right Panel: Side Panel Metrics and Created Logs Stream (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Context Stats Details card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                Active Sandbox Logs
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Acting User Tier:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] uppercase font-bold border border-blue-500/10">
                    {simulatedCreatorRole}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Ready Projects:</span>
                  <strong className="text-slate-800 font-mono">{availableProjects.length} loaded</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Provisioned Bots:</span>
                  <strong className="text-slate-800 font-mono">{createdBotUsers.length} total</strong>
                </div>
              </div>

              {/* Secure Fernet explanation */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#1e40af] block font-mono">
                  Standard Cryptography specs
                </span>
                <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  Fernet encryption guarantees that keys cannot be read or tampered with without the private workspace key. This fully separates user credentials at the database layer.
                </p>
              </div>
            </div>

            {/* Created Bots History Tracker Stream */}
            <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 to-slate-900 pointer-events-none" />
              
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono border-b border-slate-800 pb-3 flex items-center gap-1.5 relative z-10">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Provisioned Cache Log
              </h3>

              {loadingBots ? (
                <div className="py-6 text-center text-slate-500 text-xs font-mono">Loading cache...</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 relative z-10">
                  {createdBotUsers.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-[11px] leading-relaxed font-semibold">
                      No custom bot accounts have been created yet during this session.
                    </div>
                  ) : (
                    createdBotUsers.map((bot, ind) => (
                      <div 
                        key={bot.uuid || ind}
                        className="p-3 bg-[#0c1221] rounded-xl border border-slate-800 space-y-1.5 transition-all text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                            {bot.username}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold leading-none ${
                            bot.role === 'admin' 
                              ? 'bg-red-950/80 text-red-400 border border-red-900/40' 
                              : bot.role === 'developer' 
                                ? 'bg-blue-950/80 text-blue-400 border border-blue-900/40' 
                                : 'bg-purple-950/80 text-purple-400 border border-purple-900/40'
                          }`}>
                            {bot.role}
                          </span>
                        </div>
                        <span className="block text-[10px] font-mono text-slate-400 select-all truncate">
                          UUID: {bot.uuid}
                        </span>
                        {bot.projectAccess && bot.projectAccess.length > 0 && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            Assigned UUIDs: {bot.projectAccess.join(', ')}
                          </div>
                        )}
                        {bot.encryptedLlmKey && (
                          <div className="text-[8.5px] font-mono text-emerald-400 tracking-wider truncate">
                            Crypt: {bot.encryptedLlmKey}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
