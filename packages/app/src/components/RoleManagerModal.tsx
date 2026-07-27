import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Check,
  X,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Settings2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Key
} from "lucide-react";
import { UserAccount, ALL_PERMISSIONS } from "../types";

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
  isBangla: boolean;
}

export default function RoleManagerModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onUpdateUsers,
  isBangla
}: RoleManagerModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleTogglePermission = (permKey: string) => {
    if (!selectedUser) return;
    const hasPerm = selectedUser.permissions.includes(permKey);
    const newPerms = hasPerm
      ? selectedUser.permissions.filter((p) => p !== permKey)
      : [...selectedUser.permissions, permKey];

    const updatedList = users.map((u) =>
      u.id === selectedUser.id ? { ...u, permissions: newPerms } : u
    );

    onUpdateUsers(updatedList);
    triggerSuccessNote(isBangla ? "পারমিশন আপডেট করা হয়েছে" : "Permission updated");
  };

  const handleToggleStatus = (userId: string) => {
    const updatedList = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        return { ...u, status: nextStatus as "Active" | "Suspended" };
      }
      return u;
    });

    onUpdateUsers(updatedList);
    triggerSuccessNote(isBangla ? "ব্যবহারকারীর স্ট্যাটাস আপডেট হয়েছে" : "User status updated");
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    const updatedList = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    onUpdateUsers(updatedList);
    triggerSuccessNote(isBangla ? "ব্যবহারকারীর রোল পরিবর্তন করা হয়েছে" : "User role updated");
  };

  const handleGrantAll = () => {
    if (!selectedUser) return;
    const updatedList = users.map((u) =>
      u.id === selectedUser.id ? { ...u, permissions: ALL_PERMISSIONS.map((p) => p.key) } : u
    );
    onUpdateUsers(updatedList);
    triggerSuccessNote(isBangla ? "সকল পারমিশন প্রদান করা হয়েছে" : "Granted all permissions");
  };

  const handleRevokeNonCore = () => {
    if (!selectedUser) return;
    const updatedList = users.map((u) =>
      u.id === selectedUser.id ? { ...u, permissions: ["view_dashboard", "manage_support"] } : u
    );
    onUpdateUsers(updatedList);
    triggerSuccessNote(isBangla ? "বেসিক পারমিশন ছাড়া বাকি তুলে নেওয়া হয়েছে" : "Reset to basic permissions");
  };

  const triggerSuccessNote = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => {
      setSaveNotification(null);
    }, 2000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-white/10 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                <span>{isBangla ? "আরবিএসি পারমিশন ও ইউজার অ্যাডমিন" : "Role-Based Access Control (RBAC) Console"}</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {isBangla
                  ? "সিস্টেমের ব্যবহারকারীদের রোল ও মডিউলভিত্তিক পারমিশন কনফিগার করুন"
                  : "Manage enterprise user accounts, assigned roles, and granular security permissions"}
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

        {/* Success toast overlay inside modal */}
        {saveNotification && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="h-4 w-4" />
            <span>{saveNotification}</span>
          </div>
        )}

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[500px]">
          {/* Left Column: User List & Search (5 cols) */}
          <div className="md:col-span-5 p-4 flex flex-col space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>{isBangla ? "ব্যবহারকারী তালিকা" : "Registered Accounts"} ({users.length})</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBangla ? "নাম, ইমেইল বা রোল দিয়ে খুঁজুন..." : "Filter by name, email, or role..."}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Accounts List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[420px] pr-1">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-white dark:bg-slate-800 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold text-xs font-mono flex items-center justify-center shrink-0 shadow-sm">
                        {u.avatar}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {u.name}
                          </p>
                          {u.status === "Suspended" && (
                            <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0">
                              Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {u.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
                            {u.role}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {u.permissions.length} perms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix for Selected User (7 cols) */}
          <div className="md:col-span-7 p-5 space-y-5 overflow-y-auto max-h-[520px]">
            {selectedUser ? (
              <>
                {/* User Info Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm font-mono flex items-center justify-center shrink-0">
                        {selectedUser.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedUser.name}
                        </h4>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(selectedUser.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedUser.status === "Active"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/50"
                      }`}
                    >
                      {selectedUser.status === "Active" ? (
                        <>
                          <UserX className="h-3.5 w-3.5 text-rose-500" />
                          <span>{isBangla ? "অ্যাকাউন্ট স্থগিত করুন" : "Suspend Account"}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{isBangla ? "সক্রিয় করুন" : "Re-Activate Account"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs font-mono">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        {isBangla ? "অ্যাসাইনকৃত ভূমিকা (Role)" : "Assigned Role"}
                      </label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="CFO">CFO (Administrator)</option>
                        <option value="SCM Manager">SCM Manager</option>
                        <option value="Warehouse Admin">Warehouse Admin</option>
                        <option value="Sales Officer">Sales Officer</option>
                        <option value="Finance Officer">Finance Officer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        {isBangla ? "সংযুক্ত বিভাগ" : "Department"}
                      </label>
                      <span className="block px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                        {selectedUser.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions Actions & Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-indigo-500" />
                      <span>{isBangla ? "মডিউল পারমিশন ম্যাট্রিক্স" : "Granular Module Permissions"}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleGrantAll}
                        className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isBangla ? "সব পারমিশন দিন" : "Grant All"}
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        onClick={handleRevokeNonCore}
                        className="text-[10px] font-mono font-bold text-slate-500 hover:underline cursor-pointer"
                      >
                        {isBangla ? "রিসেট করুন" : "Reset Basic"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isGranted = selectedUser.permissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isGranted
                              ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800/60"
                              : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {isBangla ? perm.labelBn : perm.labelEn}
                            </p>
                            <span className="text-[9px] font-mono text-slate-400">
                              {perm.category} • {perm.key}
                            </span>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                              isGranted
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                            }`}
                          >
                            {isGranted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                {isBangla ? "একটি অ্যাকাউন্ট নির্বাচন করুন" : "Select an account to view and configure permissions."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
