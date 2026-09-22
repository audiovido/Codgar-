import React, { useEffect, useState } from 'react';
import { voiceAgent, VoiceState } from '../services/voiceAgent';
import {
  Mic,
  MicOff,
  Send,
  X,
  Type,
  Check,
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

  // Real voice power calculation (scale dynamically with microphone amplitude)
  const powerLevel = voiceState.isListening ? Math.max(0.1, voiceState.audioLevel) : 0;
  const pulseScale = 1 + Math.min(0.5, powerLevel * 0.8);
  const glowOpacity = Math.min(0.9, 0.3 + powerLevel * 0.7);

  return (
    <div
      id="compact-voice-overlay"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[360px] rounded-[24px] bg-gradient-to-b from-white/95 via-sky-50/80 to-blue-50/90 backdrop-blur-2xl border border-white/95 shadow-[0_16px_40px_rgba(37,99,235,0.2),inset_0_1.5px_2px_rgba(255,255,255,1)] p-3.5 select-none dir-auto font-sans"
    >
      {/* Top Header: Responsive Live Mic Power Indicator & Close */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/50">
        <div className="flex items-center gap-2">
          {/* Animated 3D Reactive Glowing Mic Circle */}
          <div className="relative flex items-center justify-center">
            {/* Dynamic Sound Aura (scales & glows with real voice power) */}
            <span
              className="absolute w-8 h-8 rounded-full bg-blue-500/30 blur-xs transition-transform duration-75"
              style={{
                transform: `scale(${pulseScale})`,
                opacity: glowOpacity,
              }}
            />
            {/* Inner Glowing Icon */}
            <div
              className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-75 shadow-xs ${
                voiceState.isListening
                  ? 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Mic className="w-3.5 h-3.5 animate-none" />
            </div>
          </div>

          {/* Voice Amplitude Visualizer Bars */}
          <div className="flex items-center gap-1 h-3.5">
            {[0.4, 0.8, 1.2, 0.9, 0.5].map((factor, idx) => {
              const barHeight = Math.max(
                3,
                Math.min(14, voiceState.isListening ? 3 + powerLevel * 14 * factor : 3)
              );
              return (
                <span
                  key={idx}
                  className="w-1 rounded-full bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-75"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>

          <span className="text-[11px] font-sans font-bold text-blue-950 mr-1">
            {isFa ? 'در حال شنیدن...' : 'Listening...'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-white shadow-2xs transition-all duration-100 active:scale-95 cursor-pointer"
          title={isFa ? 'بستن' : 'Close'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Voice Transcript Display Box (Zero delay, high-contrast) */}
      <div
        className="w-full my-1.5 px-3.5 py-2.5 rounded-xl bg-white/85 border border-blue-100/90 text-center min-h-[46px] max-h-[80px] overflow-y-auto flex items-center justify-center shadow-[inset_0_1.5px_3px_rgba(37,99,235,0.04)]"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {currentDisplay ? (
          <p className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-relaxed break-words font-sans">
            « {currentDisplay} »
          </p>
        ) : (
          <p className="text-xs text-slate-400 font-sans font-normal">
            {isFa ? 'صحبت کنید... ویس بلادرنگ تایپ می‌شود' : 'Speak clearly into the microphone...'}
          </p>
        )}
      </div>

      {/* Action Footer: Unified Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100/60 items-center">
        {/* Button 1: Toggle / Pause Recording */}
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
          className={`h-8.5 px-2 rounded-xl text-xs font-sans font-bold transition-all duration-100 flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 whitespace-nowrap ${
            voiceState.isListening
              ? 'bg-gradient-to-b from-rose-50 to-rose-100/80 text-rose-600 border-rose-200/90 shadow-2xs hover:brightness-95'
              : 'bg-gradient-to-b from-white to-blue-50/80 text-slate-700 border-blue-100/80 shadow-2xs hover:bg-white'
          }`}
        >
          {voiceState.isListening ? (
            <>
              <MicOff className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{isFa ? 'توقف' : 'Stop'}</span>
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{isFa ? 'شروع' : 'Start'}</span>
            </>
          )}
        </button>

        {/* Button 2: Insert into Chat Box */}
        <button
          onClick={handleInsert}
          disabled={!currentDisplay.trim()}
          className="h-8.5 px-2 rounded-xl bg-gradient-to-b from-white to-sky-50/90 hover:from-white hover:to-sky-100/90 border border-sky-200/80 text-blue-950 font-sans font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all duration-100 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
          title={isFa ? 'درج در کادر تایپ' : 'Insert into chat input'}
        >
          {copiedSuccess ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{isFa ? 'درج شد' : 'Inserted'}</span>
            </>
          ) : (
            <>
              <Type className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{isFa ? 'درج در متن' : 'Insert'}</span>
            </>
          )}
        </button>

        {/* Button 3: Send Directly to Codgar */}
        <button
          onClick={handleSendDirectly}
          disabled={!currentDisplay.trim()}
          className="h-8.5 px-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] disabled:opacity-40 transition-all duration-100 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <span>{isFa ? 'ارسال' : 'Send'}</span>
          <Send className="w-3 h-3 shrink-0" />
        </button>
      </div>
    </div>
  );
}
