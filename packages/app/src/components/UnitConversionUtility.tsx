import React, { useState } from "react";
import { ArrowLeftRight, Calculator, Check, Scale } from "lucide-react";
import { ConversionManager } from "@agro-erp/shared-utils";

export type DisplayUnitMode = "default" | "MT" | "Bags" | "Quintals";

interface UnitConversionUtilityProps {
  displayUnit: DisplayUnitMode;
  onSelectDisplayUnit: (unit: DisplayUnitMode) => void;
  isBangla: boolean;
}

// Conversion rates relative to KG (1 KG = factor)
export const UNIT_FACTORS: Record<string, { factorToKG: number; labelEn: string; labelBn: string }> = {
  KG: { factorToKG: 1, labelEn: "Kilograms (KG)", labelBn: "কেজি" },
  MT: { factorToKG: 1000, labelEn: "Metric Tons (MT / Tons)", labelBn: "মেট্রিক টন" },
  Bags: { factorToKG: 50, labelEn: "50kg Bags", labelBn: "৫০ কেজি বস্তা" },
  Quintals: { factorToKG: 100, labelEn: "Quintals (100kg)", labelBn: "কুইন্টাল" },
  Lbs: { factorToKG: 0.453592, labelEn: "Pounds (lbs)", labelBn: "পাউন্ড" }
};

export function convertQuantity(qtyInKg: number, targetUnit: DisplayUnitMode | string): { value: number; unitLabel: string } {
  return ConversionManager.convertFromKg(qtyInKg, targetUnit);
}

export default function UnitConversionUtility({
  displayUnit,
  onSelectDisplayUnit,
  isBangla
}: UnitConversionUtilityProps) {
  const [calcQty, setCalcQty] = useState<number>(1000);
  const [fromUnit, setFromUnit] = useState<string>("KG");
  const [toUnit, setToUnit] = useState<string>("MT");
  const [showCalculator, setShowCalculator] = useState(false);

  // Compute live calculation using ConversionManager service
  const convertedResult = ConversionManager.convert(calcQty, fromUnit, toUnit);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono uppercase tracking-wider">
            {isBangla ? "একক রূপান্তর ও প্রদর্শন সেটিংস" : "Unit Conversion & Display Mode"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Interactive Calculator Toggle Button */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Calculator className="h-3.5 w-3.5 text-indigo-500" />
            <span>{isBangla ? "ক্যালকুলেটর" : "Quick Converter"}</span>
          </button>

          {/* Table Display Unit Mode Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
              {isBangla ? "প্রদর্শন:" : "View As:"}
            </span>
            {(["default", "MT", "Bags", "Quintals"] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => onSelectDisplayUnit(unit)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  displayUnit === unit
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {unit === "default" ? (isBangla ? "মূল (KG)" : "Raw KG") : unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Interactive Unit Converter */}
      {showCalculator && (
        <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-indigo-500/20 space-y-3 animate-in fade-in duration-200">
          <div className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>{isBangla ? "লাইভ কনভার্সন হিসাব" : "Dynamic Formula Calculation Matrix"}</span>
            <span className="text-slate-400">Predefined Rate: 1 MT = 1,000 KG | 1 Bag = 50 KG</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
            {/* Amount Input */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                {isBangla ? "পরিমাণ" : "Quantity"}
              </label>
              <input
                type="number"
                value={calcQty}
                onChange={(e) => setCalcQty(Number(e.target.value) || 0)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* From Unit */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                {isBangla ? "কোথা থেকে" : "From Unit"}
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {Object.entries(UNIT_FACTORS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {isBangla ? info.labelBn : info.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap indicator */}
            <div className="flex justify-center sm:pt-4">
              <button
                onClick={() => {
                  const temp = fromUnit;
                  setFromUnit(toUnit);
                  setToUnit(temp);
                }}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-indigo-500"
                title="Swap Units"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            {/* To Unit */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                {isBangla ? "কোন এককে" : "To Unit"}
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {Object.entries(UNIT_FACTORS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {isBangla ? info.labelBn : info.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Banner */}
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-between font-mono text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              {calcQty.toLocaleString()} {fromUnit} =
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {convertedResult.toLocaleString(undefined, { maximumFractionDigits: 3 })} {toUnit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
