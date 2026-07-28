import React from "react";
import { motion } from "motion/react";

interface ZoneData {
  id: string;
  nameEn: string;
  nameBn: string;
  capacity: number; // 0-100
  items: number;
  temp: string;
}

interface WarehouseHeatmapProps {
  isBangla: boolean;
}

const zones: ZoneData[] = [
  { id: "A1", nameEn: "Zone A1 - Cold Storage", nameBn: "জোন এ১ - কোল্ড স্টোরেজ", capacity: 85, items: 1200, temp: "4°C" },
  { id: "A2", nameEn: "Zone A2 - Grains", nameBn: "জোন এ২ - শস্য", capacity: 45, items: 3400, temp: "22°C" },
  { id: "B1", nameEn: "Zone B1 - Packaging", nameBn: "জোন বি১ - প্যাকেজিং", capacity: 12, items: 450, temp: "25°C" },
  { id: "B2", nameEn: "Zone B2 - Chemicals", nameBn: "জোন বি২ - রাসায়নিক", capacity: 68, items: 890, temp: "18°C" },
  { id: "C1", nameEn: "Zone C1 - Equipment", nameBn: "জোন সি১ - সরঞ্জাম", capacity: 92, items: 150, temp: "24°C" },
  { id: "C2", nameEn: "Zone C2 - Buffer", nameBn: "জোন সি২ - বাফার", capacity: 5, items: 100, temp: "23°C" },
];

export const WarehouseHeatmap: React.FC<WarehouseHeatmapProps> = ({ isBangla }) => {
  const getColor = (capacity: number) => {
    if (capacity > 80) return "bg-rose-500 shadow-rose-500/20";
    if (capacity > 50) return "bg-amber-500 shadow-amber-500/20";
    return "bg-emerald-500 shadow-emerald-500/20";
  };

  return (
    <div className="p-6 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {isBangla ? "গুদাম সক্ষমতা হিটম্যাপ" : "Warehouse Capacity Heatmap"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            {isBangla ? "জোন ভিত্তিক ব্যবহারের রিয়েল-টাইম চিত্র" : "Real-time visualization of zone-wise utilization"}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Mid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Full</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <motion.div
            key={zone.id}
            whileHover={{ scale: 1.02 }}
            className="relative group p-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-800/50 overflow-hidden cursor-help"
          >
            {/* Heat Indicator Background Overlay */}
            <div 
              className={`absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 ${getColor(zone.capacity)}`}
              style={{ height: `${zone.capacity}%`, top: `${100 - zone.capacity}%` }}
            ></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                  {zone.id}
                </span>
                <span className={`text-xs font-mono font-bold ${
                  zone.capacity > 80 ? "text-rose-600 dark:text-rose-400" : 
                  zone.capacity > 50 ? "text-amber-600 dark:text-amber-400" : 
                  "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {zone.capacity}%
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 truncate">
                {isBangla ? zone.nameBn : zone.nameEn}
              </h4>

              <div className="flex items-center justify-between mt-4">
                <div className="text-[10px] text-slate-500 font-mono">
                  <p>{isBangla ? "আইটেম:" : "Items:"} <span className="font-bold text-slate-700 dark:text-slate-300">{zone.items}</span></p>
                </div>
                <div className="text-[10px] text-slate-500 font-mono text-right">
                  <p>{isBangla ? "তাপমাত্রা:" : "Temp:"} <span className="font-bold text-slate-700 dark:text-slate-300">{zone.temp}</span></p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.capacity}%` }}
                  className={`h-full rounded-full ${getColor(zone.capacity)}`}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
