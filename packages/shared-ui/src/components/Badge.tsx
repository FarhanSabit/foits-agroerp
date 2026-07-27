/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  const variantClasses = {
    default: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    info: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20",
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
