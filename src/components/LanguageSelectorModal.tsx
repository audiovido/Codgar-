import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Globe, X } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export function LanguageSelectorModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}: Props) {
  const t = translations[currentLanguage] || translations.en;
  const isFa = currentLanguage === 'fa';

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-Screen Backdrop Layer: Blurs everything behind the modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-slate-950/25 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />

          {/* Floating Top Card Overlay - Matching Profile and Siri Record design */}
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.95,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.96,
              filter: 'blur(6px)',
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 26,
            }}
            id="language-selector-dropdown-menu"
            className={`fixed top-16 sm:top-18 ${
              isFa ? 'left-4 sm:left-24' : 'right-4 sm:right-24'
            } z-[9999] w-[90%] sm:w-88 max-w-sm pointer-events-auto select-none`}
            dir={isFa ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-3xl bg-white/95 border border-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 sm:p-5 overflow-hidden flex flex-col gap-3.5">
              {/* Header: Title, Locales Count & Close Button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {t.selectLanguage}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {SUPPORTED_LANGUAGES.length} {t.localesCount}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  title={t.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Language Options List */}
              <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-0.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        onClose();
                      }}
                      className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 scale-[1.01]'
                          : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 hover:shadow-xs border border-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-2xs ${
                            isActive ? 'bg-white/20' : 'bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          <span>{lang.flag}</span>
                        </div>

                        <div className={isFa ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                              {lang.nativeName}
                            </span>
                          </div>
                          <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                            {lang.name}
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{lang.code.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/60">
                          {lang.code.toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
