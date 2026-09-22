import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Maximize2,
  Minimize2,
  X,
  RotateCw,
  Code2,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Play,
  Terminal,
  Download,
  AlertCircle,
  Cpu,
  CheckCircle2,
  Wrench,
  Zap,
  ShieldCheck,
  Loader2,
  CheckCheck,
  Settings,
  Flame,
} from 'lucide-react';
import { PreviewArtifact } from '../types';

interface Props {
  artifact: PreviewArtifact | null;
  onClose: () => void;
  language?: string;
  isOpen?: boolean;
}

type PreviewSizeMode = 'compact' | 'half' | 'fullscreen';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export function LiveArtifactPreview({
  artifact,
  onClose,
  language = 'fa',
  isOpen = true,
}: Props) {
  const isFa = language === 'fa';
  const [sizeMode, setSizeMode] = useState<PreviewSizeMode>('compact');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [runningExecution, setRunningExecution] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  
  // Universal Compiler & Auto-Installer States
  const [autoInstall, setAutoInstall] = useState<boolean>(true);
  const [isInstallingTool, setIsInstallingTool] = useState<boolean>(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'terminal' | 'code' | 'tools'>('preview');
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [selectedLanguageOverride, setSelectedLanguageOverride] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Detect artifact type and language
  const rawCode = artifact?.code || '';
  
  const isReactCode =
    rawCode.includes('import React') ||
    rawCode.includes('export default function') ||
    rawCode.includes('useState(') ||
    rawCode.includes('useEffect(') ||
    rawCode.includes('<div') ||
    rawCode.includes('className=') ||
    artifact?.type === 'react';

  const isVueCode =
    rawCode.includes('<template>') ||
    rawCode.includes('createApp(') ||
    artifact?.type === 'vue';

  const isPythonCode =
    rawCode.includes('def ') ||
    rawCode.includes('import sys') ||
    rawCode.includes('print(') ||
    artifact?.type === 'python';

  const isSwiftCode =
    rawCode.includes('import SwiftUI') ||
    rawCode.includes('import Foundation') ||
    artifact?.type === 'swift';

  const isGoCode =
    rawCode.includes('package main') ||
    rawCode.includes('func main()') ||
    artifact?.type === 'go';

  const isRustCode =
    rawCode.includes('fn main()') ||
    rawCode.includes('println!') ||
    artifact?.type === 'rust';

  const isCppCode =
    rawCode.includes('#include <iostream>') ||
    rawCode.includes('#include <stdio.h>') ||
    artifact?.type === 'cpp' ||
    artifact?.type === 'c';

  const detectedLanguage = selectedLanguageOverride || (
    isReactCode
      ? 'react'
      : isVueCode
      ? 'vue'
      : isPythonCode
      ? 'python'
      : isSwiftCode
      ? 'swift'
      : isGoCode
      ? 'go'
      : isRustCode
      ? 'rust'
      : isCppCode
      ? 'cpp'
      : artifact?.type === 'html' || rawCode.includes('<!DOCTYPE') || rawCode.includes('<html')
      ? 'html'
      : 'javascript'
  );

  const isWebArtifact =
    detectedLanguage === 'html' ||
    detectedLanguage === 'react' ||
    detectedLanguage === 'vue' ||
    artifact?.type === 'canvas' ||
    artifact?.type === 'dashboard' ||
    artifact?.type === 'app';

  // Fetch tools status on mount
  useEffect(() => {
    fetchToolsStatus();
  }, []);

  const fetchToolsStatus = async () => {
    try {
      const res = await fetch('/api/compiler/tools');
      const data = await res.json();
      if (data.success && data.tools) {
        setToolsList(data.tools);
        if (typeof data.autoInstallEnabled === 'boolean') {
          setAutoInstall(data.autoInstallEnabled);
        }
      }
    } catch {
      // ignore
    }
  };

  // Reset and execute when artifact changes
  useEffect(() => {
    if (artifact) {
      setIframeKey((prev) => prev + 1);
      setExecutionResult(null);
      setSelectedLanguageOverride(null);
      
      if (!isWebArtifact) {
        setActiveTab('terminal');
        handleRunScript();
      } else {
        setActiveTab('preview');
      }
    }
  }, [artifact?.id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && artifact) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artifact, onClose]);

  const handleCopyCode = () => {
    if (!artifact) return;
    navigator.clipboard.writeText(artifact.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!artifact) return;
    const extMap: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      python: 'py',
      swift: 'swift',
      go: 'go',
      rust: 'rs',
      cpp: 'cpp',
      javascript: 'js',
      html: 'html',
    };
    const ext = extMap[detectedLanguage] || 'txt';
    const blob = new Blob([artifact.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title?.toLowerCase().replace(/\s+/g, '_') || 'app'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Universal Script Runner & Builder with Auto-Install
  const handleRunScript = async (lang = detectedLanguage, forceAutoInstall = autoInstall) => {
    if (!artifact) return;
    setRunningExecution(true);
    try {
      const extMap: Record<string, string> = {
        react: 'tsx',
        vue: 'vue',
        python: 'py',
        swift: 'swift',
        go: 'go',
        rust: 'rs',
        cpp: 'cpp',
        javascript: 'js',
        html: 'html',
      };
      const ext = extMap[lang] || 'js';
      const targetFilePath = `apps/${artifact.title?.toLowerCase().replace(/\s+/g, '_') || 'app'}.${ext}`;

      const res = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          code: artifact.code,
          filePath: targetFilePath,
          autoInstall: forceAutoInstall,
        }),
      });
      const data = await res.json();
      setExecutionResult(data);
      fetchToolsStatus();
    } catch (err: any) {
      setExecutionResult({
        success: false,
        installed: false,
        stderr: err.message,
      });
    } finally {
      setRunningExecution(false);
    }
  };

  // 1-Click Tool Auto-Installer
  const handleInstallTool = async (toolId: string) => {
    setIsInstallingTool(true);
    setInstallStatusMsg(isFa ? `در حال نصب پکیج و کامپایلر ${toolId}...` : `Installing compiler ${toolId}...`);
    try {
      const res = await fetch('/api/compiler/install-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      });
      const data = await res.json();
      if (data.success) {
        setInstallStatusMsg(isFa ? `ابزار ${toolId} با موفقیت نصب شد! در حال اجرای مجدد بیلد...` : `Installed ${toolId}! Re-running build...`);
        await fetchToolsStatus();
        setTimeout(() => {
          handleRunScript(detectedLanguage, true);
          setIsInstallingTool(false);
          setInstallStatusMsg('');
        }, 1000);
      } else {
        setInstallStatusMsg(isFa ? `خطا در نصب: ${data.error}` : `Install error: ${data.error}`);
        setIsInstallingTool(false);
      }
    } catch (err: any) {
      setInstallStatusMsg(err.message);
      setIsInstallingTool(false);
    }
  };

  const toggleAutoInstallMode = async () => {
    const nextState = !autoInstall;
    setAutoInstall(nextState);
    try {
      await fetch('/api/compiler/auto-install-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    if (!isWebArtifact || activeTab === 'terminal') {
      handleRunScript();
    }
  };

  const handleOpenNewTab = () => {
    if (!artifact) return;
    const blob = new Blob([generateFullHtml(artifact.code)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Universal Live Sandbox HTML Generator (React 18 / Vue / HTML / Tailwind / Lucide Icons)
  const generateFullHtml = (code: string) => {
    if (artifact?.livePreviewHtml) {
      return artifact.livePreviewHtml;
    }

    if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
      return code;
    }

    if (detectedLanguage === 'react' || isReactCode) {
      // Clean import statements from raw React code for in-browser Babel Standalone execution
      let cleanedCode = code
        .replace(/import\s+React(?:\s*,\s*\{([^}]+)\})?\s+from\s+['"][^'"]+['"];?/g, (_, hooks) => {
          return hooks ? `const { ${hooks} } = React;` : '';
        })
        .replace(/import\s*\{([^}]+)\}\s*from\s+['"]lucide-react['"];?/g, (_, icons) => {
          return `const { ${icons} } = window.LucideProxy;`;
        })
        .replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1(...args) { return __AppImpl__$1.apply(this, args); }\nconst __AppImpl__$1 = function $1')
        .replace(/export\s+default\s+/g, 'window.__MainAppExport__ = ')
        .replace(/export\s+(?:const|let|var|function|class)\s+/g, '');

      return `<!DOCTYPE html>
<html lang="fa" dir="auto" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artifact?.title || 'React Live Build'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for live in-browser TSX/JSX compilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', 'Vazirmatn', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #070b14;
      color: #f1f5f9;
      min-height: 100vh;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.4); border-radius: 9999px; }
  </style>
</head>
<body class="bg-[#070b14] text-slate-100 min-h-screen">
  <div id="root"></div>

  <script>
    window.process = { env: { NODE_ENV: 'production' } };
    
    // Universal Lucide Icon component generator
    function makeLucideIcon(iconName) {
      return function DynamicLucideIcon(props) {
        const { size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...rest } = props || {};
        const iconRef = React.useRef(null);
        React.useEffect(() => {
          if (window.lucide && iconRef.current) {
            window.lucide.createIcons();
          }
        });
        const kebab = (iconName || 'activity').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        return React.createElement('i', {
          ref: iconRef,
          'data-lucide': kebab,
          className: 'inline-flex items-center justify-center ' + className,
          style: { width: size, height: size, display: 'inline-flex', verticalAlign: 'middle', color },
          ...rest
        });
      };
    }

    window.LucideProxy = new Proxy({}, {
      get: (target, prop) => {
        if (typeof prop === 'string') return makeLucideIcon(prop);
        return makeLucideIcon('activity');
      }
    });

    window.require = function(mod) {
      if (mod === 'react') return React;
      if (mod === 'react-dom' || mod === 'react-dom/client') return ReactDOM;
      if (mod === 'lucide-react') return window.LucideProxy;
      return {};
    };
  </script>

  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
    const { 
      TrendingUp, TrendingDown, DollarSign, Activity, 
      ArrowUpRight, ArrowDownRight, RefreshCw, Zap, Shield, 
      PieChart, BarChart2, Bell, Wallet, ChevronRight, Check, Copy, X, Plus, Minus, Search 
    } = window.LucideProxy;

    try {
      ${cleanedCode}

      const TargetApp = window.__MainAppExport__ ||
        (typeof CryptoTradingDashboard !== 'undefined' ? CryptoTradingDashboard : null) ||
        (typeof App !== 'undefined' ? App : null) ||
        (typeof Main !== 'undefined' ? Main : null);

      if (TargetApp) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<TargetApp />);
        setTimeout(() => {
          if (window.lucide) window.lucide.createIcons();
        }, 100);
      } else {
        document.getElementById('root').innerHTML = '<div class="p-6 text-center text-cyan-400 font-mono">React component executed and loaded successfully.</div>';
      }
    } catch (renderError) {
      console.error("React Live Render Error:", renderError);
      document.getElementById('root').innerHTML = '<div class="p-6 bg-red-950/80 border border-red-500/60 rounded-2xl m-4 text-red-200 font-mono text-sm"><h3 class="font-bold text-red-400 mb-2 flex items-center gap-2">⚠️ React Compilation Error</h3><pre class="whitespace-pre-wrap bg-black/60 p-3 rounded-lg border border-red-500/30 text-xs">' + renderError.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artifact?.title || 'Live Preview'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', 'Vazirmatn', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      color: #f1f5f9;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 9999px; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-start">
  ${code}
</body>
</html>`;
  };

  if (!artifact || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Universal Build & Execution Hub"
        layout
        initial={{
          opacity: 0,
          scale: 0.88,
          x: 40,
          y: -20,
          filter: 'blur(10px)',
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
        }}
        exit={{
          opacity: 0,
          scale: 0.88,
          x: 35,
          y: -15,
          filter: 'blur(8px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 25,
          mass: 0.85,
        }}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity, width, height, filter',
          backfaceVisibility: 'hidden',
        }}
        className={`fixed z-50 transform-gpu pointer-events-auto select-none ${
          sizeMode === 'fullscreen'
            ? 'inset-2 sm:inset-4 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)]'
            : sizeMode === 'half'
            ? 'top-3 sm:top-4 right-3 sm:right-6 w-[92vw] sm:w-[580px] md:w-[680px] lg:w-[760px] h-[80vh] max-h-[720px]'
            : 'top-3 sm:top-4 right-3 sm:right-6 w-80 sm:w-88 h-52 sm:h-60'
        }`}
      >
        {/* Futuristic Liquid Glass Frame */}
        <div className="w-full h-full rounded-[26px] bg-[#0c121e]/95 border border-cyan-400/40 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95),0_10px_35px_rgba(0,240,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.22)] p-2.5 sm:p-3.5 flex flex-col justify-between overflow-hidden relative">
          {/* Holographic Top Rim */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-amber-400 to-transparent animate-pulse pointer-events-none" />

          {/* Ambient Lighting Cones */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/15 blur-2xl rounded-full pointer-events-none" />

          {/* 1. Header Bar */}
          <div className="relative z-10 pb-2 border-b border-cyan-400/20 flex items-center justify-between gap-2 shrink-0">
            {/* Title & Live Engine Badge */}
            <div
              onClick={() => {
                if (sizeMode === 'compact') setSizeMode('half');
              }}
              className="flex items-center gap-2 min-w-0 cursor-pointer group"
            >
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-amber-500/30 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide truncate max-w-[130px] sm:max-w-[200px]">
                    {artifact.title || (isFa ? 'بیلد همه‌منظوره' : 'Universal Build Hub')}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase font-mono font-bold">
                    {detectedLanguage}
                  </span>
                </div>
                <div className="text-[9px] text-cyan-400/70 font-mono flex items-center gap-1">
                  <span>{isWebArtifact ? 'Interactive Sandbox' : 'Container Engine'}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 inline" />
                    {autoInstall ? 'Auto-Install ON' : 'Manual Approval'}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode & Compiler Tabs (When in Half / Fullscreen) */}
            {sizeMode !== 'compact' && (
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
                {isWebArtifact && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
                      activeTab === 'preview'
                        ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isFa ? 'پیش‌نمایش زنده' : 'Preview'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('terminal');
                    if (!executionResult) handleRunScript();
                  }}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
                    activeTab === 'terminal'
                      ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>{isFa ? 'ترمینال و بیلد' : 'Terminal / Build'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
                    activeTab === 'code'
                      ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>{isFa ? 'کد منبع' : 'Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
                    activeTab === 'tools'
                      ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>{isFa ? 'ابزارهای بیلد' : 'Tools'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Re-run / Reload */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={runningExecution || isInstallingTool}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-cyan-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Reload Sandbox / Re-run Build"
              >
                <RotateCw className={`w-3 h-3 ${runningExecution ? 'animate-spin' : ''}`} />
              </button>

              {/* Download File */}
              {sizeMode !== 'compact' && (
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-cyan-300 hover:text-white transition cursor-pointer"
                  title="Download source file"
                >
                  <Download className="w-3 h-3" />
                </button>
              )}

              {/* Size Mode Toggle */}
              {sizeMode === 'compact' ? (
                <button
                  type="button"
                  onClick={() => setSizeMode('half')}
                  className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 transition cursor-pointer"
                  title={isFa ? 'بزرگ‌نمایی به نصف صفحه' : 'Expand to half screen'}
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              ) : sizeMode === 'half' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSizeMode('fullscreen')}
                    className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 transition cursor-pointer"
                    title={isFa ? 'تمام صفحه' : 'Fullscreen'}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeMode('compact')}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-cyan-300 transition cursor-pointer"
                    title={isFa ? 'کوچک کردن به گوشه' : 'Shrink to corner'}
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSizeMode('half')}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-cyan-300 transition cursor-pointer"
                  title={isFa ? 'خروج از تمام صفحه' : 'Exit fullscreen'}
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
              )}

              {/* External Tab for Web Apps */}
              {sizeMode !== 'compact' && isWebArtifact && (
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-cyan-300 hover:text-white transition cursor-pointer hidden sm:flex"
                  title="Open in new window (Chrome/Safari)"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {/* Close Preview */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 border border-white/10 text-cyan-300 hover:text-rose-300 transition cursor-pointer"
                title={isFa ? 'بستن پیش‌نمایش' : 'Close preview'}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2. Main Content Body */}
          <div
            className={`relative z-10 flex-1 rounded-xl bg-[#090d16] border border-cyan-500/20 overflow-hidden my-1 flex items-center justify-center ${
              sizeMode === 'compact' ? 'cursor-pointer' : ''
            }`}
            onClick={() => {
              if (sizeMode === 'compact') {
                setSizeMode('half');
              }
            }}
          >
            {/* VIEW TAB: Live Sandboxed Iframe */}
            {activeTab === 'preview' && isWebArtifact ? (
              <div
                className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
                  viewport === 'mobile' && sizeMode !== 'compact'
                    ? 'max-w-[375px] shadow-2xl border-x border-cyan-500/30'
                    : viewport === 'tablet' && sizeMode !== 'compact'
                    ? 'max-w-[768px] shadow-2xl border-x border-cyan-500/30'
                    : 'w-full'
                }`}
              >
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  srcDoc={generateFullHtml(artifact.code)}
                  title={artifact.title || 'Live Preview'}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  className={`w-full h-full border-0 bg-transparent rounded-lg ${
                    sizeMode === 'compact' ? 'pointer-events-none' : 'pointer-events-auto'
                  }`}
                />
              </div>
            ) : activeTab === 'code' ? (
              /* CODE TAB: Raw Code Inspector */
              <div className="w-full h-full p-3 font-mono text-xs text-cyan-200 overflow-y-auto bg-black/80 select-text custom-scrollbar">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 font-bold">{detectedLanguage.toUpperCase()} Source Code</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-[10px] text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{artifact.code}</pre>
              </div>
            ) : activeTab === 'tools' ? (
              /* TOOLS TAB: Compilers & Auto-Installer Management */
              <div className="w-full h-full p-4 overflow-y-auto bg-[#070b14] select-text custom-scrollbar space-y-3">
                {/* Auto-Install Toggle Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-black border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>{isFa ? 'نصب خودکار ابزارهای ناموجود (Auto-Install)' : 'Automatic Tool Installation'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isFa
                        ? 'در صورت نبود کامپایلر (مانند GCC، Python-Pip، Go یا Rust)، سیستم به‌طور خودکار آن را در پس‌زمینه نصب می‌کند.'
                        : 'Automatically installs missing compilers (GCC, Python, Go, Rust) in the container background.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAutoInstallMode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      autoInstall
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {autoInstall ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5" />}
                    <span>{autoInstall ? (isFa ? 'فعال (پیش‌فرض)' : 'Enabled') : (isFa ? 'غیرفعال (نیاز به اجازه)' : 'Disabled')}</span>
                  </button>
                </div>

                {/* Status message during installation */}
                {installStatusMsg && (
                  <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{installStatusMsg}</span>
                  </div>
                )}

                {/* Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {toolsList.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-3 rounded-xl bg-black/60 border border-white/10 hover:border-cyan-500/30 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-white/5">
                        <span className="text-xs font-bold text-slate-200">{tool.name}</span>
                        {tool.isInstalled ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Installed</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Not Found</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 my-1.5">{tool.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <code className="text-[9px] text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">{tool.command}</code>
                        {!tool.isInstalled && (
                          <button
                            type="button"
                            onClick={() => handleInstallTool(tool.id)}
                            disabled={isInstallingTool}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          >
                            <Download className="w-2.5 h-2.5" />
                            <span>{isFa ? 'نصب ابزار' : 'Install Tool'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* TERMINAL / UNIVERSAL RUNNER TAB */
              <div className="w-full h-full p-3 font-mono text-xs overflow-y-auto bg-[#070b12] select-text custom-scrollbar flex flex-col justify-between">
                <div className="space-y-2.5">
                  {/* Runner Header & Language Selector */}
                  <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-200 text-[11px] font-bold">
                        {executionResult?.filePath || `apps/${artifact.title?.toLowerCase().replace(/\s+/g, '_') || 'app'}.${detectedLanguage === 'python' ? 'py' : detectedLanguage === 'react' ? 'tsx' : 'js'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Manual Language Switcher */}
                      <select
                        value={detectedLanguage}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setSelectedLanguageOverride(newLang);
                          handleRunScript(newLang);
                        }}
                        className="bg-black/80 border border-cyan-500/30 text-cyan-300 text-[10px] rounded px-2 py-0.5 font-mono cursor-pointer"
                      >
                        <option value="react">React (TSX / JSX)</option>
                        <option value="python">Python 3</option>
                        <option value="javascript">Node / TSX</option>
                        <option value="cpp">C / C++ (GCC/G++)</option>
                        <option value="go">Go (Golang)</option>
                        <option value="rust">Rust (rustc)</option>
                        <option value="swift">Swift</option>
                        <option value="html">HTML5 / Canvas</option>
                      </select>

                      {/* Execution Status Badge */}
                      {executionResult?.success ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Success ({executionResult.durationMs}ms)</span>
                        </span>
                      ) : executionResult && !executionResult.installed ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Tool Missing</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRunScript()}
                          disabled={runningExecution}
                          className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{runningExecution ? 'Running...' : 'Run Code'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Auto-Installation in Progress Card */}
                  {isInstallingTool && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{installStatusMsg || (isFa ? 'در حال نصب ابزارهای بیلد...' : 'Installing build tools...')}</span>
                    </div>
                  )}

                  {/* Terminal STDOUT */}
                  {executionResult?.stdout && (
                    <div className="p-3 rounded-lg bg-black/80 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                      <div className="text-[9px] text-emerald-500/70 border-b border-emerald-500/20 pb-1 flex items-center justify-between">
                        <span>STDOUT &middot; Exit Code {executionResult.exitCode}</span>
                        <span>{executionResult.durationMs} ms</span>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{executionResult.stdout}</pre>
                    </div>
                  )}

                  {/* Terminal STDERR */}
                  {executionResult?.stderr && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] space-y-1">
                      <div className="text-[9px] text-rose-400/70 border-b border-rose-500/20 pb-1">STDERR / DIAGNOSTIC</div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{executionResult.stderr}</pre>
                    </div>
                  )}

                  {/* Missing Tool Diagnostic & Permission Card */}
                  {executionResult && !executionResult.installed && executionResult.missingTools?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/50 to-black/90 border border-amber-500/50 text-amber-200 text-[11px] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>
                            {isFa
                              ? `کامپایلر موردنیاز (${executionResult.missingTools[0].name}) نصب نیست`
                              : `Missing toolchain: ${executionResult.missingTools[0].name}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInstallTool(executionResult.missingTools[0].id)}
                          disabled={isInstallingTool}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-400/60 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{isFa ? 'اجازه و نصب فوری ابزار' : 'Authorize & Install Now'}</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-amber-200/80 leading-relaxed">
                        {isFa
                          ? `برای اجرای خودکار این برنامه به دسترسی نصب ${executionResult.missingTools[0].name} نیاز است. می‌توانید با کلیک روی دکمه بالا، فرآیند نصب را آغاز کنید یا حالت نصب اتوماتیک را فعال نگه دارید.`
                          : `The system needs ${executionResult.missingTools[0].name} to build this code. Click above to install automatically.`}
                      </p>
                    </div>
                  )}

                  {/* Source Preview */}
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-slate-400 max-h-40 overflow-y-auto">
                    <div className="text-[9px] text-slate-500 pb-1 border-b border-white/10 mb-1">Code Snapshot</div>
                    <pre className="whitespace-pre-wrap">{artifact.code.slice(0, 450)}...</pre>
                  </div>
                </div>

                <div className="pt-2 text-[9px] text-cyan-400/50 flex items-center justify-between border-t border-white/5 mt-2">
                  <span>Language: {detectedLanguage.toUpperCase()}</span>
                  <span>Autonomous Multi-Language Engine</span>
                </div>
              </div>
            )}

            {/* Hint overlay on compact mode */}
            {sizeMode === 'compact' && (
              <div className="absolute inset-0 bg-cyan-950/20 hover:bg-cyan-950/40 transition flex items-center justify-center opacity-0 hover:opacity-100 backdrop-blur-[1px]">
                <div className="px-3 py-1 rounded-full bg-black/80 border border-cyan-400/50 text-[10px] font-mono text-cyan-200 flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-3 h-3 text-cyan-300" />
                  <span>{isFa ? 'برای بزرگ‌نمایی کلیک کنید' : 'Click to expand'}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Footer Bar */}
          <div className="relative z-10 pt-1 border-t border-cyan-400/15 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-cyan-300/70 shrink-0">
            <span className="truncate flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>
                {activeTab === 'preview'
                  ? `REACT / HTML LIVE SANDBOX (${detectedLanguage.toUpperCase()})`
                  : activeTab === 'terminal'
                  ? `CONTAINER RUNNER & COMPILER (${detectedLanguage.toUpperCase()})`
                  : activeTab === 'tools'
                  ? 'AUTO-INSTALLER & TOOLCHAINS'
                  : 'SOURCE INSPECTOR'}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-amber-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3" />
                <span>All-Languages Enabled</span>
              </span>
            </span>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
