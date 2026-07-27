/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Centralized CurrencyManager service for real-time currency conversion.
 */
export class CurrencyManager {
  private static rateToBDT: number = 1;
  private static symbol: string = "৳";
  private static code: string = "BDT";

  public static setCurrency(code: string, rateToBDT: number, symbol: string) {
     this.code = code;
     this.rateToBDT = rateToBDT;
     this.symbol = symbol;
  }
  
  public static getCode(): string {
     return this.code;
  }

  public static format(amount: number): string {
     const converted = amount / this.rateToBDT;
     return `${this.symbol}${converted.toLocaleString("en-US", {
       minimumFractionDigits: 0,
       maximumFractionDigits: 0,
     })}`;
  }
}

/**
 * Formats a numeric value into the active currency with proper grouping.
 * Defaults to Bangladeshi Taka (BDT ৳) if no other currency is set.
 * @param amount Number to format
 * @returns Formatted currency string
 */
export function formatBDT(amount: number): string {
  return CurrencyManager.format(amount);
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

/**
 * Centralized ConversionManager service for calculating unit transformations
 * across inventory items (e.g., Tons, Bags, Quintals, Lbs to/from KG).
 */
export class ConversionManager {
  private static conversionFactors: Record<string, number> = {
    KG: 1,
    MT: 1000,
    Tons: 1000,
    Bags: 50,
    Quintals: 100,
    Lbs: 0.453592,
  };

  /**
   * Converts a given quantity from one unit to another based on conversion factors relative to KG.
   */
  public static convert(quantity: number, fromUnit: string, toUnit: string): number {
    const fromFactor = this.conversionFactors[fromUnit] ?? 1;
    const toFactor = this.conversionFactors[toUnit] ?? 1;
    if (toFactor === 0) return 0;
    
    // Convert to base unit (KG) then to target unit
    const inKg = quantity * fromFactor;
    return inKg / toFactor;
  }

  /**
   * Converts a quantity in KG directly to a target display unit.
   */
  public static convertFromKg(qtyInKg: number, targetUnit: string): { value: number; unitLabel: string } {
    if (!targetUnit || targetUnit === "default" || targetUnit === "KG") {
      return { value: qtyInKg, unitLabel: "KG" };
    }
    const factor = this.conversionFactors[targetUnit] ?? 1;
    return {
      value: qtyInKg / factor,
      unitLabel: targetUnit,
    };
  }

  /**
   * Gets stored conversion factor map relative to 1 KG.
   */
  public static getFactors(): Record<string, number> {
    return { ...this.conversionFactors };
  }

  /**
   * Sets or overrides a unit conversion factor relative to KG.
   */
  public static setFactor(unit: string, factorToKg: number): void {
    if (factorToKg > 0) {
      this.conversionFactors[unit] = factorToKg;
    }
  }
}

export * from "./schemas";

