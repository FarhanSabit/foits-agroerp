import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Languages,
  Sun,
  Moon,
  Plus,
  User,
  LogOut,
  ChevronDown,
  Info,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Smartphone,
  Menu
} from "lucide-react";
import { Notification, DocStatus, UserAccount } from "../types";
import { ShieldCheck, Lock, UserCheck } from "lucide-react";

interface HeaderProps {
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  isBangla: boolean;
  setIsBangla: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  triggerSearchOpen: () => void;
  onQuickAction: (action: string) => void;
  dbConnected: boolean;
  onResetDB: () => void;
  role: string;
  onChangeRole: (newRole: string) => void;
  currency: "BDT" | "USD" | "EUR";
  onToggleCurrency: (currency: "BDT" | "USD" | "EUR") => void;
  onAutoGeneratePreventivePR?: (itemCode: string, qty: number) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenRoleManagerModal?: () => void;
  onSignOut?: () => void;
  toggleMobileSidebar?: () => void;
}

export default function Header({
  notifications,
  markNotificationRead,
  isBangla,
  setIsBangla,
  darkMode,
  setDarkMode,
  triggerSearchOpen,
  onQuickAction,
  dbConnected,
  onResetDB,
  role,
  onChangeRole,
  currency,
  onToggleCurrency,
  onAutoGeneratePreventivePR,
  currentUser,
  onOpenAuthModal,
  onOpenRoleManagerModal,
  onSignOut,
  toggleMobileSidebar
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const [notifFilter, setNotifFilter] = useState<string>("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === "All") return true;
    if (notifFilter === "Approvals" || notifFilter === "Approval") return n.category === "Approval";
    return n.category === notifFilter;
  });

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        triggerSearchOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSearchOpen]);

  const toggleLanguage = () => {
    setIsBangla(!isBangla);
  };

  // Role permissions for Quick action creators
  const showPR = role === "CFO" || role === "SCM Manager";
  const showRFQ = role === "CFO" || role === "SCM Manager";
  const showPO = role === "CFO" || role === "SCM Manager";
  const showWO = role === "CFO" || role === "SCM Manager" || role === "Warehouse Admin";
  const showSO = role === "CFO";

  return (
    <header className="sticky top-0 glass-header z-30 h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-150 border-b border-slate-200/50 dark:border-white/10 relative">
      {!isOnline && (
        <div className="absolute top-full left-0 right-0 bg-amber-500/95 text-slate-950 px-4 py-1.5 text-[11px] font-mono font-bold flex items-center justify-between shadow-md z-40 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 truncate">
            <WifiOff className="h-4 w-4 shrink-0 animate-bounce text-slate-950" />
            <span className="truncate">
              {isBangla
                ? "নেটওয়ার্ক সংযোগ বিচ্ছিন্ন — আপনার পরিবর্তনসমূহ স্থানীয়ভাবে সংরক্ষিত হচ্ছে এবং সিনক্রোনাইজেশনের জন্য অপেক্ষমাণ।"
                : "NETWORK DISCONNECTED — Changes saved locally & queued for automatic sync upon reconnection."}
            </span>
          </div>
          <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0 ml-2">
            Offline Queued
          </span>
        </div>
      )}
      
      {/* Left: Mobile Toggle + Search Bar trigger */}
      <div className="flex items-center gap-2 sm:gap-4 w-1/3 lg:w-1/4">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={triggerSearchOpen}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-white/30 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors rounded-lg text-xs font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 border border-slate-200/50 dark:border-white/10 outline-none"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">{isBangla ? "সার্চ করুন... (Ctrl + K)" : "Search... (Ctrl + K)"}</span>
            <span className="sm:hidden">{isBangla ? "সার্চ" : "Search"}</span>
          </div>
          <span className="hidden xl:inline bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none tracking-tight shrink-0">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickOpen(!quickOpen);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 border border-white/10 outline-none hover:shadow-lg shadow-indigo-500/15 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{isBangla ? "নতুন অ্যাকশন" : "Quick Action"}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          
          {quickOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-card py-1 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center">
                <span>{isBangla ? "নতুন অ্যাকশন" : "Raise Transaction"}</span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-md font-mono">{role}</span>
              </div>
              
              {role === "CFO" && (
                <>
                  <button
                    onClick={() => {
                      onQuickAction("approve_all_cfo");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 transition-colors font-medium text-xs flex items-center justify-between"
                  >
                    <span>{isBangla ? "সব অনুমোদন করুন" : "Approve All (PR/PO)"}</span>
                    <span className="text-[9px] font-mono border border-emerald-500/20 px-1 rounded">CFO</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("financial_report_cfo");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "আর্থিক বিবরণী বিশ্লেষণ" : "Financial Report Preview"}
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("create_so");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors border-t border-slate-100 dark:border-slate-700/60 text-xs"
                  >
                    {isBangla ? "সেলস অর্ডার তৈরি করুন (SO)" : "Create Sales Order (SO)"}
                  </button>
                </>
              )}

              {role === "SCM Manager" && (
                <>
                  <button
                    onClick={() => {
                      onQuickAction("create_pr");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "ক্রয় রিকুইজিশন তৈরি (PR)" : "Raise Requisition (PR)"}
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("create_rfq");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "দরপত্র আহ্বান তৈরি (RFQ)" : "Generate RFQ"}
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("create_po");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "পারচেজ অর্ডার তৈরি (PO)" : "Create Purchase Order (PO)"}
                  </button>
                </>
              )}

              {role === "Warehouse Admin" && (
                <>
                  <button
                    onClick={() => {
                      onQuickAction("log_stock_intake");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 transition-colors font-medium text-xs flex items-center justify-between"
                  >
                    <span>{isBangla ? "স্টক ইনটেক লগ করুন" : "Log Stock Intake (GRN)"}</span>
                    <span className="text-[9px] font-mono border border-indigo-500/20 px-1 rounded">WH</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("issue_wo");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "উৎপাদন ওয়ার্ক অর্ডার (WO)" : "Issue Work Order (WO)"}
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction("physical_audit_warehouse");
                      setQuickOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-xs"
                  >
                    {isBangla ? "বাস্তব স্টক নিরীক্ষা" : "Force Physical Stock Audit"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/10 bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${dbConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className="hidden md:inline text-[9px] font-bold font-mono tracking-wide text-slate-500 dark:text-slate-400">
              {isBangla ? "নিওন পিজি" : "NEON PG"}
            </span>
          </div>
          <button
            onClick={onResetDB}
            className="p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
            title={isBangla ? "ডাটাবেজ রি-সিড করুন" : "Re-seed Dummy Data"}
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        {/* PWA / Field Warehouse Offline Status Indicator */}
        <div
          className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold font-mono transition-all ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-xs"
          }`}
          title={
            isOnline
              ? "Network Connected - Online Mode"
              : "Network Disconnected - Actions currently queued for local synchronization"
          }
        >
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">ONLINE</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>OFFLINE (QUEUED)</span>
            </>
          )}
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none flex items-center gap-1 text-xs font-semibold cursor-pointer"
          title={isBangla ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
        >
          <Languages className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-mono tracking-tight text-[11px] hidden sm:inline">{isBangla ? "EN" : "বাংলা"}</span>
        </button>

        {/* Currency Toggle */}
        <button
          onClick={() => {
            const nextCurr = currency === "BDT" ? "USD" : currency === "USD" ? "EUR" : "BDT";
            onToggleCurrency(nextCurr);
          }}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title={isBangla ? "মুদ্রা পরিবর্তন করুন" : "Toggle Currency"}
        >
          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">{currency === "USD" ? "$" : currency === "EUR" ? "€" : "৳"}</span>
          <span className="font-mono tracking-tight text-[11px] hidden sm:inline">{currency}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
              setQuickOpen(false);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 rounded-full text-white text-[9px] font-bold font-mono flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-card z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-sm">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white">
                  {isBangla ? "সাম্প্রতিক নোটিফিকেশন" : "Notifications"}
                </span>
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                  {unreadCount} {isBangla ? "নতুন" : "NEW"}
                </span>
              </div>

              {/* Category-based Filters */}
              <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-1 overflow-x-auto scrollbar-none">
                {["All", "Approvals", "Inventory", "Finance", "System"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotifFilter(cat)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer shrink-0 font-mono ${
                      notifFilter === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    {isBangla ? "কোনো নোটিফিকেশন পাওয়া যায়নি" : "No notifications found in this category."}
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const isRead = n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer flex flex-col gap-2 ${
                          isRead ? "opacity-75" : "bg-green-50/20 dark:bg-green-950/10 font-medium"
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="mt-0.5 shrink-0">
                            {n.category === "Inventory" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            {n.category === "Approval" && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {n.category === "Finance" && <Info className="h-4 w-4 text-blue-600" />}
                            {n.category === "System" && <FolderOpen className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 dark:text-slate-100 font-bold truncate">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                              {n.message}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                          {!isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 shrink-0 self-center"></span>
                          )}
                        </div>

                        {/* Stock-Out AI Trend Card inside Notification */}
                        {n.stockOutPrediction && (
                          <div className="mt-1 p-2.5 bg-rose-950/20 dark:bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                                {isBangla ? "প্রেডিক্টিভ স্টক-আউট রিস্ক" : `STOCK-OUT RISK: ${n.stockOutPrediction.riskLevel}`}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">
                                {n.stockOutPrediction.daysRemaining} Days Left
                              </span>
                            </div>

                            <div className="text-[11px] font-mono text-slate-300 flex justify-between">
                              <span>Daily Burn: {n.stockOutPrediction.avgDailyBurnKg.toLocaleString()} KG/day</span>
                              <span>Stock: {n.stockOutPrediction.currentStockKg.toLocaleString()} KG</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAutoGeneratePreventivePR && n.stockOutPrediction) {
                                  onAutoGeneratePreventivePR(n.stockOutPrediction.itemCode, n.stockOutPrediction.suggestedReorderKg);
                                }
                              }}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded text-[11px] font-mono transition-all cursor-pointer shadow-xs shadow-rose-600/30 flex items-center justify-center gap-1 mt-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>
                                {isBangla
                                  ? `স্বয়ংক্রিয় রিকুইজিশন তৈরি (${n.stockOutPrediction.suggestedReorderKg.toLocaleString()} KG)`
                                  : `Auto-Generate PR (${n.stockOutPrediction.suggestedReorderKg.toLocaleString()} KG)`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider before Role Selector */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800/80"></div>

        {/* Role Switcher Pill Group */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200/40 dark:border-white/5 shrink-0 font-sans">
          {[
            { id: "CFO", labelEn: "CFO", labelBn: "সিএফও" },
            { id: "SCM Manager", labelEn: "SCM", labelBn: "এসসিএম" },
            { id: "Warehouse Admin", labelEn: "WH Admin", labelBn: "স্টোর" }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => onChangeRole(r.id)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                role === r.id
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title={isBangla ? r.labelBn : r.labelEn}
            >
              {isBangla ? r.labelBn : r.labelEn}
            </button>
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800/80"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
              setQuickOpen(false);
            }}
            className="flex items-center gap-2 text-left hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 p-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none cursor-pointer"
            title="User Settings"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wide shrink-0">
              {currentUser?.avatar || (role === "CFO" ? "AR" : role === "SCM Manager" ? "MR" : "SI")}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                {currentUser?.name ||
                  (role === "CFO" ? "Dr. Ahsan Rahman" : role === "SCM Manager" ? "M. Rahman" : "S. Islam")}
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 leading-none">
                {currentUser?.role || role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-card z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150 text-sm">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-bold">
                  {isBangla ? "সক্রিয় ব্যবহারকারী" : "Authenticated Identity"}
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {currentUser?.name || "Dr. Ahsan Rahman"}
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {currentUser?.email || "cfo@agroerp.com"}
                </p>
                <span className="inline-block mt-1 text-[9px] font-mono bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold">
                  {currentUser?.department || "Executive Management"}
                </span>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between cursor-pointer text-xs"
              >
                <span>{isBangla ? "লগইন / ভূমিকা পরিবর্তন" : "Switch Account / Auth Portal"}</span>
                <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
              </button>

              {(role === "CFO" || currentUser?.permissions?.includes("manage_users_rbac")) && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onOpenRoleManagerModal) onOpenRoleManagerModal();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between cursor-pointer text-xs border-t border-slate-100 dark:border-slate-800"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {isBangla ? "আরবিএসি পারমিশন অ্যাডমিন" : "RBAC & User Permissions"}
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </button>
              )}

              <button
                onClick={() => {
                  setProfileOpen(false);
                  if (onSignOut) {
                    onSignOut();
                  } else if (onOpenAuthModal) {
                    onOpenAuthModal();
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 cursor-pointer text-xs"
              >
                <LogOut className="h-4 w-4" />
                <span>{isBangla ? "লগ আউট করুন" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
