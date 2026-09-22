import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, CheckCircle2, X, Terminal, Cpu, Sparkles, Mail, GripHorizontal } from 'lucide-react';
import { Language } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentProject: string;
}

export function ProfileModal({ isOpen, onClose, language, currentProject }: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const isFa = language === 'fa';

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-md ice-glass-window border border-white/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-800 bg-white/95 cursor-default select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/60 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center text-white font-black text-sm shrink-0">
                K
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{isFa ? 'حساب کاربری کیان' : 'Kian // Developer Profile'}</span>
                  <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {isFa ? 'فعال' : 'Pro'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">arminsh00@gmail.com</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
              title={isFa ? 'بستن' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isFa ? 'سطح دسترسی سیستم' : 'Access Level'}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Superuser / Full Studio IDE</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isFa ? 'فضای کاری فعال' : 'Active Workspace'}</span>
                <span className="text-slate-800 font-mono font-medium">{currentProject || '/workspace'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isFa ? 'هوش‌مصنوعی متصل' : 'Connected Model'}</span>
                <span className="text-blue-600 font-semibold">Gemini 2.5 / Fast Reasoning</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed font-sans">
              {isFa
                ? 'نشست فعال ابری هوش مصنوعی با قابلیت اجرای زنده کد، چرخش هوشمند کلید API، کنترل صوتی سیری و هماهنگی بلادرنگ گیت.'
                : 'Active AI Cloud session enabled with live code execution, smart API key rotation, voice speech interface, and real-time git diffing.'}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/60 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full coral-pill-btn text-white text-xs font-bold transition cursor-pointer shadow-md"
            >
              {isFa ? 'بستن' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
