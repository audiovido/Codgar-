import { useState, useEffect, useCallback } from 'react';
import {
  AgentMode,
  AgentState,
  Message,
  PreviewArtifact,
  ProjectInfo,
  GitStatus,
  PermissionPolicy,
  AgentConfig,
} from './types';
import { Language, translations, SUPPORTED_LANGUAGES } from './utils/translations';
import { Sidebar } from './components/Sidebar';
import { CodedAiChatCard } from './components/CodedAiChatCard';
import { playSoftChimeSound } from './utils/audioNotification';
import { LiveArtifactPreview } from './components/LiveArtifactPreview';
import { AnimatedCodeDrawer } from './components/AnimatedCodeDrawer';
import { TerminalPanel } from './components/TerminalPanel';
import { FileExplorer } from './components/FileExplorer';
import { DiffViewerModal } from './components/DiffViewerModal';
import { FreebuffWorkspacesModal } from './components/FreebuffWorkspacesModal';
import { FreebuffQueueDrawer } from './components/FreebuffQueueDrawer';
import { SkillsModal } from './components/SkillsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { FuelApiKeyView } from './components/FuelApiKeyView';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { LocalBridgeModal } from './components/LocalBridgeModal';
import { LiquidGlassBackground } from './components/LiquidGlassBackground';
import { SiriLiveSpeakerOverlay } from './components/SiriLiveSpeakerOverlay';
import { SoundtrackBar } from './components/SoundtrackBar';
import { voiceAgent } from './services/voiceAgent';
import {
  Sparkles,
  Globe,
  Settings as SettingsIcon,
  User,
  Fuel,
  Terminal as TerminalIcon,
  Bot,
} from 'lucide-react';

export default function App() {
  // Core App State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('codgar_lang') as Language) || 'fa';
  });
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [activeWorker, setActiveWorker] = useState<'coder' | 'writer' | null>(null);

  // Active Artifact for Live Preview
  const [activeArtifact, setActiveArtifact] = useState<PreviewArtifact | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // System & Workspace Data
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);

  // Modals & Panels State
  const [isFuelActive, setIsFuelActive] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [codeDrawerTab, setCodeDrawerTab] = useState<'editor' | 'terminal' | 'files' | 'agents'>('editor');
  const [isDiffOpen, setIsDiffOpen] = useState<boolean>(false);
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [isLocalBridgeOpen, setIsLocalBridgeOpen] = useState<boolean>(false);

  // Voice Engine State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [siriVisualActive, setSiriVisualActive] = useState<boolean>(false);

  // Toggle helper for Live Preview: if artifact is null, create a stylish live demo artifact
  const toggleLivePreview = () => {
    if (isPreviewOpen) {
      setIsPreviewOpen(false);
    } else {
      if (!activeArtifact) {
        setActiveArtifact({
          id: `art-live-${Date.now()}`,
          title: isFa ? 'برنامه واکنش‌گرا و مدرن کدگر' : 'Codgar Live Interactive Workspace',
          type: 'react',
          language: 'react',
          code: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('Active');
  const [items, setItems] = useState([
    { id: 1, name: 'AI Core Engine', ready: true },
    { id: 2, name: 'Live Sandbox Compiler', ready: true },
    { id: 3, name: 'Terminal Execution Pipeline', ready: true },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Codgar Sandbox Live</h2>
              <p className="text-xs text-emerald-400 font-mono">Status: {status}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
            React 18 + Tailwind
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Interactive Click Counter</p>
              <h3 className="text-2xl font-black text-white font-mono">{count}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCount(c => c - 1)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center"
              >
                -
              </button>
              <button
                onClick={() => setCount(c => c + 1)}
                className="px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center shadow-md shadow-blue-600/30"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-2 font-mono">Workspace Pipeline Checks</p>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-emerald-400 font-mono font-bold">✓ READY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
          timestamp: Date.now(),
        });
      }
      setIsPreviewOpen(true);
    }
  };

  // Permission & Agent Config
  const [policy, setPolicy] = useState<PermissionPolicy>({
    requireApprovalForCommands: false,
    requireApprovalForFileWrite: false,
    requireApprovalForGitCommit: false,
    allowedCommands: ['npm', 'node', 'python3', 'git', 'ls', 'cat', 'cargo', 'go'],
  });

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxOutputTokens: 8192,
    systemPromptAdditions: '',
    autoCompactContext: true,
    bashTimeoutSeconds: 30,
    verboseTelemetry: true,
    soundtrackAutoPlay: false,
    typewriterSpeed: 5,
  });

  // Save Language Preference
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('codgar_lang', lang);
  };

  // Initial Data Fetching
  const refreshWorkspaceData = useCallback(async () => {
    try {
      const [projRes, gitRes] = await Promise.all([
        fetch('/api/project/info'),
        fetch('/api/git/status'),
      ]);
      const projData = await projRes.json();
      const gitData = await gitRes.json();
      if (projData.success) setProjectInfo(projData.info);
      if (gitData.success) setGitStatus(gitData);
    } catch (err) {
      console.warn('Workspace sync note:', err);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaceData();
    // Default initial greeting message in Codgar AI style
    setMessages([
      {
        id: 'msg-welcome',
        role: 'agent',
        content: isFa
          ? `سلام! من **کدگر** هستم؛ دستیار هوشمند برنامه‌نویسی شما.\n\nچه پروژه یا فیچری مد نظرتان است؟ درخواست خود را بنویسید یا با دکمه ضبط صدا بیان کنید تا آماده شود.`
          : `Hello! I am **Codgar**, your intelligent coding assistant.\n\nWhat would you like to build or work on today?`,
        timestamp: Date.now(),
      },
    ]);
  }, [refreshWorkspaceData, isFa]);

  // Quick client-side check to detect coding intent for immediate UI feedback
  const [activeTaskIntent, setActiveTaskIntent] = useState<'chat' | 'coding'>('chat');

  // Handle Send Message to AI Agent
  const handleSendMessage = async (text: string, mode: AgentMode = 'chat') => {
    if (!text.trim() || isExecuting) return;

    // Strict Mode Enforcement: If user chose 'chat', strictly fast conversation; if 'agent' or code modes, strictly coding.
    const isCodingPrompt = mode === 'agent' || mode === 'plan' || mode === 'review' || mode === 'debug';

    setActiveTaskIntent(isCodingPrompt ? 'coding' : 'chat');

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      isCodingTask: isCodingPrompt,
      taskType: isCodingPrompt ? 'coding' : 'chat',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsExecuting(true);
    setAgentState(isCodingPrompt ? 'planning' : 'writing');
    setActiveWorker(isCodingPrompt ? 'coder' : 'writer');

    try {
      const response = await fetch('/api/agent/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          language,
          mode: isCodingPrompt ? 'agent' : 'chat',
          history: messages.slice(-10),
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr: any) {
        const rawText = await response.text().catch(() => '');
        throw new Error(rawText || `Server returned invalid response (status ${response.status})`);
      }

      if (data && data.success) {
        setAgentState('writing');
        const responseContent =
          data.text ||
          data.response ||
          (typeof data.message === 'string' ? data.message : data.message?.content || data.message?.text) ||
          '';

        const assistantMsg: Message = {
          id: `msg-asst-${Date.now()}`,
          role: 'agent',
          content: responseContent,
          timestamp: Date.now(),
          isCodingTask: data.isCodingTask !== undefined ? data.isCodingTask : isCodingPrompt,
          taskType: data.taskType || (isCodingPrompt ? 'coding' : 'chat'),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        playSoftChimeSound();

        // If backend returned an artifact (live code preview), auto-open live preview drawer
        if (data.artifact) {
          setActiveArtifact(data.artifact);
          setIsPreviewOpen(true);
        }

        setAgentState('completed');
        refreshWorkspaceData();
      } else {
        throw new Error(data?.error || 'Execution failed');
      }
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setAgentState('failed');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'agent',
          content: isFa
            ? `⚠️ خطا در اجرای فرمان: ${err.message || 'مشکل ارتباطی با سرور'}`
            : `⚠️ Execution error: ${err.message || 'Server connection failed'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => {
        setAgentState('idle');
        setActiveWorker(null);
      }, 2000);
    }
  };

  // Voice Recognition Handler
  const toggleVoiceRecording = () => {
    if (siriVisualActive) {
      voiceAgent.stopListening();
      setIsRecordingVoice(false);
      setSiriVisualActive(false);
    } else {
      setIsRecordingVoice(true);
      setSiriVisualActive(true);
    }
  };

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full text-slate-800 flex flex-col font-sans overflow-hidden select-none"
    >
      {/* Dynamic Visual Canvas Background */}
      <LiquidGlassBackground />

      {/* Top Application Bar (Clean Product Showcase Liquid Glass Hero Bar) */}
      <header className="relative z-30 py-3 px-4 sm:px-6 min-h-[68px] border-b border-white/80 bg-white/55 backdrop-blur-3xl flex items-center justify-between shadow-xs transition-all">
        {/* Left: Active Project/Workspace Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs text-xs font-sans font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{projectInfo?.name || (isFa ? 'محیط توسعه فعال' : 'Workspace Active')}</span>
          </div>
        </div>

        {/* Center: Hero Product Showcase Branding (کدگر / CODGAR) */}
        <div className="flex items-center justify-center my-auto py-1.5 px-3 select-none group cursor-pointer">
          <div className="flex items-center gap-2.5 sm:gap-3 transition-all duration-300">
            {/* Glossy 3D Blue Bot Agent Icon Badge */}
            <div
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-2xl p-[2px] border-2 border-white/95 transition-all duration-700 group-hover:scale-105 active:scale-95 shrink-0 ${
                isExecuting
                  ? 'animate-codgar-thinking'
                  : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_20px_rgba(56,189,248,0.35),0_6px_16px_rgba(37,99,235,0.18)]'
              }`}
            >
              <div className="w-full h-full bg-white rounded-[11px] sm:rounded-[13px] flex items-center justify-center shadow-inner relative overflow-hidden">
                <Bot
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-700 ${
                    isExecuting
                      ? 'animate-codgar-icon'
                      : 'text-blue-600 drop-shadow-[0_2px_4px_rgba(37,99,235,0.3)]'
                  }`}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_6px_#10b981] animate-pulse" />
            </div>

            {/* 3D Ice-Blue & Crystal-Cyan High-Contrast Title (کدگر / CODGAR) */}
            <h1 className="font-sans font-black tracking-tight text-2xl sm:text-3xl md:text-[30px] flex items-center leading-none mt-1">
              {isFa ? (
                <span className="flex items-center tracking-normal">
                  <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 bg-clip-text text-transparent font-black drop-shadow-[0_3px_8px_rgba(37,99,235,0.25)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                    کد
                  </span>
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-indigo-600 bg-clip-text text-transparent font-black mr-0.5 drop-shadow-[0_3px_8px_rgba(6,182,212,0.25)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                    گر
                  </span>
                </span>
              ) : (
                <span className="flex items-center tracking-tight">
                  <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 bg-clip-text text-transparent font-black drop-shadow-[0_3px_8px_rgba(37,99,235,0.25)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                    COD
                  </span>
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-indigo-600 bg-clip-text text-transparent font-black drop-shadow-[0_3px_8px_rgba(6,182,212,0.25)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                    GAR
                  </span>
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Right: Quick Actions & Soundtrack */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Soundtrack Player */}
          <div className="hidden lg:flex items-center">
            <SoundtrackBar language={language} />
          </div>

          {/* Enhanced Language Selector with Flag & Code */}
          <button
            onClick={() => setIsLanguageOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-white/90 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
            title={t.language}
          >
            <span className="text-sm leading-none">{currentLangObj.flag}</span>
            <span className="text-xs font-mono font-bold uppercase">{currentLangObj.code}</span>
          </button>

          {/* Profile Modal */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 rounded-xl bg-white/70 border border-white/90 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition cursor-pointer shadow-xs active:scale-95"
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white/70 border border-white/90 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition cursor-pointer shadow-xs active:scale-95"
            title={t.settings}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="relative z-20 flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenQueue={() => setIsQueueOpen(!isQueueOpen)}
          onOpenChanges={() => setIsDiffOpen(!isDiffOpen)}
          onOpenWorkspaces={() => setIsWorkspacesOpen(!isWorkspacesOpen)}
          onOpenEditor={() => {
            if (isCodeDrawerOpen && codeDrawerTab === 'editor') {
              setIsCodeDrawerOpen(false);
            } else {
              setCodeDrawerTab('editor');
              setIsCodeDrawerOpen(true);
            }
          }}
          onOpenTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          onOpenPreview={toggleLivePreview}
          onOpenFuel={() => setIsFuelActive(!isFuelActive)}
          isQueueActive={isQueueOpen}
          isChangesActive={isDiffOpen}
          isWorkspacesActive={isWorkspacesOpen}
          isEditorActive={isCodeDrawerOpen && codeDrawerTab === 'editor'}
          isTerminalActive={isTerminalOpen}
          isFuelActive={isFuelActive}
          isPreviewActive={isPreviewOpen}
          isExecuting={isExecuting}
          language={language}
        />

        {/* Central Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {isFuelActive ? (
            <FuelApiKeyView
              onBackToChat={() => setIsFuelActive(false)}
              userEmail="arminsh00@gmail.com"
              language={language}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden w-full">
              <CodedAiChatCard
                messages={messages}
                onSendMessage={handleSendMessage}
                isExecuting={isExecuting}
                taskIntent={activeTaskIntent}
                onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenSiriVoice={toggleVoiceRecording}
                isRecordingVoice={isRecordingVoice}
                inputText={inputText}
                onInputTextChange={setInputText}
                language={language}
                onTogglePreview={toggleLivePreview}
                isPreviewOpen={isPreviewOpen}
              />
            </div>
          )}
        </main>
      </div>

      {/* Live Artifact Preview (Interactive App/Code Runner) */}
      {isPreviewOpen && activeArtifact && (
        <LiveArtifactPreview
          artifact={activeArtifact}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          language={language}
        />
      )}

      {/* Animated Code Drawer / Monaco Workspace */}
      <AnimatedCodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        language={language}
        initialTab={codeDrawerTab}
        messages={messages}
        onRefreshWorkspace={refreshWorkspaceData}
      />

      {/* Terminal Panel */}
      {isTerminalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[80vh] bg-[#090e1a] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <TerminalIcon className="w-4 h-4" />
                <span>Integrated Execution Terminal</span>
              </div>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono cursor-pointer px-2 py-0.5 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TerminalPanel isOpen={true} language={language} messages={messages} onToggle={() => setIsTerminalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* File Explorer Modal */}
      <FileExplorer
        isOpen={isFileExplorerOpen}
        onClose={() => setIsFileExplorerOpen(false)}
        onSelectFileForContext={(path) => {
          setInputText((prev) => `${prev} @${path} `);
          setIsFileExplorerOpen(false);
        }}
      />

      {/* Git Diff Viewer Modal */}
      <DiffViewerModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        onRefreshGitStatus={refreshWorkspaceData}
      />

      {/* Workspaces Modal */}
      <FreebuffWorkspacesModal
        isOpen={isWorkspacesOpen}
        onClose={() => setIsWorkspacesOpen(false)}
        language={language}
      />

      {/* Task Queue Drawer */}
      <FreebuffQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        language={language}
        onEnqueueTask={(prompt) => handleSendMessage(prompt, 'agent')}
        isExecuting={isExecuting}
      />

      {/* Skills Modal */}
      <SkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectInfo={projectInfo}
        policy={policy}
        onUpdatePolicy={setPolicy}
        agentConfig={agentConfig}
        onUpdateAgentConfig={setAgentConfig}
        language={language}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        currentProject={projectInfo?.name || 'codgar-agent'}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Local OS Terminal Bridge Modal */}
      <LocalBridgeModal
        isOpen={isLocalBridgeOpen}
        onClose={() => setIsLocalBridgeOpen(false)}
        language={language}
      />

      {/* Siri Voice Visual Overlay */}
      {siriVisualActive && (
        <SiriLiveSpeakerOverlay
          isOpen={siriVisualActive}
          onClose={() => {
            setSiriVisualActive(false);
            setIsRecordingVoice(false);
            voiceAgent.stopListening();
          }}
          onSendTranscript={(text) => {
            handleSendMessage(text, 'agent');
            setSiriVisualActive(false);
            setIsRecordingVoice(false);
          }}
          onInsertToInput={(text) => {
            setInputText(text);
            setSiriVisualActive(false);
            setIsRecordingVoice(false);
          }}
          language={language}
        />
      )}
    </div>
  );
}
