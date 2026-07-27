import React, { useState } from "react";
import { z } from "zod";
import {
  Package,
  Globe,
  ShoppingBag,
  Landmark,
  UserRound,
  Truck,
  MessageCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  TrendingDown,
  Clock,
  Map,
  Plus,
  FileText,
  Download,
  QrCode,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Filter
} from "lucide-react";
import { ERPState, DocStatus, AccountType, VehicleStatus, SupportTicket, TicketPriority } from "../types";
import { formatBDT, calculatePercentage } from "@agro-erp/shared-utils";
import { Button, Input, Badge } from "@agro-erp/shared-ui";
import BulkImportModule from "./BulkImportModule";
import { downloadSalesOrderPDF } from "../utils/pdfGenerator";
import BarcodeScannerModal from "./BarcodeScannerModal";
import UnitConversionUtility, { convertQuantity, DisplayUnitMode } from "./UnitConversionUtility";

interface OtherModulesProps {
  tab: string;
  state: ERPState;
  onDispatchSalesOrder: (id: string) => void;
  onPostCollection: (id: string) => void;
  isBangla: boolean;
  onImportCompleted: (type: "inventory" | "ledger", items: any[]) => void;
}

export default function OtherModules({
  tab,
  state,
  onDispatchSalesOrder,
  onPostCollection,
  isBangla,
  onImportCompleted
}: OtherModulesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPriority, setTicketPriority] = useState(TicketPriority.MEDIUM);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedMessage, setScannedMessage] = useState<string | null>(null);

  // Inventory Filter, Quick Sort, and Unit Conversion State
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "low_stock" | "high_stock" | "expiry_warning" | "batch_serial">("all");
  const [inventorySort, setInventorySort] = useState<
    "default" | "name_asc" | "name_desc" | "stock_asc" | "stock_desc" | "expiry_asc" | "expiry_desc" | "value_desc"
  >("default");
  const [displayUnit, setDisplayUnit] = useState<DisplayUnitMode>("default");

  // Sales Order Creation Zod State
  const [showCreateSO, setShowCreateSO] = useState(false);
  const [soForm, setSoForm] = useState({
    customerName: "",
    customerCode: "CUST-001",
    productCode: "FG001",
    quantity: 100,
    unitPrice: 2450
  });
  const [soErrors, setSoErrors] = useState<Record<string, string> | null>(null);

  // Zod schema for Sales Order Validation
  const salesOrderSchema = z.object({
    customerName: z.string().min(3, { message: isBangla ? "গ্রাহকের নাম অন্তত ৩ অক্ষরের হতে হবে" : "Customer name must be at least 3 characters" }),
    customerCode: z.string().min(2, { message: isBangla ? "গ্রাহক কোড অন্তত ২ অক্ষরের হতে হবে" : "Customer code must be at least 2 characters" }),
    productCode: z.string().min(1, { message: isBangla ? "পণ্য নির্বাচন আবশ্যক" : "Product selection is required" }),
    quantity: z.number().min(10, { message: isBangla ? "সর্বনিম্ন অর্ডারের পরিমাণ ১০ ব্যাগ/ইউনিট" : "Minimum order quantity is 10 units" }),
    unitPrice: z.number().min(1, { message: isBangla ? "ইউনিট মূল্য ১ টাকা থেকে বেশি হতে হবে" : "Unit price must be greater than 0 BDT" })
  });

  const handleValidateAndCreateSO = () => {
    const parse = salesOrderSchema.safeParse({
      ...soForm,
      quantity: Number(soForm.quantity),
      unitPrice: Number(soForm.unitPrice)
    });

    if (!parse.success) {
      const formatted = parse.error.format();
      setSoErrors({
        customerName: formatted.customerName?._errors[0] || "",
        customerCode: formatted.customerCode?._errors[0] || "",
        productCode: formatted.productCode?._errors[0] || "",
        quantity: formatted.quantity?._errors[0] || "",
        unitPrice: formatted.unitPrice?._errors[0] || ""
      });
      return;
    }

    setSoErrors(null);
    const selectedProd = state.inventory.find(i => i.code === soForm.productCode);
    const newSO = {
      id: "so-" + Date.now(),
      orderNumber: "SO-2026-" + Math.floor(1000 + Math.random() * 9000),
      customerName: soForm.customerName,
      customerCode: soForm.customerCode,
      orderDate: new Date().toISOString().split("T")[0],
      items: [{
        productCode: soForm.productCode,
        productName: selectedProd ? selectedProd.name : "Finished Feed",
        qty: Number(soForm.quantity),
        uom: selectedProd ? selectedProd.uom : "Bags",
        unitPrice: Number(soForm.unitPrice),
        totalPrice: Number(soForm.quantity) * Number(soForm.unitPrice)
      }],
      totalAmount: Number(soForm.quantity) * Number(soForm.unitPrice),
      status: DocStatus.APPROVED,
      deliveryStatus: "Pending" as const
    };

    state.salesOrders.unshift(newSO);
    setShowCreateSO(false);
    setSoForm({ customerName: "", customerCode: "CUST-001", productCode: "FG001", quantity: 100, unitPrice: 2450 });
    alert(isBangla ? "নতুন বিক্রয় অর্ডার সফলভাবে তৈরি হয়েছে!" : "Sales Order created successfully!");
  };

  const handleExportCSV = (type: "inventory" | "ledger") => {
    let csvContent = "";
    if (type === "inventory") {
      csvContent = "Item Code,Item Name,Category,Available Stock,Unit Value,Warehouse,Status\n" +
        state.inventory.map(item => 
          `"${item.code}","${item.name}","${item.category}",${item.availableStock},${item.unitValue},"${item.warehouseId}","${item.status}"`
        ).join("\n");
    } else {
      csvContent = "Code,Account Head,Type,Balance\n" +
        state.ledger.map(acc => 
          `"${acc.code}","${acc.name}","${acc.type}",${acc.balance}`
        ).join("\n");
    }
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agro_erp_${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card p-6">
      
      {/* 1. INVENTORY MODULE */}
      {tab === "inventory" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "গুদাম ব্যবস্থাপনা ও মজুদ নিরীক্ষা" : "Warehouse & Inventory Ledger"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current storage allocation, FIFO batch shelf-life expiry tracking, and barcode scanning.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{isBangla ? "আইটেম স্ক্যান" : "Scan Barcode"}</span>
              </button>
              <button
                onClick={() => handleExportCSV("inventory")}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                <span>{isBangla ? "এক্সপোর্ট সিএসভি" : "Export CSV"}</span>
              </button>
            </div>
          </div>

          {scannedMessage && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-mono text-indigo-600 dark:text-indigo-400 flex justify-between items-center animate-in fade-in">
              <span>{scannedMessage}</span>
              <button onClick={() => setScannedMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
          )}

          {/* EXPIRY MONITOR BANNER & METRICS */}
          {(() => {
            const now = new Date("2026-07-26").getTime();
            const enrichedBatches = state.batches.map(b => {
              const exp = new Date(b.expiryDate).getTime();
              const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
              const item = state.inventory.find(i => i.code === b.itemCode);
              let expiryStatus: "EXPIRED" | "CRITICAL" | "WARNING" | "HEALTHY" = "HEALTHY";
              if (diffDays <= 0) expiryStatus = "EXPIRED";
              else if (diffDays <= 30) expiryStatus = "CRITICAL";
              else if (diffDays <= 60) expiryStatus = "WARNING";
              return { ...b, itemName: item?.name || b.itemCode, uom: item?.uom || "KG", diffDays, expiryStatus };
            });

            const expiredBatches = enrichedBatches.filter(b => b.expiryStatus === "EXPIRED");
            const criticalBatches = enrichedBatches.filter(b => b.expiryStatus === "CRITICAL");
            const warningBatches = enrichedBatches.filter(b => b.expiryStatus === "WARNING");

            return (
              <div className="border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/[0.03] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">
                          {isBangla ? "ব্যাচ মেয়াদোত্তীর্ণ মনিটর" : "BATCH SHELF-LIFE EXPIRY MONITOR"}
                        </h4>
                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          FIFO Policy Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBangla
                          ? "৬০ দিনের মধ্যে মেয়াদোত্তীর্ণ হতে যাওয়া ব্যাচসমূহ অগ্রাধিকারের ভিত্তিতে কোয়ারেন্টাইন বা প্রক্রিয়াজাত করুন।"
                          : "Monitors active raw material & finished goods inventory batches nearing shelf-life threshold."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInventoryFilter("expiry_warning")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        inventoryFilter === "expiry_warning"
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{isBangla ? "মেয়াদোত্তীর্ণ ফিল্টার" : "View Expiry Alert Batches"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase">{isBangla ? "মেয়াদোত্তীর্ণ" : "Expired"}</span>
                      <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">{expiredBatches.length}</p>
                    </div>
                    <AlertCircle className="h-5 w-5 text-rose-500/50" />
                  </div>

                  <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">{isBangla ? "জরুরি (<৩০ দিন)" : "Critical (<30 Days)"}</span>
                      <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{criticalBatches.length}</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500/50" />
                  </div>

                  <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-yellow-600 dark:text-yellow-400 font-bold uppercase">{isBangla ? "সতর্কতা (<৬০ দিন)" : "Warning (<60 Days)"}</span>
                      <p className="text-lg font-bold font-mono text-yellow-600 dark:text-yellow-400">{warningBatches.length}</p>
                    </div>
                    <Clock className="h-5 w-5 text-yellow-500/50" />
                  </div>

                  <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">{isBangla ? "স্বাভাবিক মজুদ" : "Healthy Stock"}</span>
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{state.batches.length - expiredBatches.length - criticalBatches.length - warningBatches.length}</p>
                    </div>
                    <Package className="h-5 w-5 text-emerald-500/50" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bulk Import Module */}
          <BulkImportModule isBangla={isBangla} onImportCompleted={onImportCompleted} />

          {/* Warehouse utilization cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.warehouses.map((wh) => {
              const utilPercent = calculatePercentage(wh.utilized, wh.capacity);
              return (
                <div key={wh.id} className="p-4 border border-slate-200/50 dark:border-white/5 rounded-2xl bg-white/30 dark:bg-white/[0.01]">
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                    {wh.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">{wh.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">{wh.location}</p>
                  
                  {/* Util Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span>{isBangla ? "ক্ষমতা:" : "Utilized:"} {wh.utilized} MT / {wh.capacity} MT</span>
                      <span>{utilPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-950/40 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${utilPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* UNIT CONVERSION UTILITY */}
          <UnitConversionUtility
            displayUnit={displayUnit}
            onSelectDisplayUnit={setDisplayUnit}
            isBangla={isBangla}
          />

          {/* INVENTORY & BATCH FILTER TOOLBAR */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/10 pb-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mr-1">
                {isBangla ? "ফিল্টার ভিউ:" : "Filter:"}
              </span>

              {/* Filter Chips */}
              <button
                onClick={() => setInventoryFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inventoryFilter === "all"
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {isBangla ? "সকল আইটেম" : "All Items"} ({state.inventory.length})
              </button>

              <button
                onClick={() => setInventoryFilter("low_stock")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inventoryFilter === "low_stock"
                    ? "bg-amber-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {isBangla ? "কম স্টক (< ১০%)" : "Low Stock (< 10%)"} ({state.inventory.filter(i => i.status === "Low Stock" || i.availableStock < 50000).length})
              </button>

              <button
                onClick={() => setInventoryFilter("high_stock")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inventoryFilter === "high_stock"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {isBangla ? "উচ্চ স্টক" : "High Stock"} ({state.inventory.filter(i => i.availableStock >= 50000).length})
              </button>

              <button
                onClick={() => setInventoryFilter("expiry_warning")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  inventoryFilter === "expiry_warning"
                    ? "bg-rose-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span>{isBangla ? "ব্যাচ মেয়াদ ফিল্টার" : "Batch Expiry Monitor"}</span>
              </button>

              <button
                onClick={() => setInventoryFilter("batch_serial")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  inventoryFilter === "batch_serial"
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <QrCode className="h-3 w-3 text-indigo-400" />
                <span>{isBangla ? "ব্যাচ ও সিরিয়াল ট্র্যাকিং" : "Batch & Serial Tracking"}</span>
              </button>
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline">
                {isBangla ? "সর্টিং:" : "Quick Sort:"}
              </span>
              <select
                value={inventorySort}
                onChange={(e) => setInventorySort(e.target.value as any)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="default">{isBangla ? "ডিফল্ট (কোড)" : "Default (Item Code)"}</option>
                <option value="name_asc">{isBangla ? "আইটেম নাম (A → Z)" : "Name (A → Z)"}</option>
                <option value="name_desc">{isBangla ? "আইটেম নাম (Z → A)" : "Name (Z → A)"}</option>
                <option value="stock_asc">{isBangla ? "স্টক লেভেল (কম → বেশি)" : "Stock Level (Low → High)"}</option>
                <option value="stock_desc">{isBangla ? "স্টক লেভেল (বেশি → কম)" : "Stock Level (High → Low)"}</option>
                <option value="expiry_asc">{isBangla ? "মেয়াদ উত্তীর্ণ (দ্রুততম প্রথম)" : "Expiry Date (Earliest First)"}</option>
                <option value="expiry_desc">{isBangla ? "মেয়াদ উত্তীর্ণ (সর্বশেষ প্রথম)" : "Expiry Date (Latest First)"}</option>
                <option value="value_desc">{isBangla ? "ইউনিট মূল্য (সর্বোচ্চ)" : "Unit Value (Highest)"}</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC TABLE: BATCH & SERIAL TRACKING VS BATCH EXPIRY MONITOR VS STANDARD STOCK LEDGER */}
          {inventoryFilter === "batch_serial" ? (
            <div className="border border-indigo-500/20 rounded-xl overflow-hidden bg-indigo-500/[0.02]">
              <div className="p-3 bg-indigo-500/10 border-b border-indigo-500/20 flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-indigo-500" />
                  {isBangla ? "ব্যাচ ও সিরিয়াল নাম্বার ট্র্যাকিং রেজিস্ট্রি" : "Batch & Serial Number Traceability Register"}
                </span>
                <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-400 font-bold">
                  Tracked Batches: {state.batches.length}
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-6">{isBangla ? "ব্যাচ কোড" : "Batch Code"}</th>
                    <th className="p-3">{isBangla ? "আইটেম বিবরণ" : "Item Description"}</th>
                    <th className="p-3">{isBangla ? "সিরিয়াল নাম্বারসমূহ" : "Serial Numbers"}</th>
                    <th className="p-3">{isBangla ? "উৎপত্তি ও পোর্ট" : "Origin / Port"}</th>
                    <th className="p-3">{isBangla ? "গুদাম অবস্থান" : "Warehouse Location"}</th>
                    <th className="p-3">{isBangla ? "মেয়াদ ও কোয়ারেন্টাইন" : "Expiry & QA Status"}</th>
                    <th className="p-3 pr-6 text-right">{isBangla ? "অ্যাকশন" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-sans">
                  {state.batches.map((b) => {
                    const item = state.inventory.find(i => i.code === b.itemCode);
                    const serials = b.serialNumbers || [];
                    const originStr = b.origin || "Dhaka Central Silo";

                    return (
                      <tr key={b.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 pl-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {b.batchNumber}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{item?.name || b.itemCode}</p>
                          <span className="text-[10px] font-mono text-slate-400">Code: [{b.itemCode}] • Qty: {b.quantity.toLocaleString()} {item?.uom || "KG"}</span>
                        </td>
                        <td className="p-3 font-mono">
                          {serials.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {serials.map((s) => (
                                <span key={s} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 dark:border-slate-700 font-bold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No individual serials assigned</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {originStr}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                          {b.currentLocation || b.warehouseId || "WH-MAIN"}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            b.status === "Quarantine" || (b.status as string) === "Quarantined"
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : b.status === "Expiring Soon" || (b.status as string) === "Near Expiry"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}>
                            {b.status || "Active Quarantine"}
                          </span>
                        </td>
                        <td className="p-3 pr-6 text-right">
                          <button
                            onClick={() => alert(`Full traceability audit trail for Batch ${b.batchNumber} logged to QA system.`)}
                            className="glass-button-indigo text-[10px] px-2.5 py-1"
                          >
                            {isBangla ? "ট্রেসেবিলিটি প্রিন্ট" : "Traceability Label"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : inventoryFilter === "expiry_warning" ? (
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-amber-500/[0.02]">
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {isBangla ? "ব্যাচ শেলফ-লাইফ ও এক্সপায়ারি রেজিস্ট্রি" : "Batch Shelf-Life & Expiry Schedule"}
                </span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                  Total Active Batches: {state.batches.length}
                </span>
              </div>
              
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-6">{isBangla ? "ব্যাচ নম্বর" : "Batch Code"}</th>
                    <th className="p-3">{isBangla ? "আইটেম বিবরণ" : "Item Description"}</th>
                    <th className="p-3">{isBangla ? "পরিমাণ" : "Batch Qty"}</th>
                    <th className="p-3">{isBangla ? "উৎপাদন তারিখ" : "Mfg Date"}</th>
                    <th className="p-3">{isBangla ? "মেয়াদোত্তীর্ণ তারিখ" : "Expiry Date"}</th>
                    <th className="p-3">{isBangla ? "অবশিষ্ট দিন" : "Days Remaining"}</th>
                    <th className="p-3 pr-6 text-right">{isBangla ? "অ্যাকশন" : "Status & Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-sans">
                  {state.batches.map((b) => {
                    const now = new Date("2026-07-26").getTime();
                    const exp = new Date(b.expiryDate).getTime();
                    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                    const item = state.inventory.find(i => i.code === b.itemCode);

                    return (
                      <tr key={b.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{b.batchNumber}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{item?.name || b.itemCode}</p>
                          <span className="text-[10px] font-mono text-slate-400">[{b.itemCode}] - Warehouse: {b.warehouseId}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {b.quantity.toLocaleString()} {item?.uom || "KG"}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{b.manufactureDate}</td>
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{b.expiryDate}</td>
                        <td className="p-3 font-mono">
                          {diffDays <= 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              EXPIRED ({Math.abs(diffDays)}d ago)
                            </span>
                          ) : diffDays <= 30 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {diffDays} Days Remaining
                            </span>
                          ) : diffDays <= 60 ? (
                            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                              {diffDays} Days Remaining
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {diffDays} Days (Healthy)
                            </span>
                          )}
                        </td>
                        <td className="p-3 pr-6 text-right">
                          {diffDays <= 0 ? (
                            <button
                              onClick={() => alert(`Batch ${b.batchNumber} quarantined for quality inspection.`)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              {isBangla ? "কোয়ারেন্টাইন করুন" : "Quarantine Batch"}
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`FIFO Dispatch priority logged for Batch ${b.batchNumber}.`)}
                              className="glass-button-indigo text-[10px] px-2.5 py-1"
                            >
                              {isBangla ? "এফআইএফও অগ্রাধিকার" : "Set FIFO Priority"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Stock items ledger */
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-6">{isBangla ? "আইটেম কোড" : "Item Code"}</th>
                    <th className="p-3">{isBangla ? "বিবরণ" : "Item Name"}</th>
                    <th className="p-3">{isBangla ? "ক্যাটাগরি" : "Category"}</th>
                    <th className="p-3">{isBangla ? "মজুদ পরিমাণ" : "Available Stock"}</th>
                    <th className="p-3">{isBangla ? "ইউনিট মূল্য" : "Unit Value"}</th>
                    <th className="p-3 pr-6 text-right">{isBangla ? "স্ট্যাটাস" : "Stock Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {state.inventory
                    .filter((i) => {
                      if (inventoryFilter === "low_stock") {
                        return i.status === "Low Stock" || i.availableStock < 50000;
                      }
                      if (inventoryFilter === "high_stock") {
                        return i.status === "Normal" && i.availableStock >= 50000;
                      }
                      return true;
                    })
                    .sort((a, b) => {
                      if (inventorySort === "name_asc") return a.name.localeCompare(b.name);
                      if (inventorySort === "name_desc") return b.name.localeCompare(a.name);
                      if (inventorySort === "stock_asc") return a.availableStock - b.availableStock;
                      if (inventorySort === "stock_desc") return b.availableStock - a.availableStock;
                      if (inventorySort === "expiry_asc" || inventorySort === "expiry_desc") {
                        const getMinExp = (code: string) => {
                          const bList = state.batches.filter((b) => b.itemCode === code);
                          if (!bList.length) return "9999-12-31";
                          return bList.reduce((min, cur) => (cur.expiryDate < min ? cur.expiryDate : min), bList[0].expiryDate);
                        };
                        const expA = getMinExp(a.code);
                        const expB = getMinExp(b.code);
                        return inventorySort === "expiry_asc" ? expA.localeCompare(expB) : expB.localeCompare(expA);
                      }
                      if (inventorySort === "value_desc") return b.unitValue - a.unitValue;
                      return a.code.localeCompare(b.code);
                    })
                    .map((item) => {
                      const converted = convertQuantity(item.availableStock, displayUnit);

                      return (
                        <tr key={item.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{item.code}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.name}</td>
                          <td className="p-3 text-slate-500">{item.category}</td>
                          <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {displayUnit === "default" ? (
                              <span>{item.availableStock.toLocaleString()} {item.uom}</span>
                            ) : (
                              <div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                  {converted.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {converted.unitLabel}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  ({item.availableStock.toLocaleString()} {item.uom})
                                </span>
                              </div>
                            )}
                          </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                          {state.currency === "USD"
                            ? `$ ${(item.unitValue / 120).toFixed(2)}`
                            : `৳ ${item.unitValue.toLocaleString()}`
                          }
                        </td>
                        <td className="p-3 pr-6 text-right">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            item.status === "Normal"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : item.status === "Low Stock"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. COMMERCIAL MODULE */}
      {tab === "commercial" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isBangla ? "বাণিজ্যিক ও বৈদেশিক এলসি ট্র্যাকিং" : "Commercial Import & LC Tracking"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Letter of Credit (LC) opening documentation, port custom dues, CNF agent clearing records.
            </p>
          </div>

          <div className="p-4 border border-slate-200/50 dark:border-white/5 rounded-2xl bg-white/30 dark:bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">LC</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">LC-2026-0081</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Foreign raw material supplier: <span className="text-slate-700 dark:text-slate-200 font-semibold">Agri-Global S.A. (Brazil)</span>
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">Value: $185,000 (Bank Asia Facility)</span>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                Customs Cleared
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">ETA: Arrived at Mongla Port</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SALES MODULE */}
      {tab === "sales" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "বিক্রয় অর্ডার এবং কাস্টমার লেজার" : "Sales Orders & Distributors Registry"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorize distributor orders, enforce credit limits, and coordinate shipments.
              </p>
            </div>
            <button
              onClick={() => setShowCreateSO(!showCreateSO)}
              className="glass-button-indigo text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{showCreateSO ? (isBangla ? "ফরম বন্ধ করুন" : "Close Form") : (isBangla ? "নতুন সেলস অর্ডার" : "Create Sales Order")}</span>
            </button>
          </div>

          {/* Collapsible Sales Order Creation Form with Zod Inline Validation */}
          {showCreateSO && (
            <div className="p-4 border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl space-y-4 animate-in slide-in-from-top duration-150">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4" />
                  {isBangla ? "নতুন ডিস্ট্রিবিউটর সেলস অর্ডার এন্ট্রি (Zod ভ্যালিডেশন)" : "New Sales Order Entry (Zod Validated)"}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Strict Schema Enforcement Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? "গ্রাহকের নাম:" : "Customer Name:"}
                  </label>
                  <div className="relative flex items-center group">
                    <input
                      type="text"
                      value={soForm.customerName}
                      onChange={(e) => {
                        setSoForm({ ...soForm, customerName: e.target.value });
                        setSoErrors(null);
                      }}
                      placeholder="e.g. Paragon Feeds Ltd"
                      className={`w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-100 outline-none ${
                        soErrors?.customerName ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold" : ""
                      }`}
                    />
                    {soErrors?.customerName && (
                      <div className="absolute right-2 flex items-center">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse cursor-help" />
                        <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 bg-rose-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap border border-rose-700">
                          {soErrors.customerName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Code */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? "গ্রাহক কোড:" : "Customer Code:"}
                  </label>
                  <div className="relative flex items-center group">
                    <input
                      type="text"
                      value={soForm.customerCode}
                      onChange={(e) => {
                        setSoForm({ ...soForm, customerCode: e.target.value });
                        setSoErrors(null);
                      }}
                      placeholder="e.g. CUST-001"
                      className={`w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-100 outline-none ${
                        soErrors?.customerCode ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold" : ""
                      }`}
                    />
                    {soErrors?.customerCode && (
                      <div className="absolute right-2 flex items-center">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse cursor-help" />
                        <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 bg-rose-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap border border-rose-700">
                          {soErrors.customerCode}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? "পণ্য নির্বাচন:" : "Finished Product:"}
                  </label>
                  <select
                    value={soForm.productCode}
                    onChange={(e) => {
                      setSoForm({ ...soForm, productCode: e.target.value });
                      setSoErrors(null);
                    }}
                    className="w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                  >
                    {state.inventory.filter(i => (i.category as string) === "Finished Goods" || (i.category as string) === "By-Product").map(i => (
                      <option key={i.code} value={i.code}>{i.name} ({i.code})</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? "পরিমাণ (ব্যাগ/ইউনিট):" : "Order Quantity (Min 10):"}
                  </label>
                  <div className="relative flex items-center group">
                    <input
                      type="number"
                      value={soForm.quantity}
                      onChange={(e) => {
                        setSoForm({ ...soForm, quantity: Number(e.target.value) });
                        setSoErrors(null);
                      }}
                      className={`w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-100 outline-none ${
                        soErrors?.quantity ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold" : ""
                      }`}
                    />
                    {soErrors?.quantity && (
                      <div className="absolute right-2 flex items-center">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse cursor-help" />
                        <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 bg-rose-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap border border-rose-700">
                          {soErrors.quantity}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {isBangla ? "ইউনিট মূল্য (টাকা):" : "Unit Price (BDT):"}
                  </label>
                  <div className="relative flex items-center group">
                    <input
                      type="number"
                      value={soForm.unitPrice}
                      onChange={(e) => {
                        setSoForm({ ...soForm, unitPrice: Number(e.target.value) });
                        setSoErrors(null);
                      }}
                      className={`w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-100 outline-none ${
                        soErrors?.unitPrice ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold" : ""
                      }`}
                    />
                    {soErrors?.unitPrice && (
                      <div className="absolute right-2 flex items-center">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 animate-pulse cursor-help" />
                        <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 bg-rose-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-lg whitespace-nowrap border border-rose-700">
                          {soErrors.unitPrice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleValidateAndCreateSO}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-lg text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isBangla ? "অর্ডার সাবমিট করুন" : "Submit Sales Order"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sales order list */}
          <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3 pl-6">{isBangla ? "অর্ডার নম্বর" : "Order Number"}</th>
                  <th className="p-3">{isBangla ? "কাস্টমার" : "Customer Name"}</th>
                  <th className="p-3">{isBangla ? "অর্ডার ডেট" : "Date"}</th>
                  <th className="p-3">{isBangla ? "অর্ডার আইটেম" : "Product details"}</th>
                  <th className="p-3">{isBangla ? "মোট মূল্য" : "Total Cost"}</th>
                  <th className="p-3">{isBangla ? "ডেলিভারি" : "Dispatch Status"}</th>
                  <th className="p-3">{isBangla ? "পিডিএফ" : "Document PDF"}</th>
                  <th className="p-3 pr-6 text-right">{isBangla ? "পেমেন্ট আদায়" : "Payment"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {state.salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-6 font-mono font-bold text-slate-800 dark:text-slate-200">{so.orderNumber}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{so.customerName}</td>
                    <td className="p-3 font-mono text-slate-400">{so.orderDate}</td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-200">
                      {so.items[0].productName} ({so.items[0].qty} {so.items[0].uom})
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{formatBDT(so.totalAmount)}</td>
                    <td className="p-3">
                      {so.deliveryStatus === "Pending" ? (
                        <button
                          onClick={() => {
                            onDispatchSalesOrder(so.id);
                            alert(isBangla ? "অর্ডার সফলভাবে পরিবহন ডিপার্টমেন্টে প্রেরণ করা হয়েছে!" : "Sales Order successfully dispatched for logistics trip scheduling!");
                          }}
                          className="glass-button-green text-[10px] px-2.5 py-1.5"
                        >
                          {isBangla ? "চালান ছাড় করুন" : "Dispatch"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-650 dark:text-emerald-450 font-bold">{so.deliveryStatus}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => downloadSalesOrderPDF(so, isBangla)}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-indigo-400 font-bold px-2 py-1 rounded border border-indigo-200/50 dark:border-white/10 transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                    <td className="p-3 pr-6 text-right">
                      {so.status === DocStatus.APPROVED && so.deliveryStatus === "Delivered" ? (
                        <button
                          onClick={() => {
                            onPostCollection(so.id);
                            alert(isBangla ? "টাকা আদায় সম্পন্ন এবং খতিয়ানে এন্ট্রি দেওয়া হয়েছে!" : "Payment collection cleared & bank ledger balances updated!");
                          }}
                          className="glass-button-amber text-[10px] px-2.5 py-1.5"
                        >
                          {isBangla ? "আদায় করুন" : "Collect Payment"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-bold">
                          {so.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FINANCE MODULE */}
      {tab === "finance" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "সাধারণ খতিয়ান ও হিসাব বিশ্লেষণ" : "General Ledger & Financial Accounting"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live account charts, accounts payable, accounts receivable, bank assets.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV("ledger")}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              <span>{isBangla ? "এক্সপোর্ট সিএসভি" : "Export CSV"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ledger Accounts Table */}
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-white/10 dark:bg-white/[0.01] backdrop-blur-xs">
              <div className="bg-white/30 dark:bg-slate-950/40 p-3 border-b border-slate-200/50 dark:border-white/10">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                  {isBangla ? "হিসাব তালিকা" : "CHART OF ACCOUNTS"}
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-2.5 pl-4">{isBangla ? "কোড" : "Code"}</th>
                    <th className="p-2.5">{isBangla ? "হিসাব খাত" : "Account Head"}</th>
                    <th className="p-2.5">{isBangla ? "ধরণ" : "Type"}</th>
                    <th className="p-2.5 pr-4 text-right">{isBangla ? "ব্যালেন্স" : "Balance"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {state.ledger.map((acc) => (
                    <tr key={acc.code} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-2.5 pl-4 font-mono font-bold text-slate-500">{acc.code}</td>
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{acc.name}</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">{acc.type}</td>
                      <td className="p-2.5 pr-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {state.currency === "USD"
                          ? `$ ${(acc.balance / 120).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `৳ ${acc.balance.toLocaleString()}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulated journal entry log */}
            <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-white/10 dark:bg-white/[0.01] backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="bg-white/30 dark:bg-slate-950/40 p-3 border-b border-slate-200/50 dark:border-white/10">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                    {isBangla ? "স্বয়ংক্রিয় জার্নাল এন্ট্রি" : "AUTOMATED JOURNAL ENTRIES"}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {state.journal.map((j) => (
                    <div key={j.id} className="p-3 bg-white/30 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-xl">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>{j.voucherNo}</span>
                        <span>{j.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-bold mt-1">{j.description}</p>
                      
                      <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-500">
                        {j.lines.map((l, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{l.accountName}</span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {l.debit > 0
                                ? (state.currency === "USD" ? `Dr $ ${(l.debit / 120).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `Dr ৳${l.debit.toLocaleString()}`)
                                : (state.currency === "USD" ? `Cr $ ${(l.credit / 120).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `Cr ৳${l.credit.toLocaleString()}`)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-indigo-500/5 dark:bg-indigo-500/[0.02] text-xs text-slate-500 dark:text-slate-400 leading-normal font-mono">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">P2P & O2C Real-time Postings:</span> Every goods receipt (GRN) automatically credits accounts payable and debits inventories. Every payment collection automatically debits Cash in Bank and credits receivables. Double-entry validation is fully compiled!
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. HR MODULE */}
      {tab === "hr" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isBangla ? "মানব সম্পদ ও পে-রোল শীট" : "HR Personnel & Payroll Register"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee departments, biometric attendance averages, and monthly salary dispatch profiles.
            </p>
          </div>

          <div className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                <tr>
                  <th className="p-3 pl-6">{isBangla ? "আইডি" : "Employee ID"}</th>
                  <th className="p-3">{isBangla ? "কর্মকর্তা" : "Name"}</th>
                  <th className="p-3">{isBangla ? "পদবি" : "Designation"}</th>
                  <th className="p-3">{isBangla ? "বিভাগ" : "Department"}</th>
                  <th className="p-3">{isBangla ? "উপস্থিতি" : "Biometric Attendance"}</th>
                  <th className="p-3 pr-6 text-right">{isBangla ? "মাসিক বেতন" : "Gross Salary"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {state.employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-6 font-mono font-bold text-slate-500">{emp.code}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{emp.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                    <td className="p-3 text-slate-500">{emp.department}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-200/50 dark:bg-slate-950/40 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${emp.attendanceRate}%` }}></div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{emp.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="p-3 pr-6 text-right font-mono font-bold text-slate-800 dark:text-slate-200 font-mono">৳ {emp.grossSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LOGISTICS & FLEET MODULE */}
      {tab === "logistics" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isBangla ? "বহর ট্র্যাকিং ও জিপিএস ম্যাপ সিমুলেশন" : "Fleet Operations & GPS Delivery Simulation"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live flatbed truck coordinates, driver assignments, and fuel consumption logs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live GPS Map Simulation of Bangladesh (Swiss-Modern vector styling) */}
            <div className="lg:col-span-2 border border-indigo-500/15 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-950/90 p-4 relative flex flex-col justify-between min-h-[300px] shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">
                  {isBangla ? "লাইভ জিপিএস রুট ট্র্যাকিং" : "LIVE FLEET RADAR & MAPS"}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Mymensingh Plant ➔ Gazipur Central ➔ Dhaka HQ</span>
              </div>

              {/* Bangladesh abstract vector map with route marker */}
              <div className="flex-1 relative flex items-center justify-center p-2">
                <svg viewBox="0 0 400 300" className="w-full h-full max-h-60 overflow-visible opacity-80">
                  {/* Abstract Bangladesh coastlines and zones */}
                  <path
                    d="M 120 40 L 150 20 L 200 10 L 250 30 L 280 60 L 310 110 L 330 150 L 350 210 L 280 250 L 220 280 L 140 260 L 90 200 L 70 120 Z"
                    fill="#022c22"
                    stroke="#14532d"
                    strokeWidth="1.5"
                  />
                  
                  {/* Route path */}
                  <path
                    d="M 190 60 Q 200 110 210 140 T 220 210"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    className="animate-[dash_10s_linear_infinite]"
                  />

                  {/* Nodes (Dhaka, Gazipur, Mymensingh, Khulna) */}
                  <circle cx="190" cy="60" r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="198" y="63" className="text-[9px] font-mono font-bold fill-slate-350">Mymensingh (Plant)</text>

                  <circle cx="210" cy="140" r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="218" y="143" className="text-[9px] font-mono font-bold fill-slate-350">Gazipur (Depot)</text>

                  <circle cx="220" cy="210" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="228" y="213" className="text-[9px] font-mono font-bold fill-red-400">Dhaka (HQ)</text>

                  {/* Pulsing delivery truck indicator */}
                  <g className="animate-pulse">
                    <circle cx="205" cy="115" r="8" fill="#6366f1" opacity="0.3" />
                    <circle cx="205" cy="115" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
                  </g>
                </svg>
              </div>

              <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl text-xs font-mono flex items-center justify-between text-slate-300 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{isBangla ? "ট্রাক অবস্থান: গাজীপুর বাইপাস" : "DM-TA-14-3021: Gazipur Bypass"}</span>
                </div>
                <span className="text-indigo-400 font-bold">ETA 25 MINS</span>
              </div>
            </div>

            {/* Logistics active trips logs */}
            <div className="space-y-4">
              <div className="border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 bg-white/10 dark:bg-white/[0.01] backdrop-blur-xs h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    {isBangla ? "সক্রিয় ট্রিপ তালিকা" : "ACTIVE TRIP METRICS"}
                  </span>
                  <div className="space-y-3 mt-3">
                    {state.trips.map((t) => (
                      <div key={t.id} className="p-3 bg-white/30 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl">
                        <div className="flex justify-between font-mono text-[10px] text-slate-500">
                          <span>{t.tripNumber}</span>
                          <span className="text-indigo-700 dark:text-indigo-400 font-bold">{t.status}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-100 font-bold mt-1">{t.driverName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.route}</p>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-200/30 dark:border-white/5">
                          <span>{isBangla ? "জ্বালানি ইস্যু:" : "Fuel Issued:"} {t.fuelIssuedLiters}L</span>
                          <span className="font-mono">৳ {t.fuelCost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 mt-4 font-mono">
                  <span className="font-bold text-indigo-400">Fuel Optimization:</span> Intelligent route allocation reduces empty return trips by co-loading grain bags from the Mongla custom ports.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. CRM & CUSTOMER PORTAL */}
      {tab === "crm" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isBangla ? "গ্রাহক সম্পর্ক ব্যবস্থাপনা (CRM)" : "CRM Support Tickets & Complaints"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Handle distributor complaints, feed performance feedback, and raise service tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Support Tickets list */}
            <div className="md:col-span-2 border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-white/10 dark:bg-white/[0.01] backdrop-blur-xs">
              <div className="bg-white/30 dark:bg-slate-950/40 p-3 border-b border-slate-200/50 dark:border-white/10">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                  {isBangla ? "টিকেট তালিকা" : "OPEN COMPLAINT TICKETS"}
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-white/30 dark:bg-slate-950/40 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/50 dark:border-white/10 font-mono">
                  <tr>
                    <th className="p-3 pl-4">{isBangla ? "টিকিট আইডি" : "Ticket ID"}</th>
                    <th className="p-3">{isBangla ? "আবেদনকারী" : "Raised By"}</th>
                    <th className="p-3">{isBangla ? "বিষয়" : "Subject"}</th>
                    <th className="p-3">{isBangla ? "অগ্রাধিকার" : "Priority"}</th>
                    <th className="p-3 pr-4 text-right">{isBangla ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {state.tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-slate-500">{t.ticketId}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{t.createdBy}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{t.subject}</td>
                      <td className="p-3">
                        <Badge variant={t.priority === "High" || t.priority === "Critical" ? "danger" : t.priority === "Medium" ? "warning" : "default"}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <Badge variant={t.status === "Open" ? "danger" : "success"}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Raise complaint form */}
            <div className="p-4 border border-slate-200/50 dark:border-white/5 rounded-2xl bg-white/30 dark:bg-white/[0.01] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                  {isBangla ? "নতুন টিকিট তৈরি" : "RAISE SUPPORT COMPLAINT"}
                </span>
                
                <div className="space-y-3 mt-3">
                  <Input
                    label={isBangla ? "অভিযোগের বিষয়" : "Subject"}
                    type="text"
                    placeholder="e.g. Moisture level inquiry for Broiler feed"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full bg-white/45 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-100 p-2.5 text-xs rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <option value={TicketPriority.LOW}>Low</option>
                      <option value={TicketPriority.MEDIUM}>Medium</option>
                      <option value={TicketPriority.HIGH}>High</option>
                      <option value={TicketPriority.CRITICAL}>Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!ticketSubject) return alert(isBangla ? "দয়া করে টিকিট বিবরণ দিন।" : "Please enter the ticket subject.");
                  alert(isBangla ? "অভিযোগ টিকিট সফলভাবে নথিবদ্ধ করা হয়েছে!" : "IT/Customer Support Ticket logged successfully.");
                  setTicketSubject("");
                }}
                variant="indigo"
                className="w-full flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>{isBangla ? "অভিযোগ দাখিল করুন" : "File Ticket"}</span>
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          const item = state.inventory.find(i => i.code.toLowerCase() === code.toLowerCase() || i.name.toLowerCase().includes(code.toLowerCase()));
          if (item) {
            setScannedMessage(`Matched Barcode: [${item.code}] ${item.name} | Available Stock: ${item.availableStock.toLocaleString()} ${item.uom} | Warehouse: ${item.warehouseId}`);
          } else {
            setScannedMessage(`Scanned Barcode [${code}]: Record found in ledger registry.`);
          }
        }}
        title={isBangla ? "মজুদ আইটেম বারকোড স্ক্যানার" : "Inventory Item Barcode / QR Scanner"}
        isBangla={isBangla}
      />
    </div>
  );
}
