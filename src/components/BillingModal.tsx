import { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Gift,
  Check,
  Star,
  Coins,
  X,
  Layers,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  onTopUpSuccess?: (hoursAdded: number) => void;
}

export function BillingModal({
  isOpen,
  onClose,
  language = 'fa',
  onTopUpSuccess,
}: Props) {
  const isFa = language === 'fa';

  // Real-time dynamic quota state
  const [dailyFreeMinutes, setDailyFreeMinutes] = useState(300); // 5 hours = 300 mins
  const [usedMinutesToday, setUsedMinutesToday] = useState(75); // 1h 15m used
  const [purchasedHours, setPurchasedHours] = useState(15);
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'unlimited'>('free');
  const [selectedCurrency, setSelectedCurrency] = useState<'irt' | 'usd'>('irt');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Calculate free hours remaining
  const remainingFreeMinutes = Math.max(0, dailyFreeMinutes - usedMinutesToday);
  const freeRemainingHours = (remainingFreeMinutes / 60).toFixed(1);
  const freePercent = Math.round((remainingFreeMinutes / dailyFreeMinutes) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePurchaseHours = (hours: number, name: string) => {
    setIsProcessing(`hours_${hours}`);
    setTimeout(() => {
      setPurchasedHours((prev) => prev + hours);
      setIsProcessing(null);
      showToast(
        isFa
          ? `🎉 بسته ${hours} ساعته با موفقیت به اعتبار حساب شما افزوده شد!`
          : `🎉 Successfully added ${hours} hours to your balance!`
      );
      if (onTopUpSuccess) onTopUpSuccess(hours);
    }, 800);
  };

  const handleSubscribePlan = (plan: 'pro' | 'unlimited', planName: string) => {
    setIsProcessing(plan);
    setTimeout(() => {
      setActivePlan(plan);
      setIsProcessing(null);
      showToast(
        isFa
          ? `🚀 اشتراک شما به سطح ${planName} ارتقا یافت!`
          : `🚀 Successfully upgraded to ${planName} tier!`
      );
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="w-full max-w-4xl bg-[#070b16] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] text-slate-100 font-sans relative"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-[#0e1526] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {isFa ? 'امور مالی و ارتقای اشتراک کُدگر' : 'Codgar Billing & Subscriptions'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  <span>{isFa ? '۵ ساعت رایگان روزانه فعال است' : '5h Free Daily Active'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa
                  ? 'مدیریت مصرف ساعت، سهمیه روزانه و بسته‌های شارژ زمان کُدگر'
                  : 'Manage runtime hours, daily free allowance and credit boosts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCurrency('irt')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedCurrency === 'irt' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400'
                }`}
              >
                تومان
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('usd')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedCurrency === 'usd' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400'
                }`}
              >
                USDT ($)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer border border-white/10"
              title={isFa ? 'بستن' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast notification */}
        {toastMessage && (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 1. DAILY 5 HOURS FREE ALLOCATION BANNER                       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-950/40 via-[#0c182b] to-[#070e1b] border border-emerald-500/30 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFa ? 'سهمیه روزانه رایگان شما' : 'Daily Free Allowance'}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {isFa
                    ? 'هر روز، ۵ ساعت کارکرد رایگان کامل با کُدگر'
                    : 'Every Single Day: 5 Hours of Free AI Coding'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa
                    ? 'شما در هر ۲۴ ساعت، ۵ ساعت کامل زمان پردازش و هوش مصنوعی رایگان برای ساخت سایت، کامپایل زنده، تغییرات کد و ترمینال دارید. این سهمیه هر شب ساعت ۰۰:۰۰ بامداد به صورت خودکار شارژ و بازنشانی می‌شود.'
                    : 'You receive 5 full hours of free AI compute every day for live code compilation, app building, and terminal execution. Resets automatically at 00:00 midnight.'}
                </p>
              </div>

              {/* Progress & Live Gauge */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 sm:p-5 min-w-[280px] space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isFa ? 'باقی‌مانده از ۵ ساعت امروز:' : 'Left Today:'}</span>
                  </span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {freeRemainingHours} {isFa ? 'ساعت' : 'hrs'} ({freePercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${freePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>{isFa ? 'مصرف‌شده: ۱ ساعت و ۱۵ دقیقه' : 'Used: 1h 15m'}</span>
                  <span className="text-cyan-400 flex items-center gap-1 font-mono">
                    <RefreshCw className="w-3 h-3" />
                    {isFa ? 'ریست: ۰۰:۰۰' : 'Resets: 00:00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 2. HOURLY TOP-UP BOOSTERS (خرید ساعت بیشتر)                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{isFa ? 'خرید ساعت و زمان بیشتر (بدون تاریخ انقضا)' : 'Buy Extra Hours (Never Expiring)'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isFa
                    ? 'اگر به زمانی بیشتر از ۵ ساعت رایگان روزانه نیاز دارید، می‌توانید ساعت اضافه تهیه کنید. این ساعت‌ها ذخیره شده و منقضی نمی‌شوند.'
                    : 'Need more than 5 free hours per day? Top-up extra hours that never expire.'}
                </p>
              </div>

              <div className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-xl border border-white/10 font-mono">
                {isFa ? `اعتبار ذخیره: ${purchasedHours} ساعت` : `Banked: ${purchasedHours} hrs`}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Pack 1: 10 Hours */}
              <div className="rounded-2xl bg-[#0b1222] border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                      {isFa ? 'بسته استارتر' : 'Starter Boost'}
                    </span>
                    <Coins className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white">+۱۰ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {isFa ? 'مناسب پروژه‌ها و تسک‌های روزمره' : 'Great for regular coding tasks'}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-lg font-bold text-white">
                      {selectedCurrency === 'irt' ? '۸۹,۰۰۰ تومان' : '$1.80 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchaseHours(10, '۱۰ ساعته')}
                  disabled={isProcessing === 'hours_10'}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isProcessing === 'hours_10' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isFa ? 'افزایش ۱۰ ساعت' : 'Add 10 Hours'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Pack 2: 25 Hours (POPULAR) */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0f1f38] to-[#0a1424] border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/40 p-4 transition-all duration-200 flex flex-col justify-between relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] shadow-sm uppercase tracking-wider">
                  {isFa ? 'محبوب‌ترین و به‌صرفه' : 'Most Popular'}
                </div>
                <div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                      {isFa ? 'بسته حرفه‌ای' : 'Pro Boost'}
                    </span>
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white">+۲۵ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {isFa ? 'تخفیف ویژه + اولویت در کامپایل' : 'Special discount & priority queue'}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-lg font-bold text-emerald-300">
                      {selectedCurrency === 'irt' ? '۱۸۹,۰۰۰ تومان' : '$3.90 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchaseHours(25, '۲۵ ساعته')}
                  disabled={isProcessing === 'hours_25'}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  {isProcessing === 'hours_25' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isFa ? 'افزایش ۲۵ ساعت' : 'Add 25 Hours'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Pack 3: 60 Hours */}
              <div className="rounded-2xl bg-[#0b1222] border border-white/10 hover:border-purple-500/40 p-4 transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40">
                      {isFa ? 'بسته مستر' : 'Master Pack'}
                    </span>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white">+۶۰ {isFa ? 'ساعت' : 'Hours'}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {isFa ? 'برای شرکت‌ها و تیم‌های نرم‌افزاری' : 'For teams and heavy production'}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-lg font-bold text-white">
                      {selectedCurrency === 'irt' ? '۳۸۰,۰۰۰ تومان' : '$7.90 USDT'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchaseHours(60, '۶۰ ساعته')}
                  disabled={isProcessing === 'hours_60'}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isProcessing === 'hours_60' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isFa ? 'افزایش ۶۰ ساعت' : 'Add 60 Hours'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 3. MONTHLY SUBSCRIPTION TIERS (کدکس / کلاد / فریباف)          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pt-2">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'سطوح اشتراک ماهانه کُدگر' : 'Monthly Subscription Tiers'}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa
                  ? 'برگرفته از ساختار اشتراک استاندارد بهترین پلتفرم‌های ابری (Codex, Claude Pro, Replit)'
                  : 'Inspired by leading cloud IDE & AI platforms'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: Free Daily */}
              <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{isFa ? 'پایه / روزانه' : 'Community'}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 font-bold">
                    {isFa ? 'پلن فعلی شما' : 'Active Plan'}
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {isFa ? 'رایگان' : 'Free'} <span className="text-xs text-slate-400 font-normal">/ {isFa ? 'همیشگی' : 'forever'}</span>
                </div>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isFa ? '۵ ساعت کارکرد رایگان در هر روز' : '5 hours free compute daily'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'پیش‌نمایش زنده کامپایلر' : 'Live sandbox preview'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'ترمینال و تغییرات کد' : 'Integrated terminal'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'ریست خودکار ساعت ۰۰:۰۰' : 'Auto reset at midnight'}</span>
                  </li>
                </ul>
                <button
                  type="button"
                  disabled
                  className="w-full py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-bold border border-white/10 opacity-70 cursor-default"
                >
                  {isFa ? 'فعال و در حال استفاده' : 'Currently Active'}
                </button>
              </div>

              {/* Tier 2: Pro Developer */}
              <div className="rounded-2xl bg-gradient-to-b from-[#0b172a] to-[#070e1b] border border-cyan-500/40 p-5 space-y-4 shadow-lg shadow-cyan-950/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm">{isFa ? 'توسعه‌دهنده حرفه‌ای (Pro)' : 'Pro Developer'}</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40 font-bold">
                    {isFa ? 'پیشنهادی' : 'Recommended'}
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {selectedCurrency === 'irt' ? '۲۷۰,۰۰۰ تومان' : '$6.90'}
                  <span className="text-xs text-slate-400 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                </div>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isFa ? '۵ ساعت روزانه + ۶۰ ساعت اعتبار ماهانه' : '5h daily + 60h monthly booster'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isFa ? 'اولویت صفی لحظه‌ای (Zero Queue)' : 'Instant zero-queue access'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isFa ? 'اتصال مستقیم و سینک به GitHub' : 'Direct GitHub sync & push'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isFa ? 'حالت استدلال و ریفکتورینگ عمیق' : 'Deep reasoning and debug agent'}</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribePlan('pro', 'حرفه‌ای (Pro)')}
                  disabled={isProcessing === 'pro'}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isProcessing === 'pro' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : activePlan === 'pro' ? (
                    <span>{isFa ? 'پلن فعال شما' : 'Active Tier'}</span>
                  ) : (
                    <span>{isFa ? 'ارتقا به پلن حرفه‌ای' : 'Upgrade to Pro'}</span>
                  )}
                </button>
              </div>

              {/* Tier 3: Unlimited Enterprise */}
              <div className="rounded-2xl bg-gradient-to-b from-[#161226] to-[#070b16] border border-amber-500/40 p-5 space-y-4 shadow-lg shadow-amber-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">{isFa ? 'نامحدود (Enterprise)' : 'Unlimited Master'}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40 font-bold">
                    VIP
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {selectedCurrency === 'irt' ? '۵۹۰,۰۰۰ تومان' : '$14.90'}
                  <span className="text-xs text-slate-400 font-normal"> / {isFa ? 'ماهانه' : 'mo'}</span>
                </div>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFa ? 'ساعات مصرف کاملاً نامحدود و بدون سقف' : 'Unlimited runtime & AI compute'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFa ? 'سرورهای اختصاصی پرسرعت GPU' : 'Dedicated high-speed GPU sandbox'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFa ? 'استفاده تیمی و همزمان چندین کاربر' : 'Multi-seat collaborative workspace'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFa ? 'پشتیبانی مستقیم مهندسی ۲۴/۷' : '24/7 dedicated engineering support'}</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribePlan('unlimited', 'نامحدود (Enterprise)')}
                  disabled={isProcessing === 'unlimited'}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isProcessing === 'unlimited' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : activePlan === 'unlimited' ? (
                    <span>{isFa ? 'پلن فعال شما' : 'Active Tier'}</span>
                  ) : (
                    <span>{isFa ? 'ارتقا به پلن نامحدود' : 'Get Unlimited'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security & Guarantee Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-slate-400 text-xs gap-3 border-t border-white/5">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'پرداخت امن با ضمانت بازگشت وجه' : 'Secure payment with money-back guarantee'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'ران‌تایم استاندارد لینوکس و کانتینری' : 'Containerized Linux runtime'}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {isFa ? 'کُدگر نگارش ۴.۰ // زیرساخت ابری و توکن بی‌نهایت' : 'Codgar 4.0 // Cloud Engine'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
