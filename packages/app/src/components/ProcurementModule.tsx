import React, { useState } from "react";
import { z } from "zod";
import {
  Users,
  FileText,
  Mail,
  Scale,
  FileCheck,
  CheckCircle,
  FileCheck2,
  Plus,
  AlertTriangle,
  AlertCircle,
  Search,
  Check,
  X,
  Camera,
  RefreshCw,
  CheckCircle2,
  Download,
  QrCode,
  PenTool,
  History,
  ShieldCheck
} from "lucide-react";
import { downloadGRNPDF } from "../utils/pdfGenerator";
import BarcodeScannerModal from "./BarcodeScannerModal";
import { ESignatureModal } from "./ESignatureModal";
import DocVersionHistoryModal from "./DocVersionHistoryModal";
import BiometricAuthModal from "./BiometricAuthModal";
import {
  ERPState,
  Supplier,
  PurchaseRequisition,
  RFQ,
  PurchaseOrder,
  GoodsReceipt,
  DocStatus,
  SupplierType
} from "../types";

interface ProcurementModuleProps {
  state: ERPState;
  onRaisePR: (itemCode: string, qty: number) => void;
  onRaiseRFQ: (prNumber: string) => void;
  onAwardSupplier: (rfqNumber: string, supplierCode: string) => void;
  onPostGRN: (poNumber: string, receivedItems: any[], signatureDataUrl?: string, signatoryName?: string) => void;
  onApprovePR?: (id: string, signatureDataUrl?: string, signatoryName?: string) => void;
  onBulkApprovePR?: (ids: string[], signatureDataUrl?: string, signatoryName?: string) => void;
  onApprovePO?: (id: string, signatureDataUrl?: string, signatoryName?: string) => void;
  onLinkInvoiceToGRN?: (grnId: string, invoiceUrl: string) => void;
  onRevertVersion?: (docType: "PR" | "PO", docId: string, versionNumber: number) => void;
  isBangla: boolean;
  isLoading?: boolean;
}

const Skeleton = ({ className }: { className?: string; key?: React.Key }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export default function ProcurementModule({
  state,
  onRaisePR,
  onRaiseRFQ,
  onAwardSupplier,
  onPostGRN,
  onApprovePR,
  onBulkApprovePR,
  onApprovePO,
  onLinkInvoiceToGRN,
  onRevertVersion,
  isBangla,
  isLoading = false
}: ProcurementModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"suppliers" | "pr" | "rfq" | "po" | "grn">("suppliers");
  const [searchTerm, setSearchTerm] = useState("");
  const [newPrQty, setNewPRQty] = useState(20000);
  const [newPrItem, setNewPRItem] = useState("RM001");
  const [prErrors, setPrErrors] = useState<{ itemCode?: string; qty?: string } | null>(null);

  // Multi-select PR selection state
  const [selectedPrIds, setSelectedPrIds] = useState<string[]>([]);

  // Quick Sort States for Procurement
  const [prSort, setPrSort] = useState<"number_asc" | "date_desc" | "date_asc" | "cost_desc" | "cost_asc">("date_desc");
  const [poSort, setPoSort] = useState<"number_asc" | "date_desc" | "date_asc" | "cost_desc" | "cost_asc" | "supplier_asc">("date_desc");

  // E-Signature Modal State
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigTargetType, setSigTargetType] = useState<"pr" | "po" | "grn" | "bulk_pr">("pr");
  const [sigTargetId, setSigTargetId] = useState<string>("");
  const [sigDocTitle, setSigDocTitle] = useState<string>("");
  const [sigExtraData, setSigExtraData] = useState<any>(null);

  // Version Control Modal State
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [verDocDetails, setVerDocDetails] = useState<{ id: string; number: string; type: "PR" | "PO"; versions: any[] } | null>(null);

  // WebAuthn Biometric Auth State
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioTargetDoc, setBioTargetDoc] = useState<{ type: "pr" | "po"; id: string; title: string; amount: number } | null>(null);

  // Zod schema for PR validation
  const prSchema = z.object({
    itemCode: z.string().min(1, { message: isBangla ? "আইটেম নির্বাচন আবশ্যক" : "Item selection is required" }),
    qty: z
      .number({ message: isBangla ? "সংখ্যার মান প্রয়োজন" : "Must be a valid number" })
      .min(100, { message: isBangla ? "সর্বনিম্ন পরিমাণ ১০০ কেজি" : "Minimum quantity is 100 KG" })
      .max(500000, { message: isBangla ? "সর্বোচ্চ পরিমাণ ৫,০০,০০০ কেজি" : "Maximum quantity is 500,000 KG" })
  });

  const handleValidateAndRaisePR = () => {
    const parseResult = prSchema.safeParse({ itemCode: newPrItem, qty: Number(newPrQty) });
    if (!parseResult.success) {
      const formatted = parseResult.error.format();
      setPrErrors({
        itemCode: formatted.itemCode?._errors[0],
        qty: formatted.qty?._errors[0]
      });
      return;
    }
    setPrErrors(null);
    onRaisePR(newPrItem, Number(newPrQty));
    alert(isBangla ? "ক্রয় রিকুইজিশন তৈরি সম্পন্ন হয়েছে!" : "Purchase Requisition created successfully!");
  };

  const handleSignatureConfirm = (dataUrl: string, signatoryName: string, role: string) => {
    if (sigTargetType === "bulk_pr") {
      if (onBulkApprovePR) {
        onBulkApprovePR(selectedPrIds, dataUrl, signatoryName);
      } else if (onApprovePR) {
        selectedPrIds.forEach((id) => onApprovePR(id, dataUrl, signatoryName));
      }
      setSelectedPrIds([]);
    } else if (sigTargetType === "pr" && onApprovePR) {
      onApprovePR(sigTargetId, dataUrl, signatoryName);
    } else if (sigTargetType === "po" && onApprovePO) {
      onApprovePO(sigTargetId, dataUrl, signatoryName);
    } else if (sigTargetType === "grn") {
      onPostGRN(sigTargetId, sigExtraData || [], dataUrl, signatoryName);
    }
  };

  const openSignatureModal = (type: "pr" | "po" | "grn" | "bulk_pr", id: string, docTitle: string, extraData?: any, amount?: number) => {
    if (amount && amount > 500000) {
      setBioTargetDoc({ type: type === "bulk_pr" ? "pr" : (type as "pr" | "po"), id, title: docTitle, amount });
      setSigExtraData(extraData);
      setIsBioModalOpen(true);
      return;
    }
    setSigTargetType(type);
    setSigTargetId(id);
    setSigDocTitle(docTitle);
    setSigExtraData(extraData);
    setIsSigModalOpen(true);
  };

  const handleBiometricSuccess = () => {
    if (bioTargetDoc) {
      setSigTargetType(bioTargetDoc.type);
      setSigTargetId(bioTargetDoc.id);
      setSigDocTitle(bioTargetDoc.title);
      setIsBioModalOpen(false);
      setIsSigModalOpen(true);
    }
  };

  // Barcode & QR Scanner state
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Camera Scanning States
  const [scanningGRN, setScanningGRN] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="glass-card p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex gap-1 bg-white/45 dark:bg-white/5 p-1 rounded-xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200/50 dark:border-white/10 flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl p-4 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    setOcrResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setTimeout(() => {
        const video = document.getElementById("scanner-video") as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access is not supported, or was blocked in the browser iframe. Running high-fidelity simulation.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById("scanner-video") as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
        runSimulatedOCR();
      }
    } else {
      simulateScan();
    }
  };

  const runSimulatedOCR = () => {
    setIsOcrProcessing(true);
    setTimeout(() => {
      setIsOcrProcessing(false);
      setOcrResult({
        invoiceNo: "INV-2026-9041",
        supplier: "XYZ Grain Trading",
        item: "Maize (Yellow Grade A)",
        qty: "20,000 KG",
        matchStatus: "Verified & Matched"
      });
    }, 1500);
  };

  const simulateScan = () => {
    setCameraError(null);
    setCapturedImage(null);
    setOcrResult(null);
    setIsOcrProcessing(true);
    setTimeout(() => {
      setCapturedImage("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400&fm=webp");
      setIsOcrProcessing(false);
      setOcrResult({
        invoiceNo: "INV-2026-9041",
        supplier: "XYZ Grain Trading",
        item: "Maize (Yellow Grade A)",
        qty: "20,000 KG",
        matchStatus: "Verified & Matched"
      });
    }, 1500);
  };

  // Suppliers list filtering
  const filteredSuppliers = state.suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200/50 dark:border-white/10 gap-1 overflow-x-auto">
        {(
          [
            { id: "suppliers", labelEn: "Suppliers", labelBn: "সরবরাহকারী", icon: Users },
            { id: "pr", labelEn: "Purchase Requisitions", labelBn: "ক্রয় রিকুইজিশন", icon: FileText },
            { id: "rfq", labelEn: "RFQs & Bids", labelBn: "দরপত্র (RFQ)", icon: Mail },
            { id: "po", labelEn: "Purchase Orders", labelBn: "কার্যাদেশ (PO)", icon: FileCheck },
            { id: "grn", labelEn: "Goods Receipt (GRN)", labelBn: "জিআরএন রশিদ", icon: FileCheck2 }
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSearchTerm("");
              }}
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

      {/* SEARCH AND FILTER BAR */}
      <div className="flex justify-between items-center glass-card p-4 gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              isBangla
                ? "খুঁজুন কোড বা বিবরণ দিয়ে..."
                : `Search in ${activeSubTab}...`
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input p-2.5 pl-9.5 text-xs rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          />
        </div>
        
        {/* Helper widget based on tab */}
        {activeSubTab === "pr" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">{isBangla ? "নতুন পিআর:" : "Item:"}</span>
            
            <div className="relative flex items-center">
              <select
                value={newPrItem}
                onChange={(e) => {
                  setNewPRItem(e.target.value);
                  setPrErrors(null);
                }}
                className={`glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none ${
                  prErrors?.itemCode ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/30" : ""
                }`}
              >
                {state.inventory.filter(i => i.category === "Raw Material").map(i => (
                  <option key={i.code} value={i.code}>{i.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center group">
              <input
                type="number"
                value={newPrQty}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewPRQty(val);
                  const check = prSchema.safeParse({ itemCode: newPrItem, qty: val });
                  if (!check.success) {
                    setPrErrors({ qty: check.error.format().qty?._errors[0] });
                  } else {
                    setPrErrors(null);
                  }
                }}
                className={`glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 w-28 outline-none ${
                  prErrors?.qty ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold" : ""
                }`}
                placeholder="Quantity"
              />
              {prErrors?.qty && (
                <div className="relative flex items-center ml-1">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-rose-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap font-sans border border-rose-700">
                    {prErrors.qty}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleValidateAndRaisePR}
              className="glass-button-indigo text-xs px-3.5 py-1.5 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isBangla ? "পিআর যোগ করুন" : "Raise PR"}</span>
            </button>
          </div>
        )}
      </div>

      {/* MODULE TAB VIEWS */}
      <div className="glass-card overflow-hidden">
        
        {/* Tab 1: Suppliers */}
        {activeSubTab === "suppliers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3.5 pl-6">{isBangla ? "কোড" : "Code"}</th>
                  <th className="p-3.5">{isBangla ? "সরবরাহকারী" : "Supplier Name"}</th>
                  <th className="p-3.5">{isBangla ? "ধরণ" : "Type"}</th>
                  <th className="p-3.5">{isBangla ? "যোগাযোগকারী" : "Contact Person"}</th>
                  <th className="p-3.5">{isBangla ? "মোবাইল" : "Phone"}</th>
                  <th className="p-3.5">{isBangla ? "ক্রেডিট মেয়াদ" : "Credit Days"}</th>
                  <th className="p-3.5">{isBangla ? "রেটিং" : "Rating"}</th>
                  <th className="p-3.5 pr-6">{isBangla ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{sup.code}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{sup.name}</td>
                    <td className="p-3.5 text-slate-500">{sup.type}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{sup.contactPerson}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{sup.phone}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{sup.creditDays} Days</td>
                    <td className="p-3.5 font-mono text-amber-600 dark:text-amber-500 font-bold">★ {sup.rating}</td>
                    <td className="p-3.5 pr-6">
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                        {sup.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Purchase Requisitions */}
        {activeSubTab === "pr" && (() => {
          const pendingPRs = state.requisitions.filter((r) => r.status === DocStatus.PENDING);
          const allPendingSelected = pendingPRs.length > 0 && pendingPRs.every((r) => selectedPrIds.includes(r.id));

          const handleToggleSelectAllPRs = () => {
            if (allPendingSelected) {
              setSelectedPrIds([]);
            } else {
              setSelectedPrIds(pendingPRs.map((r) => r.id));
            }
          };

          const handleToggleSelectPR = (id: string) => {
            setSelectedPrIds((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
          };

          return (
            <div className="overflow-x-auto">
              {/* PR Quick Sort Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                    {isBangla ? "ক্রয় রিকুইজিশন রেজিস্ট্রি (PR)" : "Purchase Requisitions Register"} ({state.requisitions.length})
                  </span>
                  {pendingPRs.length > 0 && (
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                      {pendingPRs.length} {isBangla ? "পেন্ডিং অনুমোদন" : "Pending Approval"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    {isBangla ? "কুইক সর্ট:" : "Quick Sort:"}
                  </span>
                  <select
                    value={prSort}
                    onChange={(e) => setPrSort(e.target.value as any)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="date_desc">{isBangla ? "তারিখ (নতুন প্রথম)" : "Requested Date (Newest)"}</option>
                    <option value="date_asc">{isBangla ? "তারিখ (পুরাতন প্রথম)" : "Requested Date (Oldest)"}</option>
                    <option value="cost_desc">{isBangla ? "প্রাক্কলিত ব্যয় (সর্বোচ্চ)" : "Est. Cost (Highest)"}</option>
                    <option value="cost_asc">{isBangla ? "প্রাক্কলিত ব্যয় (সর্বনিম্ন)" : "Est. Cost (Lowest)"}</option>
                    <option value="number_asc">{isBangla ? "পিআর কোড" : "PR Number (A-Z)"}</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Bar for Selected PRs */}
              {selectedPrIds.length > 0 && (
                <div className="p-3 mx-3 my-2 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl border border-indigo-500/30 shadow-lg flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/40 rounded-lg border border-indigo-400/30">
                      <CheckCircle2 className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono text-white flex items-center gap-2">
                        <span>{selectedPrIds.length} {isBangla ? "টি রিকুইজিশন নির্বাচিত" : "Purchase Requisition(s) Selected"}</span>
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/20">
                          CFO Bulk Approval Mode
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                        {isBangla ? "মোট প্রাক্কলিত মান:" : "Total Est. Value:"} <strong className="text-emerald-400 font-bold">৳ {state.requisitions
                          .filter((r) => selectedPrIds.includes(r.id))
                          .reduce((sum, r) => sum + (r.totalEstimatedValue || 0), 0)
                          .toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPrIds([])}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      {isBangla ? "নির্বাচন বাতিল" : "Clear Selection"}
                    </button>

                    <button
                      onClick={() => {
                        const selectedPRs = state.requisitions.filter((r) => selectedPrIds.includes(r.id));
                        const totalVal = selectedPRs.reduce((sum, r) => sum + (r.totalEstimatedValue || 0), 0);
                        openSignatureModal(
                          "bulk_pr",
                          "bulk-prs",
                          `${selectedPrIds.length} Requisitions (Bulk Authorization)`,
                          null,
                          totalVal
                        );
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PenTool className="h-4 w-4" />
                      <span>
                        {isBangla ? "বাল্ক ই-স্বাক্ষর ও অনুমোদন" : "Bulk E-Sign & Approve"} ({selectedPrIds.length})
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={handleToggleSelectAllPRs}
                        disabled={pendingPRs.length === 0}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isBangla ? "সব পেন্ডিং রিকুইজিশন নির্বাচন করুন" : "Select All Pending Requisitions"}
                      />
                    </th>
                    <th className="p-3.5">{isBangla ? "রিকুইজিশন কোড" : "PR Number"}</th>
                    <th className="p-3.5">{isBangla ? "বিভাগ" : "Department"}</th>
                    <th className="p-3.5">{isBangla ? "আবেদনকারী" : "Requested By"}</th>
                    <th className="p-3.5">{isBangla ? "রিকুয়েস্ট ডেট" : "Date"}</th>
                    <th className="p-3.5">{isBangla ? "সামগ্রী" : "Requested Items"}</th>
                    <th className="p-3.5">{isBangla ? "প্রাক্কলিত ব্যয়" : "Est. Cost"}</th>
                    <th className="p-3.5">{isBangla ? "অনুমোদন স্ট্যাটাস" : "Approval Status"}</th>
                    <th className="p-3.5 pr-6">{isBangla ? "অ্যাকশন" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {[...state.requisitions]
                    .sort((a, b) => {
                      if (prSort === "number_asc") return a.prNumber.localeCompare(b.prNumber);
                      if (prSort === "date_desc") return b.requestedDate.localeCompare(a.requestedDate);
                      if (prSort === "date_asc") return a.requestedDate.localeCompare(b.requestedDate);
                      if (prSort === "cost_desc") return (b.totalEstimatedValue || 0) - (a.totalEstimatedValue || 0);
                      if (prSort === "cost_asc") return (a.totalEstimatedValue || 0) - (b.totalEstimatedValue || 0);
                      return 0;
                    })
                    .map((pr) => {
                      const isSelected = selectedPrIds.includes(pr.id);
                      const isPending = pr.status === DocStatus.PENDING;

                      return (
                        <tr
                          key={pr.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-indigo-50/80 dark:bg-indigo-950/40"
                              : "hover:bg-white/40 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="p-3.5 pl-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectPR(pr.id)}
                              disabled={!isPending}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{pr.prNumber}</td>
                          <td className="p-3.5 font-bold text-slate-700 dark:text-slate-200">{pr.department}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">{pr.requestedBy}</td>
                          <td className="p-3.5 font-mono text-slate-400">{pr.requestedDate}</td>
                          <td className="p-3.5 font-medium text-slate-800 dark:text-slate-100">
                            {pr.items.map((item) => (
                              <div key={item.itemCode}>
                                {item.itemName} ({item.qty.toLocaleString()} {item.uom})
                              </div>
                            ))}
                          </td>
                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 font-mono">৳ {pr.totalEstimatedValue.toLocaleString()}</td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full w-fit ${
                                pr.status === DocStatus.APPROVED
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              }`}>
                                {pr.status}
                              </span>
                              {pr.signatureUrl && (
                                <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                                  <PenTool className="h-3 w-3" /> Signed: {pr.signedBy || "Manager"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 pr-6">
                            <div className="flex items-center gap-2">
                              {pr.status === DocStatus.PENDING && (
                                <button
                                  onClick={() => openSignatureModal("pr", pr.id, `Requisition ${pr.prNumber}`, null, pr.totalEstimatedValue)}
                                  className="glass-button-amber text-[11px] px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"
                                  title="Sign & Approve Requisition"
                                >
                                  <PenTool className="h-3.5 w-3.5" />
                                  <span>{isBangla ? "ই-স্বাক্ষর ও অনুমোদন" : "E-Sign & Approve"}</span>
                                </button>
                              )}
                              {pr.status === DocStatus.APPROVED && (
                                <button
                                  onClick={() => {
                                    onRaiseRFQ(pr.prNumber);
                                    alert(isBangla ? "আরএফকিউ দরপত্র প্রস্তুত করা হয়েছে!" : "RFQ generated from approved Requisition!");
                                  }}
                                  className="glass-button-indigo text-[11px] px-2.5 py-1.5 cursor-pointer"
                                >
                                  {isBangla ? "আরএফকিউ তৈরি" : "Generate RFQ"}
                                </button>
                              )}

                        {/* Version History Trigger */}
                        <button
                          onClick={() => {
                            setVerDocDetails({
                              id: pr.id,
                              number: pr.prNumber,
                              type: "PR",
                              versions: pr.versions || [
                                {
                                  versionNumber: 1,
                                  modifiedAt: pr.requestedDate + " 10:00 AM",
                                  modifiedBy: pr.requestedBy,
                                  changeSummary: "Initial Purchase Requisition creation",
                                  snapshot: pr
                                }
                              ]
                            });
                            setIsVerModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono border border-slate-200/50 dark:border-white/10"
                          title={isBangla ? "সংস্করণ ইতিহাস ও সংশোধন আডিট" : "Version History & Audit"}
                        >
                          <History className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="hidden sm:inline">v{pr.versions ? pr.versions.length : 1}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        );
      })()}

        {/* Tab 3: RFQs & Bids Comparison Matrix */}
        {activeSubTab === "rfq" && (
          <div className="p-4 space-y-6">
            {state.rfqs.map((rfq) => (
              <div key={rfq.id} className="border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 bg-white/30 dark:bg-white/[0.01]">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4">
                  <div>
                    <span className="glass-badge">RFQ</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                      {rfq.rfqNumber} <span className="text-xs text-slate-400 font-normal">({isBangla ? "অনুকূলে" : "Linked to"} {rfq.prNumber})</span>
                    </h4>
                  </div>
                  <span className="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-400">
                    {isBangla ? "দরপত্র তুলনা মেত্রিক্স" : "Supplier Quotation Evaluation Matrix"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bids received list */}
                  <div className="overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-xl bg-white/30 dark:bg-white/[0.01] backdrop-blur-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/30 dark:bg-slate-950/40 font-mono text-slate-500">
                        <tr>
                          <th className="p-2.5 pl-4">{isBangla ? "সরবরাহকারী" : "Supplier"}</th>
                          <th className="p-2.5">{isBangla ? "দর (৳/কেজি)" : "Rate (৳/KG)"}</th>
                          <th className="p-2.5">{isBangla ? "সীমা" : "Delivery"}</th>
                          <th className="p-2.5">{isBangla ? "স্কোর" : "Rank Score"}</th>
                          <th className="p-2.5 pr-4 text-right">{isBangla ? "কার্যাদেশ দিন" : "Award"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                        {rfq.comparisonMatrix.map((matrix) => (
                          <tr key={matrix.supplierCode} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-2.5 pl-4 font-bold text-slate-800 dark:text-slate-100">{matrix.supplierName}</td>
                            <td className="p-2.5 font-bold font-mono text-slate-700 dark:text-slate-300">৳ {matrix.pricePerUnit}</td>
                            <td className="p-2.5 text-slate-500">{matrix.leadTimeDays} Days</td>
                            <td className="p-2.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{matrix.score} / 100</td>
                            <td className="p-2.5 pr-4 text-right">
                              <button
                                onClick={() => {
                                  onAwardSupplier(rfq.rfqNumber, matrix.supplierCode);
                                  alert(isBangla ? "পারচেজ অর্ডার তৈরি সম্পন্ন হয়েছে!" : "Purchase Order successfully awarded to " + matrix.supplierName);
                                }}
                                className="glass-button-indigo text-[11px] px-2.5 py-1 rounded-lg"
                              >
                                {isBangla ? "অর্ডার দিন" : "Award PO"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Procurement gate explanations */}
                  <div className="p-4 bg-indigo-950/80 dark:bg-slate-950/40 text-slate-300 rounded-2xl border border-indigo-500/15 dark:border-white/10 flex flex-col justify-between shadow-lg">
                    <div>
                      <h5 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold mb-2">
                        {isBangla ? "ভেন্ডর নির্বাচন নীতি" : "SCM DECISION MATRIX"}
                      </h5>
                      <p className="text-xs leading-normal text-slate-300">
                        {isBangla
                          ? "সিস্টেম স্বয়ংক্রিয়ভাবে সরবরাহকারী রেটিং, মূল্য অফার, অর্থ প্রদানের শর্তাদি এবং পূর্ববর্তী ডেলিভারি নির্ভুলতার ওপর ভিত্তি করে রাঙ্ক স্কোর প্রস্তুত করে।"
                          : "Rank score calculates automatically. Weights: Price Offer (50%), Credit Days (20%), Previous Lead Time Accuracy (20%), and QA Supplier Scorecard Rating (10%)."}
                      </p>
                    </div>
                    <div className="mt-4 p-2 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-indigo-400">Decision Gate 2:</span> Lowest qualified quote receives standard award prioritization unless factory lead times are highly urgent.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Purchase Orders */}
        {activeSubTab === "po" && (
          <div className="overflow-x-auto">
            {/* PO Quick Sort Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                {isBangla ? "পারচেজ অর্ডার রেজিস্ট্রি (PO)" : "Purchase Orders Register"} ({state.purchaseOrders.length})
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {isBangla ? "কুইক সর্ট:" : "Quick Sort:"}
                </span>
                <select
                  value={poSort}
                  onChange={(e) => setPoSort(e.target.value as any)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="date_desc">{isBangla ? "অর্ডার তারিখ (নতুন প্রথম)" : "Order Date (Newest)"}</option>
                  <option value="date_asc">{isBangla ? "অর্ডার তারিখ (পুরাতন প্রথম)" : "Order Date (Oldest)"}</option>
                  <option value="cost_desc">{isBangla ? "মোট ব্যয় (সর্বোচ্চ)" : "Total Amount (Highest)"}</option>
                  <option value="cost_asc">{isBangla ? "মোট ব্যয় (সর্বনিম্ন)" : "Total Amount (Lowest)"}</option>
                  <option value="supplier_asc">{isBangla ? "সরবরাহকারী নাম" : "Supplier Name (A-Z)"}</option>
                  <option value="number_asc">{isBangla ? "পিও নম্বর" : "PO Number (A-Z)"}</option>
                </select>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3.5 pl-6">{isBangla ? "পারচেজ অর্ডার নম্বর" : "PO Number"}</th>
                  <th className="p-3.5">{isBangla ? "সরবরাহকারী" : "Awarded Supplier"}</th>
                  <th className="p-3.5">{isBangla ? "কার্যাদেশ তারিখ" : "Order Date"}</th>
                  <th className="p-3.5">{isBangla ? "ক্রয় আইটেম" : "Items Ordered"}</th>
                  <th className="p-3.5">{isBangla ? "মোট মূল্য" : "Total Cost"}</th>
                  <th className="p-3.5">{isBangla ? "অনুমোদন স্ট্যাটাস" : "Authorization"}</th>
                  <th className="p-3.5 pr-6">{isBangla ? "ডেলিভারি স্ট্যাটাস" : "Fulfillment"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {[...state.purchaseOrders]
                  .sort((a, b) => {
                    if (poSort === "number_asc") return a.poNumber.localeCompare(b.poNumber);
                    if (poSort === "date_desc") return b.orderDate.localeCompare(a.orderDate);
                    if (poSort === "date_asc") return a.orderDate.localeCompare(b.orderDate);
                    if (poSort === "cost_desc") return (b.totalAmount || 0) - (a.totalAmount || 0);
                    if (poSort === "cost_asc") return (a.totalAmount || 0) - (b.totalAmount || 0);
                    if (poSort === "supplier_asc") return a.supplierName.localeCompare(b.supplierName);
                    return 0;
                  })
                  .map((po) => (
                  <tr key={po.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{po.poNumber}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{po.supplierName}</td>
                    <td className="p-3.5 font-mono text-slate-400">{po.orderDate}</td>
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-100">
                      {po.items.map((item) => (
                        <div key={item.itemCode}>
                          {item.itemName} ({item.qty.toLocaleString()} {item.uom})
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 font-mono">৳ {po.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full w-fit ${
                          po.approvalStatus === DocStatus.APPROVED
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {po.approvalStatus}
                        </span>
                        {po.signatureUrl && (
                          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                            <PenTool className="h-3 w-3" /> Signed: {po.signedBy || "Manager"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 pr-6">
                      <div className="flex items-center gap-2">
                        {po.approvalStatus === DocStatus.PENDING && (
                          <button
                            onClick={() => openSignatureModal("po", po.id, `Purchase Order ${po.poNumber}`, null, po.totalAmount)}
                            className="glass-button-amber text-[11px] px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"
                            title="Sign & Approve Purchase Order"
                          >
                            <PenTool className="h-3.5 w-3.5" />
                            <span>{isBangla ? "ই-স্বাক্ষর ও অনুমোদন" : "E-Sign & Approve"}</span>
                          </button>
                        )}
                        {po.approvalStatus === DocStatus.APPROVED && po.deliveryStatus === "Pending" && (
                          <button
                            onClick={() => {
                              openSignatureModal(
                                "grn",
                                po.poNumber,
                                `Goods Receipt Note (${po.poNumber})`,
                                po.items.map(i => ({ itemCode: i.itemCode, itemName: i.itemName, qty: i.qty, uom: i.uom }))
                              );
                            }}
                            className="glass-button-green text-[11px] px-3.5 py-1.5 flex items-center gap-1 cursor-pointer"
                          >
                            <PenTool className="h-3.5 w-3.5" />
                            <span>{isBangla ? "পণ্য গ্রহণ (ই-স্বাক্ষর)" : "Post GRN (Sign)"}</span>
                          </button>
                        )}
                        {po.approvalStatus === DocStatus.APPROVED && po.deliveryStatus !== "Pending" && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {po.deliveryStatus}
                          </span>
                        )}

                        {/* Version History Trigger */}
                        <button
                          onClick={() => {
                            setVerDocDetails({
                              id: po.id,
                              number: po.poNumber,
                              type: "PO",
                              versions: po.versions || [
                                {
                                  versionNumber: 1,
                                  modifiedAt: po.orderDate + " 11:30 AM",
                                  modifiedBy: "SCM Lead",
                                  changeSummary: "Initial PO issue to supplier " + po.supplierName,
                                  snapshot: po
                                }
                              ]
                            });
                            setIsVerModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono border border-slate-200/50 dark:border-white/10"
                          title={isBangla ? "সংস্করণ ইতিহাস ও সংশোধন আডিট" : "Version History & Audit"}
                        >
                          <History className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="hidden sm:inline">v{po.versions ? po.versions.length : 1}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Goods Receipts */}
        {activeSubTab === "grn" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/10 flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                  {isBangla ? "পণ্য প্রাপ্তি রশিদ ও কোড স্ক্যানার" : "Goods Receipt Notes (GRN) Registry"}
                </h4>
                <p className="text-[11px] text-slate-500">Verify warehouse GRN inflows, export PDF documents, and scan item barcodes.</p>
              </div>
              <button
                onClick={() => setIsBarcodeModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>{isBangla ? "বারকোড স্ক্যানার" : "Scan Barcode / QR"}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3.5 pl-6">{isBangla ? "জিআরএন রশিদ নম্বর" : "GRN Number"}</th>
                    <th className="p-3.5">{isBangla ? "কার্যাদেশ নম্বর" : "PO Ref"}</th>
                    <th className="p-3.5">{isBangla ? "সরবরাহকারী" : "Supplier"}</th>
                    <th className="p-3.5">{isBangla ? "প্রাপ্তির তারিখ" : "Received Date"}</th>
                    <th className="p-3.5">{isBangla ? "পণ্য ও পরিমাণ" : "Items Received"}</th>
                    <th className="p-3.5">{isBangla ? "মান নিয়ন্ত্রণ কিউসি" : "Quality Check (QA)"}</th>
                    <th className="p-3.5 pr-6 text-right">{isBangla ? "অ্যাকশন & পিডিএফ" : "Actions / PDF"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {state.goodsReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        {isBangla ? "কোনো পণ্য প্রাপ্তি রসিদ এই ডেমো ট্র্যাকে তৈরি হয়নি।" : "No Goods Receipt records posted in the current active simulation tracker yet."}
                      </td>
                    </tr>
                  ) : (
                    state.goodsReceipts.map((grn) => (
                      <tr key={grn.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{grn.grnNumber}</span>
                            {grn.scannedInvoiceUrl ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-755 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold" title="Invoice Linked">
                                📎 LINKED
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setScanningGRN(grn.id);
                                  startCamera();
                                }}
                                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-200/50 dark:border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Camera className="h-3 w-3" />
                                <span>{isBangla ? "স্ক্যান" : "Scan Invoice"}</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{grn.poNumber}</td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{grn.supplierName}</td>
                        <td className="p-3.5 font-mono text-slate-400">{grn.receivedDate}</td>
                        <td className="p-3.5 font-medium text-slate-800 dark:text-slate-100">
                          {grn.items.map((item) => (
                             <div key={item.itemCode}>
                               {item.itemName} ({item.receivedQty.toLocaleString()} / {item.orderedQty.toLocaleString()} {item.uom})
                             </div>
                          ))}
                        </td>
                        <td className="p-3.5">
                          {grn.items[0].qcPassed ? (
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> QC PASSED
                            </span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <X className="h-3 w-3" /> QC FAILED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {grn.signatureUrl ? (
                              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/30 px-2 py-1 rounded font-mono font-bold flex items-center gap-1" title={`Signed by ${grn.signedBy}`}>
                                <PenTool className="h-3 w-3 text-indigo-500" />
                                <span>SIGNED ({grn.signedBy || "Manager"})</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => openSignatureModal("grn", grn.poNumber, `Goods Receipt Note (${grn.grnNumber})`, grn.items)}
                                className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-300 font-bold px-2 py-1 rounded border border-amber-200/50 dark:border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                title="Attach E-Signature"
                              >
                                <PenTool className="h-3 w-3" />
                                <span>{isBangla ? "ই-স্বাক্ষর করুন" : "Add Signature"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => downloadGRNPDF(grn, isBangla)}
                              className="text-[11px] bg-slate-100 hover:bg-indigo-50 text-indigo-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-indigo-400 font-bold px-2.5 py-1 rounded border border-slate-200 dark:border-white/10 transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Download PDF GRN Document"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>{isBangla ? "পিডিএফ" : "Download PDF"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CAMERA SCANNING MODAL */}
      {scanningGRN && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0b101f] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                  {isBangla ? "স্মার্ট ইনভয়েস স্ক্যানার ও ওসিআর" : "Paper Invoice Scanner & OCR"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Linking physical invoices directly to GRN: {state.goodsReceipts.find(g => g.id === scanningGRN)?.grnNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setScanningGRN(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Camera Preview Box */}
              {!capturedImage && !cameraError && (
                <div className="relative aspect-video rounded-xl bg-black border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center">
                  <video id="scanner-video" className="w-full h-full object-cover" playsInline muted />
                  
                  {/* Laser Scanning Animation Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                    <div className="border-t-2 border-l-2 border-indigo-500 h-6 w-6 m-4"></div>
                    <div className="border-b-2 border-r-2 border-indigo-500 h-6 w-6 m-4 self-end"></div>
                  </div>
                  
                  {/* Laser Beam */}
                  <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-bounce" style={{ animationDuration: "2.5s" }}></div>

                  {/* Controls overlay */}
                  <div className="absolute bottom-4 flex gap-2">
                    <button
                      onClick={capturePhoto}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{isBangla ? "ক্যাপচার করুন" : "Capture Invoice"}</span>
                    </button>
                    <button
                      onClick={simulateScan}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border border-white/10"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>{isBangla ? "সিমুলেট স্ক্যান" : "Simulate File Scan"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Error / Fallback View */}
              {cameraError && !capturedImage && (
                <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl text-center space-y-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {cameraError}
                  </p>
                  <button
                    onClick={simulateScan}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md mx-auto cursor-pointer"
                  >
                    {isBangla ? "ডকুমেন্ট ওসিআর ডেমো চালান" : "Run Document OCR Simulation"}
                  </button>
                </div>
              )}

              {/* OCR Processing Loader */}
              {isOcrProcessing && (
                <div className="p-8 text-center space-y-3">
                  <div className="inline-block relative">
                    <div className="h-10 w-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono tracking-widest animate-pulse">
                    {isBangla ? "ওসিআর ইঞ্জিন বিশ্লেষণ করছে..." : "EXTRACTING INVOICE TEXT (OCR)..."}
                  </p>
                </div>
              )}

              {/* Scanned Image & OCR Result */}
              {capturedImage && !isOcrProcessing && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-black flex items-center justify-center">
                    <img src={capturedImage} alt="Captured Invoice" className="w-full h-full object-cover opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white text-[10px] font-mono tracking-wide bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
                      SNAPSHOT CAPTURED
                    </div>
                  </div>

                  {ocrResult && (
                    <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {isBangla ? "ভেরিফাইড ও ম্যাচড" : "OCR VERIFICATION SUCCESSFUL"}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Score: 99.8%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400">Invoice Ref:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{ocrResult.invoiceNo}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Scanned Supplier:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{ocrResult.supplier}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Extracted Item:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{ocrResult.item}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Extracted Qty:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{ocrResult.qty}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            if (onLinkInvoiceToGRN) {
                              onLinkInvoiceToGRN(scanningGRN, capturedImage);
                            }
                            setScanningGRN(null);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-4 w-4" />
                          <span>{isBangla ? "লিংক ও সেভ করুন" : "Link Scanned Invoice to GRN"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScanSuccess={(code) => {
          console.log("Scanned code in Procurement:", code);
        }}
        title="Procurement Item Barcode & QR Scanner"
        isBangla={isBangla}
      />

      {/* E-SIGNATURE MODAL FOR DOCUMENT APPROVALS */}
      <ESignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onConfirmSignature={handleSignatureConfirm}
        documentTitle={sigDocTitle}
        signatoryRole="Manager / Approver"
        isBangla={isBangla}
      />

      {/* VERSION HISTORY MODAL */}
      {verDocDetails && (
        <DocVersionHistoryModal
          isOpen={isVerModalOpen}
          onClose={() => setIsVerModalOpen(false)}
          documentNumber={verDocDetails.number}
          documentType={verDocDetails.type}
          versions={verDocDetails.versions}
          onRevertVersion={(verNum) => {
            if (onRevertVersion) {
              onRevertVersion(verDocDetails.type, verDocDetails.id, verNum);
            }
            setIsVerModalOpen(false);
          }}
          isBangla={isBangla}
        />
      )}

      {/* WEBAUTHN BIOMETRIC AUTH MODAL */}
      {bioTargetDoc && (
        <BiometricAuthModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          onSuccess={handleBiometricSuccess}
          title={isBangla ? `বায়োমেট্রিক সনিশ্চিতকরণ: ${bioTargetDoc.title}` : `High-Value Authorization (${bioTargetDoc.title})`}
          description={isBangla ? "৫,০০,০০০ টাকার বেশি লেনদেনের জন্য সিকিউর ফিঙ্গারপ্রিন্ট/ফেস আইডি স্ক্যান আবশ্যক।" : "Biometric WebAuthn FIDO2 verification required for high-value transactions (> ৳500,000)."}
          amount={bioTargetDoc.amount}
          isBangla={isBangla}
        />
      )}
    </div>
  );
}
