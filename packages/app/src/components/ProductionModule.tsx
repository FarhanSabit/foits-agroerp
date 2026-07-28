import React, { useState } from "react";
import {
  TrendingUp,
  Cpu,
  Bookmark,
  Hammer,
  Plus,
  Play,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ListCollapse
} from "lucide-react";
import { ERPState, ProductBOM, productBOMs, DocStatus } from "../types";

interface ProductionModuleProps {
  state: ERPState;
  onSetForecast: (qty: number) => void;
  onRunMRP: () => void;
  onRaisePR: (itemCode: string, qty: number) => void;
  onLaunchWO: (productId: string, qty: number) => void;
  isBangla: boolean;
}

export default function ProductionModule({
  state,
  onSetForecast,
  onRunMRP,
  onRaisePR,
  onLaunchWO,
  isBangla
}: ProductionModuleProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "bom" | "mrp" | "workorders">("mrp");
  const [selectedProduct, setSelectedProduct] = useState("FG001");
  const [forecastInput, setForecastInput] = useState(1000);

  // Selected BOM
  const currentBOM = productBOMs.find((b) => b.productCode === selectedProduct) || productBOMs[0];

  // Calculate dynamic MRP live based on state and inputs
  const mrpCalculation = currentBOM.materials.map((mat) => {
    const totalNeeded = mat.qtyNeededPerFG * forecastInput;
    const currentStock = state.inventory.find((i) => i.code === mat.materialCode)?.availableStock || 0;
    const shortage = Math.max(0, totalNeeded - currentStock);
    return {
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      qtyNeededPerFG: mat.qtyNeededPerFG,
      totalNeeded,
      currentStock,
      shortage,
      uom: mat.uom
    };
  });

  const maizeShortage = mrpCalculation.find((m) => m.materialCode === "RM001")?.shortage || 0;

  return (
    <div className="space-y-6">
      
      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200/50 dark:border-white/10 gap-1 overflow-x-auto">
        {(
          [
            { id: "forecast", labelEn: "Sales Forecast", labelBn: "বিক্রয় পূর্বাভাস", icon: TrendingUp },
            { id: "bom", labelEn: "BOM Specifications", labelBn: "বিওএম ফর্মুলা", icon: ListCollapse },
            { id: "mrp", labelEn: "MRP Calculator", labelBn: "এমআরপি হিসাব", icon: Cpu },
            { id: "workorders", labelEn: "Work Orders", labelBn: "উৎপাদন আদেশ", icon: Hammer }
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/10"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{isBangla ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Selector Area */}
      <div className="flex justify-between items-center glass-card p-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{isBangla ? "পণ্য নির্বাচন করুন:" : "Target Product:"}</span>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold outline-none"
          >
            {productBOMs.map((bom) => (
              <option key={bom.productCode} value={bom.productCode}>
                {bom.productName}
              </option>
            ))}
          </select>
        </div>

        {activeTab === "forecast" && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">{isBangla ? "পূর্বাভাস পরিমাণ (ব্যাগ):" : "Forecast Qty (Bags):"}</span>
            <input
              type="number"
              value={forecastInput}
              onChange={(e) => {
                const val = Number(e.target.value);
                setForecastInput(val);
                onSetForecast(val);
              }}
              className="glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold w-28 outline-none"
            />
          </div>
        )}
      </div>

      {/* Sub-tab view renders */}
      <div className="glass-card overflow-hidden p-6">
        
        {/* Sub-tab 1: Forecast planning */}
        {activeTab === "forecast" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isBangla ? "বিক্রয় চাহিদা এবং পরিকল্পনা" : "Aggregate Demand Forecasting"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure projected poultry feed demand to auto-calculate raw material requirements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-white/10">
              <div className="space-y-4">
                <div className="p-4 border border-slate-200/50 dark:border-white/5 rounded-2xl bg-white/30 dark:bg-white/[0.01]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">REORDER RECOMMENDATION</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 font-mono">1,000 Bags</span>
                    <span className="text-xs text-slate-500">of Broiler Starter</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 animate-pulse">
                    Based on seasonal demand spike in Gazipur hatcheries sector (Average temperature 32°C).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setForecastInput(1000);
                    onSetForecast(1000);
                    alert(isBangla ? "পূর্বাভাস ১,০০০ ব্যাগ সেটিং সম্পন্ন হয়েছে!" : "Demand set to 1,000 Bags.");
                  }}
                  className="w-full glass-button-indigo text-xs p-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{isBangla ? "প্রস্তাবিত লক্ষ্য সেট করুন" : "Apply Recommended Forecast"}</span>
                </button>
              </div>

              <div className="p-4 bg-indigo-950/80 dark:bg-slate-950/40 text-slate-300 rounded-2xl border border-indigo-500/15 dark:border-white/10 flex flex-col justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">SYSTEM VALUE</span>
                  <p className="text-xs leading-normal mt-2 text-slate-300">
                    Establishing a precise sales demand projection feeds the Material Requirement Planning (MRP) scheduler to protect working capital and optimize factory utilization.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-2 text-[10px] text-slate-400 rounded-xl mt-4 border border-white/5 font-mono">
                  <span className="font-bold text-indigo-400">OITS Dhaka Rule:</span> Always synchronize forecast quantities before launching production work orders to prevent idle warehouse inventory space.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab 2: BOM Specifications */}
        {activeTab === "bom" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "বিওএম রেসিপি সূত্র" : "Bill of Materials (BOM) Specs"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Material composition requirements for producing 1 Bag of {currentBOM.productName}.
              </p>
            </div>

            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-6">{isBangla ? "কাঁচামাল কোড" : "Material Code"}</th>
                    <th className="p-3">{isBangla ? "বিবরণ" : "Material Name"}</th>
                    <th className="p-3">{isBangla ? "প্রয়োজনীয় পরিমাণ (প্রতি ব্যাগ)" : "Qty Needed / FG Bag"}</th>
                    <th className="p-3 pr-6 text-right">{isBangla ? "পরিমাপ" : "UOM"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {currentBOM.materials.map((mat) => (
                    <tr key={mat.materialCode} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{mat.materialCode}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{mat.materialName}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{mat.qtyNeededPerFG}</td>
                      <td className="p-3 pr-6 text-right font-mono text-slate-400">{mat.uom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-tab 3: MRP Calculator */}
        {activeTab === "mrp" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-200/50 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isBangla ? "এমআরপি হিসাব ও মজুদ ঘাটতি" : "Material Requirement Scheduler (MRP)"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Demand: <span className="font-bold text-slate-850 dark:text-white font-mono">{forecastInput} Bags</span> of {currentBOM.productName}.
                </p>
              </div>
              <button
                onClick={onRunMRP}
                className="glass-button-indigo text-xs px-3.5 py-2 flex items-center gap-1.5"
              >
                <Cpu className="h-4 w-4 shrink-0" />
                <span>{isBangla ? "এমআরপি হিসাব চালান" : "Recalculate MRP"}</span>
              </button>
            </div>

            {/* Live shortages tables */}
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-6">{isBangla ? "কাঁচামাল কোড" : "Material Code"}</th>
                    <th className="p-3">{isBangla ? "বিবরণ" : "Material"}</th>
                    <th className="p-3">{isBangla ? "প্রয়োজনীয় মোট কাঁচামাল" : "Total Required"}</th>
                    <th className="p-3">{isBangla ? "বিদ্যমান মজুদ" : "Available Stock"}</th>
                    <th className="p-3">{isBangla ? "ঘাটতি পরিমাণ" : "Shortage Detection"}</th>
                    <th className="p-3 pr-6 text-right">{isBangla ? "অ্যাকশন" : "Procurement Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {mrpCalculation.map((mrp) => {
                    const hasShortage = mrp.shortage > 0;
                    return (
                      <tr key={mrp.materialCode} className={`hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors ${hasShortage ? "bg-amber-500/5 dark:bg-amber-500/[0.02]" : ""}`}>
                        <td className="p-3 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{mrp.materialCode}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{mrp.materialName}</td>
                        <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {mrp.totalNeeded.toLocaleString()} {mrp.uom}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                          {mrp.currentStock.toLocaleString()} {mrp.uom}
                        </td>
                        <td className="p-3">
                          {hasShortage ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold font-mono inline-flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              {mrp.shortage.toLocaleString()} {mrp.uom}
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono inline-flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 shrink-0" /> {isBangla ? "ঘাটতি নেই" : "In Stock"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 pr-6 text-right">
                          {hasShortage ? (
                            <button
                              onClick={() => {
                                onRaisePR(mrp.materialCode, mrp.shortage);
                                alert(isBangla ? "ক্রয় রিকুইজিশন সফলভাবে তালিকাভুক্ত হয়েছে!" : "Purchase Requisition drafted for shortage item!");
                              }}
                              className="glass-button-amber text-[11px] px-2.5 py-1.5 rounded-lg"
                            >
                              {isBangla ? "পিআর জেনারেট করুন" : "Generate PR"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">{isBangla ? "পর্যাপ্ত মজুদ" : "Sufficient Stock"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Prompt for shortage */}
            {maizeShortage > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {isBangla
                      ? "পোল্ট্রি ফিড উৎপাদনে ২০,০০০ কেজি ভুট্টার ঘাটতি সনাক্ত করা হয়েছে। অবিলম্বে কাঁচামাল সংগ্রহের জন্য একটি ক্রয় রিকুইজিশন প্রস্তুত করুন।"
                      : "Maize shortage of 20,000 KG detected for Poultry Feed production run. Click 'Generate PR' to auto-compile a Purchase Requisition."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onRaisePR("RM001", maizeShortage);
                    alert(isBangla ? "ক্রয় রিকুইজিশন তৈরি সম্পন্ন হয়েছে!" : "Purchase Requisition automatically compiled.");
                  }}
                  className="glass-button-indigo text-xs px-4 py-2 shrink-0 flex items-center gap-1.5"
                >
                  <Cpu className="h-4 w-4 fill-white shrink-0" />
                  <span>{isBangla ? "পিআর রিকুয়েস্ট রিলুন" : "Auto-Generate Shortage PR"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 4: Work Orders */}
        {activeTab === "workorders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3.5 pl-6">{isBangla ? "ওয়ার্ক অর্ডার নম্বর" : "WO Number"}</th>
                  <th className="p-3.5">{isBangla ? "উৎপাদিত পণ্য" : "FG Product"}</th>
                  <th className="p-3.5">{isBangla ? "পরিকল্পিত পরিমাণ" : "Planned Qty"}</th>
                  <th className="p-3.5">{isBangla ? "উৎপাদিত পরিমাণ" : "Produced Qty"}</th>
                  <th className="p-3.5">{isBangla ? "তারিখ সীমা" : "Schedule Dates"}</th>
                  <th className="p-3.5">{isBangla ? "কাঁচামাল ইস্যু" : "Raw Materials"}</th>
                  <th className="p-3.5 pr-6">{isBangla ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {state.workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{wo.woNumber}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{wo.productName}</td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">{wo.plannedQty.toLocaleString()} Bags</td>
                    <td className="p-3.5 font-mono text-slate-500">{wo.producedQty.toLocaleString()} Bags</td>
                    <td className="p-3.5 font-mono text-slate-400">{wo.startDate} to {wo.endDate}</td>
                    <td className="p-3.5">
                      {wo.materialIssued ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{isBangla ? "ইস্যু সম্পন্ন" : "Materials Issued"}</span>
                      ) : (
                        <button
                          onClick={() => {
                            onLaunchWO(wo.productCode, wo.plannedQty);
                            alert(isBangla ? "ফ্যাক্টরি ওয়ার্ক অর্ডার মিলিং প্রসেস শুরু হয়েছে!" : "Work Order WO24001 successfully milling - materials consumed & stock updated!");
                          }}
                          className="glass-button-green text-[11px] px-3.5 py-1.5"
                        >
                          {isBangla ? "কাঁচামাল ইস্যু ও মিলিং" : "Issue & Mill"}
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 pr-6">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        wo.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {wo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
