import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { AgentMode, Message } from '../types';
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Copy,
  Check,
  Bot,
  User,
  X,
  Terminal,
  Clock,
  Calendar,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TranslationDict, Language, translations } from '../utils/translations';

function CodeBlockWithCopy({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && node.props && node.props.children) {
      return extractText(node.props.children);
    }
    return '';
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rawCode = extractText(children);
    if (rawCode) {
      navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="relative group/code my-3.5 overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/30 text-sky-100 dir-ltr text-left font-mono text-[11px] sm:text-xs leading-relaxed max-w-full shadow-md"
      dir="ltr"
    >
      <div className="sticky top-0 z-20 flex items-center justify-between px-3.5 py-2 bg-slate-800/95 backdrop-blur-md border-b border-white/15 text-[10px] font-mono text-slate-300 select-none shadow-sm">
        <span className="flex items-center gap-1.5 text-sky-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>کدگر // Terminal & Code Log</span>
        </span>

        {/* Copy Button for code block */}
        <button
          type="button"
          onClick={handleCopyCode}
          className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-sky-100 hover:text-white font-sans text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
          title="کپی کردن این کد / Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-emerald-300 font-bold">کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-sky-200" />
              <span>کپی کد</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-3.5 overflow-x-auto whitespace-pre-wrap break-all font-mono text-slate-100 select-text bg-slate-950/50 max-h-[500px] overflow-y-auto">
        {children}
      </pre>
    </div>
  );
}

interface Props {
  messages: Message[];
  onSendMessage: (text: string, mode: AgentMode) => void;
  isExecuting: boolean;
  onOpenCodeDrawer?: () => void;
  onOpenSettings?: () => void;
  onOpenSiriVoice?: () => void;
  isRecordingVoice?: boolean;
  inputText?: string;
  onInputTextChange?: (text: string) => void;
  isStreamingTyping?: boolean;
  streamingText?: string;
  t?: TranslationDict;
  language?: Language;
  onTogglePreview?: () => void;
  isPreviewOpen?: boolean;
}

export function CodedAiChatCard({
  messages,
  onSendMessage,
  isExecuting,
  onOpenSiriVoice,
  isRecordingVoice = false,
  inputText: controlledInputText,
  onInputTextChange,
  isStreamingTyping = false,
  streamingText = '',
  t: propT,
  language = 'en',
  onTogglePreview,
  isPreviewOpen = false,
}: Props) {
  const t = propT || translations[language] || translations.en;
  const isRTL = language === 'fa';
  const [internalInputText, setInternalInputText] = useState('');
  const inputText = controlledInputText !== undefined ? controlledInputText : internalInputText;
  const setInputText = onInputTextChange || setInternalInputText;

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages or streaming typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isStreamingTyping]);

  const handleSend = () => {
    const prompt = inputText.trim();
    if (!prompt || isExecuting) return;
    onSendMessage(prompt, 'agent');
    setInputText('');
    setAttachedFileName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const prefix = inputText ? `${inputText} ` : '';
      setInputText(`${prefix}[File: ${file.name}]`);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      id="grok-chat-container"
      layout="position"
      initial={false}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 260,
          damping: 25,
          mass: 0.9,
        },
        duration: 0.45,
      }}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, height',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'subpixel-antialiased',
      }}
      className="w-full max-w-[96%] xl:max-w-[1380px] rounded-[32px] ice-glass-window select-none relative z-30 mx-auto border border-white/85 backdrop-blur-3xl flex flex-col justify-between transform-gpu transition-all duration-300 shadow-[0_25px_80px_rgba(37,99,235,0.18)] h-[85vh] max-h-[880px] min-h-[500px] p-4 sm:p-7"
    >
      {/* 1. Sleek Window Header: Clean Claude/Cursor-Style Agent Bar */}
      <div
        className="flex items-center justify-between pb-2.5 border-b border-blue-200/60 shrink-0"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Left: Window Traffic Lights & Agent Branding */}
        <div className="flex items-center gap-2.5">
          {/* Minimalist Mac Traffic Lights */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fb7185] shadow-[0_0_6px_rgba(251,113,133,0.5)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] shadow-[0_0_6px_rgba(148,163,184,0.4)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
          </div>

          <div
            className={`w-7 h-7 rounded-xl p-[1px] flex-shrink-0 transition-all duration-500 ${
              isExecuting
                ? 'bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 animate-codgar-thinking shadow-md'
                : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
            }`}
          >
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center text-blue-600">
              <Bot
                className={`w-4 h-4 text-blue-600 ${
                  isExecuting ? 'animate-pulse' : ''
                }`}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-black text-xs sm:text-sm tracking-wide flex items-center">
                {isRTL ? (
                  <span className="flex items-center">
                    <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 bg-clip-text text-transparent font-black drop-shadow-[0_2px_6px_rgba(37,99,235,0.25)]">
                      کد
                    </span>
                    <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-indigo-600 bg-clip-text text-transparent font-black mr-0.5 drop-shadow-[0_2px_6px_rgba(6,182,212,0.25)]">
                      گر
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 bg-clip-text text-transparent font-black drop-shadow-[0_2px_6px_rgba(37,99,235,0.25)]">
                      COD
                    </span>
                    <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-indigo-600 bg-clip-text text-transparent font-black drop-shadow-[0_2px_6px_rgba(6,182,212,0.25)]">
                      GAR
                    </span>
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Clean Header Controls & Live Date Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/70 text-blue-900 text-[10px] font-medium shadow-2xs">
            <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
            <span>
              {new Intl.DateTimeFormat(isRTL ? 'fa-IR-u-ca-persian' : 'en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }).format(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable 1-on-1 Chat Stream */}
      <div className="flex-1 overflow-y-auto my-2 space-y-2.5 sm:space-y-3 pr-2 pl-1 select-text custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user' || msg.sender === 'user';
          const textContent = msg.content || msg.text || '';

          // In Persian/RTL: User message is on the RIGHT (attached to user's blue avatar), Agent message is on the LEFT
          // In English/LTR: User message is on the right, Agent is on the left
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser
                  ? isRTL
                    ? 'flex-row justify-start' // In RTL container: start is RIGHT edge, so avatar is on right, bubble is immediately next to it
                    : 'flex-row-reverse justify-start' // In LTR container: user on right
                  : isRTL
                  ? 'flex-row-reverse justify-start' // In RTL container: agent is on LEFT
                  : 'flex-row justify-start' // In LTR container: agent is on LEFT
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* User Avatar (Blue Glossy) */}
              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-300 p-[1px] shadow-[0_4px_12px_rgba(59,130,246,0.22)] shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white border border-white/50">
                    <User className="w-3.5 h-3.5 text-blue-50" />
                  </div>
                </div>
              )}

              {/* Agent Avatar (Bot Icon) */}
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-sm shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-600">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`relative group w-fit max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all overflow-hidden ${
                  isUser
                    ? 'user-glass-bubble-3d text-white'
                    : 'ice-glass-card text-slate-800 shadow-sm border border-white/90'
                }`}
              >
                <div
                  className={`markdown-body w-full overflow-hidden font-sans select-text ${
                    isUser ? 'text-white font-medium' : 'text-slate-800'
                  }`}
                  dir="auto"
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p
                          className="mb-2 last:mb-0 leading-relaxed font-sans text-xs sm:text-sm break-words overflow-wrap-anywhere dir-auto"
                          dir="auto"
                        >
                          {children}
                        </p>
                      ),
                      pre: ({ children }) => <CodeBlockWithCopy>{children}</CodeBlockWithCopy>,
                      code: ({ inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isBlock = !inline && (match || (typeof children === 'string' && children.includes('\n')));

                        if (isBlock) {
                          return (
                            <code className="font-mono text-xs text-sky-200 break-all block py-1" {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <code
                            className="px-2 py-0.5 rounded-lg bg-blue-100/95 text-blue-950 border border-blue-300/90 font-mono text-[11px] sm:text-xs dir-ltr inline-block mx-0.5 break-all font-bold shadow-2xs"
                            dir="ltr"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      ul: ({ children }) => (
                        <ul className="list-disc pr-5 my-2 space-y-1 font-sans text-xs sm:text-sm dir-auto" dir="auto">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pr-5 my-2 space-y-1 font-sans text-xs sm:text-sm dir-auto" dir="auto">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed dir-auto" dir="auto">
                          {children}
                        </li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="font-bold text-base sm:text-lg my-2 text-slate-900 border-b border-blue-200/60 pb-1 dir-auto" dir="auto">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-bold text-sm sm:text-base my-2 text-slate-900 dir-auto" dir="auto">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-semibold text-xs sm:text-sm my-1.5 text-slate-800 dir-auto" dir="auto">
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {textContent}
                  </ReactMarkdown>
                </div>

                {/* Footer Bar: Date, Timestamp & Copy Whole Message */}
                <div
                  className={`mt-3 pt-2.5 flex items-center justify-between border-t ${
                    isUser ? 'border-white/25 text-blue-100' : 'border-blue-200/60 text-slate-500'
                  } text-[11px] select-none`}
                >
                  {/* Left: Clean Harmonious Date & Time Display */}
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 font-semibold opacity-90">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>
                      {new Date(msg.timestamp || Date.now()).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' - '}
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Right: Copy Whole Answer Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, textContent)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                      isUser
                        ? 'bg-white/20 hover:bg-white/30 text-white border border-white/40'
                        : 'bg-blue-50/90 hover:bg-blue-100 text-blue-900 border border-blue-200/90 shadow-2xs'
                    }`}
                    title={isRTL ? 'کپی کامل متن این پاسخ' : 'Copy entire answer text'}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{isRTL ? 'کامل کپی شد' : 'Copied All'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isRTL ? 'کپی کل پاسخ' : 'Copy All'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* In English LTR: User Avatar on Right */}
              {!isRTL && isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-300 p-[1px] shadow-[0_4px_12px_rgba(59,130,246,0.22)] shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white border border-white/50">
                    <User className="w-3.5 h-3.5 text-blue-50" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Typewriter Bubble */}
        {isStreamingTyping && (
          <div
            className={`flex items-start gap-2.5 ${isRTL ? 'justify-end' : 'justify-start'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {isRTL ? (
              <>
                <div className="order-2 w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-sm shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-600">
                    <Bot className="w-3.5 h-3.5 animate-spin-slow" />
                  </div>
                </div>
                <div className="order-1 ice-glass-card text-slate-800 rounded-2xl p-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 text-right">
                  <p className="whitespace-pre-line font-sans leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 mr-1 animate-pulse align-middle" />
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-sm shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-600">
                    <Bot className="w-3.5 h-3.5 animate-spin-slow" />
                  </div>
                </div>
                <div className="ice-glass-card text-slate-800 rounded-2xl p-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90">
                  <p className="whitespace-pre-line font-sans leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle" />
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Active Thinking Indicator State */}
        {isExecuting && !isStreamingTyping && (
          <div
            className={`flex items-start gap-2.5 ${isRTL ? 'justify-end' : 'justify-start'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {isRTL ? (
              <>
                <div className="order-2 w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 p-[1px] shadow-md shrink-0 mt-0.5 animate-codgar-thinking">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-purple-600">
                    <Bot className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                </div>
                <div className="order-1 ice-glass-card text-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 text-right flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                  <span className="font-semibold text-slate-800">
                    کدگر در حال پردازش، اندیشیدن و اجرای دستور...
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 mr-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 p-[1px] shadow-md shrink-0 mt-0.5 animate-codgar-thinking">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-purple-600">
                    <Bot className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                </div>
                <div className="ice-glass-card text-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping shrink-0" />
                  <span className="font-semibold text-slate-800">
                    Codgar is thinking & executing prompt...
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached file chip if any */}
      {attachedFileName && !isExecuting && (
        <div
          className={`mb-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-700 flex items-center justify-between gap-2 max-w-sm shrink-0 ${
            isRTL ? 'mr-0 ml-auto' : 'ml-0 mr-auto'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <span className="truncate font-mono">📎 {attachedFileName}</span>
          <button
            type="button"
            onClick={() => setAttachedFileName(null)}
            className="text-blue-500 hover:text-blue-800 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Harmonious Light Liquid Glass Bottom Input Bar */}
      <div
        className="rounded-[24px] ice-glass-card bg-white/80 backdrop-blur-2xl p-2 flex items-center gap-2 border border-white/95 shadow-md shrink-0 relative transition-all duration-300 hover:border-blue-300/80"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-white/70 transition cursor-pointer shrink-0 active:scale-95"
          title={t.attachFile}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Main Text Input with Slightly Bolder Typography */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.typeMessagePlaceholder}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`flex-1 bg-transparent px-3 text-xs sm:text-sm font-sans font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition-all ${
            isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
          }`}
        />

        {/* Voice / Siri Mic Button */}
        <button
          type="button"
          onClick={onOpenSiriVoice}
          className={`p-2.5 rounded-full transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
            isRecordingVoice
              ? 'w-8 h-8 bg-gradient-to-tr from-cyan-400 via-pink-500 to-rose-400 text-white shadow-[0_0_20px_rgba(251,113,133,0.7)] animate-spin-slow'
              : 'text-slate-500 hover:text-blue-600 hover:bg-white/70'
          }`}
          title={t.liveVoice}
        >
          {isRecordingVoice ? (
            <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xs">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Coral Pink / Sky Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() && !attachedFileName}
          className="w-8.5 h-8.5 rounded-full coral-pill-btn disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md transition cursor-pointer shrink-0 active:scale-95"
          title={t.sendMessage}
        >
          <Send className={`w-3.5 h-3.5 fill-current transform ${isRTL ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </motion.div>
  );
}
