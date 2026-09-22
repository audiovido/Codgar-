import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PermissionPolicy, ProjectInfo, AgentConfig } from '../types';
import { Language, translations } from '../utils/translations';
import {
  Settings,
  Shield,
  HardDrive,
  Check,
  X,
  Save,
  Cpu,
  Sliders,
  Sparkles,
  Volume2,
  Terminal,
  KeyRound,
  RefreshCw,
  Plus,
  GitBranch,
  BrainCircuit,
  FileCode,
  Zap,
  RotateCcw,
  Boxes,
  Network,
  ArrowRightLeft,
  ShieldCheck,
  Flame,
  GripHorizontal,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectInfo: ProjectInfo | null;
  policy: PermissionPolicy;
  onUpdatePolicy: (policy: PermissionPolicy) => void;
  agentConfig: AgentConfig;
  onUpdateAgentConfig: (config: AgentConfig) => void;
  language: Language;
}

export function SettingsModal({
  isOpen,
  onClose,
  projectInfo,
  policy,
  onUpdatePolicy,
  agentConfig,
  onUpdateAgentConfig,
  language,
}: Props) {
  const [activeTab, setActiveTab] = useState<'permissions' | 'memory' | 'claude_tuning' | 'router_package' | 'info'>('router_package');
  const [localPolicy, setLocalPolicy] = useState<PermissionPolicy>(policy);
  const [localConfig, setLocalConfig] = useState<AgentConfig>(agentConfig);
  const [memoryText, setMemoryText] = useState('');
  const [savingMemory, setSavingMemory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [keyStatus, setKeyStatus] = useState<any>(null);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [addingKey, setAddingKey] = useState(false);
  const [keyActionMsg, setKeyActionMsg] = useState('');
  const [routerTopology, setRouterTopology] = useState<any>(null);
  const [routerModels, setRouterModels] = useState<any[]>([]);
  const [installingSuite, setInstallingSuite] = useState(false);
  const [testArbitrationResult, setTestArbitrationResult] = useState<any>(null);

  const t = translations[language];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchKeyStatus = () => {
    fetch('/api/keys/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setKeyStatus(data);
      })
      .catch(console.error);
  };

  const fetchRouterData = () => {
    fetch('/api/router/topology')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.topology) setRouterTopology(data.topology);
      })
      .catch(console.error);

    fetch('/api/router/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.models)) setRouterModels(data.models);
      })
      .catch(console.error);
  };

  useEffect(() => {
    setLocalPolicy(policy);
  }, [policy]);

  useEffect(() => {
    setLocalConfig(agentConfig);
  }, [agentConfig]);

  useEffect(() => {
    if (isOpen) {
      fetchKeyStatus();
      fetchRouterData();
      fetch('/api/memory')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.memory) {
            setMemoryText(JSON.stringify(data.memory, null, 2));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleInstallSuite = async () => {
    setInstallingSuite(true);
    try {
      const res = await fetch('/api/router/install-package', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchRouterData();
        setKeyActionMsg('All 5 ecosystem packages (CodGate + Cloud Code + NineWriter + OmniRouter + Vance Router) synchronized successfully!');
      }
    } catch (err: any) {
      setKeyActionMsg(`Installation error: ${err.message}`);
    } finally {
      setInstallingSuite(false);
    }
  };

  const handleTestArbitration = async (samplePrompt: string) => {
    try {
      const res = await fetch('/api/router/select-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: samplePrompt, mode: 'agent' }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setTestArbitrationResult(data.evaluation);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRotateKey = async () => {
    setRotatingKey(true);
    setKeyActionMsg('');
    try {
      const res = await fetch('/api/keys/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'manual_ui_trigger' }),
      });
      const data = await res.json();
      if (data.success) {
        setKeyActionMsg(`Rotated to key: ${data.newKeyMask}`);
        fetchKeyStatus();
      } else {
        setKeyActionMsg(`Rotation failed: ${data.error || 'No other keys'}`);
      }
    } catch (err: any) {
      setKeyActionMsg(`Error: ${err.message}`);
    } finally {
      setRotatingKey(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyInput.trim()) return;
    setAddingKey(true);
    setKeyActionMsg('');
    try {
      const res = await fetch('/api/keys/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKeyInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setKeyActionMsg(`Added key: ${data.keyMask}`);
        setNewKeyInput('');
        fetchKeyStatus();
      } else {
        setKeyActionMsg(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setKeyActionMsg(`Error: ${err.message}`);
    } finally {
      setAddingKey(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onUpdatePolicy(localPolicy);
    onUpdateAgentConfig(localConfig);
    onClose();
  };

  const handleSaveMemory = async () => {
    setSavingMemory(true);
    try {
      const parsed = JSON.parse(memoryText);
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory: parsed }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Invalid JSON format in persistent memory');
    } finally {
      setSavingMemory(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-2xl ice-glass-window rounded-3xl flex flex-col overflow-hidden border border-white/90 shadow-2xl text-slate-800 bg-white/95 cursor-default select-none max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Apple-Style Refined Modal Header */}
          <div className="px-6 py-3.5 border-b border-white/60 flex items-center justify-between bg-white/40 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-wider flex items-center gap-1.5">
                  <span>CODGAR CONFIGURATION MATRIX</span>
                  <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                    v1.0.5
                  </span>
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">
                  Security boundaries, Claude Code parameters & runtime heuristics
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/60 px-6 bg-white/30 text-xs font-sans overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-3.5 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold ${
              activeTab === 'permissions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.settingsTabs.permissions}</span>
          </button>
          <button
            onClick={() => setActiveTab('claude_tuning')}
            className={`py-2 px-3.5 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold ${
              activeTab === 'claude_tuning'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.settingsTabs.modelParams}</span>
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-2 px-3.5 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold ${
              activeTab === 'memory'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{t.settingsTabs.memory}</span>
          </button>
          <button
            onClick={() => setActiveTab('router_package')}
            className={`py-2 px-3.5 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold ${
              activeTab === 'router_package'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Gaif.dev & Suite (جیاف.دِو)</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-3.5 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t.settingsTabs.daemon}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] text-xs bg-white/60">
          {/* TAB 1: PERMISSIONS & SAFETY BOUNDARIES */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed font-sans mb-3 font-medium">
                Configure autonomous execution boundaries, command blacklists, and human authorization checks.
              </p>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-white bg-white/80 shadow-sm cursor-pointer hover:bg-white transition">
                <input
                  type="checkbox"
                  checked={localPolicy.requireApprovalForCommands}
                  onChange={(e) =>
                    setLocalPolicy((p) => ({
                      ...p,
                      requireApprovalForCommands: e.target.checked,
                    }))
                  }
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-400 bg-white border-slate-300 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Require approval before executing shell commands
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Prompts interactive verification card before executing terminal operations.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-white bg-white/80 shadow-sm cursor-pointer hover:bg-white transition">
                <input
                  type="checkbox"
                  checked={localPolicy.requireApprovalForFileWrite}
                  onChange={(e) =>
                    setLocalPolicy((p) => ({
                      ...p,
                      requireApprovalForFileWrite: e.target.checked,
                    }))
                  }
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-400 bg-white border-slate-300 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Require approval before writing source code to disk
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Requires human verification of diff hunks before mutating workspace files.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-white bg-white/80 shadow-sm cursor-pointer hover:bg-white transition">
                <input
                  type="checkbox"
                  checked={localPolicy.requireApprovalForGitCommit}
                  onChange={(e) =>
                    setLocalPolicy((p) => ({
                      ...p,
                      requireApprovalForGitCommit: e.target.checked,
                    }))
                  }
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-400 bg-white border-slate-300 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Require approval for git commit & branch mutations
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Holds VCS changes until reviewed in the visual Diff Viewer.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* TAB 2: WORLD-CLASS CODER TUNING (Claude Code, OpenAI Codex, Cursor) */}
          {activeTab === 'claude_tuning' && (
            <div className="space-y-4">
              {/* Presets Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs">Coder Profile Presets:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setLocalConfig((c) => ({
                        ...c,
                        reasoningEffort: 'high',
                        contextWindowStrategy: 'auto_compact',
                        diffFormat: 'synthesized_ast',
                        codeReviewLinter: 'strict',
                        multiFilePlanning: true,
                        selfCorrectionPasses: 3,
                        autoTerminalExecution: 'safe_only',
                        temperature: 0.2,
                        bashTimeoutSeconds: 45,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                  >
                    Claude Code
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalConfig((c) => ({
                        ...c,
                        reasoningEffort: 'ultra',
                        contextWindowStrategy: 'sliding_window',
                        diffFormat: 'unified',
                        codeReviewLinter: 'pedantic',
                        multiFilePlanning: true,
                        selfCorrectionPasses: 4,
                        autoTerminalExecution: 'autonomous',
                        temperature: 0.1,
                        bashTimeoutSeconds: 60,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                  >
                    OpenAI Codex
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalConfig((c) => ({
                        ...c,
                        reasoningEffort: 'medium',
                        contextWindowStrategy: 'hierarchical_rag',
                        diffFormat: 'synthesized_ast',
                        codeReviewLinter: 'strict',
                        multiFilePlanning: true,
                        selfCorrectionPasses: 2,
                        autoTerminalExecution: 'ask_always',
                        temperature: 0.4,
                        bashTimeoutSeconds: 30,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
                  >
                    Cursor IDE
                  </button>
                </div>
              </div>

              {/* Reasoning Effort & Multi-pass self-correction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Reasoning Effort
                    </span>
                    <span className="font-mono text-blue-700 font-bold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200 uppercase text-[10px]">
                      {localConfig.reasoningEffort || 'high'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Depth of step-by-step thinking before proposing code mutations.
                  </p>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(['low', 'medium', 'high', 'ultra'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLocalConfig((c) => ({ ...c, reasoningEffort: lvl }))}
                        className={`py-1 text-[10px] font-bold rounded-lg border uppercase transition cursor-pointer ${
                          (localConfig.reasoningEffort || 'high') === lvl
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                      Self-Correction Passes
                    </span>
                    <span className="font-mono text-blue-700 font-bold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200 text-[10px]">
                      {localConfig.selfCorrectionPasses ?? 3} passes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatic review & compile verification loop before finalizing response.
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={localConfig.selfCorrectionPasses ?? 3}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        selfCorrectionPasses: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-600 cursor-pointer pt-1"
                  />
                </div>
              </div>

              {/* AST Diff Format & Context Window Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      Code Diff Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    How code patch mutations are represented and reviewed.
                  </p>
                  <select
                    value={localConfig.diffFormat || 'synthesized_ast'}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        diffFormat: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="synthesized_ast">Synthesized AST Hunks (Claude Code Spec)</option>
                    <option value="unified">Unified Git Diff (Codex / Patch Spec)</option>
                    <option value="split">Split Visual Side-by-Side (Cursor Spec)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-600" />
                      Terminal Execution Autonomy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Command authorization mode for shell execution.
                  </p>
                  <select
                    value={localConfig.autoTerminalExecution || 'safe_only'}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        autoTerminalExecution: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="safe_only">Safe Read/Build Commands Auto (Recommended)</option>
                    <option value="ask_always">Strict: Prompt Approval on Every Command</option>
                    <option value="autonomous">Full Autonomous Agent Mode (Codex CI/CD)</option>
                  </select>
                </div>
              </div>

              {/* Sliders: Temperature, Tokens, Bash Timeout */}
              <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Bash Command Timeout</span>
                  <span className="font-mono text-blue-700 font-bold px-2.5 py-0.5 bg-blue-50 rounded-full border border-blue-200">
                    {localConfig.bashTimeoutSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={localConfig.bashTimeoutSeconds}
                  onChange={(e) =>
                    setLocalConfig((c) => ({
                      ...c,
                      bashTimeoutSeconds: parseInt(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Maximum Output Tokens</span>
                  <span className="font-mono text-blue-700 font-bold px-2.5 py-0.5 bg-blue-50 rounded-full border border-blue-200">
                    {localConfig.maxOutputTokens} Tokens
                  </span>
                </div>
                <input
                  type="range"
                  min={1024}
                  max={16384}
                  step={1024}
                  value={localConfig.maxOutputTokens}
                  onChange={(e) =>
                    setLocalConfig((c) => ({
                      ...c,
                      maxOutputTokens: parseInt(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl border border-white bg-white/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Autonomous Reasoning Temperature</span>
                  <span className="font-mono text-blue-700 font-bold px-2.5 py-0.5 bg-blue-50 rounded-full border border-blue-200">
                    {localConfig.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={localConfig.temperature}
                  onChange={(e) =>
                    setLocalConfig((c) => ({
                      ...c,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LONG-TERM MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-xs">
                  Persistent agent memory file <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">.codgar_memory.json</code>
                </p>
                <button
                  onClick={handleSaveMemory}
                  disabled={savingMemory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full coral-pill-btn font-bold text-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingMemory ? 'Writing...' : 'Commit Memory'}</span>
                </button>
              </div>
              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Memory synchronized successfully</span>
                </div>
              )}
              <textarea
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs p-3.5 bg-white text-slate-800 rounded-2xl outline-none border border-slate-200 focus:border-blue-500 resize-none leading-relaxed shadow-inner"
              />
            </div>
          )}

          {/* TAB 4: GAIF.DEV AI ROUTER & PACKAGE ECOSYSTEM */}
          {activeTab === 'router_package' && (
            <div className="space-y-4 font-sans text-xs">
              {/* Header Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-2xl border border-blue-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      معماری پکیج همزمان و روتر هوشمند (Gaif.dev)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      Tier-1 Free Core
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    هنگام نصب CodGate، همگام‌ساز Cloud Code، NineWriter و OmniRouter به صورت اتوماتیک و همزمان نصب شده و از طریق هوش مصنوعی Gaif.dev بهترین مدل رایگان و پرسرعت برای هر تسک انتخاب می‌شود.
                  </p>
                </div>
                <button
                  onClick={handleInstallSuite}
                  disabled={installingSuite}
                  className="px-4 py-2 rounded-xl coral-pill-btn text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${installingSuite ? 'animate-spin' : ''}`} />
                  <span>{installingSuite ? 'همگام‌سازی...' : 'نصب و همگام‌سازی پکیج‌ها'}</span>
                </button>
              </div>

              {/* Topology Grid (CodGate, Cloud Code, NineWriter, OmniRouter, Vance Router, Gaif.dev) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {/* 1. CodGate */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      CodGate
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {routerTopology?.codGate?.status || 'Installed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Security gateway, zero-day filter & agent permission policy enforcement.
                  </p>
                </div>

                {/* 2. Cloud Code */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      Cloud Code
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {routerTopology?.cloudCode?.status || 'Synced'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    MicroVM execution engine, repo sync & terminal container bridge.
                  </p>
                </div>

                {/* 3. NineWriter */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                      NineWriter
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {routerTopology?.nineWriter?.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Prompt synthesis, spec document generator & documentation worker.
                  </p>
                </div>

                {/* 4. OmniRouter */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Network className="w-3.5 h-3.5 text-purple-600" />
                      OmniRouter
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      {routerTopology?.omniRouter?.status || 'Routing'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Universal model switchboard & rate-limit cascade dispatcher.
                  </p>
                </div>

                {/* 5. Vance Router */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      Vance Router
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {routerTopology?.vanceRouter?.status || 'Standby'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tier-3 turbo fallback router triggered upon upstream rate-limit peaks.
                  </p>
                </div>

                {/* 6. Gaif.dev Core Engine */}
                <div className="p-3.5 bg-white/85 rounded-2xl border border-blue-300 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5 text-xs">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      Gaif.dev Arbiter
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      Active Arbiter
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Neural task classifier: optimizes speed, free tokens & model rotation.
                  </p>
                </div>
              </div>

              {/* Free Models Matrix */}
              <div className="p-4 bg-white/85 rounded-2xl border border-white shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    مدل‌های زبانی در دسترس (اولویت توکن رایگان و سرعت بالا)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    مدیریت هوشمند توسط Gaif.dev
                  </span>
                </div>

                <div className="space-y-2">
                  {(routerModels.length > 0 ? routerModels : [
                    { id: 'codgar-neural-turbo', name: 'مدل هوشمند کدگر توربو (CODGAR Neural Turbo)', isFree: true, speedRating: 'Ultra-Fast', gaifScore: 99, freeTokensPerDay: 'نامحدود رایگان', rateLimited: false },
                    { id: 'codgar-coder-pro', name: 'مدل تخصصی کدنویسی کدگر (CODGAR Coder Pro)', isFree: true, speedRating: 'Ultra-Fast', gaifScore: 98, freeTokensPerDay: 'سهمیه پرسرعت', rateLimited: false },
                    { id: 'codgar-reflex-lite', name: 'مدل واکنشی پرسرعت کدگر (CODGAR Reflex Lite)', isFree: true, speedRating: 'Instantaneous', gaifScore: 96, freeTokensPerDay: 'سهمیه آنی', rateLimited: false },
                    { id: 'codgar-architect-ultra', name: 'مدل معماری و طراحی سیستم کدگر (CODGAR Architect)', isFree: true, speedRating: 'Fast', gaifScore: 97, freeTokensPerDay: 'سهمیه جامع', rateLimited: false },
                  ]).map((m) => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${m.rateLimited ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                        <span className="font-bold text-slate-800">{m.name}</span>
                        {m.isFree && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            100% Free
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-slate-600">
                        <span>Speed: <strong className="text-blue-700">{m.speedRating}</strong></span>
                        <span>Quota: <strong className="text-slate-800">{m.freeTokensPerDay}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Score: {m.gaifScore || 98}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Test Panel */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">
                    تست هوشمند تصمیم‌گیری Gaif.dev برای تسک‌های مختلف:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTestArbitration('کد یک کامپوننت ری‌اکت بنویس')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold border border-slate-200 transition cursor-pointer"
                  >
                    تست تسک کدنویسی (Coder)
                  </button>
                  <button
                    onClick={() => handleTestArbitration('مستندات معماری روتر را بنویس')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold border border-slate-200 transition cursor-pointer"
                  >
                    تست تسک مستندسازی (Writer)
                  </button>
                  <button
                    onClick={() => handleTestArbitration('سلام چطوری کار می‌کنی؟')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold border border-slate-200 transition cursor-pointer"
                  >
                    تست چت و مکالمه سریع (Companion)
                  </button>
                </div>

                {testArbitrationResult && (
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-blue-800 font-bold">
                      <span>مدل برگزیده توسط Gaif.dev: {testArbitrationResult.decision?.model?.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">
                        {testArbitrationResult.decision?.routerTier}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600">{testArbitrationResult.decision?.reason}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Fallback Cascade Chain: {testArbitrationResult.fallbackChain?.map((f: any) => f.name).join(' -> ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM TELEMETRY */}
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Workspace Inode</span>
                  <span className="text-slate-800 font-bold font-mono">{projectInfo?.root || '.'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Agent Specification</span>
                  <span className="text-slate-800 font-bold font-mono">Claude Code Class // Autonomous Loop</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Host Kernel</span>
                  <span className="text-slate-800 font-bold font-mono">
                    {projectInfo?.platform === 'darwin'
                      ? 'Darwin (macOS)'
                      : projectInfo?.platform === 'win32'
                      ? 'WinNT (Windows)'
                      : 'Linux (Kali POSIX Environment)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Intelligence Backend</span>
                  <span className="text-blue-700 font-bold font-mono">
                    Gemini 2.5 Pro (Server Authority)
                  </span>
                </div>
              </div>

              {/* API Key Pool & Auto-Rotation Card */}
              <div className="p-4 bg-white/80 rounded-2xl border border-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">API Key Pool & Auto-Rotation</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <span className="text-slate-500 block text-[10px]">Active Key</span>
                    <span className="text-blue-700 font-mono font-bold">
                      {keyStatus?.keyMask || 'Configured in Env'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <span className="text-slate-500 block text-[10px]">Pool Count & Rotations</span>
                    <span className="text-slate-700 font-mono font-bold">
                      {keyStatus?.totalKeys ?? 1} in pool | {keyStatus?.rotationsCount ?? 0} rotations
                    </span>
                  </div>
                </div>

                {keyActionMsg && (
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 text-[11px] border border-blue-200 flex items-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{keyActionMsg}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    placeholder="Add secondary Gemini API key to pool..."
                    className="flex-1 text-xs px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono shadow-inner"
                  />
                  <button
                    onClick={handleAddKey}
                    disabled={!newKeyInput.trim() || addingKey}
                    className="px-3 py-2 rounded-xl ice-glass-btn text-xs text-blue-700 font-bold border-blue-200 hover:bg-blue-50 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{addingKey ? 'Adding...' : 'Add Key'}</span>
                  </button>
                  <button
                    onClick={handleRotateKey}
                    disabled={rotatingKey}
                    className="px-3 py-2 rounded-xl ice-glass-btn text-xs text-blue-700 font-bold border-blue-200 hover:bg-blue-50 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Rotate to next available API key in pool"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotatingKey ? 'animate-spin' : ''}`} />
                    <span>{rotatingKey ? 'Rotating...' : 'Rotate'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-white/60 bg-white/40 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-full coral-pill-btn text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Configuration</span>
          </button>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  );
}
