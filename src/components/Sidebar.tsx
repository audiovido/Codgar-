import { useState, useEffect } from 'react';
import {
  Layers,
  GitCompare,
  LayoutGrid,
  FileCode2,
  Terminal,
  MonitorPlay,
  Fuel,
} from 'lucide-react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';

interface Props {
  currentMode?: AgentMode;
  onSelectMode?: (mode: AgentMode) => void;
  onNewTask?: () => void;
  onOpenQueue: () => void;
  onOpenChanges: () => void;
  onOpenWorkspaces: () => void;
  onOpenEditor: () => void;
  onOpenTerminal: () => void;
  onOpenPreview?: () => void;
  onOpenFuel?: () => void;
  onOpenSettings?: () => void;
  isQueueActive?: boolean;
  isChangesActive?: boolean;
  isWorkspacesActive?: boolean;
  isEditorActive?: boolean;
  isTerminalActive?: boolean;
  isFuelActive?: boolean;
  isPreviewActive?: boolean;
  isExecuting?: boolean;
  language?: Language;
}

export function Sidebar({
  onOpenQueue,
  onOpenChanges,
  onOpenWorkspaces,
  onOpenEditor,
  onOpenTerminal,
  onOpenPreview,
  onOpenFuel,
  isQueueActive = false,
  isChangesActive = false,
  isWorkspacesActive = false,
  isEditorActive = false,
  isTerminalActive = false,
  isFuelActive = false,
  isPreviewActive = false,
  isExecuting = false,
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const [changedCount, setChangedCount] = useState<number>(0);
  const [queueCount, setQueueCount] = useState<number>(0);

  // Poll git status and queue stats for dynamic badges with visibility throttling
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const [gitRes, taskRes] = await Promise.all([
          fetch('/api/git/status'),
          fetch('/api/tasks'),
        ]);

        const gitData = await gitRes.json();
        const taskData = await taskRes.json();

        if (isMounted) {
          if (gitData.success) {
            const count =
              (gitData.staged?.length || 0) +
              (gitData.unstaged?.length || 0) +
              (gitData.untracked?.length || 0);
            setChangedCount(count);
          }
          if (taskData.success && Array.isArray(taskData.tasks)) {
            const pending = taskData.tasks.filter(
              (task: any) => task.status === 'running' || task.status === 'queued'
            ).length;
            setQueueCount(pending);
          }
        }
      } catch {
        // Silent fallback
      }
    };

    fetchStats();
    const timer = setInterval(fetchStats, 6000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const navSections = [
    {
      id: 'queue',
      title: t.queue,
      enTitle: 'Queue',
      desc: t.queueDesc,
      icon: <Layers className="w-4 h-4" />,
      action: onOpenQueue,
      badge: isExecuting || queueCount > 0 ? (isExecuting ? t.running : `${queueCount}`) : undefined,
      badgeStyle: isExecuting
        ? 'bg-amber-500/15 text-amber-700 border-amber-300 animate-pulse'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      iconContainerBg: 'bg-indigo-50/90 text-indigo-600 border-indigo-100',
      active: isQueueActive,
      hasDot: false,
      dotColor: isExecuting ? 'bg-amber-500' : 'bg-indigo-500',
    },
    {
      id: 'changes',
      title: t.changes,
      enTitle: 'Changes',
      desc: t.changesDesc,
      icon: <GitCompare className="w-4 h-4" />,
      action: onOpenChanges,
      badge: changedCount > 0 ? `${changedCount} diff` : t.clean,
      badgeStyle: changedCount > 0
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
        : 'bg-slate-100 text-slate-600 border-slate-200/60',
      iconContainerBg: 'bg-emerald-50/90 text-emerald-600 border-emerald-100',
      active: isChangesActive,
      hasDot: false,
      dotColor: 'bg-emerald-500',
    },
    {
      id: 'workspaces',
      title: t.workspaces,
      enTitle: 'Workspaces',
      desc: t.workspacesDesc,
      icon: <LayoutGrid className="w-4 h-4" />,
      action: onOpenWorkspaces,
      badge: isFa ? '۳ ایجنت' : '3 Agents',
      badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200/70',
      iconContainerBg: 'bg-sky-50/90 text-sky-600 border-sky-100',
      active: isWorkspacesActive,
      hasDot: false,
      dotColor: 'bg-sky-500',
    },
    {
      id: 'editor',
      title: t.editor,
      enTitle: 'IDE',
      desc: t.editorDesc,
      icon: <FileCode2 className="w-4 h-4" />,
      action: onOpenEditor,
      badge: 'IDE',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/70',
      iconContainerBg: 'bg-blue-50/90 text-blue-600 border-blue-100',
      active: isEditorActive,
      hasDot: false,
      dotColor: 'bg-blue-500',
    },
    {
      id: 'terminal',
      title: isFa ? 'ترمینال و تغییرات کد' : 'Terminal & Code Changes',
      enTitle: 'Terminal',
      desc: isFa ? 'مشاهده کدهای تولیدشده، تاریخچه تغییرات و اجرای دستورات' : 'View generated code changes, execution logs & terminal commands',
      icon: <Terminal className="w-4 h-4" />,
      action: onOpenTerminal,
      badge: isFa ? 'ترمینال' : 'Terminal',
      badgeStyle: isTerminalActive
        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs animate-pulse font-bold'
        : 'bg-slate-900 text-emerald-400 border-slate-700',
      iconContainerBg: isTerminalActive
        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
        : 'bg-slate-900 text-emerald-400 border-slate-700 shadow-2xs',
      active: isTerminalActive,
      hasDot: isTerminalActive,
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'preview',
      title: isFa ? 'پیش‌نمایش زنده اپلیکیشن' : 'Live Application Preview',
      enTitle: 'Live',
      desc: isFa ? 'مشاهده زنده سایت و برنامه‌های ساخته شده (مانند سبزمارکت)' : 'Interactive live rendering of built apps & components',
      icon: <MonitorPlay className="w-4 h-4" />,
      action: onOpenPreview,
      badge: 'Live',
      badgeStyle: isPreviewActive
        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs animate-pulse font-bold'
        : 'bg-emerald-50/90 text-emerald-700 border-emerald-200',
      iconContainerBg: isPreviewActive
        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
        : 'bg-emerald-50/90 text-emerald-600 border-emerald-100',
      active: isPreviewActive,
      hasDot: false,
      dotColor: 'bg-emerald-500',
    },
    {
      id: 'fuel',
      title: t.fuelAndModels,
      enTitle: 'Fuel',
      desc: t.fuelAndModelsDesc,
      icon: <Fuel className="w-4 h-4" />,
      action: onOpenFuel,
      badge: '100%',
      badgeStyle: isFuelActive
        ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
        : 'bg-amber-50 text-amber-700 border-amber-200/70',
      iconContainerBg: isFuelActive
        ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
        : 'bg-amber-50/90 text-amber-600 border-amber-100',
      active: isFuelActive,
      hasDot: false,
      dotColor: 'bg-amber-500',
    },
  ];

  return (
    <aside
      id="freebuff-sidebar"
      className={`h-auto my-auto ${
        isFa ? 'mr-2 sm:mr-4 ml-0' : 'ml-2 sm:ml-4 mr-0'
      } rounded-[28px] ice-glass-dock flex flex-col items-center justify-center shadow-2xl z-40 select-none pointer-events-auto border border-white/95 backdrop-blur-2xl shrink-0 w-14 sm:w-16 py-3 px-1.5 sm:px-2`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Navigation List */}
      <div className="w-full flex flex-col gap-1.5 relative items-center">
        {navSections.map((item) => {
          const isButtonActive = item.active;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={item.action}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 relative ${
                  isButtonActive
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/35 ring-2 ring-blue-400/80 scale-105'
                    : 'ice-glass-btn text-slate-700 hover:text-blue-600 hover:bg-white/90'
                }`}
              >
                {/* Micro Icon Container */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
                    isButtonActive
                      ? 'bg-white/25 text-white border-white/40 shadow-xs'
                      : `${item.iconContainerBg} shadow-2xs group-hover:scale-105`
                  }`}
                >
                  {item.icon}
                </div>

                {/* Subtle Status Pip in Collapsed Mode */}
                {item.hasDot && (
                  <span
                    className={`absolute top-1.5 ${isFa ? 'left-1.5' : 'right-1.5'} flex h-2 w-2 items-center justify-center`}
                  >
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${item.dotColor} ring-2 ring-white shadow-xs`} />
                  </span>
                )}
              </button>

              {/* Floating Tooltip in Collapsed Mode */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isFa ? 'right-full mr-3' : 'left-full ml-3'
                } px-3 py-2 rounded-2xl bg-slate-950/95 text-white shadow-2xl border border-white/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[100] flex flex-col gap-1 min-w-[160px] ring-1 ring-black/40 backdrop-blur-md`}
                dir={isFa ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[9px] font-mono text-cyan-300">{item.enTitle}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-snug">{item.desc}</p>
                {item.badge && (
                  <div className="mt-0.5 flex items-center justify-between text-[9px] font-mono text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-lg border border-blue-400/20">
                    <span>{isFa ? 'وضعیت' : 'Status'}</span>
                    <span className="font-bold">{item.badge}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
