import React from "react";
import { ShieldAlert, Lock, ArrowLeft, KeyRound, UserCheck } from "lucide-react";
import { UserAccount } from "../types";

interface AccessDeniedViewProps {
  requiredPermission: string;
  tabTitle: string;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onGoToDashboard: () => void;
  isBangla: boolean;
}

export default function AccessDeniedView({
  requiredPermission,
  tabTitle,
  currentUser,
  onOpenAuthModal,
  onGoToDashboard,
  isBangla
}: AccessDeniedViewProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
        <ShieldAlert className="h-9 w-9 stroke-[2.2]" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
          {isBangla ? "অ্যাক্সেস সংরক্ষিত / পারমিশন সীমাবদ্ধতা" : "Restricted Access / RBAC Policy"}
        </span>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
          {isBangla ? `"${tabTitle}" অ্যাক্সেসের অনুমতি নেই` : `Access Denied for "${tabTitle}"`}
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-md mx-auto">
          {isBangla
            ? `আপনার বর্তমান ভূমিকা (${currentUser?.role || "Guest"}) এই মডিউলটির অ্যাক্সেস অন্তর্ভুক্ত করে না।`
            : `Your current role (${currentUser?.role || "Guest"}) does not have the required permission (${requiredPermission}).`}
        </p>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-left text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
          <span>{isBangla ? "বর্তমান অ্যাকাউন্ট:" : "Logged in as:"}</span>
          <strong className="font-bold text-indigo-600 dark:text-indigo-400">
            {currentUser?.name || "Guest User"} ({currentUser?.email})
          </strong>
        </div>

        <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
          <span>{isBangla ? "প্রয়োজনীয় পারমিশন:" : "Required Permission:"}</span>
          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-bold">
            {requiredPermission}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onGoToDashboard}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isBangla ? "ড্যাশবোর্ডে ফিরে যান" : "Return to Dashboard"}</span>
        </button>

        <button
          onClick={onOpenAuthModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs font-mono transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="h-4 w-4" />
          <span>{isBangla ? "ভূমিকা পরিবর্তন / লগইন করুন" : "Switch Account / Sign In"}</span>
        </button>
      </div>
    </div>
  );
}
