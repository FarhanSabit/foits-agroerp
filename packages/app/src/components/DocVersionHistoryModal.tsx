import React, { useState } from "react";
import { History, RotateCcw, Clock, FileText, CheckCircle2, AlertTriangle, ArrowLeft, X, Layers } from "lucide-react";
import { DocVersion } from "../types";

interface DocVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentNumber: string;
  documentType: "PR" | "PO";
  versions?: DocVersion<any>[];
  onRevertVersion: (versionNumber: number) => void;
  isBangla: boolean;
}

export default function DocVersionHistoryModal({
  isOpen,
  onClose,
  documentNumber,
  documentType,
  versions = [],
  onRevertVersion,
  isBangla
}: DocVersionHistoryModalProps) {
  const [selectedVersionNum, setSelectedVersionNum] = useState<number | null>(null);

  if (!isOpen) return null;

  // Fallback demo versions if none exist yet
  const displayVersions = versions.length > 0 ? versions : [
    {
      version: 2,
      timestamp: "2026-07-26 18:30",
      modifiedBy: "Dr. Ahsan Rahman (CFO)",
      changeSummary: "Approved budget with attached e-signature",
      dataSnapshot: {
        totalValue: 690000,
        status: "Approved",
        itemsCount: 1
      }
    },
    {
      version: 1,
      timestamp: "2026-07-25 10:15",
      modifiedBy: "Sultana Begum (Factory GM)",
      changeSummary: "Initial draft submission for Maize raw material request",
      dataSnapshot: {
        totalValue: 700000,
        status: "Pending Approval",
        itemsCount: 1
      }
    }
  ];

  const selectedVerObj = displayVersions.find(v => v.version === selectedVersionNum) || displayVersions[0];

  const handleRevert = (verNum: number) => {
    if (confirm(isBangla ? `আপনি কি নিশ্চিত ভার্সন v${verNum}.0 তে ডকুমেন্টস রিস্টোর করতে চান?` : `Are you sure you want to revert ${documentNumber} to Version ${verNum}.0?`)) {
      onRevertVersion(verNum);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{documentNumber}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {documentType === "PR" ? "Purchase Requisition" : "Purchase Order"}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {isBangla ? "ভার্সন কন্ট্রোল ইতিহাস ও রিভিশন ট্র্যাকিং" : "Audit Trail Revision & Snapshot History"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 overflow-y-auto pr-1">
          {/* Versions Timeline List (Left) */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-800 pr-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-2">
              {isBangla ? "ভার্সন টাইমলাইন" : "Revision Timeline"}
            </span>

            {displayVersions.map((v) => {
              const isSelected = selectedVerObj.version === v.version;
              return (
                <div
                  key={v.version}
                  onClick={() => setSelectedVersionNum(v.version)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-950/60 border-indigo-500/60 text-white shadow-md shadow-indigo-500/10"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                      v{v.version}.0
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {v.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-semibold line-clamp-1 text-slate-200 mt-1">
                    {v.changeSummary}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    By: {v.modifiedBy}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Version Snapshot Detail (Right) */}
          <div className="md:col-span-7 bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  Version {selectedVerObj.version}.0 Snapshot
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedVerObj.timestamp}
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block font-semibold mb-0.5">
                    {isBangla ? "পরিবর্তনের বিবরণ" : "Change Notes"}
                  </span>
                  <p className="text-xs font-medium text-slate-200">
                    {selectedVerObj.changeSummary}
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block font-semibold mb-0.5">
                    {isBangla ? "সম্পাদনকারী কর্মকর্তা" : "Modified By"}
                  </span>
                  <p className="text-xs font-mono font-bold text-indigo-300">
                    {selectedVerObj.modifiedBy}
                  </p>
                </div>

                {selectedVerObj.dataSnapshot && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block font-semibold mb-1">
                      {isBangla ? "ডাটা স্ন্যাপশট তথ্য" : "Document Snapshot Summary"}
                    </span>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Value:</span>
                      <span className="font-bold text-emerald-400">
                        ৳ {selectedVerObj.dataSnapshot.totalValue ? selectedVerObj.dataSnapshot.totalValue.toLocaleString() : "6,90,000"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-amber-400">
                        {selectedVerObj.dataSnapshot.status || "Approved"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revert Action */}
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => handleRevert(selectedVerObj.version)}
                className="w-full glass-button-amber py-2.5 text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {isBangla
                    ? `ভার্সন v${selectedVerObj.version}.0 তে পূর্বাবস্থায় ফেরান`
                    : `Revert Document to Version v${selectedVerObj.version}.0`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
