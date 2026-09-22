import React, { useEffect, useState } from 'react';
import { voiceAgent, VoiceState } from '../services/voiceAgent';
import {
  Mic,
  MicOff,
  Send,
  X,
  Bot,
  Type,
  Check,
  Volume2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
  onInsertToInput?: (text: string) => void;
  language: string;
}

export function SiriLiveSpeakerOverlay({
  isOpen,
  onClose,
  onSendTranscript,
  onInsertToInput,
  language = 'fa',
}: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isSpeaking: false,
    isListening: false,
    audioLevel: 0,
  });
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const isFa = language === 'fa';

  useEffect(() => {
    if (!isOpen) return;

    setTranscript('');
    setInterimText('');
    setCopiedSuccess(false);

    const unsub = voiceAgent.subscribe((st) => {
      setVoiceState(st);
    });

    voiceAgent.startListening(
      language,
      (text: string, isFinal: boolean) => {
        if (isFinal) {
          setTranscript(text);
          setInterimText('');
        } else {
          setInterimText(text);
        }
      },
      (err) => {
        console.warn('Codgar Voice Recorder Error:', err);
      }
    );

    return () => {
      unsub();
      voiceAgent.stopListening();
    };
  }, [isOpen, language]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDisplay = transcript || interimText;

  const handleInsert = () => {
    const textToInsert = currentDisplay.trim();
    if (textToInsert) {
      if (onInsertToInput) {
        onInsertToInput(textToInsert);
      }
      setCopiedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleSendDirectly = () => {
    const textToSend = currentDisplay.trim();
    if (textToSend) {
      onSendTranscript(textToSend);
      onClose();
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[480px] rounded-[28px] ice-glass-card bg-white/85 backdrop-blur-3xl border border-white/95 shadow-[0_25px_70px_rgba(37,99,235,0.25),inset_0_1px_2px_rgba(255,255,255,0.95)] p-5 select-none dir-auto">
      {/* Top Bar: Codgar Brand Icon with Listening Ears Animation & Live Status */}
      <div className="flex items-center justify-between mb-3 border-b border-blue-200/60 pb-3">
        <div className="flex items-center gap-3">
          {/* Codgar Signature Bot Icon with Animated Listening Ears */}
          <div className="relative flex items-center justify-center py-1 px-3">
            {/* Left Listening Ear Soundwaves */}
            <div className="flex items-center gap-0.5 mr-1.5 h-5">
              <span className={`w-1 rounded-full bg-cyan-400 transition-all duration-300 ${voiceState.isListening ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'}`} />
              <span className={`w-1 rounded-full bg-blue-500 transition-all duration-300 ${voiceState.isListening ? 'h-5 animate-bounce' : 'h-2 opacity-50'}`} style={{ animationDelay: '150ms' }} />
            </div>

            {/* Main Robot Head with Color Breathing Pulse */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 p-[1.5px] shadow-md flex items-center justify-center transition-all duration-500">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-300">
                <Bot className={`w-5 h-5 transition-all duration-700 ${voiceState.isListening ? 'text-cyan-300 animate-pulse scale-105' : 'text-blue-400'}`} />
              </div>
              {/* Outer Glowing Liquid Aura */}
              {voiceState.isListening && (
                <span className="absolute -inset-1.5 rounded-2xl border border-cyan-400/50 animate-ping opacity-60 pointer-events-none" />
              )}
            </div>

            {/* Right Listening Ear Soundwaves */}
            <div className="flex items-center gap-0.5 ml-1.5 h-5">
              <span className={`w-1 rounded-full bg-blue-500 transition-all duration-300 ${voiceState.isListening ? 'h-5 animate-bounce' : 'h-2 opacity-50'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-1 rounded-full bg-cyan-400 transition-all duration-300 ${voiceState.isListening ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'}`} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
              <span>{isFa ? 'دستیار صوتی و ضبط ویس کدگر' : 'Codgar Voice Assistant'}</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-900 font-bold">
                {isFa ? 'تشخیص فارسی' : 'EN'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isFa
                  ? 'میکروفون فعال است // در حال دریافت ویس...'
                  : 'Microphone Active // Listening...'}
              </span>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer border border-slate-200"
          title={isFa ? 'بستن' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lightweight Audio Wave Indicator Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50/90 border border-blue-200/80 my-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-[10px] font-mono text-blue-900 font-semibold">
            {isFa ? 'شدت صدا:' : 'Audio:'} {Math.round(voiceState.audioLevel * 100)}%
          </span>
        </div>
        {/* Lightweight Audio Wave Bars */}
        <div className="flex items-center gap-1 h-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
            const heightMultiplier = (bar % 4) + 1;
            const barHeight = Math.max(3, Math.min(14, voiceState.audioLevel * 20 * heightMultiplier));
            return (
              <span
                key={bar}
                className="w-1 rounded-full bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-75"
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Live Transcribed Speech Output Box */}
      <div
        className="w-full my-3 p-3 rounded-2xl bg-slate-50 border border-blue-200/90 text-center min-h-[60px] max-h-[120px] overflow-y-auto flex items-center justify-center shadow-inner"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {currentDisplay ? (
          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed break-words font-sans">
            « {currentDisplay} »
          </p>
        ) : (
          <p className="text-xs text-slate-500 font-sans animate-pulse font-medium">
            {isFa
              ? 'صحبت کنید... ویس شما به متن فارسی تبدیل می‌شود'
              : 'Speak now... Your voice will be transcribed to text'}
          </p>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-blue-100">
        <button
          onClick={() => {
            if (voiceState.isListening) {
              voiceAgent.stopListening();
            } else {
              voiceAgent.startListening(
                language,
                (text, isFinal) => {
                  if (isFinal) setTranscript(text);
                  else setInterimText(text);
                }
              );
            }
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
            voiceState.isListening
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {voiceState.isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-rose-600" />
              <span>{isFa ? 'توقف' : 'Stop'}</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFa ? 'شروع دوباره' : 'Record'}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Button: Insert into "Type Your Message" Box */}
          <button
            onClick={handleInsert}
            disabled={!currentDisplay.trim()}
            className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/90 text-blue-900 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer active:scale-95 shadow-2xs"
            title={isFa ? 'قرار دادن در کادر پیام' : 'Insert into message box'}
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isFa ? 'درج شد' : 'Inserted'}</span>
              </>
            ) : (
              <>
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>{isFa ? 'درج در کادر تایپ' : 'Insert to box'}</span>
              </>
            )}
          </button>

          {/* Button: Send Directly to Codgar */}
          <button
            onClick={handleSendDirectly}
            disabled={!currentDisplay.trim()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 disabled:opacity-40 transition cursor-pointer active:scale-95"
          >
            <span>{isFa ? 'ارسال به کدگر' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
