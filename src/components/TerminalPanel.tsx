import { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  Trash2,
  Copy,
  Check,
  Clock,
  Sparkles,
  CornerDownLeft,
  Network,
  Cpu,
  ChevronDown,
  Zap,
  BookOpen,
  Activity,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle?: () => void;
  language?: string;
}

interface CommandLog {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timestamp: number;
}

export interface RouterModelItem {
  id: string;
  name: string;
  provider: string;
  tier: string;
  latencyMs: number;
  tokensPerSec: number;
  codingScore: number;
  description: string;
  features: string[];
}

export interface RouterDefinition {
  id: 'omni' | 'nine' | 'vance';
  name: string;
  faName: string;
  tagline: string;
  status: 'active' | 'standby' | 'syncing';
  throughput: string;
  latencyAvg: string;
  uptime: string;
  architectureTier: string;
  description: string;
  models: RouterModelItem[];
}

export function TerminalPanel({ isOpen }: Props) {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Router & Model book state
  const [routers, setRouters] = useState<RouterDefinition[]>([]);
  const [activeRouterId, setActiveRouterId] = useState<'omni' | 'nine' | 'vance'>('omni');
  const [activeModelId, setActiveModelId] = useState<string>('omni-gemini-3-8-flash');
  const [activeRouter, setActiveRouter] = useState<RouterDefinition | null>(null);
  const [activeModel, setActiveModel] = useState<RouterModelItem | null>(null);
  const [showRouterDropdown, setShowRouterDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the Book of Routers (Omni, Nine, Vance)
  const fetchRouterBook = async () => {
    try {
      const res = await fetch('/api/routers/book');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRouters(data.routers || []);
          setActiveRouterId(data.activeRouterId || 'omni');
          setActiveModelId(data.activeModelId || '');
          setActiveRouter(data.activeRouter || null);
          setActiveModel(data.activeModel || null);
        }
      }
    } catch (err) {
      console.warn('Failed to load router book:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRouterBook();
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleSelectRouter = async (routerId: 'omni' | 'nine' | 'vance', modelId?: string) => {
    try {
      const res = await fetch('/api/routers/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routerId, modelId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveRouterId(routerId);
        setActiveRouter(data.router);
        setActiveModel(data.model);
        setActiveModelId(data.model.id);
        setShowRouterDropdown(false);
        setShowModelDropdown(false);

        const msg = `⚡ Connected to ${data.router.name} [Model: ${data.model.name}]`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);

        // Append notice into terminal logs
        setLogs((prev) => [
          ...prev,
          {
            id: `router_change_${Date.now()}`,
            command: `router use ${routerId} ${data.model.id}`,
            stdout: `[ROUTER SWITCH SUCCESS]\n• Router: ${data.router.name} (${data.router.faName})\n• Tier: ${data.router.architectureTier}\n• Throughput: ${data.router.throughput} | Latency: ${data.router.latencyAvg}\n• Active Model Selected: ${data.model.name} (${data.model.id})\n• Provider: ${data.model.provider} | Score: ${data.model.codingScore}/100`,
            stderr: '',
            exitCode: 0,
            durationMs: 8,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error selecting router:', err);
    }
  };

  const handleExecute = async (cmdToRun?: string) => {
    const targetCmd = (cmdToRun || command).trim();
    if (!targetCmd || running) return;

    // Record in history
    setHistory((prev) => [...prev.filter((c) => c !== targetCmd), targetCmd]);
    setHistoryIdx(-1);

    const executionId = `term_${Date.now()}`;
    setCurrentExecutionId(executionId);
    setRunning(true);
    setCommand('');

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: targetCmd, executionId }),
      });
      const data = await res.json();
      setLogs((prev) => [
        ...prev,
        {
          id: executionId,
          command: targetCmd,
          stdout: data.stdout || '',
          stderr: data.stderr || '',
          exitCode: data.exitCode ?? -1,
          durationMs: data.durationMs || 0,
          timestamp: Date.now(),
        },
      ]);

      // If command was a router switch command, refresh the router book state
      if (targetCmd.startsWith('router') || targetCmd.startsWith('model')) {
        fetchRouterBook();
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: executionId,
          command: targetCmd,
          stdout: '',
          stderr: err.message || 'Execution error',
          exitCode: -1,
          durationMs: 0,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setRunning(false);
      setCurrentExecutionId(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCancel = async () => {
    if (!currentExecutionId) return;
    try {
      await fetch('/api/terminal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId: currentExecutionId }),
      });
    } catch (err) {
      console.error('Failed to cancel terminal process:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCommand(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setCommand('');
      } else {
        setHistoryIdx(nextIdx);
        setCommand(history[nextIdx]);
      }
    }
  };

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `kian@codgar:~$ ${l.command}\n[exit: ${l.exitCode}, duration: ${l.durationMs}ms]\n${l.stdout}\n${l.stderr}`
      )
      .join('\n---\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const routerPills = [
    { id: 'omni', label: 'Omni Router', cmd: 'router use omni' },
    { id: 'nine', label: 'Nine Router', cmd: 'router use nine' },
    { id: 'vance', label: 'Vance Router', cmd: 'router use vance' },
    { id: 'book', label: '📖 Book of Routers', cmd: 'router book' },
    { id: 'models', label: '🧠 Models', cmd: 'models' },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="codgar-integrated-terminal"
      className="h-full w-full flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-white/80 shadow-[0_15px_45px_rgba(15,23,42,0.16)] bg-[#070b16] backdrop-blur-3xl font-mono text-xs select-none relative"
    >
      {/* Top Ambient Glow Rim */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-blue-500 pointer-events-none animate-pulse" />

      {/* Terminal Title / Action Bar with Router Connectivity */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#0e1526]/90 text-slate-300 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 select-none shrink-0 relative z-30">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <TerminalIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide text-xs">
              CODGAR TERMINAL
            </span>
            <span className="hidden sm:inline-block text-[10px] text-cyan-400/80 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              bash // tty1
            </span>
          </div>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* INTERACTIVE ROUTER SELECTOR (Omni, Nine, Vance)              */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRouterDropdown(!showRouterDropdown);
                setShowModelDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition border cursor-pointer active:scale-95 ${
                activeRouterId === 'vance'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : activeRouterId === 'nine'
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              }`}
              title="Click to switch Router (Omni Router, Nine Router, Vance Router)"
            >
              <Network className="w-3 h-3" />
              <span>{activeRouter?.name || 'Omni Router'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Router Dropdown */}
            {showRouterDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0b1222] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    Book of Routers
                  </span>
                  <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">
                    3 Active
                  </span>
                </div>

                <div className="space-y-1">
                  {routers.map((r) => {
                    const isSelected = r.id === activeRouterId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectRouter(r.id)}
                        className={`w-full text-left p-2 rounded-xl transition flex flex-col gap-0.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-white/10 border-cyan-400/40 text-white shadow-sm'
                            : 'hover:bg-white/5 border-transparent text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                r.id === 'vance'
                                  ? 'bg-amber-400'
                                  : r.id === 'nine'
                                  ? 'bg-purple-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                            {r.name}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400">
                            {r.throughput}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{r.faName}</p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono pt-0.5">
                          <span>Avg: {r.latencyAvg}</span>
                          <span>•</span>
                          <span>{r.models.length} Models</span>
                          {isSelected && <span className="text-cyan-400 font-bold ml-auto">✓ CONNECTED</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* INTERACTIVE MODEL SELECTOR (Selected from the Router's Book)  */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowModelDropdown(!showModelDropdown);
                setShowRouterDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 transition cursor-pointer active:scale-95"
              title="Click to choose model from Router's Book"
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {activeModel?.name || activeModelId || 'Select Model'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>

            {/* Model Selection Dropdown */}
            {showModelDropdown && activeRouter && (
              <div className="absolute left-0 mt-2 w-80 max-h-80 overflow-y-auto bg-[#0b1222] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {activeRouter.name} Catalog
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {activeRouter.models.length} models
                  </span>
                </div>

                <div className="space-y-1">
                  {activeRouter.models.map((m) => {
                    const isSelected = m.id === activeModelId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectRouter(activeRouterId, m.id)}
                        className={`w-full text-left p-2 rounded-xl transition flex flex-col gap-1 cursor-pointer border ${
                          isSelected
                            ? 'bg-white/10 border-cyan-400/40 text-white shadow-sm'
                            : 'hover:bg-white/5 border-transparent text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber-400" />
                            {m.name}
                          </span>
                          <span className="px-1.5 py-0.2 text-[9px] rounded font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                            {m.provider}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                          {m.description}
                        </p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                          <span>Latency: {m.latencyMs}ms</span>
                          <span>Score: {m.codingScore}/100</span>
                          {isSelected && <span className="text-emerald-400 font-bold">ACTIVE</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {toastMessage && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/40 animate-pulse hidden sm:inline-block">
              {toastMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer border border-white/10"
            title="Copy Terminal Logs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer border border-white/10"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Router Quick Command Pills Bar */}
      <div className="px-3 py-1.5 bg-[#0a0f1d] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mr-1 shrink-0">
          <Activity className="w-3 h-3 text-cyan-400" />
          Quick Router:
        </span>
        {routerPills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => handleExecute(pill.cmd)}
            disabled={running}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/30 text-[10px] font-mono transition cursor-pointer shrink-0 disabled:opacity-40 active:scale-95"
          >
            $ {pill.cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Stream Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#070b16] text-slate-200 space-y-3 leading-relaxed min-h-0 select-text font-mono">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center text-slate-400 gap-2.5 py-6">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                CODGAR Terminal Connected to {activeRouter?.name || 'Omni Router'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                Client is connected to <span className="text-cyan-400 font-bold">Omni Router</span>, <span className="text-purple-400 font-bold">Nine Router</span>, and <span className="text-amber-400 font-bold">Vance Router</span>.
                Switch models from the Book of Routers above or type <code className="text-cyan-300">router book</code>.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleExecute('router book')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono transition cursor-pointer"
              >
                $ router book
              </button>
              <button
                type="button"
                onClick={() => handleExecute('models')}
                className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] text-purple-300 font-mono transition cursor-pointer"
              >
                $ models
              </button>
              <button
                type="button"
                onClick={() => handleExecute('claude --version')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-slate-300 font-mono transition cursor-pointer"
              >
                $ claude --version
              </button>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="space-y-1.5 rounded-lg bg-black/30 p-2.5 border border-white/5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-1">
                <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="text-emerald-400">kian@codgar:~$</span> {log.command}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.exitCode === 0
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                    }`}
                  >
                    exit {log.exitCode}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {log.durationMs}ms
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = `${log.command}\n${log.stdout || ''}${log.stderr || ''}`.trim();
                      navigator.clipboard.writeText(textToCopy);
                    }}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white transition cursor-pointer text-[10px] flex items-center gap-1 font-mono border border-white/10 active:scale-95"
                    title="کپی خروجی این دستور / Copy Log"
                  >
                    <Copy className="w-3 h-3" />
                    <span>کپی</span>
                  </button>
                </div>
              </div>
              {log.stdout && (
                <pre className="text-slate-300 whitespace-pre-wrap text-[11px] overflow-x-auto leading-relaxed">
                  {log.stdout}
                </pre>
              )}
              {log.stderr && (
                <pre className="text-rose-400 whitespace-pre-wrap text-[11px] overflow-x-auto leading-relaxed">
                  {log.stderr}
                </pre>
              )}
            </div>
          ))
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Terminal Command Input Bar */}
      <div className="p-2 sm:p-2.5 bg-[#0e1526]/95 border-t border-white/10 flex items-center gap-2 shrink-0 select-none">
        <span className="text-emerald-400 font-bold pl-2 font-mono text-xs whitespace-nowrap">
          kian@codgar:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Command (e.g. router use vance, models, claude, npm test)..."
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-xs font-mono select-text"
        />
        {running ? (
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold font-mono shadow-[0_0_12px_rgba(255,23,68,0.4)] cursor-pointer active:scale-95 transition"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleExecute()}
            disabled={!command.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold font-mono cursor-pointer shadow-[0_0_12px_rgba(37,99,235,0.35)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
          >
            <span>Exec</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
