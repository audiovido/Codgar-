import { useState, useEffect } from 'react';
import {
  Layers,
  Terminal,
  MonitorPlay,
  Fuel,
  CreditCard,
} from 'lucide-react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';

interface Props {
  currentMode?: AgentMode;
  onSelectMode?: (mode: AgentMode) => void;
  onNewTask?: () => void;
  onOpenQueue: () => void;
  onOpenChanges?: () => void;
  onOpenWorkspaces?: () => void;
  onOpenEditor?: () => void;
  onOpenTerminal: () => void;
  onOpenPreview?: () => void;
  onOpenBilling?: () => void;
  onOpenFuel?: () => void;
  onOpenSettings?: () => void;
  isQueueActive?: boolean;
  isChangesActive?: boolean;
  isWorkspacesActive?: boolean;
  isEditorActive?: boolean;
  isTerminalActive?: boolean;
  isBillingActive?: boolean;
  isFuelActive?: boolean;
  isPreviewActive?: boolean;
  isExecuting?: boolean;
  language?: Language;
}

export function Sidebar({
  onOpenQueue,
  onOpenTerminal,
  onOpenPreview,
  onOpenBilling,
  onOpenFuel,
  isQueueActive = false,
  isTerminalActive = false,
  isBillingActive = false,
  isFuelActive = false,
  isPreviewActive = false,
  isExecuting = false,
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const [queueCount, setQueueCount] = useState<number>(0);

  // Poll queue stats for dynamic badges with visibility throttling
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const taskRes = await fetch('/api/tasks');
        const taskData = await taskRes.json();

        if (isMounted) {
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
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
        : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 ring-2 ring-indigo-400/80 scale-105',
      activeInnerBg: 'bg-white/20 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-indigo-50/90 text-indigo-600 border-indigo-200/90 shadow-2xs group-hover/btn:border-indigo-400 group-hover/btn:bg-indigo-100',
      active: isQueueActive,
      hasDot: isExecuting,
      dotColor: 'bg-amber-400',
    },
    {
      id: 'terminal',
      title: isFa ? 'ترمینال و تغییرات کد' : 'Terminal & Code Changes',
      enTitle: 'Terminal',
      desc: isFa ? 'مشاهده کدهای تولیدشده، تاریخچه تغییرات و اجرای دستورات' : 'View generated code changes, execution logs & terminal commands',
      icon: <Terminal className="w-4 h-4" />,
      action: onOpenTerminal,
      badge: isFa ? 'ترمینال فعال' : 'Terminal Active',
      badgeStyle: isTerminalActive
        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 font-bold'
        : 'bg-slate-900 text-emerald-400 border-slate-700',
      activeBtnBg: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-[#07172b] text-emerald-400 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 scale-105 border border-emerald-500/40',
      activeInnerBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-inner',
      inactiveInnerBg: 'bg-[#080f1d] text-emerald-400 border-slate-700/80 shadow-2xs group-hover/btn:border-emerald-500/50 group-hover/btn:shadow-emerald-500/10',
      active: isTerminalActive,
      hasDot: isTerminalActive,
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'preview',
      title: isFa ? 'پیش‌نمایش زنده اپلیکیشن' : 'Live Application Preview',
      enTitle: 'Live',
      desc: isFa ? 'مشاهده زنده سایت و برنامه‌های ساخته شده' : 'Interactive live rendering of built apps & components',
      icon: <MonitorPlay className="w-4 h-4" />,
      action: onOpenPreview,
      badge: 'Live Sandbox',
      badgeStyle: isPreviewActive
        ? 'bg-teal-500/25 text-teal-300 border-teal-400/60 font-bold'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/35 ring-2 ring-emerald-300 scale-105 font-bold',
      activeInnerBg: 'bg-white/30 text-slate-950 border-white/50 shadow-inner',
      inactiveInnerBg: 'bg-teal-50/90 text-teal-600 border-teal-200/90 shadow-2xs group-hover/btn:border-teal-400 group-hover/btn:bg-teal-100',
      active: isPreviewActive,
      hasDot: isPreviewActive,
      dotColor: 'bg-teal-400',
    },
    {
      id: 'billing',
      title: isFa ? 'امور مالی و ارتقای اشتراک' : 'Billing & Plans',
      enTitle: 'Billing',
      desc: isFa ? '۵ ساعت رایگان روزانه، خرید ساعت بیشتر و پلن‌های نامحدود' : '5h free daily, buy extra hours & unlimited AI plans',
      icon: <CreditCard className="w-4 h-4" />,
      action: onOpenBilling,
      badge: isFa ? '۵ ساعت رایگان' : '5h Free Daily',
      badgeStyle: isBillingActive
        ? 'bg-amber-500/25 text-amber-300 border-amber-400/60 font-bold'
        : 'bg-amber-950/80 text-amber-300 border-amber-700/50 font-bold',
      activeBtnBg: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/35 ring-2 ring-amber-300 scale-105',
      activeInnerBg: 'bg-white/25 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-amber-50/90 text-amber-600 border-amber-200/90 shadow-2xs group-hover/btn:border-amber-400 group-hover/btn:bg-amber-100',
      active: isBillingActive,
      hasDot: true,
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'fuel',
      title: t.fuelAndModels,
      enTitle: 'Fuel',
      desc: t.fuelAndModelsDesc,
      icon: <Fuel className="w-4 h-4" />,
      action: onOpenFuel,
      badge: '100% Ready',
      badgeStyle: isFuelActive
        ? 'bg-orange-500/25 text-orange-300 border-orange-400/60 font-bold'
        : 'bg-orange-950/80 text-orange-300 border-orange-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/35 ring-2 ring-rose-300 scale-105',
      activeInnerBg: 'bg-white/20 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-orange-50/90 text-orange-600 border-orange-200/90 shadow-2xs group-hover/btn:border-orange-400 group-hover/btn:bg-orange-100',
      active: isFuelActive,
      hasDot: false,
      dotColor: 'bg-orange-400',
    },
  ];

  return (
    <aside
      id="freebuff-sidebar"
      className={`h-auto my-auto ${
        isFa ? 'mr-2 sm:mr-4 ml-0' : 'ml-2 sm:ml-4 mr-0'
      } rounded-[30px] ice-glass-dock flex flex-col items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.14)] z-40 select-none pointer-events-auto border border-white/95 backdrop-blur-2xl shrink-0 w-14 sm:w-16 py-3.5 px-1.5 sm:px-2`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Navigation List */}
      <div className="w-full flex flex-col gap-2 relative items-center">
        {navSections.map((item) => {
          return (
            <div key={item.id} className="relative group/nav flex items-center justify-center w-full">
              <button
                type="button"
                onClick={item.action}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 group/btn ${
                  item.active
                    ? item.activeBtnBg
                    : 'ice-glass-btn text-slate-700 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Micro Icon Squircle Container */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border ${
                    item.active
                      ? item.activeInnerBg
                      : `${item.inactiveInnerBg} group-hover/btn:scale-108`
                  }`}
                >
                  {item.icon}
                </div>

                {/* Status Dot */}
                {item.hasDot && (
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${item.dotColor} shadow-xs animate-pulse`}
                  />
                )}
              </button>

              {/* High-Tech Crystal Floating Tooltip Card */}
              <div
                className={`absolute ${
                  isFa
                    ? 'right-full mr-3.5 origin-right'
                    : 'left-full ml-3.5 origin-left'
                } top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-1 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 transition-all duration-200 z-[100]`}
                dir={isFa ? 'rtl' : 'ltr'}
              >
                <div className="rounded-2xl p-3 bg-slate-950/95 text-white shadow-2xl border border-white/20 backdrop-blur-2xl min-w-[180px] max-w-[230px] ring-1 ring-black/50">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
                    <span className="font-bold text-white text-xs tracking-tight">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold opacity-80">
                      {item.enTitle}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {item.desc}
                  </p>
                  {item.badge && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{isFa ? 'وضعیت:' : 'Status:'}</span>
                      <span className={`px-1.5 py-0.5 rounded-md border font-mono font-bold text-[9px] ${item.badgeStyle}`}>
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
