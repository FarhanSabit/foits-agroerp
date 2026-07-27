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
  RefreshCw
} from "lucide-react";
import { Notification, DocStatus } from "../types";

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
  onChangeRole
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <header className="sticky top-0 glass-header z-30 h-16 flex items-center justify-between px-6 transition-all duration-150 border-b border-slate-200/50 dark:border-white/10">
      
      {/* Left: Search Bar trigger */}
      <div className="flex items-center gap-4 w-1/4">
        <button
          onClick={triggerSearchOpen}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-white/30 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors rounded-lg text-xs font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 border border-slate-200/50 dark:border-white/10 outline-none"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">{isBangla ? "সার্চ করুন... (Ctrl + K)" : "Search... (Ctrl + K)"}</span>
          </div>
          <span className="hidden md:inline bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none tracking-tight shrink-0">
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
            <div className="absolute right-0 mt-2 w-56 glass-card py-1 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-black/[0.02] dark:bg-white/[0.02]">
                {isBangla ? "নতুন ট্রানজেকশন" : "Raise Transaction"}
              </div>
              
              {showPR && (
                <button
                  onClick={() => {
                    onQuickAction("create_pr");
                    setQuickOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {isBangla ? "ক্রয় রিকুইজিশন (PR)" : "Purchase Requisition (PR)"}
                </button>
              )}
              
              {showRFQ && (
                <button
                  onClick={() => {
                    onQuickAction("create_rfq");
                    setQuickOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {isBangla ? "আরএফকিউ তৈরি (RFQ)" : "Generate RFQ"}
                </button>
              )}
              
              {showPO && (
                <button
                  onClick={() => {
                    onQuickAction("create_po");
                    setQuickOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {isBangla ? "পারচেজ অর্ডার (PO)" : "Purchase Order (PO)"}
                </button>
              )}
              
              {showWO && (
                <button
                  onClick={() => {
                    onQuickAction("issue_wo");
                    setQuickOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {isBangla ? "উৎপাদন ওয়ার্ক অর্ডার (WO)" : "Work Order (WO)"}
                </button>
              )}
              
              {showSO && (
                <button
                  onClick={() => {
                    onQuickAction("create_so");
                    setQuickOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors border-t border-slate-100 dark:border-slate-700/60"
                >
                  {isBangla ? "সেলস অর্ডার (SO)" : "Sales Order (SO)"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/10 bg-slate-50 dark:bg-slate-800/30">
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

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none flex items-center gap-1 text-xs font-semibold cursor-pointer"
          title={isBangla ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
        >
          <Languages className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-mono tracking-tight text-[11px]">{isBangla ? "EN" : "বাংলা"}</span>
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
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    {isBangla ? "কোনো নোটিফিকেশন নেই" : "No notifications right now."}
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer flex gap-3 ${
                          isRead ? "opacity-75" : "bg-green-50/20 dark:bg-green-950/10 font-medium"
                        }`}
                      >
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
              {role === "CFO" ? "AR" : role === "SCM Manager" ? "MR" : "SI"}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                {role === "CFO" 
                  ? "Dr. Ahsan Rahman" 
                  : role === "SCM Manager" 
                  ? "M. Rahman" 
                  : "S. Islam"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 leading-none">
                {role === "CFO" 
                  ? (isBangla ? "সিএফও (এডমিন)" : "CFO (Admin)") 
                  : role === "SCM Manager" 
                  ? (isBangla ? "এসসিএম ব্যবস্থাপক" : "SCM Manager") 
                  : (isBangla ? "গুদাম প্রশাসক" : "Warehouse Admin")}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-card z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150 text-sm">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/10">
                <p className="text-xs text-slate-400 font-mono tracking-wider uppercase font-bold">
                  {isBangla ? "সংযুক্ত বিভাগ" : "Assigned Module"}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                  Dhaka Head Office (HQ)
                </p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {isBangla ? "ব্যবহারকারী প্রোফাইল" : "Profile Settings"}
              </button>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {isBangla ? "সিকিউরিটি ও লগস" : "Security & Logs"}
              </button>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{isBangla ? "লগ আউট" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
