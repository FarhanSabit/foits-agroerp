import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, X, Camera, CheckCircle2, AlertCircle } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  isBangla?: boolean;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = "QR & Barcode Scanner",
  isBangla = false
}: BarcodeScannerModalProps) {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current = null;
        });
      }
      setIsCameraActive(false);
      setScannedResult(null);
      setCameraError(null);
    }
  }, [isOpen]);

  const startScanner = async () => {
    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader-element");
      scannerRef.current = html5QrCode;
      setIsCameraActive(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          setScannedResult(decodedText);
          onScanSuccess(decodedText);
          html5QrCode.stop().catch(() => {}).finally(() => {
            scannerRef.current = null;
            setIsCameraActive(false);
          });
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Camera scanner error:", err);
      setCameraError("Camera access unavailable in preview iframe. You can use preset test barcodes or manual entry.");
      setIsCameraActive(false);
    }
  };

  const handleSimulatedScan = (code: string) => {
    setScannedResult(code);
    onScanSuccess(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0b101f] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
              {isBangla ? "কিউআর / বারকোড স্ক্যানার" : title}
            </h4>
          </div>
          <button
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {}).finally(() => {
                  scannerRef.current = null;
                });
              }
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center">
            <div id="reader-element" className="w-full h-full"></div>
            
            {!isCameraActive && !cameraError && (
              <div className="text-center p-4 space-y-3">
                <QrCode className="h-10 w-10 text-indigo-500 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400">
                  {isBangla ? "ক্যামেরা স্ক্যান শুরু করতে ক্লিক করুন" : "Initialize hardware camera stream"}
                </p>
                <button
                  onClick={startScanner}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Camera className="h-4 w-4" />
                  <span>{isBangla ? "ক্যামেরা খুলুন" : "Start Camera"}</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="text-center p-4 space-y-2">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-[11px] text-slate-400 leading-normal">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Quick preset selection for quick testing */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              {isBangla ? "টেস্ট কিউআর / বারকোড প্রি-সেট:" : "Quick Test Barcode Presets:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: "RM001", label: "RM001 (Yellow Maize)" },
                { code: "RM002", label: "RM002 (Soybean Meal)" },
                { code: "FG001", label: "FG001 (Poultry Feed)" },
                { code: "GRN-2026-0091", label: "GRN-2026-0091" }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleSimulatedScan(item.code)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/10 rounded-lg text-[11px] font-mono font-semibold transition-all text-left truncate cursor-pointer"
                >
                  ⚡ {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={isBangla ? "বারকোড নাম্বার দিন..." : "Or enter barcode number..."}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 glass-input px-3 py-1.5 text-xs rounded-lg font-mono outline-none"
            />
            <button
              onClick={() => {
                if (manualCode.trim()) {
                  handleSimulatedScan(manualCode.trim());
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            >
              {isBangla ? "স্ক্যান" : "Scan"}
            </button>
          </div>

          {scannedResult && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Scanned & Matched
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">{scannedResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
