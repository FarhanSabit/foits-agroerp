import React, { useState } from "react";
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
  Search,
  Check,
  X,
  Camera,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
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
  onPostGRN: (poNumber: string, receivedItems: any[]) => void;
  onLinkInvoiceToGRN?: (grnId: string, invoiceUrl: string) => void;
  isBangla: boolean;
}

export default function ProcurementModule({
  state,
  onRaisePR,
  onRaiseRFQ,
  onAwardSupplier,
  onPostGRN,
  onLinkInvoiceToGRN,
  isBangla
}: ProcurementModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"suppliers" | "pr" | "rfq" | "po" | "grn">("suppliers");
  const [searchTerm, setSearchTerm] = useState("");
  const [newPrQty, setNewPRQty] = useState(20000);
  const [newPrItem, setNewPRItem] = useState("RM001");

  // Camera Scanning States
  const [scanningGRN, setScanningGRN] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{isBangla ? "নতুন পিআর:" : "Item:"}</span>
            <select
              value={newPrItem}
              onChange={(e) => setNewPRItem(e.target.value)}
              className="glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none"
            >
              {state.inventory.filter(i => i.category === "Raw Material").map(i => (
                <option key={i.code} value={i.code}>{i.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={newPrQty}
              onChange={(e) => setNewPRQty(Number(e.target.value))}
              className="glass-input rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 w-24 outline-none"
              placeholder="Quantity"
            />
            <button
              onClick={() => {
                onRaisePR(newPrItem, newPrQty);
                alert(isBangla ? "ক্রয় রিকুইজিশন তৈরি সম্পন্ন হয়েছে!" : "Purchase Requisition created successfully!");
              }}
              className="glass-button-indigo text-xs px-3.5 py-1.5 shrink-0 flex items-center gap-1"
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
        {activeSubTab === "pr" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3.5 pl-6">{isBangla ? "রিকুইজিশন কোড" : "PR Number"}</th>
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
                {state.requisitions.map((pr) => (
                  <tr key={pr.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{pr.prNumber}</td>
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
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        pr.status === DocStatus.APPROVED
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6">
                      {pr.status === DocStatus.APPROVED && (
                        <button
                          onClick={() => {
                            onRaiseRFQ(pr.prNumber);
                            alert(isBangla ? "আরএফকিউ দরপত্র প্রস্তুত করা হয়েছে!" : "RFQ generated from approved Requisition!");
                          }}
                          className="glass-button-indigo text-[11px] px-2.5 py-1.5"
                        >
                          {isBangla ? "আরএফকিউ তৈরি" : "Generate RFQ"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                {state.purchaseOrders.map((po) => (
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
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        po.approvalStatus === DocStatus.APPROVED
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {po.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6">
                      {po.approvalStatus === DocStatus.APPROVED && po.deliveryStatus === "Pending" ? (
                        <button
                          onClick={() => {
                            onPostGRN(po.poNumber, po.items.map(i => ({ itemCode: i.itemCode, itemName: i.itemName, qty: i.qty, uom: i.uom })));
                            alert(isBangla ? "পণ্য প্রাপ্তি জিআরএন সফলভাবে সম্পন্ন হয়েছে!" : "Goods Receipt Note (GRN) successfully posted into inventory.");
                          }}
                          className="glass-button-green text-[11px] px-3.5 py-1.5"
                        >
                          {isBangla ? "পণ্য গ্রহণ (GRN)" : "Post GRN"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {po.deliveryStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Goods Receipts */}
        {activeSubTab === "grn" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3.5 pl-6">{isBangla ? "জিআরএন রশিদ নম্বর" : "GRN Number"}</th>
                  <th className="p-3.5">{isBangla ? "কার্যাদেশ নম্বর" : "PO Ref"}</th>
                  <th className="p-3.5">{isBangla ? "সরবরাহকারী" : "Supplier"}</th>
                  <th className="p-3.5">{isBangla ? "প্রাপ্তির তারিখ" : "Received Date"}</th>
                  <th className="p-3.5">{isBangla ? "পণ্য ও পরিমাণ" : "Items Received"}</th>
                  <th className="p-3.5">{isBangla ? "মান নিয়ন্ত্রণ কিউসি" : "Quality Check (QA)"}</th>
                  <th className="p-3.5 pr-6 text-right">{isBangla ? "মজুদ এন্ট্রি" : "Inventory Ledger"}</th>
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
                      <td className="p-3.5 pr-6 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                        {grn.postedToInventory ? "✔ POSTED" : "PENDING"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    </div>
  );
}
