import React, { useState, useEffect } from "react";
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
  Users,
  GripVertical,
  PenTool
} from "lucide-react";
import { CurrencyManager } from "@agro-erp/shared-utils";
import { ESignatureModal } from "./ESignatureModal";
import VoiceCommandControl from "./VoiceCommandControl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ERPState, DocStatus, AccountType } from "../types";

// Sortable Widget Wrapper Component
function SortableWidget({ id, children }: { id: string; children: React.ReactNode; key?: React.Key }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.75 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 z-20 p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing transition-opacity shadow-xs border border-slate-200/50 dark:border-white/10"
        title="Drag to reorder layout"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </div>
  );
}
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell
} from "recharts";

interface ExecutiveDashboardProps {
  state: ERPState;
  onApprovePR: (id: string, signatureDataUrl?: string, signatoryName?: string) => void;
  onApprovePO: (id: string, signatureDataUrl?: string, signatoryName?: string) => void;
  isBangla: boolean;
  role: string;
  darkMode?: boolean;
  isLoading?: boolean;
  onNavigateTab?: (tab: string) => void;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export default function ExecutiveDashboard({
  state,
  onApprovePR,
  onApprovePO,
  isBangla,
  role,
  darkMode = false,
  isLoading = false,
  onNavigateTab
}: ExecutiveDashboardProps) {
  const [roleMode, setRoleMode] = useState<"ceo" | "cfo" | "coo">("ceo");

  // E-Signature Modal State
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigTargetType, setSigTargetType] = useState<"pr" | "po">("pr");
  const [sigTargetId, setSigTargetId] = useState<string>("");
  const [sigDocTitle, setSigDocTitle] = useState<string>("");

  const handleSignatureConfirm = (dataUrl: string, signatoryName: string, signatoryRole: string) => {
    if (sigTargetType === "pr") {
      onApprovePR(sigTargetId, dataUrl, signatoryName);
    } else {
      onApprovePO(sigTargetId, dataUrl, signatoryName);
    }
  };

  const openSigModal = (type: "pr" | "po", id: string, title: string) => {
    setSigTargetType(type);
    setSigTargetId(id);
    setSigDocTitle(title);
    setIsSigModalOpen(true);
  };
  const [selectedMonthTransactions, setSelectedMonthTransactions] = useState<{
    month: string;
    transactions: Array<{
      date: string;
      voucherNo: string;
      description: string;
      debitHead: string;
      creditHead: string;
      amount: number;
    }>;
  } | null>(null);

  // UserConfig widget layout persistence
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("userConfig_dashboardLayout");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return ["kpi-metrics", "primary-chart", "finance-deviation", "pending-approvals", "operational-health"];
  });

  const [forecastData] = useState([
    { month: "Jan", expense: 12500000, forecast: 12000000 },
    { month: "Feb", expense: 13200000, forecast: 13000000 },
    { month: "Mar", expense: 11800000, forecast: 12500000 },
    { month: "Apr", expense: 14500000, forecast: 14000000 },
    { month: "May", expense: 15200000, forecast: 14500000 },
    { month: "Jun", expense: 16800000, forecast: 16000000 },
    { month: "Jul", expense: 17400000, forecast: 18000000 },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        try {
          localStorage.setItem("userConfig_dashboardLayout", JSON.stringify(newOrder));
        } catch (e) {}
        return newOrder;
      });
    }
  };

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
    
    const scale = state.currency === "USD" ? 120 : 1;
    
    return {
      month,
      cash: Math.round((cashBalance * factor * wave) / scale),
      receivables: Math.round((receivables * factor * (wave - 0.02)) / scale),
      payables: Math.round((payables * factor * (wave + 0.03)) / scale),
      revenue: Math.round((((totalSales / 6) * (0.8 + (index / 5) * 0.3) * wave)) / scale), // Monthly revenue (sales spread out)
      purchases: Math.round((((purchases / 6) * (0.85 + (index / 5) * 0.2) * (wave - 0.01))) / scale), // Monthly purchases
      rawMaterial: Math.round((rawMatVal * factor * wave) / scale),
      finishedGoods: Math.round((finGoodsVal * factor * (wave + 0.01)) / scale),
      inventory: Math.round((totalInventoryVal * factor * wave) / scale)
    };
  });

  const handleChartClick = (chartData: any) => {
    // Recharts passes different structures depending on where the click landed
    const clickedMonth = chartData?.activeLabel || chartData?.month || (chartData?.activePayload && chartData.activePayload[0]?.payload?.month);
    if (!clickedMonth) return;

    // Generate simulated associated ledger transactions for that month!
    const monthTxList: Record<string, Array<{ date: string; voucherNo: string; description: string; debitHead: string; creditHead: string; amount: number }>> = {
      "Jan": [
        { date: "2026-01-15", voucherNo: "JV-2026-0105", description: "Purchased raw materials from XYZ Grain", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 2400000 },
        { date: "2026-01-20", voucherNo: "JV-2026-0112", description: "Received payment from Kazi Farms", debitHead: "Bank Asia General A/C", creditHead: "Accounts Receivable", amount: 1500000 }
      ],
      "Feb": [
        { date: "2026-02-12", voucherNo: "JV-2026-0201", description: "Dispatched Premium Broiler Feed to Aftab Feed", debitHead: "Accounts Receivable", creditHead: "Poultry Feed Sales", amount: 3500000 },
        { date: "2026-02-18", voucherNo: "JV-2026-0215", description: "Paid customs clearance dues for Brazilian Maize import", debitHead: "Raw Material Inventory", creditHead: "Bank Asia General A/C", amount: 450000 }
      ],
      "Mar": [
        { date: "2026-03-10", voucherNo: "JV-2026-0311", description: "Utility bill and diesel fuel cost clearance", debitHead: "Retained Earnings", creditHead: "Bank Asia General A/C", amount: 310000 },
        { date: "2026-03-24", voucherNo: "JV-2026-0348", description: "Soybean Meal intake from Dhaka Agri-Chemicals", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 4800000 }
      ],
      "Apr": [
        { date: "2026-04-05", voucherNo: "JV-2026-0404", description: "Salary disbursement for manufacturing staff", debitHead: "Retained Earnings", creditHead: "Bank Asia General A/C", amount: 1200000 },
        { date: "2026-04-20", voucherNo: "JV-2026-0419", description: "Feed export dispatch to CP Bangladesh Ltd", debitHead: "Accounts Receivable", creditHead: "Poultry Feed Sales", amount: 6200000 }
      ],
      "May": [
        { date: "2026-05-02", voucherNo: "JV-2026-0511", description: "Purchased packaging woven bags from Bengal Pack", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 800000 },
        { date: "2026-05-15", voucherNo: "JV-2026-0524", description: "Advance received from Bengal Feed Distributor", debitHead: "Bank Asia General A/C", creditHead: "Retained Earnings", amount: 1000000 }
      ],
      "Jun/Jul": [
        { date: "2026-07-26", voucherNo: "JV-2026-0741", description: "Opening balances alignment", debitHead: "Bank Asia General A/C", creditHead: "Accounts Payable", amount: 18000000 },
        { date: "2026-07-26", voucherNo: "JV-2026-0742", description: "Standard monthly depreciation posting", debitHead: "Retained Earnings", creditHead: "Retained Earnings", amount: 15000 }
      ],
      "জানুয়ারি": [
        { date: "2026-01-15", voucherNo: "JV-2026-0105", description: "XYZ গ্রেইন থেকে কাঁচামাল কেনা", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 2400000 },
        { date: "2026-01-20", voucherNo: "JV-2026-0112", description: "কাজী ফার্মস থেকে পেমেন্ট প্রাপ্তি", debitHead: "Bank Asia General A/C", creditHead: "Accounts Receivable", amount: 1500000 }
      ],
      "ফেব্রুয়ারি": [
        { date: "2026-02-12", voucherNo: "JV-2026-0201", description: "আফতাব ফিডকে প্রিমিয়াম ব্রয়লার ফিড সরবরাহ", debitHead: "Accounts Receivable", creditHead: "Poultry Feed Sales", amount: 3500000 },
        { date: "2026-02-18", voucherNo: "JV-2026-0215", description: "ব্রাজিলিয়ান ভুট্টা আমদানির শুল্ক পরিশোধ", debitHead: "Raw Material Inventory", creditHead: "Bank Asia General A/C", amount: 450000 }
      ],
      "মার্চ": [
        { date: "2026-03-10", voucherNo: "JV-2026-0311", description: "ইউটিলিটি বিল এবং ডিজেল জ্বালানি খরচ", debitHead: "Retained Earnings", creditHead: "Bank Asia General A/C", amount: 310000 },
        { date: "2026-03-24", voucherNo: "JV-2026-0348", description: "ঢাকা এগ্রি-কেমিক্যালস থেকে সয়াবিন খৈল কেনা", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 4800000 }
      ],
      "এপ্রিল": [
        { date: "2026-04-05", voucherNo: "JV-2026-0404", description: "উৎপাদন কর্মীদের বেতন বিতরণ", debitHead: "Retained Earnings", creditHead: "Bank Asia General A/C", amount: 1200000 },
        { date: "2026-04-20", voucherNo: "JV-2026-0419", description: "সিপি বাংলাদেশ লিমিটেডকে ফিড সরবরাহ", debitHead: "Accounts Receivable", creditHead: "Poultry Feed Sales", amount: 6200000 }
      ],
      "মে": [
        { date: "2026-05-02", voucherNo: "JV-2026-0511", description: "বেঙ্গল প্যাক থেকে প্যাকেজিং ব্যাগ কেনা", debitHead: "Raw Material Purchases", creditHead: "Accounts Payable", amount: 800000 },
        { date: "2026-05-15", voucherNo: "JV-2026-0524", description: "বেঙ্গল ফিড ডিস্ট্রিবিউটর থেকে অগ্রিম প্রাপ্তি", debitHead: "Bank Asia General A/C", creditHead: "Retained Earnings", amount: 1000000 }
      ],
      "জুন/জুলাই": [
        { date: "2026-07-26", voucherNo: "JV-2026-0741", description: "উদ্বোধনী ব্যালেন্স সমন্বয়", debitHead: "Bank Asia General A/C", creditHead: "Accounts Payable", amount: 18000000 }
      ]
    };

    const txs = monthTxList[clickedMonth] || [
      { date: "2026-07-26", voucherNo: "JV-2026-0799", description: "Simulated automatic postings for " + clickedMonth, debitHead: "Bank Asia General A/C", creditHead: "Retained Earnings", amount: 2500000 }
    ];

    setSelectedMonthTransactions({
      month: clickedMonth,
      transactions: txs
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-white/10 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Top KPI Metrics Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 border border-slate-200/50 dark:border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Chart & Activity Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 border border-slate-200/50 dark:border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="glass-card p-6 border border-slate-200/50 dark:border-white/5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isUSD = state.currency === "USD";
      const symbol = isUSD ? "$" : "৳";
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-xl p-3 border border-white/10 font-mono text-xs shadow-xl space-y-1.5">
          <p className="font-bold text-slate-300">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }}></span>
                <span className="text-slate-400">{p.name}:</span>
              </span>
              <span className="font-bold text-white">
                {symbol} {p.value.toLocaleString(undefined, { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
              </span>
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
      <BarChart onClick={handleChartClick} data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} className="cursor-pointer">
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => state.currency === "USD" ? `$ ${(val / 1000).toFixed(0)} K` : `৳ ${(val / 100000).toFixed(0)} L`} />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <Bar name={isBangla ? "রাজস্ব (বিক্রয়)" : "Revenue (Sales)"} dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar name={isBangla ? "ব্যয় (ক্রয়)" : "Cost (Purchases)"} dataKey="purchases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  // CFO Board Chart: Cash Position & Liquidity
  const renderCFOChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart onClick={handleChartClick} data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} className="cursor-pointer">
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
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => state.currency === "USD" ? `$ ${(val / 1000000).toFixed(2)} M` : `৳ ${(val / 10000000).toFixed(1)} Cr`} />
        <RechartsTooltip content={<CustomTooltip />} />
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
      <AreaChart onClick={handleChartClick} data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} className="cursor-pointer">
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
        <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={(val) => state.currency === "USD" ? `$ ${(val / 1000).toFixed(0)} K` : `৳ ${(val / 100000).toFixed(0)} L`} />
        <RechartsTooltip content={<CustomTooltip />} />
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
              ? "রিয়েল-টাইম এন্টারপ্রাইজ কার্যকারিতা রিপোর্টিং (ড্র্যাগ-এন্ড-ড্রপ লেআউট)"
              : "Real-time enterprise performance metrics & analytical intelligence (Drag-and-Drop Customizable)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Voice Command Control */}
          <VoiceCommandControl
            onNavigateTab={(tab) => onNavigateTab && onNavigateTab(tab)}
            isBangla={isBangla}
          />

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
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="space-y-6">
            {widgetOrder.map((widgetId) => {
              if (widgetId === "kpi-metrics") {
                return (
                  <SortableWidget key="kpi-metrics" id="kpi-metrics">
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
              {CurrencyManager.getCode() === "BDT"
                ? `৳ ${(totalSales / 10000000).toFixed(2)} Cr`
                : `${CurrencyManager.getCode() === "USD" ? "$" : "€"} ${(CurrencyManager.convert(totalSales) / 1000000).toFixed(2)} M`
              }
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
              {state.currency === "USD"
                ? `$ ${(((rawMatVal + finGoodsVal) / 120) / 1000).toFixed(1)} K`
                : `৳ ${((rawMatVal + finGoodsVal) / 100000).toFixed(1)} Lk`
              }
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
              {CurrencyManager.getCode() === "BDT"
                ? `৳ ${(cashBalance / 10000000).toFixed(2)} Cr`
                : `${CurrencyManager.getCode() === "USD" ? "$" : "€"} ${(CurrencyManager.convert(cashBalance) / 1000000).toFixed(2)} M`
              }
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
              {CurrencyManager.getCode() === "BDT"
                ? `৳ ${(receivables / 10000000).toFixed(2)} Cr`
                : `${CurrencyManager.getCode() === "USD" ? "$" : "€"} ${(CurrencyManager.convert(receivables) / 1000000).toFixed(2)} M`
              }
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
              {CurrencyManager.getCode() === "BDT"
                ? `৳ ${(payables / 10000000).toFixed(2)} Cr`
                : `${CurrencyManager.getCode() === "USD" ? "$" : "€"} ${(CurrencyManager.convert(payables) / 1000000).toFixed(2)} M`
              }
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-500 font-mono">
              <span>{isBangla ? "৪টি বিল বকেয়া" : "4 Pending Invoices"}</span>
            </div>
          </div>
        </div>

      </div>
    </SortableWidget>
  );
}

if (widgetId === "primary-chart") {
  return (
    <SortableWidget key="primary-chart" id="primary-chart">
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
              {isBangla ? "প্রসেস বটলনেক বিশ্লেষণ" : "PROCESS BOTTLENECK ANALYSIS"}
            </h4>
            <div className="space-y-3 mb-4">
              {(() => {
                // Calculate Average PR to PO time
                let totalPrToPoDays = 0;
                let prToPoCount = 0;
                state.purchaseOrders.forEach(po => {
                  const rfq = state.rfqs.find(r => r.rfqNumber === po.rfqNumber);
                  if (rfq) {
                    const pr = state.requisitions.find(r => r.prNumber === rfq.prNumber);
                    if (pr) {
                      const prDate = new Date(pr.requestedDate).getTime();
                      const poDate = new Date(po.orderDate).getTime();
                      if (!isNaN(prDate) && !isNaN(poDate)) {
                        totalPrToPoDays += Math.abs(poDate - prDate) / (1000 * 3600 * 24);
                        prToPoCount++;
                      }
                    }
                  }
                });
                const avgPrToPo = prToPoCount > 0 ? (totalPrToPoDays / prToPoCount).toFixed(1) : "2.5"; // mock if 0

                // Calculate Average PO to GRN time
                let totalPoToGrnDays = 0;
                let poToGrnCount = 0;
                state.goodsReceipts.forEach(grn => {
                  const po = state.purchaseOrders.find(p => p.poNumber === grn.poNumber);
                  if (po) {
                    const poDate = new Date(po.orderDate).getTime();
                    const grnDate = new Date(grn.receivedDate).getTime();
                    if (!isNaN(poDate) && !isNaN(grnDate)) {
                      totalPoToGrnDays += Math.abs(grnDate - poDate) / (1000 * 3600 * 24);
                      poToGrnCount++;
                    }
                  }
                });
                const avgPoToGrn = poToGrnCount > 0 ? (totalPoToGrnDays / poToGrnCount).toFixed(1) : "4.2"; // mock if 0

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded border border-indigo-100 dark:border-indigo-500/20">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">PR to PO Avg</p>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{avgPrToPo} Days</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">PO to GRN Avg</p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{avgPoToGrn} Days</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-2">
              {isBangla ? "রিয়েল-টাইম অডিট ট্রেইল" : "LIVE AUDIT LOGS"}
            </h4>
            <div className="space-y-2">
              {state.activities.slice(0, 3).map((act, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium max-w-[150px] truncate">{act.action}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </SortableWidget>
  );
}

if (widgetId === "finance-deviation") {
  return (
    <SortableWidget key="finance-deviation" id="finance-deviation">
      <div className="glass-card p-6 border border-slate-200/50 dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-amber-500" />
              {isBangla ? "আর্থিক বিচ্যুতি বিশ্লেষণ" : "Finance Deviation Analysis"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBangla ? "পূর্বাভাসিত বনাম প্রকৃত ব্যয়ের তুলনা" : "Comparison of Forecasted vs. Actual Expenditure"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">{isBangla ? "পূর্বাভাস" : "Forecast"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">{isBangla ? "প্রকৃত" : "Actual"}</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#64748b" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#64748b" }}
                tickFormatter={(val) => `৳${(val / 1000000).toFixed(1)}M`}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                  borderColor: darkMode ? "#1e293b" : "#e2e8f0",
                  borderRadius: "12px",
                  fontSize: "11px"
                }}
              />
              <Bar dataKey="forecast" fill={darkMode ? "#1e293b" : "#f1f5f9"} radius={[4, 4, 0, 0]} name={isBangla ? "পূর্বাভাস" : "Forecast"} />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]} name={isBangla ? "প্রকৃত" : "Actual"}>
                {forecastData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.actual > entry.forecast ? "#f43f5e" : "#6366f1"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
          {forecastData.slice(-4).map((d, i) => {
            const deviation = ((d.actual - d.forecast) / d.forecast) * 100;
            return (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase">{d.month}</p>
                <p className={`text-xs font-bold ${deviation > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                  {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SortableWidget>
  );
}

if (widgetId === "pending-approvals") {
  return (
    <SortableWidget key="pending-approvals" id="pending-approvals">
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
                        onClick={() => openSigModal("pr", pr.id, `Requisition Approval (${pr.prNumber})`)}
                        className="glass-button-green text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
                        title="E-Sign and Approve Requisition"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                        <span>{isBangla ? "ই-স্বাক্ষর ও অনুমোদন" : "Sign & Approve"}</span>
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
                        onClick={() => openSigModal("po", po.id, `Purchase Order Authorization (${po.poNumber})`)}
                        className="glass-button-green text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
                        title="E-Sign and Authorize PO"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                        <span>{isBangla ? "ই-স্বাক্ষর ও অনুমোদন" : "Sign & Authorize"}</span>
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
    </SortableWidget>
  );
}

              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>

      {selectedMonthTransactions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                  <span>
                    {isBangla 
                      ? `${selectedMonthTransactions.month}-এর লেজার লেনদেন বিশ্লেষণ` 
                      : `Ledger Drill-down for ${selectedMonthTransactions.month}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isBangla 
                    ? "নির্বাচিত মাস ও সংশ্লিষ্ট খতিয়ান অ্যাকাউন্ট সমূহের বিস্তারিত তথ্য।" 
                    : "Granular audit log of journal vouchers posted during this monthly cycle."}
                </p>
              </div>
              <button
                onClick={() => setSelectedMonthTransactions(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isBangla ? "বন্ধ করুন" : "Close (Esc)"}
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5 pl-4">{isBangla ? "তারিখ" : "Date"}</th>
                    <th className="p-2.5">{isBangla ? "ভাউচার নং" : "Voucher No"}</th>
                    <th className="p-2.5">{isBangla ? "বিবরণ" : "Description"}</th>
                    <th className="p-2.5">{isBangla ? "ডেবিট খাত" : "Debit Head"}</th>
                    <th className="p-2.5">{isBangla ? "ক্রেডিট খাত" : "Credit Head"}</th>
                    <th className="p-2.5 pr-4 text-right">{isBangla ? "পরিমাণ" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                  {selectedMonthTransactions.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-2.5 pl-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                      <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{tx.voucherNo}</td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-300 font-sans max-w-xs truncate" title={tx.description}>{tx.description}</td>
                      <td className="p-2.5 font-sans font-medium text-slate-600 dark:text-slate-300">{tx.debitHead}</td>
                      <td className="p-2.5 font-sans font-medium text-slate-600 dark:text-slate-300">{tx.creditHead}</td>
                      <td className="p-2.5 pr-4 text-right font-bold text-slate-800 dark:text-slate-100">
                        {CurrencyManager.format(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* E-SIGNATURE APPROVAL MODAL */}
      <ESignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onConfirmSignature={handleSignatureConfirm}
        documentTitle={sigDocTitle}
        signatoryRole="Executive / CFO / CEO"
        isBangla={isBangla}
      />
    </div>
  );
}
