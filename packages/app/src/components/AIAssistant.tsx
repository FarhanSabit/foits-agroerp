import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  Loader,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { ERPState, DocStatus } from "../types";
import { Button, Input } from "@agro-erp/shared-ui";

interface AIAssistantProps {
  state: ERPState;
  onExecuteAction: (actionType: string, payload?: any) => void;
  isBangla: boolean;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  actions?: {
    label: string;
    actionType: string;
    payload?: any;
  }[];
}

export default function AIAssistant({
  state,
  onExecuteAction,
  isBangla
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: isBangla
        ? "আসসালামু আলাইকুম! আমি ওআইটিএস ঢাকা অ্যাগ্রো ইআরপি সহকারী। আমি আপনাকে এই ডেমো ফ্লোর প্রতিটি ধাপ পরিচালনা করতে এবং লাইভ ডাটা বিশ্লেষণ করতে সাহায্য করতে পারি।"
        : "Hello! I am your OITS Dhaka Agro ERP AI Assistant. I can help you analyze live inventory levels, check pending approvals, track logistics trips, or execute the Golden Demo Flow steps!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput("");

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setIsTyping(true);

    // Simulate AI response based on keywords & current state
    setTimeout(() => {
      let aiText = "";
      let actions: Message["actions"] = [];

      const query = text.toLowerCase();

      // Check current state metrics for real-time AI context!
      const maizeStock = state.inventory.find((i) => i.code === "RM001")?.availableStock || 0;
      const poultryFeedStock = state.inventory.find((i) => i.code === "FG001")?.availableStock || 0;
      const pendingPRs = state.requisitions.filter((r) => r.status === DocStatus.PENDING);
      const pendingPOs = state.purchaseOrders.filter((p) => p.approvalStatus === DocStatus.PENDING);
      const cash = state.ledger.find((a) => a.code === "1010")?.balance || 0;

      if (query.includes("maize") || query.includes("ভুট্টা") || query.includes("shortage") || query.includes("ঘাটতি")) {
        if (maizeStock < 50000) {
          aiText = isBangla
            ? `সিস্টেম বিশ্লেষণ: বর্তমানে ভুট্টার মজুদ মাত্র ${maizeStock.toLocaleString()} কেজি, যা রিঅর্ডার লেভেল (৫০,০০০ কেজি) এর নিচে রয়েছে। ১,০০০ ব্যাগ ফিড উৎপাদনের জন্য ২০,০০০ কেজি ঘাটতি রয়েছে। রিকুইজিশন তৈরি করতে চান?`
            : `Live SCM Analysis: Maize stock is currently at ${maizeStock.toLocaleString()} KG, which is below the reorder level. We have a shortage of ${Math.max(0, 60000 - maizeStock).toLocaleString()} KG for the current Poultry Feed production.`;
          
          if (maizeStock < 60000) {
            actions = [
              {
                label: isBangla ? "রিকুইজিশন (PR) তৈরি করুন" : "Generate Shortage PR",
                actionType: "generate_pr",
                payload: { itemCode: "RM001", qty: 20000 }
              }
            ];
          }
        } else {
          aiText = isBangla
            ? `ভুট্টার মজুদ সন্তোষজনক অবস্থায় রয়েছে (${maizeStock.toLocaleString()} কেজি)। কোনো অতিরিক্ত ক্রয়ের প্রয়োজন নেই।`
            : `Maize stock is currently healthy at ${maizeStock.toLocaleString()} KG. No immediate procurement needed.`;
        }
      } else if (query.includes("approve") || query.includes("অনুমোদন") || query.includes("pending") || query.includes("অপেক্ষমাণ")) {
        if (pendingPRs.length > 0 || pendingPOs.length > 0) {
          aiText = isBangla
            ? `বর্তমানে ${pendingPRs.length}টি রিকুইজিশন এবং ${pendingPOs.length}টি কার্যাদেশ অনুমোদন এর জন্য পেন্ডিং রয়েছে। অনুমোদন সম্পন্ন করতে চান?`
            : `Approval Queue: There are currently ${pendingPRs.length} PRs and ${pendingPOs.length} POs pending CFO authorization.`;
          
          if (pendingPRs.length > 0) {
            actions.push({
              label: isBangla ? "পিআর অনুমোদন দিন" : "Approve Requisition",
              actionType: "approve_pr",
              payload: { id: pendingPRs[0].id }
            });
          }
          if (pendingPOs.length > 0) {
            actions.push({
              label: isBangla ? "পিও অনুমোদন দিন" : "Approve Purchase Order",
              actionType: "approve_po",
              payload: { id: pendingPOs[0].id }
            });
          }
        } else {
          aiText = isBangla
            ? "অনুমোদন অপেক্ষমাণ তালিকায় কোনো পেন্ডিং আইটেম নেই। সকল কাজ হালনাগাদ রয়েছে।"
            : "The approval queue is completely cleared. No pending actions right now.";
        }
      } else if (query.includes("cash") || query.includes("টাকা") || query.includes("ব্যাংক") || query.includes("receivable")) {
        aiText = isBangla
          ? `আর্থিক ব্যালেন্স শিট: বর্তমানে ব্যাংক এশিয়া এ্যাকাউন্টে মোট ৳ ${(cash / 10000000).toFixed(2)} কোটি তরল ক্যাশ রিজার্ভ রয়েছে।`
          : `Financial Balances: Cash position in Bank Asia is ৳ ${(cash / 10000000).toFixed(2)} Crore. Accounts Receivable outstanding is ৳ 2.3 Crore.`;
      } else if (query.includes("help") || query.includes("সাহায্য") || query.includes("demo") || query.includes("ডেমো")) {
        aiText = isBangla
          ? "আমি আপনাকে ডেমো ফ্লোর ধাপগুলো সম্পন্ন করতে সাহায্য করব। আপনি 'Run MRP' বা 'Approve PR' বা 'Post GRN' টাইপ করতে পারেন।"
          : "I recommend following the 'Golden Demo Flow' indicator bar at the top of your screen to execute each step (Forecast ➔ MRP ➔ PR ➔ RFQ ➔ PO ➔ GRN ➔ Production ➔ Sales ➔ Collection).";
      } else {
        aiText = isBangla
          ? `ধন্যবাদ! আপনি অ্যাগ্রো ইআরপি সংক্রান্ত প্রশ্ন করেছেন। বর্তমানে পোল্ট্রি ফিড মজুদ রয়েছে ${poultryFeedStock.toLocaleString()} ব্যাগ। আপনার জন্য কোনো হেল্প করতে পারি?`
          : `I have scanned the active ERP database. Finished Poultry Feed stock is ${poultryFeedStock.toLocaleString()} Bags. We have 10 active flatbed vehicles in Gazipur depot. Let me know if you would like me to trigger an automated action!`;
        
        actions = [
          {
            label: isBangla ? "পরবর্তী ডেমো ধাপে যান" : "Go to Next Demo Step",
            actionType: "next_demo_step"
          }
        ];
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiText, actions }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="glass-sidebar w-80 h-full border-l border-slate-200/25 dark:border-white/10 shrink-0 flex flex-col text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-slate-950/40 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400 animate-pulse shrink-0" />
        <div className="flex flex-col">
          <span className="font-bold text-xs tracking-tight text-slate-800 dark:text-white uppercase">AI ERP Co-Pilot</span>
          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">OITS Dhaka Smart Agent</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scroll-smooth">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              m.sender === "user"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "bg-white/30 dark:bg-slate-950/40 text-indigo-650 dark:text-indigo-400 border border-slate-200/40 dark:border-white/10"
            }`}>
              {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="flex flex-col max-w-[80%]">
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-indigo-500/10 dark:bg-indigo-500/25 text-slate-850 dark:text-indigo-100 border border-indigo-500/20 dark:border-indigo-500/35 rounded-tr-none"
                  : "bg-white/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-white/5 rounded-tl-none shadow-sm"
              }`}>
                {m.text}
              </div>

              {/* Action Buttons */}
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2 space-y-1.5 self-start">
                  {m.actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => onExecuteAction(act.actionType, act.payload)}
                      className="w-full flex items-center justify-between gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-indigo-750 dark:text-indigo-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 dark:border-white/10 text-left transition-colors"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-white/30 dark:bg-slate-950/40 text-indigo-500 dark:text-indigo-400 border border-slate-200/50 dark:border-white/10 flex items-center justify-center shrink-0">
              <Loader className="h-4 w-4 animate-spin" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 self-center">AI is scanning ledger...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-slate-950/20 flex gap-1.5 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => handleSend(isBangla ? "ভুট্টা মজুদ পরীক্ষা করো" : "Check Maize shortages")}
          className="bg-white/45 hover:bg-white/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-mono text-[9px] px-2.5 py-1.5 rounded-md border border-slate-200/50 dark:border-white/10 shrink-0 focus-visible:ring-1 focus-visible:ring-indigo-500 outline-none transition-colors"
        >
          {isBangla ? "ভুট্টা মজুদ" : "Maize Stock"}
        </button>
        <button
          onClick={() => handleSend(isBangla ? "অনুমোদন অপেক্ষমাণ তালিকা" : "Show pending approvals")}
          className="bg-white/45 hover:bg-white/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-mono text-[9px] px-2.5 py-1.5 rounded-md border border-slate-200/50 dark:border-white/10 shrink-0 focus-visible:ring-1 focus-visible:ring-indigo-500 outline-none transition-colors"
        >
          {isBangla ? "পেন্ডিং তালিকা" : "Pending Queue"}
        </button>
        <button
          onClick={() => handleSend(isBangla ? "আর্থিক রিজার্ভ কত?" : "Show cash position")}
          className="bg-white/45 hover:bg-white/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-mono text-[9px] px-2.5 py-1.5 rounded-md border border-slate-200/50 dark:border-white/10 shrink-0 focus-visible:ring-1 focus-visible:ring-indigo-500 outline-none transition-colors"
        >
          {isBangla ? "আর্থিক রিজার্ভ" : "Cash Ledger"}
        </button>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-slate-950/40 flex gap-2 items-center">
        <Input
          type="text"
          placeholder={isBangla ? "প্রশ্ন করুন..." : "Ask AI Co-Pilot..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button
          onClick={() => handleSend()}
          variant="indigo"
          className="p-2.5 rounded-xl shrink-0 flex items-center justify-center w-9 h-9"
          aria-label="Send message"
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>

    </div>
  );
}
