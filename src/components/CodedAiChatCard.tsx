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
  Code2,
  Cpu,
  Zap,
  MessageSquare,
  Sparkle,
  FolderOpen,
  FolderPlus,
  FolderCheck,
  CheckCircle2,
  HardDrive,
  Play,
  Layers,
  ArrowRight,
  RefreshCw,
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
  taskIntent?: 'chat' | 'coding';
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
  taskIntent = 'chat',
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
  const [activeMode, setActiveMode] = useState<'chat' | 'coding'>('chat');
  const [internalInputText, setInternalInputText] = useState('');
  const inputText = controlledInputText !== undefined ? controlledInputText : internalInputText;
  const setInputText = onInputTextChange || setInternalInputText;

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-resize textarea when text changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 38), 160)}px`;
    }
  }, [inputText]);

  // Autonomous Desktop & Screenshot Organizer State
  const [isOrganizingDesktop, setIsOrganizingDesktop] = useState<boolean>(false);
  const [desktopOrganizeResult, setDesktopOrganizeResult] = useState<{
    success: boolean;
    folder: string;
    count: number;
    files: string[];
    source: 'browser_fs' | 'local_bridge';
    message: string;
  } | null>(null);

  const handleAutonomousDesktopOrganize = async () => {
    setIsOrganizingDesktop(true);
    setDesktopOrganizeResult(null);

    const folderName = isRTL ? 'کدگر اسکرین شات' : 'Codgar Screenshots';

    // 1. Try Native Browser File System Access API (showDirectoryPicker)
    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'desktop',
        });

        // Create or get subfolder
        const destFolderHandle = await dirHandle.getDirectoryHandle(folderName, { create: true });
        const screenshotRegex = /(screenshot|screen shot|screen_shot|اسکرین|اسکرین‌شات|اسکرین شات|capture|snip|\.png$|\.jpg$|\.jpeg$)/i;

        const movedFiles: string[] = [];

        // Iterate directory entries
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && screenshotRegex.test(entry.name)) {
            try {
              const fileHandle = entry;
              const file = await fileHandle.getFile();
              
              // Write into subfolder
              const newFileHandle = await destFolderHandle.getFileHandle(entry.name, { create: true });
              const writable = await newFileHandle.createWritable();
              await writable.write(await file.arrayBuffer());
              await writable.close();

              // Delete original if browser supports removal
              if (typeof dirHandle.removeEntry === 'function') {
                try {
                  await dirHandle.removeEntry(entry.name);
                } catch {
                  // If browser restricts removal, file was copied safely
                }
              }

              movedFiles.push(entry.name);
            } catch (fileErr) {
              console.warn('Error organizing file:', fileErr);
            }
          }
        }

        const successResult = {
          success: true,
          folder: folderName,
          count: movedFiles.length,
          files: movedFiles,
          source: 'browser_fs' as const,
          message: isRTL
            ? `با موفقیت ${movedFiles.length} فایل اسکرین‌شات به پوشه "${folderName}" منتقل شدند.`
            : `Successfully organized ${movedFiles.length} screenshot files into "${folderName}".`,
        };

        setDesktopOrganizeResult(successResult);
        setIsOrganizingDesktop(false);
        return;
      } catch (pickerErr: any) {
        if (pickerErr.name === 'AbortError') {
          setIsOrganizingDesktop(false);
          return;
        }
        console.log('Falling back to Local Bridge filesystem endpoint...', pickerErr);
      }
    }

    // 2. Fallback to Local Bridge MCP Server Execution
    try {
      const res = await fetch('/api/local-bridge/organize-desktop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationFolderName: folderName }),
      });
      const data = await res.json();
      if (data.success) {
        setDesktopOrganizeResult({
          success: true,
          folder: data.destinationFolder,
          count: data.filesMovedCount,
          files: data.movedFiles || [],
          source: 'local_bridge',
          message: data.message,
        });
      } else {
        setDesktopOrganizeResult({
          success: false,
          folder: folderName,
          count: 0,
          files: [],
          source: 'local_bridge',
          message: data.error || 'خطا در اجرای خودکار',
        });
      }
    } catch (err: any) {
      setDesktopOrganizeResult({
        success: false,
        folder: folderName,
        count: 0,
        files: [],
        source: 'local_bridge',
        message: err.message,
      });
    } finally {
      setIsOrganizingDesktop(false);
    }
  };

  // Auto-scroll to bottom on new messages or streaming typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isStreamingTyping]);

  const handleSend = () => {
    const prompt = inputText.trim();
    if (!prompt || isExecuting) return;
    
    // Explicit user-selected mode: 'chat' for fast natural conversation, 'agent' for coding
    const targetMode: AgentMode = activeMode === 'coding' ? 'agent' : 'chat';

    onSendMessage(prompt, targetMode);
    setInputText('');
    setAttachedFileName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = '38px';
    }
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
      {/* 1. Sleek Window Header: Mode Toggles & Agent Bar */}
      <div
        className="flex items-center justify-between pb-2.5 border-b border-blue-200/60 shrink-0 gap-2 flex-wrap sm:flex-nowrap"
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

        {/* Center/Right: Dedicated Mode Selector (Fast Chat vs Deep Coding) & Online Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Distinct 2-Mode Segmented Pill */}
          <div className="flex items-center p-1 rounded-2xl bg-white/70 border border-white/90 shadow-[0_2px_10px_rgba(37,99,235,0.06)] gap-1">
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                activeMode === 'chat'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-[0_2px_10px_rgba(16,185,129,0.35)] scale-100'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 font-bold'
              }`}
              title={isRTL ? 'حالت گفتگو و چت سریع، بدون کدنویسی خودکار' : 'Fast conversational mode'}
            >
              <Zap className={`w-3.5 h-3.5 ${activeMode === 'chat' ? 'text-white' : 'text-emerald-600'}`} />
              <span>{isRTL ? 'چت ساده' : 'Fast Chat'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('coding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                activeMode === 'coding'
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white font-black shadow-[0_2px_10px_rgba(37,99,235,0.35)] scale-100'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 font-bold'
              }`}
              title={isRTL ? 'حالت کدنویسی، ساخت برنامه و اجرای پروژه‌ها' : 'Deep autonomous coding mode'}
            >
              <Code2 className={`w-3.5 h-3.5 ${activeMode === 'coding' ? 'text-white' : 'text-blue-600'}`} />
              <span>{isRTL ? 'کدنویسی' : 'Coding'}</span>
            </button>
          </div>

          {/* Subtle Live Active Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isRTL ? 'آنلاین و آماده' : 'Online & Ready'}</span>
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

              {/* Agent Avatar (Original Codgar Bot Icon) */}
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.2)] shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                    <Bot className="w-3.5 h-3.5 text-blue-600 drop-shadow-[0_1px_2px_rgba(37,99,235,0.25)]" />
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
                  <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-600/90 shrink-0" />
                    <span className="tracking-normal">
                      {new Intl.DateTimeFormat(isRTL ? 'fa-IR-u-ca-persian' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                      }).format(new Date(msg.timestamp || Date.now()))}
                      {' • '}
                      {new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }).format(new Date(msg.timestamp || Date.now()))}
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

                {/* Interactive Desktop & Screenshot Organizer Widget */}
                {!isUser && (textContent.includes('اسکرین') || textContent.includes('دسکتاپ') || textContent.includes('screenshot') || textContent.includes('پوشه') || textContent.includes('فولدر')) && (
                  <div className="mt-3 pt-3 border-t border-blue-200/70">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/80 to-indigo-50/90 border border-blue-200/80 shadow-sm text-slate-800 dir-auto">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <FolderPlus className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block">
                              {isRTL ? 'مرتب‌سازی و انتقال اسکرین‌شات‌ها' : 'Auto-Organize Screenshots'}
                            </span>
                            <span className="text-[10px] text-blue-700 font-medium">
                              {isRTL ? 'ساخت پوشه اختصاصی و انتقال فایل‌های اسکرین‌شات دسکتاپ' : 'Create a dedicated folder and move desktop screenshots'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          {isRTL ? 'آماده' : 'Ready'}
                        </span>
                      </div>

                      {/* Execution Result Status */}
                      {desktopOrganizeResult ? (
                        <div className="mt-2.5 p-3 rounded-xl bg-white/90 border border-emerald-300 shadow-2xs">
                          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{desktopOrganizeResult.message}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono mt-2 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1 font-sans">
                              <FolderCheck className="w-3.5 h-3.5 text-blue-600" />
                              <strong className="text-slate-800">{desktopOrganizeResult.folder}</strong>
                            </span>
                            <span>•</span>
                            <span className="font-sans">
                              {isRTL ? `تعداد فایل‌ها: ${desktopOrganizeResult.count}` : `Files: ${desktopOrganizeResult.count}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAutonomousDesktopOrganize}
                            disabled={isOrganizingDesktop}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-[0_4px_12px_rgba(37,99,235,0.25)] active:scale-95 transition cursor-pointer disabled:opacity-60"
                          >
                            {isOrganizingDesktop ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                <span>{isRTL ? 'در حال انتقال فایل‌ها...' : 'Organizing files...'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current" />
                                <span>{isRTL ? '📁 انتقال اسکرین‌شات‌ها به پوشه جدید' : '📁 Move Screenshots to Folder'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Action Button: Transition from Chat to Coding Mode when permission requested */}
                {!isUser && (textContent.includes('کدنویسی') || textContent.toLowerCase().includes('coding mode')) && activeMode === 'chat' && (
                  <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('coding');
                        onSendMessage(isRTL ? 'بله، به حالت کدنویسی برو و این پروژه را به صورت کامل و زنده بساز و پیش‌نمایش را باز کن.' : 'Yes, switch to coding mode and build this project completely with live preview.', 'agent');
                      }}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>{isRTL ? '🚀 تایید و شروع کدنویسی زنده پروژه' : '🚀 Switch to Coding Mode & Build'}</span>
                    </button>
                  </div>
                )}
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
                <div className="order-2 w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.2)] shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                    <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
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
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.2)] shrink-0 mt-0.5">
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                    <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
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

        {/* Active Thinking Indicator State with Explicit Mode Recognition */}
        {isExecuting && !isStreamingTyping && (
          <div
            className={`flex items-start gap-2.5 ${isRTL ? 'justify-end' : 'justify-start'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {isRTL ? (
              <>
                {/* Codgar Intelligent Thinking Avatar */}
                <div className={`order-2 w-7 h-7 rounded-xl p-[1.5px] shrink-0 mt-0.5 shadow-md ${
                  activeMode === 'coding'
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 animate-pulse'
                    : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_15px_rgba(56,189,248,0.45)] animate-codgar-thinking'
                }`}>
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center shadow-inner">
                    {activeMode === 'coding' ? (
                      <Code2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse drop-shadow-[0_1px_2px_rgba(37,99,235,0.3)]" />
                    )}
                  </div>
                </div>

                <div className="order-1 ice-glass-card text-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 text-right flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${activeMode === 'coding' ? 'bg-blue-600 animate-ping' : 'bg-emerald-500 animate-ping'}`} />
                    <span className="font-bold text-slate-800">
                      {activeMode === 'coding'
                        ? 'من دارم می‌رم با حالت کدزنی، به من فرصت بده...'
                        : 'کُدگر در حال اندیشیدن و پاسخگویی...'}
                    </span>
                    <span className="flex items-center gap-1 text-sky-600 mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    </span>
                  </div>
                  {activeMode === 'coding' && (
                    <p className="text-[11px] text-blue-600 font-medium mr-4 flex items-center gap-1">
                      <Cpu className="w-3 h-3 shrink-0" />
                      <span>در حال تحلیل معماری، تولید کدهای استاندارد و آماده‌سازی خروجی</span>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Codgar Intelligent Thinking Avatar */}
                <div className={`w-7 h-7 rounded-xl p-[1.5px] shrink-0 mt-0.5 shadow-md ${
                  activeMode === 'coding'
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 animate-pulse'
                    : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_15px_rgba(56,189,248,0.45)] animate-codgar-thinking'
                }`}>
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center shadow-inner">
                    {activeMode === 'coding' ? (
                      <Code2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse drop-shadow-[0_1px_2px_rgba(37,99,235,0.3)]" />
                    )}
                  </div>
                </div>

                <div className="ice-glass-card text-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 flex flex-col gap-1.5" dir="ltr">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${activeMode === 'coding' ? 'bg-blue-600 animate-ping' : 'bg-emerald-500 animate-ping'}`} />
                    <span className="font-bold text-slate-800">
                      {activeMode === 'coding'
                        ? 'Entering Deep Coding Mode, giving me a moment...'
                        : 'Codgar is thinking and formulating response...'}
                    </span>
                    <span className="flex items-center gap-1 text-sky-600 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    </span>
                  </div>
                  {activeMode === 'coding' && (
                    <p className="text-[11px] text-blue-600 font-medium ml-4 flex items-center gap-1">
                      <Cpu className="w-3 h-3 shrink-0" />
                      <span>Analyzing architecture, generating code, and preparing output</span>
                    </p>
                  )}
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

      {/* 3. Harmonious Modern Multi-Line Input Bar with Soft Elevation & Expandable Box */}
      <div
        className="rounded-[26px] sm:rounded-[28px] ice-glass-card bg-white/95 backdrop-blur-2xl p-2 sm:p-2.5 flex items-end gap-2 border border-white/95 shadow-lg shadow-blue-900/5 shrink-0 relative transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:border-blue-300 hover:border-blue-200"
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
          className="p-2.5 mb-0.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 transition cursor-pointer shrink-0 active:scale-95"
          title={t.attachFile}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Multi-line Auto-Expanding Textarea */}
        <div className="flex-1 min-w-0 py-1 px-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'chat'
                ? (isRTL ? 'پیام یا سوال خود را مطرح کنید (مشاوره، گفتگو، تحلیل هوشمند)...' : 'Type your message (conversational chat, Q&A, advice)...')
                : (isRTL ? 'توصیف پروژه یا برنامه‌ای که می‌خواهید ساخته شود (ساخت سایت، بازی، ابزار)...' : 'Describe the project, app, or website to build live...')
            }
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`w-full bg-transparent resize-none overflow-y-auto max-h-[160px] min-h-[38px] text-xs sm:text-sm font-sans font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition-all custom-scrollbar leading-relaxed ${
              isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
            }`}
          />
        </div>

        {/* Action Buttons Right/Left Side */}
        <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
          {/* Voice / Siri Mic Button */}
          <button
            type="button"
            onClick={onOpenSiriVoice}
            className={`p-2.5 rounded-full transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
              isRecordingVoice
                ? 'w-8.5 h-8.5 bg-gradient-to-tr from-cyan-400 via-pink-500 to-rose-400 text-white shadow-[0_0_20px_rgba(251,113,133,0.7)] animate-spin-slow'
                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/80'
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

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() && !attachedFileName}
            className="w-9 h-9 rounded-full coral-pill-btn disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md shadow-rose-500/20 transition cursor-pointer shrink-0 active:scale-95"
            title={t.sendMessage}
          >
            <Send className={`w-3.5 h-3.5 fill-current transform ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
