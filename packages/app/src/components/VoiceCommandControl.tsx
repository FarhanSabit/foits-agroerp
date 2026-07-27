import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, HelpCircle, Sparkles, X, Check, Command } from "lucide-react";

interface VoiceCommandControlProps {
  onNavigateTab: (tab: string) => void;
  onQuickAction?: (action: string) => void;
  isBangla: boolean;
}

// Typing for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceCommandControl({
  onNavigateTab,
  onQuickAction,
  isBangla
}: VoiceCommandControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = isBangla ? "bn-BD" : "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      processCommand(currentTranscript.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if meant to stay active
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isBangla]);

  const processCommand = (text: string) => {
    // Navigation Triggers
    if (text.includes("procurement") || text.includes("রিকুইজিশন") || text.includes("ক্রয়")) {
      onNavigateTab("procurement");
      setLastCommand(isBangla ? "নেভিগেশন: প্রকিউরমেন্ট মডিউল" : "Navigated: Procurement Module");
      setTranscript("");
    } else if (text.includes("inventory") || text.includes("warehouse") || text.includes("স্টক") || text.includes("ইনভেন্টরি")) {
      onNavigateTab("inventory");
      setLastCommand(isBangla ? "নেভিগেশন: ইনভেন্টরি ও ওয়্যারহাউজ" : "Navigated: Inventory & Warehouse");
      setTranscript("");
    } else if (text.includes("sales") || text.includes("order") || text.includes("বিক্রয়")) {
      onNavigateTab("sales");
      setLastCommand(isBangla ? "নেভিগেশন: সেলস মডিউল" : "Navigated: Sales & Distribution");
      setTranscript("");
    } else if (text.includes("finance") || text.includes("ledger") || text.includes("অর্থায়ন") || text.includes("হিসাব")) {
      onNavigateTab("finance");
      setLastCommand(isBangla ? "নেভিগেশন: ফাইন্যান্স ও লেজার" : "Navigated: Finance & Ledger");
      setTranscript("");
    } else if (text.includes("production") || text.includes("factory") || text.includes("উৎপাদন")) {
      onNavigateTab("production");
      setLastCommand(isBangla ? "নেভিগেশন: প্রোডাকশন মিল" : "Navigated: Production Mill");
      setTranscript("");
    } else if (text.includes("logistics") || text.includes("fleet") || text.includes("গাড়ি")) {
      onNavigateTab("fleet");
      setLastCommand(isBangla ? "নেভিগেশন: লজিস্টিকস ট্রিপ" : "Navigated: Logistics & Fleet");
      setTranscript("");
    } else if (text.includes("raise pr") || text.includes("generate pr") || text.includes("new requisition") || text.includes("রিকুইজিশন তৈরি")) {
      onNavigateTab("procurement");
      if (onQuickAction) onQuickAction("raise_pr");
      setLastCommand(isBangla ? "অ্যাকশন: প্রকিউরমেন্ট রিকুইজিশন তৈরি" : "Action: Raised Purchase Requisition");
      setTranscript("");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(isBangla ? "আপনার ব্রাউজারে ভয়েস রেকগনিশন সক্রিয় নয়। দয়া করে Chrome বা Edge ব্যবহার করুন।" : "Speech Recognition is not supported by your current browser environment. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setLastCommand(null);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-xl">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
            isListening
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          }`}
          title={isListening ? "Listening... Click to Stop" : "Activate Voice Command AI"}
        >
          {isListening ? (
            <>
              <Mic className="h-4 w-4 animate-bounce" />
              <span>{isBangla ? "শ্রবণরত..." : "LISTENING..."}</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>{isBangla ? "ভয়েস কমান্ড" : "VOICE CONTROL"}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
          title="Voice Command Directives Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Active Listening / Last Command Banner */}
      {(isListening || lastCommand) && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl border border-indigo-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {isListening ? (isBangla ? "AI কথা শুনছে" : "AI Speech Listener") : (isBangla ? "কমান্ড এক্সিকিউটেড" : "Command Executed")}
            </span>
            <button onClick={() => { setIsListening(false); setLastCommand(null); }} className="text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {transcript && (
            <p className="text-xs font-mono text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-500/20 mb-1">
              "{transcript}"
            </p>
          )}

          {lastCommand && (
            <div className="text-xs font-semibold text-indigo-200 bg-indigo-950/50 p-2 rounded border border-indigo-500/30 flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{lastCommand}</span>
            </div>
          )}

          {!transcript && isListening && !lastCommand && (
            <p className="text-[11px] text-slate-400 italic">
              {isBangla ? 'বলুন: "Go to Procurement" বা "Open Inventory"' : 'Say: "Go to Procurement" or "Open Inventory"'}
            </p>
          )}
        </div>
      )}

      {/* Voice Directives Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-indigo-400">
              <Command className="h-6 w-6" />
              <h3 className="text-lg font-bold">
                {isBangla ? "ভয়েস কমান্ড গাইড" : "Agro-ERP Voice Directives"}
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              {isBangla
                ? "মাইক্রোফোন চেপে যেকোনো সময় সরাসরি কথা বলে আপনার ইআরপি পরিচালনা করুন:"
                : "Press the microphone button and issue hands-free operational instructions to navigate or trigger ERP tasks:"}
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-indigo-400 font-bold">"Go to Procurement"</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Switches directly to Purchase & Supplier RFQs</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-indigo-400 font-bold">"Open Inventory"</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Navigates to Stock Silos & Batch Matrix</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-indigo-400 font-bold">"Open Sales"</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Opens Sales Orders & Customer Accounts</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-indigo-400 font-bold">"Generate PR"</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Opens the Purchase Requisition creation flow</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full glass-button-indigo py-2 text-xs font-bold"
            >
              {isBangla ? "বুঝতে পেরেছি" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
