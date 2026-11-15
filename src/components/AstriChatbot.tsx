import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Key,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  HeartPulse,
  Gauge,
  Flame,
  ArrowRight,
  RefreshCw,
  Mic,
  MicOff,
  Radio,
  ExternalLink,
} from 'lucide-react';
import AstriAstronaut3D from './AstriAstronaut3D';
import { askAstriGemini, AstriMessage } from '../services/geminiAstriService';

interface AstriChatbotProps {
  onBackToOverview?: () => void;
  astronautName?: string;
  astronautRole?: string;
}

const INITIAL_MESSAGES: AstriMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'astri',
    text: `Greetings, Commander. I am **ASTRI** (Autonomous Space Telemetry & Reconnaissance Intelligence), your onboard flight companion powered by Gemini AI.

All 16 biometric and environmental telemetry channels are transmitting at **0.8s latency**. How may I assist your mission objectives today?`,
    timestamp: 'NOW',
    telemetryRef: 'EVA-04 // TELEMETRY LOCK',
  },
];

const SUGGESTED_PROMPTS = [
  {
    icon: Activity,
    label: 'Heart Rate & Vitals Analysis',
    prompt: 'ASTRI, analyze my latest cardiovascular heart rate variability and blood pressure baseline.',
  },
  {
    icon: Gauge,
    label: 'EVA Suit Pressure & O₂',
    prompt: 'Run a diagnostic on EVA suit primary oxygen reserve, scrubber saturation, and 4.3 psi seal.',
  },
  {
    icon: Flame,
    label: "Today's Flight Roadmap",
    prompt: "What is my immediate daily flight roadmap and scheduled bio-tests for today's orbit?",
  },
  {
    icon: Radio,
    label: 'Orbital Path & Solar Window',
    prompt: 'Check current ISS orbital inclination, solar beta angle, and next optical laser downlink pass.',
  },
];

export default function AstriChatbot({
  onBackToOverview,
  astronautName = 'CDR. Alex Vance',
  astronautRole = 'Mission Commander',
}: AstriChatbotProps) {
  const [messages, setMessages] = useState<AstriMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activeApiKey, setActiveApiKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize API Key from storage
  useEffect(() => {
    const storedKey = localStorage.getItem('astri_gemini_api_key') || '';
    setActiveApiKey(storedKey);
    setApiKeyInput(storedKey);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Speech Synthesis
  const speakText = (text: string) => {
    if (!speechSynthesisActive || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick space/futuristic voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    const userMsg: AstriMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const responseText = await askAstriGemini(prompt, messages, activeApiKey);

      const astriMsg: AstriMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'astri',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        telemetryRef: 'GEMINI 1.5 // AUTONOMOUS SYNC',
      };

      setMessages((prev) => [...prev, astriMsg]);
      speakText(responseText);
    } catch (err) {
      console.error('Error generating ASTRI response:', err);
      const errorMsg: AstriMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'astri',
        text: 'Commander, telemetry sync was briefly interrupted by orbital solar radiation. Telemetry link is restored.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    setActiveApiKey(key);
    localStorage.setItem('astri_gemini_api_key', key);
    setShowApiKeyModal(false);
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  return (
    <div
      className="w-full min-h-[92vh] flex flex-col bg-[#F6EEDB] text-[#06132B] relative overflow-hidden select-none"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePos({ x: normX, y: normY });
      }}
    >
      {/* Background Ambient Space Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,19,43,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,19,43,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ── TOP HEADER BAR ── */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3.5 border-b border-[#06132B]/15 bg-[#06132B] text-[#F6EEDB] shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#F6EEDB]">
                ASTRI AI // FLIGHT COMPANION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                GEMINI 4.0 // ACTIVE
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#ead9b2] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ISS EXPEDITION 72 // TELEMETRY CHANNELS 01–16 CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Speech Toggle */}
          <button
            type="button"
            onClick={() => {
              setSpeechSynthesisActive((prev) => !prev);
              if (speechSynthesisActive && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              speechSynthesisActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
            title="Toggle ASTRI Voice Readout"
          >
            {speechSynthesisActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{speechSynthesisActive ? 'VOICE ON' : 'VOICE OFF'}</span>
          </button>

          {/* Gemini API Key Config */}
          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-[#ead9b2] hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{activeApiKey ? 'KEY ACTIVE' : 'SET GEMINI KEY'}</span>
          </button>

          {/* Clear Messages */}
          <button
            type="button"
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f6eedb] text-[#06132b] hover:bg-white transition-all cursor-pointer"
            >
              ← RETURN
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN 3-ZONE LAYOUT: (1) TELEMETRY HUD // (2) 3D ASTRONAUT IN THE MIDDLE // (3) CHAT CONVERSATION ── */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-6 relative z-10 items-stretch">
        
        {/* ── ZONE 1 (LEFT 3 COLS): TELEMETRY MONITOR & MISSION PROFILE ── */}
        <aside className="lg:col-span-3 flex flex-col gap-3.5 order-2 lg:order-1">
          {/* Astronaut Profile Pill */}
          <div className="bg-[#06132B] text-[#F6EEDB] rounded-2xl p-4 border border-[#06132B]/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xl border border-white/20 shadow">
                👨‍🚀
              </div>
              <div className="overflow-hidden">
                <div className="font-display font-bold text-sm text-[#F6EEDB] truncate">{astronautName}</div>
                <div className="font-mono text-[11px] text-[#ead9b2] truncate">{astronautRole}</div>
                <div className="font-mono text-[10px] text-cyan-300 mt-0.5">EVA-04 // ACTIVE HUD</div>
              </div>
            </div>

            {/* Quick telemetry indicators */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 font-mono text-[11px]">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase">Heart Rate</span>
                <span className="font-bold text-[#F6EEDB]">72 BPM</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase">Suit Pressure</span>
                <span className="font-bold text-[#F6EEDB]">4.3 psi</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase">O₂ Reserve</span>
                <span className="font-bold text-emerald-400">99.4%</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase">CO₂ Scrubber</span>
                <span className="font-bold text-cyan-300">12% SAT</span>
              </div>
            </div>
          </div>

          {/* Quick Mission Inquiries */}
          <div className="bg-[#06132B]/95 text-[#F6EEDB] rounded-2xl p-4 border border-[#06132B]/30 shadow-lg flex-1 flex flex-col">
            <div className="font-mono text-[11px] text-[#ead9b2] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Suggested Inquiries</span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {SUGGESTED_PROMPTS.map((p, idx) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-xs text-[#F6EEDB] hover:text-cyan-200 transition-all cursor-pointer flex items-center gap-2.5 group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-900/40 text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium leading-snug line-clamp-2">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── ZONE 2 (MIDDLE 5 COLS): 3D ASTRONAUT HERO VIEWPORT ── */}
        <section className="lg:col-span-4 flex flex-col items-center justify-center min-h-[420px] lg:min-h-full rounded-2xl bg-gradient-to-b from-[#06132B]/10 via-[#06132B]/5 to-transparent border border-[#06132B]/15 relative overflow-hidden order-1 lg:order-2 shadow-inner">
          {/* Reticle Corner Ticks */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#06132B]/30 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#06132B]/30 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#06132B]/30 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#06132B]/30 pointer-events-none" />

          {/* Dynamic Astronaut State Overlay */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20 pointer-events-none">
            <span className="font-mono text-[10px] font-bold text-[#06132B] tracking-widest uppercase bg-[#F6EEDB]/90 px-2.5 py-1 rounded-md border border-[#06132B]/20 shadow-sm">
              3D ASTRONAUT // ZERO-G TELEMETRY
            </span>
            <div className="flex items-center gap-1.5 bg-[#06132B] text-[#F6EEDB] px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold shadow">
              <span className={`w-2 h-2 rounded-full ${isThinking ? 'bg-amber-400 animate-ping' : isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{isThinking ? 'SYNTHESIZING' : isSpeaking ? 'SPEAKING' : 'READY'}</span>
            </div>
          </div>

          {/* The 3D Astronaut in the Center */}
          <div className="w-full h-full min-h-[380px] flex items-center justify-center relative">
            <AstriAstronaut3D
              mouseX={mousePos.x}
              mouseY={mousePos.y}
              isThinking={isGenerating}
              isSpeaking={isSpeaking}
            />
          </div>

          {/* Speech bubble indicator from astronaut */}
          <div className="absolute bottom-4 inset-x-4 z-20 bg-[#06132B]/95 backdrop-blur-md border border-cyan-400/30 text-[#F6EEDB] rounded-xl p-3 shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#ead9b2] mb-1">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <strong>ASTRI COMPANION</strong>
              </span>
              <span className="text-[10px] text-cyan-300">GEMINI N4 // LATENCY 0.8s</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-2">
              {isGenerating
                ? 'Processing bio-telemetry stream and calculating mission diagnostics...'
                : messages[messages.length - 1]?.text.replace(/[*_#•]/g, ' ').slice(0, 140) + '...'}
            </p>
          </div>
        </section>

        {/* ── ZONE 3 (RIGHT 5 COLS): CHAT CONVERSATION TERMINAL ── */}
        <section className="lg:col-span-5 flex flex-col h-[560px] lg:h-full bg-[#06132B] text-[#F6EEDB] rounded-2xl border border-[#06132B]/30 shadow-2xl overflow-hidden order-3">
          {/* Chat Window Sub-Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-[#0a1c3f]/80 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-[#ead9b2]">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>LIVE COMM // HOUSTON FLIGHT RELAY</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {messages.length} {messages.length === 1 ? 'TRANSMISSION' : 'TRANSMISSIONS'}
            </span>
          </div>

          {/* Scrollable Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scroll">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 font-mono text-[10px] text-slate-400">
                    {isUser ? (
                      <>
                        <span>{msg.timestamp}</span>
                        <span className="font-semibold text-amber-300">COMMANDER</span>
                        <User className="w-3 h-3 text-amber-300" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold text-cyan-300">ASTRI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {msg.telemetryRef && (
                          <span className="text-[9px] text-[#ead9b2] bg-white/10 px-1.5 py-0.2 rounded">
                            {msg.telemetryRef}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative ${
                      isUser
                        ? 'bg-[#1E3A8A] text-white rounded-tr-sm border border-blue-400/20 shadow-md'
                        : 'bg-[#0B1736] text-[#F6EEDB] rounded-tl-sm border border-cyan-400/20 shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Render bold headers cleanly
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <div key={lIdx} className="font-bold text-amber-300 mb-1">
                              {line.replace(/\*\*/g, '')}
                            </div>
                          );
                        }
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return (
                            <div key={lIdx} className="flex items-start gap-1.5 my-0.5">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{line.slice(2)}</span>
                            </div>
                          );
                        }
                        return <p key={lIdx} className="my-1">{line}</p>;
                      })}
                    </div>

                    {/* Copy and Speech buttons */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'COPIED' : 'COPY'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3 text-cyan-400" />
                          <span>LISTEN</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 p-3 bg-[#0B1736] rounded-xl border border-cyan-400/20 text-xs font-mono text-cyan-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>ASTRI analyzing live bio-telemetry stream...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field & Send Controls */}
          <div className="p-3 border-t border-white/10 bg-[#0a1c3f]/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask ASTRI telemetry, flight tasks, or EVA diagnostics..."
                  className="w-full bg-[#06132B] text-[#F6EEDB] placeholder-slate-400 text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 transition-colors pr-9"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-2.5 p-1 rounded-md transition-colors cursor-pointer ${
                    isListening ? 'text-rose-400 animate-pulse' : 'text-slate-400 hover:text-cyan-300'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isGenerating}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer shrink-0"
              >
                <span>TRANSMIT</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* ── GEMINI API KEY MODAL DIALOG ── */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#06132B] text-[#F6EEDB] rounded-2xl border border-cyan-400/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base text-white">Gemini API Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ASTRI is equipped with an autonomous onboard spaceflight intelligence engine. To connect live to Google Gemini 1.5/2.0 API, paste your Google AI Studio API key below:
            </p>

            <div>
              <label className="block text-[11px] font-mono text-[#ead9b2] mb-1.5">GOOGLE GEMINI API KEY</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#0B1736] text-[#F6EEDB] placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setActiveApiKey('');
                  localStorage.removeItem('astri_gemini_api_key');
                  setShowApiKeyModal(false);
                }}
                className="text-xs text-rose-300 hover:text-rose-200 font-mono cursor-pointer"
              >
                Clear Key (Use Onboard Engine)
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-[#06132b] shadow cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

