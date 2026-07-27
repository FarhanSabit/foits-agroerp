/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a numeric value into Bangladeshi Taka (BDT ৳) with proper grouping.
 * @param amount Number to format
 * @returns Formatted currency string
 */
export function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Safely calculates the percentage of a value against a total.
 * @param value The numerator value
 * @param total The denominator total
 * @returns Percentage rounded to nearest integer or 0 if total is 0
 */
export function calculatePercentage(value: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Returns Tailwind class lists for priority-level badges based on high/medium/low settings.
 * @param priority Low, Medium, or High
 * @returns Tailwind CSS classes
 */
export function getPriorityColor(priority: string): string {
  const normalized = priority.toLowerCase();
  if (normalized === "high") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
  }
  if (normalized === "medium") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
  }
  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
}

/**
 * Helper to conditionally join classNames in a clean and safe manner.
 * @param classes List of class names or conditional statements
 * @returns Single joined className string
 */
export function cn(...classes: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  const result: string[] = [];
  
  classes.forEach((c) => {
    if (!c) return;
    if (typeof c === "string") {
      result.push(c);
    } else if (typeof c === "object") {
      Object.keys(c).forEach((key) => {
        if (c[key]) {
          result.push(key);
        }
      });
    }
  });

  return result.join(" ");
}
