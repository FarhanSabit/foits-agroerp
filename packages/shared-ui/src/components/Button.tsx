/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "indigo" | "amber" | "green" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    // Determine size padding matching the 2x horizontal-to-vertical padding rule
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2 text-xs font-semibold rounded-xl",
      lg: "px-6 py-3 text-sm font-bold rounded-2xl",
    }[size];

    const variantClasses = {
      primary: "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 border border-transparent active:scale-98 transition-all shadow-sm",
      secondary: "bg-white/45 hover:bg-white/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 active:scale-98 transition-all",
      indigo: "bg-indigo-600 hover:bg-indigo-550 text-white shadow-md shadow-indigo-500/15 border border-indigo-500/20 active:scale-98 transition-all",
      amber: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 active:scale-98 transition-all",
      green: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 active:scale-98 transition-all",
      danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 active:scale-98 transition-all",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-sans tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
