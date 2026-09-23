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
        ? 'bg-amber-500/15 text-amber-700 border-amber-300 animate-pulse'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      iconContainerBg: 'bg-indigo-50/90 text-indigo-600 border-indigo-100',
      active: isQueueActive,
      hasDot: false,
      dotColor: isExecuting ? 'bg-amber-500' : 'bg-indigo-500',
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
      desc: isFa ? 'مشاهده زنده سایت و برنامه‌های ساخته شده' : 'Interactive live rendering of built apps & components',
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
      id: 'billing',
      title: isFa ? 'امور مالی و ارتقای اشتراک' : 'Billing & Plans',
      enTitle: 'Billing',
      desc: isFa ? '۵ ساعت رایگان روزانه، خرید ساعت بیشتر و پلن‌های نامحدود' : '5h free daily, buy extra hours & unlimited AI plans',
      icon: <CreditCard className="w-4 h-4" />,
      action: onOpenBilling,
      badge: isFa ? '۵ساعت فری' : '5h Free',
      badgeStyle: isBillingActive
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold border-emerald-400 shadow-xs'
        : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      iconContainerBg: isBillingActive
        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 border-emerald-400 shadow-xs'
        : 'bg-emerald-50/90 text-emerald-700 border-emerald-200 shadow-2xs',
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
          return (
            <div key={item.id} className="relative group/nav flex items-center justify-center w-full">
              <button
                type="button"
                onClick={item.action}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
                  item.active
                    ? 'shadow-md shadow-emerald-500/20 scale-105'
                    : 'hover:scale-102 hover:shadow-sm'
                }`}
              >
                {/* 3D Glass Surface */}
                <div
                  className={`w-full h-full rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    item.active
                      ? item.iconContainerBg
                      : 'bg-white/80 text-slate-600 border-white/90 hover:bg-white hover:text-blue-600 hover:border-blue-200'
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

              {/* Flyout Tooltip Card */}
              <div
                className={`absolute ${
                  isFa
                    ? 'right-full mr-3.5 origin-right'
                    : 'left-full ml-3.5 origin-left'
                } top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-1 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 transition-all duration-200 z-50`}
              >
                <div className="ice-glass-card rounded-2xl p-2.5 px-3 shadow-xl border border-white/90 min-w-[170px] max-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-xs tracking-tight">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
