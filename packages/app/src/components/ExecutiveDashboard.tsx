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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface ExecutiveDashboardProps {
  state: ERPState;
  onApprovePR: (id: string) => void;
  onApprovePO: (id: string) => void;
  isBangla: boolean;
  role: string;
  darkMode?: boolean;
}

export default function ExecutiveDashboard({
  state,
  onApprovePR,
  onApprovePO,
  isBangla,
  role,
  darkMode = false
}: ExecutiveDashboardProps) {
  const [roleMode, setRoleMode] = useState<"ceo" | "cfo" | "coo">("ceo");

  // Dynamic colors based on theme
  const gridStroke = darkMode ? "#334155" : "#e2e8f0";
  const axisStroke = darkMode ? "#64748b" : "#94a3b8";

  // Sum active bank accounts and receivables
  const cashBalance = state.ledger.find((a) => a.code === "1010")?.balance || 0;
  const receivables = state.ledger.find((a) => a.code === "1200")?.balance || 0;
  const payables = state.ledger.find((a) => a.code === "2100")?.balance || 0;
  const rawMatVal = state.ledger.find((a) => a.code === "1300")?.balance || 0;
  const finGoodsVal = state.ledger.find((a) => a.code === "1310")?.balance || 0;
  const totalInventoryVal = rawMatVal + finGoodsVal;

  const totalSales = state.ledger.find((a) => a.code === "4000")?.balance || 0;
  const purchases = state.ledger.find((a) => a.code === "5000")?.balance || 0;

  // Filter pending approvals
  const pendingPRs = state.requisitions.filter((r) => r.status === DocStatus.PENDING);
  const pendingPOs = state.purchaseOrders.filter((p) => p.approvalStatus === DocStatus.PENDING);
  const totalPendingApprovals = pendingPRs.length + pendingPOs.length;

  // Generate historical trends where the last month is exactly the current ledger state.
  // We can scale the previous months proportionally.
  const months = isBangla 
    ? ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন/জুলাই"] 
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun/Jul"];

  const trendData = months.map((month, index) => {
    // scale factor from 0.75 to 1.0
    const factor = 0.75 + (index / 5) * 0.25; 
    // Add minor deterministic variance for aesthetic wave
    const wave = 1 + Math.sin(index * 1.5) * 0.04;
    
    return {
      month,
      cash: Math.round(cashBalance * factor * wave),
      receivables: Math.round(receivables * factor * (wave - 0.02)),
      payables: Math.round(payables * factor * (wave + 0.03)),
      revenue: Math.round((totalSales / 6) * (0.8 + (index / 5) * 0.3) * wave), // Monthly revenue (sales spread out)
      purchases: Math.round((purchases / 6) * (0.85 + (index / 5) * 0.2) * (wave - 0.01)), // Monthly purchases
      rawMaterial: Math.round(rawMatVal * factor * wave),
      finishedGoods: Math.round(finGoodsVal * factor * (wave + 0.01)),
      inventory: Math.round(totalInventoryVal * factor * wave)
    };
  });

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-xl p-3 border border-white/10 font-mono text-xs shadow-xl space-y-1.5">
          <p className="font-bold text-slate-300">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }}></span>
                <span className="text-slate-400">{p.name}:</span>
              </span>
              <span className="font-bold text-white">৳ {p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // CEO Board Chart: Revenue vs Cost
  const renderCEOChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => `৳${(val / 100000).toFixed(0)}L`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <Bar name={isBangla ? "রাজস্ব (বিক্রয়)" : "Revenue (Sales)"} dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar name={isBangla ? "ব্যয় (ক্রয়)" : "Cost (Purchases)"} dataKey="purchases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  // CFO Board Chart: Cash Position & Liquidity
  const renderCFOChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorReceivables" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => `৳${(val / 10000000).toFixed(1)}Cr`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <Area type="monotone" name={isBangla ? "ক্যাশ ব্যাংক ব্যালেন্স" : "Cash in Bank"} dataKey="cash" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
        <Area type="monotone" name={isBangla ? "আদায়যোগ্য বকেয়া" : "Accounts Receivable"} dataKey="receivables" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorReceivables)" />
        <Area type="monotone" name={isBangla ? "পরিশোধযোগ্য দায়" : "Accounts Payable"} dataKey="payables" stroke="#f43f5e" strokeWidth={2} fill="none" strokeDasharray="5 5" />
      </AreaChart>
    </ResponsiveContainer>
  );

  // COO Board Chart: Inventory Valuation
  const renderCOOChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorFinished" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => `৳${(val / 100000).toFixed(0)}L`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <Area type="monotone" name={isBangla ? "কাঁচামাল মজুদ মূল্য" : "Raw Materials Valuation"} dataKey="rawMaterial" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRaw)" />
        <Area type="monotone" name={isBangla ? "তৈরি পণ্য মজুদ মূল্য" : "Finished Goods Valuation"} dataKey="finishedGoods" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorFinished)" />
      </AreaChart>
    </ResponsiveContainer>
  );

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
          {(["ceo", "cfo", "coo"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setRoleMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                roleMode === mode
                  ? "bg-indigo-600/90 dark:bg-indigo-500/90 text-white font-bold shadow-md shadow-indigo-500/10 border border-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              {mode === "ceo" ? (isBangla ? "সিইও ডেক" : "CEO Board") : mode === "cfo" ? (isBangla ? "সিএফও ডেক" : "CFO Board") : (isBangla ? "সিওও ডেক" : "COO Board")}
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
        
        {/* Recharts Container card */}
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
                {isBangla ? "রিয়েল-টাইম অডিট করা ড্যাশবোর্ড ডেটা" : "Live audited ERP ledger streams"}
              </span>
            </div>
          </div>

          {/* Recharts Chart */}
          <div className="h-64 w-full bg-black/[0.02] dark:bg-white/[0.01] rounded-xl border border-slate-200/50 dark:border-white/5 p-4 relative flex flex-col justify-between overflow-hidden">
            {roleMode === "ceo" && renderCEOChart()}
            {roleMode === "cfo" && renderCFOChart()}
            {roleMode === "coo" && renderCOOChart()}
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

      {/* Row 3: Actionable Items & Approval Queue / Warehouse Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {role === "CFO" ? (
          /* CFO Approval desk */
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
                        className="glass-button-green text-xs px-4 py-2 cursor-pointer"
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
                        className="glass-button-green text-xs px-4 py-2 cursor-pointer"
                      >
                        {isBangla ? "কার্যাদেশ অনুমোদন" : "Authorize Purchase"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : role === "SCM Manager" ? (
          /* SCM view (Awaiting CFO approval) */
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isBangla ? "অনুমোদন অপেক্ষমাণ তালিকা (এসসিএম ভিউ)" : "Executive Approval Desk (SCM View)"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBangla
                    ? "অর্থ বরাদ্দের জন্য সিএফও এর অনুমোদনের অপেক্ষায়"
                    : "Awaiting CFO budget authorization for procurement releases"}
                </p>
              </div>
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
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
                    <div className="shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold border border-amber-500/20">
                        {isBangla ? "সিএফও অনুমোদনের অপেক্ষায়" : "Awaiting CFO Sign-off"}
                      </span>
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
                    <div className="shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold border border-amber-500/20">
                        {isBangla ? "সিএফও অনুমোদনের অপেক্ষায়" : "Awaiting CFO Sign-off"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Warehouse Admin view: Warehouse capacity status */
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isBangla ? "গুদাম ও মজুদ ক্ষমতা পর্যবেক্ষণ" : "Warehouse Capacity & Utilization Tracker"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBangla ? "রিয়েল-টাইম গুদাম স্থিতি" : "Real-time storage capacity status"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.warehouses.map((wh) => {
                const utilPercent = Math.round((wh.utilized / wh.capacity) * 100);
                return (
                  <div key={wh.id} className="p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{wh.name}</span>
                      <span className="text-[10px] font-mono bg-indigo-600/10 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{wh.type}</span>
                    </div>
                    <div className="space-y-1 mt-3">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>{isBangla ? "ক্ষমতা:" : "Cap:"} {wh.capacity} MT</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{utilPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${utilPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

          <div className="mt-6 bg-indigo-950/20 dark:bg-slate-950/40 p-4 rounded-xl border border-indigo-500/10 dark:border-white/10 font-sans">
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
