/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full bg-white/45 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-2.5 text-xs rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all ${
              icon ? "pl-10" : "pl-3.5"
            } ${
              error ? "border-rose-500/50 focus-visible:ring-rose-500" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[10px] font-mono text-rose-500 font-semibold">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
