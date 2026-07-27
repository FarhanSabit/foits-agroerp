import React, { useRef, useState, useEffect } from "react";
import { X, RotateCcw, Check, PenTool, ShieldCheck, UserCheck, Sparkles } from "lucide-react";

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string, signatoryName: string, role: string) => void;
  documentTitle?: string;
  isBangla?: boolean;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentTitle = "Document Approval",
  isBangla = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#1e1b4b"); // Dark Navy
  const [penWidth, setPenWidth] = useState(3);
  const [signatoryName, setSignatoryName] = useState("Dr. Ahsan Rahman");
  const [signatoryRole, setSignatoryRole] = useState("Chief Financial Officer (CFO)");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Initialize Canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const applyPresetSignature = (name: string, role: string, scriptText: string) => {
    setSignatoryName(name);
    setSignatoryRole(role);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stylized signature
    ctx.font = "italic bold 32px 'Brush Script MT', 'Dancing Script', cursive, sans-serif";
    ctx.fillStyle = penColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(scriptText, canvas.width / 2, canvas.height / 2 - 10);

    // Add decorative flourish line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 4, canvas.height / 2 + 15);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height / 2 + 35, (canvas.width * 3) / 4, canvas.height / 2 + 15);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    setHasDrawn(true);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onConfirm(dataUrl, signatoryName, signatoryRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 font-mono">
                <span>{isBangla ? "ডিজিটাল ই-স্বাক্ষর সংযোগ" : "E-Signature Approval"}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-sans font-semibold">
                  SECURE
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{documentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Signatory Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block font-mono">
                {isBangla ? "স্বাক্ষরকারী কর্মকর্তা" : "Signatory Official"}
              </label>
              <select
                value={signatoryName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSignatoryName(val);
                  if (val === "Dr. Ahsan Rahman") setSignatoryRole("Chief Financial Officer (CFO)");
                  else if (val === "Sultana Begum") setSignatoryRole("Factory General Manager");
                  else if (val === "Tareq Anis") setSignatoryRole("Logistics Coordinator");
                  else setSignatoryRole("Authorized ERP Manager");
                }}
                className="w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="Dr. Ahsan Rahman">Dr. Ahsan Rahman (CFO)</option>
                <option value="Sultana Begum">Sultana Begum (Factory GM)</option>
                <option value="Tareq Anis">Tareq Anis (Logistics)</option>
                <option value="Dr. Abul Kashem">Dr. Abul Kashem (QA Chemist)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block font-mono">
                {isBangla ? "পদবী" : "Official Title"}
              </label>
              <input
                type="text"
                value={signatoryRole}
                onChange={(e) => setSignatoryRole(e.target.value)}
                className="w-full glass-input p-2 text-xs rounded-lg text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* Preset Signatures */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>{isBangla ? "দ্রুত সিগনেচার প্রি-সেট" : "Executive Quick Signatures"}</span>
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => applyPresetSignature("Dr. Ahsan Rahman", "Chief Financial Officer (CFO)", "Ahsan Rahman")}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 font-medium transition-colors shrink-0"
              >
                ✍️ Dr. Ahsan
              </button>
              <button
                type="button"
                onClick={() => applyPresetSignature("Sultana Begum", "Factory General Manager", "S. Begum")}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 font-medium transition-colors shrink-0"
              >
                ✍️ Sultana B.
              </button>
              <button
                type="button"
                onClick={() => applyPresetSignature("Tareq Anis", "Logistics Coordinator", "T. Anis")}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 font-medium transition-colors shrink-0"
              >
                ✍️ Tareq Anis
              </button>
            </div>
          </div>

          {/* Drawing Canvas Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono">
                {isBangla ? "মাউস বা স্পর্শ দিয়ে স্বাক্ষর আঁকুন" : "Draw Signature On Canvas Below"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {["#1e1b4b", "#0284c7", "#059669", "#7c3aed"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPenColor(color)}
                      className={`h-4 w-4 rounded-full border border-white shadow-xs ${
                        penColor === color ? "ring-2 ring-indigo-500 scale-110" : "opacity-70"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-mono font-bold"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isBangla ? "মুছে ফেলুন" : "Clear"}</span>
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white shadow-inner relative group">
              <canvas
                ref={canvasRef}
                width={450}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 cursor-crosshair touch-none bg-white"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 dark:text-slate-400 text-xs font-mono font-bold">
                  ✍️ {isBangla ? "এখানে স্পর্শ বা মাউস দিয়ে স্বাক্ষর প্রদান করুন" : "Sign here using mouse or touch"}
                </div>
              )}
            </div>
          </div>

          {/* Legal Certification Checkbox */}
          <label className="flex items-start gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight font-sans">
              {isBangla
                ? "আমি সত্যায়িত করছি যে এই ডিজিটাল ই-স্বাক্ষরটি OITS Dhaka Agro ERP সিস্টেমের সকল অফিসিয়াল নথিতে বৈধ ও চূড়ান্ত অনুমোদন হিসেবে গণ্য হবে।"
                : "I verify and certify that this electronic signature serves as official approval for OITS Dhaka Agro ERP audit and compliance workflows."}
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isBangla ? "বাতিল" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={!hasDrawn || !agreedToTerms}
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{isBangla ? "স্বাক্ষর সংযোজন ও অনুমোদন" : "Attach Signature & Approve"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
