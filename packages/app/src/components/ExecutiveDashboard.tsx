import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  DollarSign,
  Package,
  Layers,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  Users
} from "lucide-react";
import { ERPState, DocStatus, AccountType } from "../types";

interface ExecutiveDashboardProps {
  state: ERPState;
  onApprovePR: (id: string) => void;
  onApprovePO: (id: string) => void;
  isBangla: boolean;
}

export default function ExecutiveDashboard({
  state,
  onApprovePR,
  onApprovePO,
  isBangla
}: ExecutiveDashboardProps) {
  const [roleMode, setRoleMode] = useState<"ceo" | "cfo" | "coo">("ceo");

  // Sum active bank accounts and receivables
  const cashBalance = state.ledger.find((a) => a.code === "1010")?.balance || 0;
  const receivables = state.ledger.find((a) => a.code === "1200")?.balance || 0;
  const payables = state.ledger.find((a) => a.code === "2100")?.balance || 0;
  const rawMatVal = state.ledger.find((a) => a.code === "1300")?.balance || 0;
  const finGoodsVal = state.ledger.find((a) => a.code === "1310")?.balance || 0;
  const totalInventoryVal = rawMatVal + finGoodsVal;

  const totalSales = state.ledger.find((a) => a.code === "4000")?.balance || 0;

  // Filter pending approvals
  const pendingPRs = state.requisitions.filter((r) => r.status === DocStatus.PENDING);
  const pendingPOs = state.purchaseOrders.filter((p) => p.approvalStatus === DocStatus.PENDING);
  const totalPendingApprovals = pendingPRs.length + pendingPOs.length;

  return (
    <div className="space-y-6">
      
      {/* Role Selection bar */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isBangla ? "নির্বাহী ড্যাশবোর্ড ও এমআইএস" : "Executive Decision Support & BI"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBangla
              ? "রিয়েল-টাইম এন্টারপ্রাইজ কার্যকারিতা রিপোর্টিং"
              : "Real-time enterprise performance metrics & analytical intelligence"}
          </p>
        </div>
        <div className="bg-white/45 dark:bg-white/5 backdrop-blur-xs border border-slate-200/50 dark:border-white/10 p-1 rounded-xl flex items-center gap-1">
          {(["ceo", "cfo", "coo"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleMode(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                roleMode === role
                  ? "bg-indigo-600/90 dark:bg-indigo-500/90 text-white font-bold shadow-md shadow-indigo-500/10 border border-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              {role === "ceo" ? (isBangla ? "সিইও ডেক" : "CEO Board") : role === "cfo" ? (isBangla ? "সিএফও ডেক" : "CFO Board") : (isBangla ? "সিওও ডেক" : "COO Board")}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Sales Card */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "মোট বিক্রয় রাজস্ব" : "REVENUE"}
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              ৳ {(totalSales / 10000000).toFixed(2)} Cr
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-mono">
              <span>+12.4%</span>
              <span>{isBangla ? "এই মাসে" : "vs Last Mo"}</span>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "উৎপাদন ভলিউম" : "PROD OUTPUT"}
            </span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              1,250 MT
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-600 font-mono">
              <span>98.4%</span>
              <span>{isBangla ? "দক্ষতা" : "Capacity Util"}</span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "ইনভেন্টরি ভ্যালু" : "STOCK VALUE"}
            </span>
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              ৳ {((rawMatVal + finGoodsVal) / 100000).toFixed(1)} Lk
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-purple-600 font-mono">
              <span>{isBangla ? "ভুট্টা:" : "Maize:"} {(state.inventory.find(i => i.code === "RM001")?.availableStock || 0).toLocaleString()} KG</span>
            </div>
          </div>
        </div>

        {/* Cash position */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "ক্যাশ পজিশন" : "CASH IN BANK"}
            </span>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              ৳ {(cashBalance / 10000000).toFixed(2)} Cr
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-mono">
              <span>Bank Asia Ltd</span>
            </div>
          </div>
        </div>

        {/* Receivables */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "বকেয়া আদায়যোগ্য" : "RECEIVABLES"}
            </span>
            <Activity className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              ৳ {(receivables / 10000000).toFixed(2)} Cr
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-600 font-mono">
              <span>{isBangla ? "বকেয়া চক্র: ২৯ দিন" : "Aging: Avg 29 Days"}</span>
            </div>
          </div>
        </div>

        {/* Payables */}
        <div className="glass-card p-4 hover:scale-[1.02] hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isBangla ? "পরিশোধযোগ্য দায়" : "PAYABLES"}
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              ৳ {(payables / 10000000).toFixed(2)} Cr
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-500 font-mono">
              <span>{isBangla ? "৪টি বিল বকেয়া" : "4 Pending Invoices"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CEO/CFO Role Specific Visual Graph */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {roleMode === "ceo"
                  ? (isBangla ? "মাসিক সামগ্রিক আয় ও ব্যয়ের ট্রেন্ড" : "Monthly Revenue & Expenditures Trend")
                  : roleMode === "cfo"
                  ? (isBangla ? "লিকুইডিটি ও ক্যাশ-ফ্লো প্রবাহ বিশ্লেষণ" : "Liquidity & Cash Flow Analysis")
                  : (isBangla ? "উৎপাদন দক্ষতা ও কাঁচামাল অপচয়" : "Production Throughput & Raw Material Variance")}
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {isBangla ? "অডিট করা ড্যাশবোর্ড ডেটা" : "Audited ERP ledger streams"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-700"></span>
                <span>{isBangla ? "আয়" : "Inflow/Sales"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>{isBangla ? "ব্যয়" : "Outflow/Cost"}</span>
              </div>
            </div>
          </div>

          {/* SVG Custom graph matching Swiss-Modern guidelines */}
          <div className="h-64 w-full bg-black/[0.02] dark:bg-white/[0.01] rounded-xl border border-slate-200/50 dark:border-white/5 p-2 relative flex flex-col justify-between overflow-hidden">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="40" x2="580" y2="40" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-slate-800" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-slate-800" />
              <line x1="40" y1="160" x2="580" y2="160" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-slate-800" />
              <line x1="40" y1="210" x2="580" y2="210" stroke="#94A3B8" strokeWidth="1" className="dark:stroke-slate-700" />

              {/* Area Under Curve (Inflow/Sales) */}
              <path
                d="M 40 210 L 100 170 L 180 160 L 280 120 L 380 90 L 480 70 L 580 50 L 580 210 Z"
                fill="rgba(22, 101, 52, 0.12)"
              />
              
              {/* Line Curve Inflow */}
              <path
                d="M 40 170 Q 100 160 180 140 T 280 110 T 380 80 T 480 65 T 580 45"
                fill="none"
                stroke="#166534"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Line Curve Outflow */}
              <path
                d="M 40 190 Q 100 180 180 170 T 280 140 T 380 130 T 480 115 T 580 90"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4,4"
              />

              {/* Grid Nodes / Data Dots */}
              <circle cx="280" cy="110" r="5" fill="#166534" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="480" cy="65" r="5" fill="#166534" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="580" cy="45" r="6" fill="#166534" stroke="#ffffff" strokeWidth="2" />

              {/* Labelings */}
              <text x="35" y="45" className="text-[10px] font-mono text-slate-400 fill-current">৳8 Cr</text>
              <text x="35" y="105" className="text-[10px] font-mono text-slate-400 fill-current">৳5 Cr</text>
              <text x="35" y="165" className="text-[10px] font-mono text-slate-400 fill-current">৳2 Cr</text>

              <text x="100" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">JAN</text>
              <text x="180" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">FEB</text>
              <text x="280" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">MAR</text>
              <text x="380" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">APR</text>
              <text x="480" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">MAY</text>
              <text x="580" y="228" className="text-[10px] font-mono text-slate-400 fill-current" textAnchor="middle">JUN/JUL</text>
            </svg>
            <div className="absolute top-10 right-10 bg-slate-950/80 backdrop-blur-md text-white rounded-xl p-2.5 text-xs border border-white/10 font-mono shadow-xl hidden md:block">
              <span className="font-bold text-green-400">Current Sales Run:</span> ৳ 8.50 Cr<br />
              <span className="font-bold text-slate-400">Operating Cost:</span> ৳ 6.50 Cr<br />
              <span className="font-bold text-yellow-400">Gross margin:</span> 23.5%
            </div>
          </div>
        </div>

        {/* Right side: Alerts & Live Audit Logs */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200/50 dark:border-white/10 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "সিস্টেম অ্যালার্ট ও নোটিশ" : "Critical Operations Desk"}
              </h3>
              <span className="text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                {state.notifications.filter((n) => !n.read).length} ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {state.notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 bg-white/30 dark:bg-white/[0.01] rounded-xl border border-slate-200/50 dark:border-white/5 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-white/10 pt-4 mt-4">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-2">
              {isBangla ? "রিয়েল-টাইম অডিট ট্রেইল" : "LIVE AUDIT LOGS"}
            </h4>
            <div className="space-y-2">
              {state.activities.slice(0, 2).map((act, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium max-w-[150px] truncate">{act.action}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Actionable Items & Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending approvals queue */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "অনুমোদন অপেক্ষমাণ তালিকা (CFO / Admin)" : "Executive Approval Desk"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBangla
                  ? "বাজেট বরাদ্দ অনুমোদন ও পিও রিলিজ রুলস"
                  : "Requires authorization of funds or SCM procurement releases"}
              </p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {totalPendingApprovals} {isBangla ? "টি অপেক্ষমান" : "PENDING"}
            </span>
          </div>

          {totalPendingApprovals === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span>{isBangla ? "সব কাজের অনুমোদন সম্পন্ন হয়েছে!" : "Your approval queue is fully cleared!"}</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Purchase Requisitions */}
              {pendingPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 border border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="glass-badge">PR</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pr.prNumber}</span>
                      <span className="text-[11px] text-slate-400">({pr.department})</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {isBangla ? "রিকুয়েস্ট সামগ্রী:" : "Requested:"}{" "}
                      <span className="text-slate-800 dark:text-slate-100 font-semibold">
                        {pr.items[0].itemName} ({pr.items[0].qty.toLocaleString()} {pr.items[0].uom})
                      </span>
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {isBangla ? "মোট প্রাক্কলিত ব্যয়:" : "Est. Value:"} ৳ {pr.totalEstimatedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApprovePR(pr.id)}
                      className="glass-button-green text-xs px-4 py-2"
                    >
                      {isBangla ? "অনুমোদন দিন" : "Approve Funds"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Purchase Orders */}
              {pendingPOs.map((po) => (
                <div
                  key={po.id}
                  className="p-4 border border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="glass-badge">PO</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{po.poNumber}</span>
                      <span className="text-[11px] text-slate-400">({po.supplierName})</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {isBangla ? "ক্রয় সামগ্রী:" : "PO Goods:"}{" "}
                      <span className="text-slate-800 dark:text-slate-100 font-semibold">
                        {po.items[0].itemName} ({po.items[0].qty.toLocaleString()} {po.items[0].uom})
                      </span>
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {isBangla ? "মোট কার্যাদেশ মূল্য:" : "Total PO Cost:"} ৳ {po.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApprovePO(po.id)}
                      className="glass-button-green text-xs px-4 py-2"
                    >
                      {isBangla ? "কার্যাদেশ অনুমোদন" : "Authorize Purchase"}
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Mini Fleet & Personnel Widget */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4">
              {isBangla ? "বহর ও মানব সম্পদ মেট্রিক্স" : "Fleet & HR Support"}
            </h3>
            <div className="space-y-4">
              
              {/* Fleet status */}
              <div className="flex justify-between items-center bg-white/30 dark:bg-white/[0.01] p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isBangla ? "পরিবহন বহর" : "Fleet Status"}</span>
                    <span className="text-[10px] text-slate-400">{isBangla ? "মোট ১০ টি সক্রিয় ট্রাক" : "10 active flatbeds"}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">{isBangla ? "৯১% সক্রিয়" : "90% Active"}</span>
              </div>

              {/* Attendance HR */}
              <div className="flex justify-between items-center bg-white/30 dark:bg-white/[0.01] p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{isBangla ? "স্টাফ উপস্থিতি" : "HR Attendance"}</span>
                    <span className="text-[10px] text-slate-400">{isBangla ? "কারখানা ও অফিস" : "Total 300 staff"}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">97.45%</span>
              </div>

            </div>
          </div>

          <div className="mt-6 bg-indigo-950/20 dark:bg-slate-950/40 p-4 rounded-xl border border-indigo-500/10 dark:border-white/10">
            <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-bold">{isBangla ? "বাংলাদেশ ভ্যাট আইন" : "NID / VAT COMPLIANT"}</span>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {isBangla 
                ? "স্বয়ংক্রিয় রিটার্ন ভরাট এবং কর চালান প্রস্তুতকরণ ভ্যাট আইন অনুযায়ী সম্পন্ন হচ্ছে।" 
                : "Tax calculations, AIT exemptions, and VAT returns follow NBR guidelines in Bangladesh."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
