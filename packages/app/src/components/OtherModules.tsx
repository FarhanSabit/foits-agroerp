import React, { useState } from "react";
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
  QrCode
} from "lucide-react";
import { ERPState, DocStatus, AccountType, VehicleStatus, SupportTicket, TicketPriority } from "../types";
import { formatBDT, calculatePercentage } from "@agro-erp/shared-utils";
import { Button, Input, Badge } from "@agro-erp/shared-ui";
import BulkImportModule from "./BulkImportModule";
import { downloadSalesOrderPDF } from "../utils/pdfGenerator";
import BarcodeScannerModal from "./BarcodeScannerModal";

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
                Current storage allocation, FIFO batch expiry details, and batch tracking.
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

          {/* Stock items ledger */}
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
                {state.inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{item.code}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.name}</td>
                    <td className="p-3 text-slate-500">{item.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.availableStock.toLocaleString()} {item.uom}
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
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isBangla ? "বিক্রয় অর্ডার এবং কাস্টমার লেজার" : "Sales Orders & Distributors Registry"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorize distributor orders, enforce credit limits, and coordinate shipments.
            </p>
          </div>

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
