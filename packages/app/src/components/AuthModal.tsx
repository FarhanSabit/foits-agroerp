import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus,
  LogIn
} from "lucide-react";
import { UserAccount, initialUsers, ALL_PERMISSIONS } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser?: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (newUser: UserAccount) => void;
  isBangla: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onLoginSuccess,
  onRegisterSuccess,
  isBangla
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states for login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states for register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("SCM Manager");
  const [regDepartment, setRegDepartment] = useState("Supply Chain Management");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(isBangla ? "দয়া করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।" : "Please enter email and password.");
      return;
    }

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!foundUser) {
      setLoginError(isBangla ? "নিবন্ধিত কোনো ব্যবহারকারী পাওয়া যায়নি।" : "No registered user found with this email.");
      return;
    }

    if (foundUser.status === "Suspended") {
      setLoginError(
        isBangla
          ? "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।"
          : "Your account is currently suspended. Please contact the CFO/Administrator."
      );
      return;
    }

    // In demo mode, allow matching password or 'admin123' / '123456'
    if (foundUser.password && foundUser.password !== loginPassword && loginPassword !== "admin123") {
      setLoginError(isBangla ? "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।" : "Incorrect password. Please try again.");
      return;
    }

    // Update last login
    const updatedUser: UserAccount = {
      ...foundUser,
      lastLogin: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    };

    onLoginSuccess(updatedUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError(isBangla ? "সকল আবশ্যিক ফিল্ড পূরণ করুন।" : "All fields are required.");
      return;
    }

    if (!regEmail.includes("@")) {
      setRegError(isBangla ? "সঠিক ইমেইল ঠিকানা প্রদান করুন।" : "Please provide a valid work email address.");
      return;
    }

    const existing = users.find((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setRegError(isBangla ? "এই ইমেইলটি ইতিপূর্বে নিবন্ধিত হয়েছে।" : "This email address is already registered.");
      return;
    }

    // Map default permissions based on requested role
    let defaultPerms: string[] = ["view_dashboard", "manage_support"];
    if (regRole === "CFO") {
      defaultPerms = ALL_PERMISSIONS.map((p) => p.key);
    } else if (regRole === "SCM Manager") {
      defaultPerms = ["view_dashboard", "manage_procurement", "approve_po", "manage_inventory", "manage_production", "manage_logistics", "manage_support"];
    } else if (regRole === "Warehouse Admin") {
      defaultPerms = ["view_dashboard", "manage_inventory", "manage_production", "manage_logistics", "manage_support"];
    } else if (regRole === "Sales Officer") {
      defaultPerms = ["view_dashboard", "manage_sales", "manage_crm", "manage_support"];
    } else if (regRole === "Finance Officer") {
      defaultPerms = ["view_dashboard", "manage_finance", "manage_commercial", "approve_po", "manage_support"];
    }

    const avatarInitials = regName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      department: regDepartment,
      avatar: avatarInitials || "UR",
      permissions: defaultPerms,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    };

    onRegisterSuccess(newUser);
    onLoginSuccess(newUser);

    setRegSuccess(
      isBangla
        ? "অ্যাকাউন্ট সফলভাবে নিবন্ধিত ও লগইন হয়েছে!"
        : "Account successfully registered & logged in!"
    );

    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleQuickDemoLogin = (demoUser: UserAccount) => {
    const updatedUser: UserAccount = {
      ...demoUser,
      lastLogin: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    };
    onLoginSuccess(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                <span>{isBangla ? "অ্যাক্সেস কন্ট্রোল ও অ্যাথেন্টিকেশন" : "OITS Agro ERP Identity Portal"}</span>
                <span className="text-[10px] font-mono bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 px-2 py-0.5 rounded-full">
                  RBAC Enabled
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {isBangla
                  ? "ভূমিকাভিত্তিক পারমিশন এবং নিরাপদ সেশন ব্যবস্থাপনা"
                  : "Role-Based Access Control (RBAC) & Single Sign-On Portal"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Currently Active User Status (if logged in) */}
        {currentUser && (
          <div className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-900/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {isBangla ? "বর্তমান সক্রিয় অ্যাকাউন্ট:" : "Active Session:"}{" "}
                <strong className="font-bold">{currentUser.name}</strong> ({currentUser.role})
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              {currentUser.department}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-1">
          <button
            onClick={() => {
              setActiveTab("login");
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans ${
              activeTab === "login"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>{isBangla ? "সিস্টেম সাইন-ইন" : "Sign In to ERP"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("register");
              setRegError(null);
              setRegSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans ${
              activeTab === "register"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>{isBangla ? "নতুন অ্যাকাউন্ট রেজিস্ট্রেশন" : "Register New Account"}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: LOGIN */}
          {activeTab === "login" && (
            <div className="space-y-6">
              {/* Quick Demo Login Cards */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>
                    {isBangla
                      ? "এক-ক্লিকে ডেমো প্রোফাইল সিলেক্ট করুন:"
                      : "Quick-Launch Predefined Enterprise Roles:"}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      className="p-2.5 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-xl transition-all group cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-xs font-mono flex items-center justify-center shrink-0">
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {u.role} ({u.department})
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-mono font-bold text-slate-400 uppercase">
                  {isBangla ? "অথবা ইমেইল ও পাসওয়ার্ড প্রদান করুন" : "OR Sign In With Password"}
                </span>
              </div>

              {/* Login Error Banner */}
              {loginError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? "ওয়ার্ক ইমেইল ঠিকানা" : "Work Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="cfo@agroerp.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? "পাসওয়ার্ড" : "Account Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    {isBangla ? "ডেমো পাসওয়ার্ড: admin123 / scm123 / store123" : "Demo password: admin123, scm123, store123"}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isBangla ? "সাইন-ইন করুন" : "Authenticate & Open Dashboard"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === "register" && (
            <div className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? "পূর্ণ নাম" : "Full Employee Name"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Nazmul Hossain"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? "অফিসিয়াল ইমেইল" : "Corporate Work Email"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="n.hossain@oitsdhaka.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? "পাসওয়ার্ড তৈরি করুন" : "Set Account Password"}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBangla ? "বিভাগ" : "Department"}
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="Supply Chain Management">Supply Chain (SCM)</option>
                      <option value="Depot & Warehousing">Depot & Warehousing</option>
                      <option value="Production & MRP">Production & Mill Operations</option>
                      <option value="Sales & Marketing">Sales & Distribution</option>
                      <option value="Accounts & Commercial">Accounts & Finance</option>
                      <option value="Executive Management">Executive Leadership (HQ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBangla ? "অনুরোধকৃত পদবী / ভূমিকা" : "Assigned Role (RBAC)"}
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="CFO">CFO (Administrator)</option>
                      <option value="SCM Manager">SCM Manager</option>
                      <option value="Warehouse Admin">Warehouse Admin</option>
                      <option value="Sales Officer">Sales Officer</option>
                      <option value="Finance Officer">Finance Officer</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-indigo-700 dark:text-indigo-300">
                    {isBangla ? "স্বয়ংক্রিয় পারমিশন ম্যাপিং:" : "Auto Permission Mapping:"}
                  </p>
                  <p className="mt-0.5">
                    {isBangla
                      ? "আপনার নির্বাচিত পদবীর উপর ভিত্তি করে রোল ভিত্তিক পারমিশন (RBAC) ম্যাপিং প্রযোজ্য হবে।"
                      : "Default system access rules and security controls will be assigned immediately upon registration."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isBangla ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create Account & Sign In"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
