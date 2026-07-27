import React, { useState, useRef } from "react";
import { Upload, Check, AlertTriangle, FileText, Download, HelpCircle } from "lucide-react";
import { InventoryItemSchema, LedgerAccountSchema } from "@agro-erp/shared-utils";

interface BulkImportModuleProps {
  isBangla: boolean;
  onImportCompleted: (type: "inventory" | "ledger", items: any[]) => void;
}

export default function BulkImportModule({
  isBangla,
  onImportCompleted
}: BulkImportModuleProps) {
  const [importType, setImportType] = useState<"inventory" | "ledger">("inventory");
  const [csvText, setCsvText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplateCSV = () => {
    if (importType === "inventory") {
      return "code,name,category,uom,availableStock,reorderLevel,safetyStock,unitValue,warehouseId,status\n" +
             "RM005,Yellow Feed Maize,Raw Material,KG,25000,10000,5000,34,w1,Normal\n" +
             "FG003,Premium Cattle Feed,Finished Goods,Bags,500,200,100,2200,w2,Normal";
    } else {
      return "code,name,type,balance\n" +
             "1020,Dutch-Bangla Bank General,Asset,4500000\n" +
             "2200,Accrued Salaries,Liability,120000";
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = getTemplateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agro_erp_${importType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };
    
    // Parse CSV line handling quotes
    const parseLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, "")); // remove quotes from headers
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  };

  const handleProcessCSV = (textToProcess: string) => {
    setSuccessMessage("");
    if (!textToProcess.trim()) {
      alert(isBangla ? "দয়া করে প্রথমে সিএসভি ফাইল আপলোড করুন বা ডাটা পেস্ট করুন।" : "Please upload a CSV file or paste some data first.");
      return;
    }

    const { headers, rows } = parseCSV(textToProcess);
    if (headers.length === 0) {
      alert(isBangla ? "সিএসভি ফাইলটি সঠিক নয় বা হেডারে সমস্যা রয়েছে।" : "Invalid CSV content or missing header row.");
      return;
    }

    setParsedHeaders(headers);

    const schema = importType === "inventory" ? InventoryItemSchema : LedgerAccountSchema;
    let errorsFound = 0;

    const results = rows.map((row, index) => {
      const obj: Record<string, any> = {};
      headers.forEach((header, colIdx) => {
        const key = header.trim();
        let val: any = row[colIdx];
        if (val !== undefined) {
          val = val.replace(/^["']|["']$/g, ""); // strip quotes
          
          // Coerce numeric values based on key
          if (["availableStock", "reorderLevel", "safetyStock", "unitValue", "balance"].includes(key)) {
            val = Number(val);
            if (isNaN(val)) val = undefined;
          }
        }
        obj[key] = val;
      });

      // Auto-assign random ID for inventory if missing
      if (importType === "inventory" && !obj.id) {
        obj.id = `imported-${Math.random().toString(36).substring(2, 9)}`;
      }

      // Safe parse using Zod
      const parsed = schema.safeParse(obj);
      if (!parsed.success) {
        errorsFound++;
      }

      return {
        line: index + 2,
        data: obj,
        isValid: parsed.success,
        errors: !parsed.success ? parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) : []
      };
    });

    setValidationResults(results);
    setErrorCount(errorsFound);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleProcessCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleProcessCSV(text);
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    const validRows = validationResults.filter(r => r.isValid).map(r => r.data);
    if (validRows.length === 0) {
      alert(isBangla ? "সংরক্ষণ করার মতো কোনো বৈধ ডাটা পাওয়া যায়নি।" : "No valid rows to import.");
      return;
    }

    onImportCompleted(importType, validRows);
    
    setSuccessMessage(
      isBangla
        ? `সফলভাবে ${validRows.length}টি এন্ট্রি ডাটাবেজে যুক্ত করা হয়েছে!`
        : `Successfully imported ${validRows.length} valid records into the database!`
    );
    // Clear out
    setValidationResults([]);
    setCsvText("");
  };

  return (
    <div className="glass-card p-6 border border-slate-200/50 dark:border-white/5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/10 pb-4">
        <div>
          <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-500" />
            {isBangla ? "বাল্ক ডাটা সিএসভি ইমপোর্টার" : "Bulk CSV Data Importer"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isBangla 
              ? "ইনভেন্টরি বা লেজার ডাটা সিএসভি ফাইলে লোড ও ভ্যালিডেট করে ইন্টিগ্রেট করুন।" 
              : "Import inventory or general ledger accounts in bulk using raw CSV sheets with real-time schema validation."}
          </p>
        </div>

        {/* DataType Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200/40 dark:border-white/5 font-mono text-xs">
          <button
            onClick={() => {
              setImportType("inventory");
              setValidationResults([]);
              setCsvText("");
              setSuccessMessage("");
            }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              importType === "inventory"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {isBangla ? "ইনভেন্টরি" : "Inventory"}
          </button>
          <button
            onClick={() => {
              setImportType("ledger");
              setValidationResults([]);
              setCsvText("");
              setSuccessMessage("");
            }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              importType === "ledger"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {isBangla ? "লেজার খতিয়ান" : "General Ledger"}
          </button>
        </div>
      </div>

      {/* Upload Box Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? "border-indigo-500 bg-indigo-550/10"
                : "border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-900/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isBangla ? "সিএসভি ফাইল ড্র্যাগ করুন অথবা ক্লিক করে আপলোড করুন" : "Drag & drop CSV file or click to choose"}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {isBangla ? "ফাইল সাইজ সর্বোচ্চ ১০এমবি" : "Standard UTF-8 CSV only"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {isBangla ? "টেমপ্লেট ডাউনলোড করুন" : "Download Template CSV"}
            </button>
            <span className="text-[10px] text-slate-400 font-mono leading-none">
              OITS Validation Protocol V1
            </span>
          </div>
        </div>

        {/* Text Paste option */}
        <div className="flex flex-col space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            {isBangla ? "অথবা সরাসরি সিএসভি টেক্সট পেস্ট করুন" : "OR PASTE RAW CSV CONTENT"}
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={getTemplateCSV()}
            className="flex-1 w-full min-h-[120px] p-3 font-mono text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-700 dark:text-slate-300"
          />
          <button
            onClick={() => handleProcessCSV(csvText)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl tracking-wider uppercase shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            {isBangla ? "ডাটা প্রসেস এবং ভ্যালিডেট করুন" : "Parse & Run Zod Validation"}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Real-time Validation Preview Grid */}
      {validationResults.length > 0 && (
        <div className="border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-black/10">
          <div className="bg-white/40 dark:bg-slate-950/40 p-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">
                {isBangla ? "ভ্যালিডেশন রেজাল্ট" : "CSV SCHEMA VALIDATION FLOW"}
              </span>
              <p className="text-xs text-slate-500">
                {isBangla 
                  ? `মোট ${validationResults.length}টি রেকর্ড চিহ্নিত। এর মধ্যে ${errorCount}টি রেকর্ডে ত্রুটি রয়েছে।` 
                  : `Analyzed ${validationResults.length} records. ${errorCount} errors found in CSV structure.`}
              </p>
            </div>
            
            <button
              onClick={handleCommit}
              disabled={errorCount === validationResults.length}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                errorCount === 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-550/10"
                  : errorCount < validationResults.length
                  ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-amber-550/10"
                  : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {errorCount > 0 
                ? (isBangla ? "শুধুমাত্র বৈধ রেকর্ড ইমপোর্ট করুন" : "Import Valid Records Only") 
                : (isBangla ? "সব ডাটা ইমপোর্ট করুন" : "Commit All Valid Data")}
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/20 dark:bg-slate-950/20 text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200/30 dark:border-white/5 font-mono text-[10px]">
                <tr>
                  <th className="p-2.5 pl-4 w-12 text-center">Line</th>
                  <th className="p-2.5">{isBangla ? "ডাটা অবজেক্ট" : "Parsed Record Payload"}</th>
                  <th className="p-2.5 w-32">{isBangla ? "স্ট্যাটাস" : "Validation Status"}</th>
                  <th className="p-2.5 pr-4">{isBangla ? "ত্রুটিসমূহ" : "Zod Validation Errors"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-mono text-[11px]">
                {validationResults.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-white/20 dark:hover:bg-white/[0.01] transition-colors ${row.isValid ? "" : "bg-red-500/5"}`}>
                    <td className="p-2.5 pl-4 text-center text-slate-400 font-bold border-r border-slate-200/50 dark:border-white/5">{row.line}</td>
                    <td className="p-2.5 text-slate-700 dark:text-slate-300 font-bold truncate max-w-xs" title={JSON.stringify(row.data)}>
                      {JSON.stringify(row.data)}
                    </td>
                    <td className="p-2.5">
                      {row.isValid ? (
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Valid PASS
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Invalid FAIL
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 pr-4 text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
                      {row.isValid ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div className="flex items-start gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            {row.errors.map((err: string, i: number) => (
                              <div key={i} className="truncate max-w-sm">{err}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
