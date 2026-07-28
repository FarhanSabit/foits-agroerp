import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle, CheckCircle2, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ErrorToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ErrorToastContext = createContext<ErrorToastContextType | undefined>(undefined);

export function ErrorToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ErrorToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-16 md:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-500/30"
                : toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
                : "bg-slate-900/90 text-slate-100 border-white/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
              {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              {toast.type === "info" && <Info className="h-4 w-4 text-indigo-400 shrink-0" />}
              <span className="text-xs font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ErrorToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ErrorToastContext);
  if (!context) {
    throw new Error("useToast must be used within an ErrorToastProvider");
  }
  return context;
}
