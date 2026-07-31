import React from "react";
import {
  TrendingUp,
  Cpu,
  FileSpreadsheet,
  CheckSquare,
  Mail,
  Scale,
  FileCheck,
  PackagePlus,
  Play,
  Hammer,
  Truck,
  DollarSign,
  ArrowRight,
  HelpCircle,
  FolderOpen
} from "lucide-react";

interface GoldenFlowProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onExecuteStep: (step: number) => void;
  isBangla: boolean;
}

export default function GoldenFlow({
  currentStep,
  setCurrentStep,
  onExecuteStep,
  isBangla
}: GoldenFlowProps) {
  
  const steps = [
    {
      id: 0,
      labelEn: "Sales Forecast",
      labelBn: "বিক্রয় পূর্বাভাস",
      descEn: "Enter product demand forecasts (e.g., Poultry Feed 1,000 Bags) to trigger monthly capacity planning.",
      descBn: "উৎপাদন সক্ষমতা পরিকল্পনা করার জন্য পণ্য চাহিদার পূর্বাভাস এন্ট্রি করুন।",
      icon: TrendingUp,
      tab: "production",
      actionLabelEn: "Set Forecast to 1,000 Bags",
      actionLabelBn: "পূর্বাভাস ১,০০০ ব্যাগ করুন"
    },
    {
      id: 1,
      labelEn: "MRP BOM Explosion",
      labelBn: "এমআরপি ও বিওএম হিসাব",
      descEn: "Explode the Poultry Feed Bill of Materials (BOM). System compares demand against stock & detects shortages.",
      descBn: "পোল্ট্রি ফিডের বিওএম সূত্র অনুযায়ী প্রয়োজনীয় ভুট্টা মজুদ যাচাই ও ঘাটতি পরিমাপ করুন।",
      icon: Cpu,
      tab: "production",
      actionLabelEn: "Run Material Planning (MRP)",
      actionLabelBn: "এমআরপি হিসাব চালান"
    },
    {
      id: 2,
      labelEn: "Purchase Req (PR)",
      labelBn: "ক্রয় রিকুইজিশন",
      descEn: "System automatically compiles a Purchase Requisition (PR-2026-0041) for the missing 20,000 KG Maize.",
      descBn: "ঘাটতি হওয়া ২০,০০০ কেজি ভুট্টার জন্য স্বয়ংক্রিয় ক্রয় রিকুইজিশন তৈরি করুন।",
      icon: FileSpreadsheet,
      tab: "procurement",
      actionLabelEn: "Generate Requisition (PR)",
      actionLabelBn: "ক্রয় রিকুইজিশন তৈরি করুন"
    },
    {
      id: 3,
      labelEn: "PR Approval",
      labelBn: "পিআর অনুমোদন",
      descEn: "CFO (Dr. Ahsan Rahman) reviews the requisition, validates budget, and authorizes procurement.",
      descBn: "সিএফও বিভাগ কর্তৃক বাজেট বরাদ্দ যাচাইপূর্বক ক্রয় রিকুইজিশনটি অনুমোদন করুন।",
      icon: CheckSquare,
      tab: "procurement",
      actionLabelEn: "Approve Requisition",
      actionLabelBn: "রিকুইজিশন অনুমোদন করুন"
    },
    {
      id: 4,
      labelEn: "RFQ to Suppliers",
      labelBn: "আরএফকিউ প্রেরণ",
      descEn: "Generate RFQ-2026-0012 and invite qualified grain suppliers (XYZ Trading, Dhaka Agri) to submit bids.",
      descBn: "উন্মুক্ত বাজারে ভুট্টার দর যাচাইয়ের জন্য সরবরাহকারীদের আমন্ত্রণপত্র প্রেরণ করুন।",
      icon: Mail,
      tab: "procurement",
      actionLabelEn: "Send RFQ to Suppliers",
      actionLabelBn: "আরএফকিউ দরপত্র আহ্বান করুন"
    },
    {
      id: 5,
      labelEn: "Quote Comparison",
      labelBn: "দরপত্র তুলনা",
      descEn: "Compare supplier pricing, lead times, and credit terms side-by-side in a dynamic evaluation matrix.",
      descBn: "সরবরাহকারীদের পাঠানো দর ও শর্তাবলী তুলনা করে সেরা ডিলার নির্বাচন করুন।",
      icon: Scale,
      tab: "procurement",
      actionLabelEn: "Compare Quotations",
      actionLabelBn: "দরপত্র তুলনা করুন"
    },
    {
      id: 6,
      labelEn: "Purchase Order (PO)",
      labelBn: "পারচেজ অর্ডার (PO)",
      descEn: "PO-2026-0092 is drafted to XYZ Trading at ৳34.5/KG. Total amount is ৳6,90,000.",
      descBn: "সেরা দরদাতা এক্সওয়াইজেড ট্রেডিংকে ২০,০০০ কেজি ভুট্টার জন্য কার্যাদেশ বা পিও প্রেরণ করুন।",
      icon: FileCheck,
      tab: "procurement",
      actionLabelEn: "Approve & Send PO",
      actionLabelBn: "পিও অনুমোদন ও প্রেরণ করুন"
    },
    {
      id: 7,
      labelEn: "Goods Receipt (GRN)",
      labelBn: "পণ্য গ্রহণ (GRN)",
      descEn: "Supplier delivers. QA tests and passes the batch. Warehouse supervisor posts GRN-2026-0112.",
      descBn: "সরবরাহকারীর পণ্য কারখানায় পৌঁছালে কিউসি পাস করে গুদামে পণ্য গ্রহণের রসিদ বা জিআরএন দিন।",
      icon: PackagePlus,
      tab: "procurement",
      actionLabelEn: "Post Goods Receipt & QC",
      actionLabelBn: "জিআরএন ও কিউসি সম্পন্ন করুন"
    },
    {
      id: 8,
      labelEn: "Inventory Update",
      labelBn: "মজুদ হালনাগাদ",
      descEn: "Maize raw material stock immediately updates from 40,000 KG to 60,000 KG. Asset valuation is updated.",
      descBn: "ভুট্টার মজুদ ৪০,০০০ কেজি থেকে বেড়ে ৬০,০০০ কেজি হয়ে যাবে। সম্পত্তির আর্থিক মূল্য হালনাগাদ হবে।",
      icon: FolderOpen,
      tab: "inventory",
      actionLabelEn: "Verify Inventory Stock",
      actionLabelBn: "মজুদ যাচাই করুন"
    },
    {
      id: 9,
      labelEn: "Production WO",
      labelBn: "উৎপাদন ও প্রসেস",
      descEn: "Launch Work Order WO24001. Issue 30,000 KG Maize. Mill & produce 1,000 Bags of Broiler Starter Feed.",
      descBn: "ওয়ার্ক অর্ডার WO24001 চালু করে কারখানায় ভুট্টা ইস্যু করুন ও পোল্ট্রি ফিড উৎপাদন সম্পন্ন করুন।",
      icon: Hammer,
      tab: "production",
      actionLabelEn: "Dispatch Work Order & Mill",
      actionLabelBn: "ওয়ার্ক অর্ডার প্রসেস করুন"
    },
    {
      id: 10,
      labelEn: "Sales & Dispatch",
      labelBn: "বিক্রয় ও সরবরাহ",
      descEn: "Customer (Kazi Farms) orders 500 bags. Allocate prime mover vehicle, coordinate route, and dispatch.",
      descBn: "কাজী ফার্মস Hatchery-তে ৫০০ ব্যাগ ফিড সরবরাহের জন্য গাড়ি বরাদ্দ করে ট্রিপ চালু করুন।",
      icon: Truck,
      tab: "sales",
      actionLabelEn: "Create Sales Dispatch",
      actionLabelBn: "সেলস ও গাড়ি ছাড় করুন"
    },
    {
      id: 11,
      labelEn: "Collection & Ledger",
      labelBn: "আদায় ও লেজার",
      descEn: "Generate customer AR Invoice, log payment collection of ৳12,25,000, and generate automatic ledger postings.",
      descBn: "কাস্টমার ইনভয়েস তৈরি করে অর্থ আদায় করুন এবং ব্যাংক লেজারে স্বয়ংক্রিয় এন্ট্রি দিন।",
      icon: DollarSign,
      tab: "finance",
      actionLabelEn: "Post Final Payment & Close Flow",
      actionLabelBn: "লেনদেন নিষ্পত্তি করুন"
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="bg-white/30 dark:bg-slate-950/20 backdrop-blur-md border-b border-slate-200/50 dark:border-white/10 p-4 shrink-0 shadow-sm">
      <div className="max-w-7xl mx-auto">
        
        {/* Top bar with guide title & auto run */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] text-white font-mono font-bold animate-pulse">
              ★
            </span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              {isBangla ? "অ্যাগ্রো ইআরপি গোল্ডেন ফ্লো ডেমো গাইড" : "Agro ERP Golden Workflow Guide"}
            </h2>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {isBangla ? "ধাপ:" : "Progress:"} <span className="text-indigo-700 dark:text-indigo-400 font-bold">{currentStep + 1} / 12</span>
          </div>
        </div>

        {/* Desktop Step Indicator timeline */}
        <div className="overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <div className="flex lg:grid lg:grid-cols-12 gap-4 lg:gap-1 relative items-center mb-5 min-w-max lg:min-w-0">
            
            {/* Background connectors */}
            <div className="absolute left-[4%] right-[4%] top-1/2 h-0.5 bg-slate-200/80 dark:bg-slate-800/80 -translate-y-1/2 z-0 hidden lg:block"></div>
            <div
              className="absolute left-[4%] top-1/2 h-0.5 bg-indigo-600 dark:bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-300 hidden lg:block"
              style={{ width: `${(currentStep / 11) * 92}%` }}
            ></div>

            {steps.map((st) => {
              const Icon = st.icon;
              const isCompleted = st.id < currentStep;
              const isActive = st.id === currentStep;
              
              return (
                <button
                  key={st.id}
                  onClick={() => setCurrentStep(st.id)}
                  className="flex flex-col items-center text-center group z-10 focus:outline-none cursor-pointer shrink-0 lg:shrink"
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all border ${
                      isActive
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 ring-4 ring-indigo-500/20 dark:ring-indigo-500/10 scale-110 shadow-lg shadow-indigo-500/20"
                        : isCompleted
                        ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30"
                        : "bg-white/40 dark:bg-white/5 backdrop-blur-xs text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-white/10 hover:border-slate-400 dark:hover:border-slate-500"
                    }`}
                    title={isBangla ? st.labelBn : st.labelEn}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                  </div>
                  <span
                    className={`text-[9px] font-mono mt-1.5 leading-none tracking-tight max-w-[80px] truncate ${
                      isActive
                        ? "text-indigo-700 dark:text-indigo-400 font-bold"
                        : isCompleted
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {isBangla ? st.labelBn : st.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Instruction card */}
        <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex gap-3">
            <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl text-indigo-700 dark:text-indigo-400 shrink-0 self-start md:self-center border border-indigo-500/10 dark:border-indigo-500/20">
              <currentStepData.icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono bg-indigo-500/15 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  {isBangla ? `ধাপ ${currentStep + 1}` : `STEP ${currentStep + 1}`}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {isBangla ? currentStepData.labelBn : currentStepData.labelEn}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal max-w-2xl">
                {isBangla ? currentStepData.descBn : currentStepData.descEn}
              </p>
            </div>
          </div>
          
          {/* Quick Step Action Trigger */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onExecuteStep(currentStep)}
              className="flex items-center gap-2 bg-indigo-600/90 dark:bg-indigo-500/90 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl transition-all border border-white/10 outline-none hover:shadow-lg shadow-indigo-500/20 active:scale-95 animate-pulse cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white shrink-0" />
              <span>{isBangla ? currentStepData.actionLabelBn : currentStepData.actionLabelEn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
