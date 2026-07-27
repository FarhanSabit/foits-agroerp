/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  title,
  subtitle,
  headerAction,
  children,
  ...props
}) => {
  return (
    <div
      className={`glass-card p-6 border border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] rounded-2xl flex flex-col gap-4 ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3">
          <div className="flex flex-col">
            {title && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};

Card.displayName = "Card";
