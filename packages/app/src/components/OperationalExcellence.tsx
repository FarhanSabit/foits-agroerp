import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Sparkles, Calendar, TrendingDown, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { ERPState } from "../types";

interface OperationalExcellenceProps {
  state: ERPState;
  isBangla: boolean;
  darkMode: boolean;
}

export default function OperationalExcellence({
  state,
  isBangla,
  darkMode
}: OperationalExcellenceProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "grain" | "packaging">("all");
  const funnelContainerRef = useRef<HTMLDivElement>(null);
  const trendContainerRef = useRef<HTMLDivElement>(null);

  // 1. Calculate active cycle times from current state:
  const pr = state.requisitions[0];
  const po = state.purchaseOrders[0];
  const rfq = state.rfqs[0];
  const grn = state.goodsReceipts[0];

  // We can calculate dynamic durations in days based on state dates, or fall back to realistic defaults if some steps aren't finished.
  const getDaysBetween = (d1Str: string, d2Str: string, defaultDays: number) => {
    try {
      const t1 = new Date(d1Str).getTime();
      const t2 = new Date(d2Str).getTime();
      if (isNaN(t1) || !t2 || isNaN(t2)) return defaultDays;
      const days = (t2 - t1) / (1000 * 60 * 60 * 24);
      return Math.max(0.2, parseFloat(days.toFixed(1)));
    } catch {
      return defaultDays;
    }
  };

  // Phase Durations for Current Golden Flow
  const phase1 = pr && rfq ? getDaysBetween(pr.requestedDate, rfq.issueDate, 0.2) : 0.2; // PR to RFQ
  const phase2 = rfq && po ? getDaysBetween(rfq.issueDate, po.orderDate, 1.0) : 1.0; // RFQ Bidding to Award
  const phase3 = pr && po ? getDaysBetween(pr.requestedDate, po.orderDate, 1.5) : 1.5; // PR to PO Approval
  const phase4 = po && grn ? getDaysBetween(po.orderDate, grn.receivedDate, 1.8) : 1.8; // PO to GRN Intake

  const funnelData = [
    {
      phase: isBangla ? "ধাপ ১: রিকুইজিশন থেকে আরএফকিউ" : "Phase 1: PR to RFQ Release",
      days: phase1,
      descEn: "Duration between PR submission by Factory GM & RFQ dispatch to bidders",
      descBn: "ফ্যাক্টরি জিএম দ্বারা পিআর পেশ এবং দরদাতাদের কাছে আরএফকিউ প্রেরণের মধ্যবর্তী সময়",
      color: "#6366f1"
    },
    {
      phase: isBangla ? "ধাপ ২: দরপত্র মূল্যায়ন ও নির্বাচন" : "Phase 2: Bid Evaluation & Award",
      days: phase2,
      descEn: "Suppliers submitting technical bids, SCM scoring, and commercial alignment",
      descBn: "সরবরাহকারীদের টেকনিক্যাল বিড প্রদান, এসসিএম স্কোরিং এবং বাণিজ্যিক সামঞ্জস্যকরণ",
      color: "#06b6d4"
    },
    {
      phase: isBangla ? "ধাপ ৩: পিও অনুমোদন ও সাইন-অফ" : "Phase 3: Fund Release & PO Signoff",
      days: phase3,
      descEn: "CFO budget check and SCM release authorization for procurement POs",
      descBn: "পিও-র জন্য সিএফও বাজেট চেক এবং এসসিএম রিলিজ অনুমোদন",
      color: "#8b5cf6"
    },
    {
      phase: isBangla ? "ধাপ ৪: ইনটেক ও জিআরএন রিসিভ" : "Phase 4: Logistic Transit & GRN Inflow",
      days: phase4,
      descEn: "Supplier manufacturing, transit dispatch, port clearance, and warehouse GRN entry",
      descBn: "সরবরাহকারী উৎপাদন, ট্রানজিট ডিসপ্যাচ, পোর্ট ক্লিয়ারেন্স এবং গুদাম জিআরএন এন্ট্রি",
      color: "#ec4899"
    }
  ];

  // Total Cycle Time (Sum of phases)
  const totalCycleTime = parseFloat((phase1 + phase2 + phase3 + phase4).toFixed(1));

  // Historical data for SCM Lead Times trend
  const historicalTrendData = [
    { month: "Jan", all: 11.2, grain: 12.5, packaging: 8.5 },
    { month: "Feb", all: 9.8, grain: 11.0, packaging: 7.2 },
    { month: "Mar", all: 8.4, grain: 9.5, packaging: 6.0 },
    { month: "Apr", all: 6.9, grain: 7.8, packaging: 5.1 },
    { month: "May", all: 5.2, grain: 5.9, packaging: 4.3 },
    { month: "Jun/Jul", all: totalCycleTime, grain: parseFloat((totalCycleTime * 1.1).toFixed(1)), packaging: parseFloat((totalCycleTime * 0.8).toFixed(1)) }
  ];

  // Draw Chart 1: Funnel / Horizontal Bar Chart
  useEffect(() => {
    if (!funnelContainerRef.current) return;

    // Clean up past SVGs
    d3.select(funnelContainerRef.current).selectAll("svg").remove();

    const containerWidth = funnelContainerRef.current.clientWidth || 500;
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 40, left: 180 };
    const width = containerWidth - margin.left - margin.right;

    const svg = d3
      .select(funnelContainerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale (Days)
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(funnelData, (d) => d.days) as number * 1.2])
      .range([0, width]);

    // Y scale (Phases)
    const y = d3
      .scaleBand()
      .domain(funnelData.map((d) => d.phase))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.3);

    // Axes
    const xAxis = d3
      .axisBottom(x)
      .ticks(6)
      .tickFormat((d) => `${d}d`);

    const yAxis = d3.axisLeft(y).tickSize(0);

    // Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3 3")
      .style("stroke", darkMode ? "#334155" : "#cbd5e1")
      .style("opacity", 0.4);

    // Render Bars
    const bars = svg
      .selectAll(".bar")
      .data(funnelData)
      .enter()
      .append("g");

    bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.phase) as number)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", 0) // Start at 0 for animation transition
      .attr("rx", 6)
      .attr("fill", (d) => d.color)
      .transition()
      .duration(800)
      .attr("width", (d) => x(d.days));

    // Value Labels on Bars
    bars
      .append("text")
      .attr("x", (d) => x(d.days) + 8)
      .attr("y", (d) => (y(d.phase) as number) + y.bandwidth() / 2 + 4)
      .attr("fill", darkMode ? "#cbd5e1" : "#1e293b")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text((d) => `${d.days} Days`);

    // Render Y Axis Labels
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", darkMode ? "#94a3b8" : "#475569");

    // Render X Axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", darkMode ? "#64748b" : "#475569");

    // Clean up classes
    svg.selectAll(".domain").style("stroke", darkMode ? "#475569" : "#cbd5e1");
    svg.selectAll(".tick line").style("stroke", darkMode ? "#475569" : "#cbd5e1");

  }, [isBangla, darkMode, phase1, phase2, phase3, phase4]);

  // Draw Chart 2: Historical SCM Cycle Time Line Chart
  useEffect(() => {
    if (!trendContainerRef.current) return;

    // Clean up
    d3.select(trendContainerRef.current).selectAll("svg").remove();

    const containerWidth = trendContainerRef.current.clientWidth || 500;
    const height = 280;
    const margin = { top: 30, right: 40, bottom: 40, left: 50 };
    const width = containerWidth - margin.left - margin.right;

    const svg = d3
      .select(trendContainerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale (Months)
    const x = d3
      .scalePoint()
      .domain(historicalTrendData.map((d) => d.month))
      .range([0, width]);

    // Y scale (Days)
    const y = d3
      .scaleLinear()
      .domain([0, 15]) // max is around 12.5 days
      .range([height - margin.top - margin.bottom, 0]);

    // Axis
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(6).tickFormat((d) => `${d}d`);

    // Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3 3")
      .style("stroke", darkMode ? "#334155" : "#cbd5e1")
      .style("opacity", 0.4);

    // Line Generator
    const line = d3
      .line<any>()
      .x((d) => x(d.month) as number)
      .y((d) => y(d[activeCategory]) as number)
      .curve(d3.curveMonotoneX);

    // Render Line Path
    const path = svg
      .append("path")
      .datum(historicalTrendData)
      .attr("fill", "none")
      .attr("stroke", activeCategory === "all" ? "#6366f1" : activeCategory === "grain" ? "#10b981" : "#ec4899")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    // Render Nodes/Circles on Line
    svg
      .selectAll(".dot")
      .data(historicalTrendData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.month) as number)
      .attr("cy", (d) => y(d[activeCategory]) as number)
      .attr("r", 0)
      .attr("fill", darkMode ? "#070a13" : "#ffffff")
      .attr("stroke", activeCategory === "all" ? "#6366f1" : activeCategory === "grain" ? "#10b981" : "#ec4899")
      .attr("stroke-width", 2.5)
      .transition()
      .delay(400)
      .duration(400)
      .attr("r", 5.5);

    // Tooltips on nodes hover (simple SVG title fallback + visual scaling)
    svg
      .selectAll(".dot")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 8);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 5.5);
      })
      .append("title")
      .text((d: any) => `${d.month}: ${d[activeCategory]} Days`);

    // Render Axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", darkMode ? "#64748b" : "#475569");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", darkMode ? "#64748b" : "#475569");

    // Clean up domain styling
    svg.selectAll(".domain").style("stroke", darkMode ? "#475569" : "#cbd5e1");
    svg.selectAll(".tick line").style("stroke", darkMode ? "#475569" : "#cbd5e1");

  }, [activeCategory, darkMode, totalCycleTime]);

  // ResponsiveResize observer trigger
  useEffect(() => {
    const handleResize = () => {
      // Just re-triggers rendering since layout widths are read inside useEffect
      setActiveCategory((prev) => prev);
    };

    const observer = new ResizeObserver(handleResize);
    if (funnelContainerRef.current) observer.observe(funnelContainerRef.current);
    if (trendContainerRef.current) observer.observe(trendContainerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            {isBangla ? "কার্যকরী উৎকর্ষ ও লিড-টাইম এনালাইসিস" : "Operational Excellence & Cycle-Time Auditing"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBangla
              ? "ক্রয় রিকুইজিশন (PR) থেকে পিও (PO) অনুমোদন এবং মালপ্রাপ্তি ট্র্যাক করুন"
              : "Analyze and optimize procure-to-pay (P2P) cycle bottleneck times with mathematical clarity"}
          </p>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {isBangla ? "মোট সিসিটি লিড-টাইম" : "TOTAL LEAD-TIME"}
            </span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {totalCycleTime} Days
            </span>
            <p className="text-[10px] text-emerald-650 dark:text-emerald-400 mt-1 font-mono flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isBangla ? "বিশ্বমানের বেঞ্চমার্ক লক্ষ্য: <৫ দিন" : "World-Class: <5.0 Days"}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {isBangla ? "লিড-টাইম হ্রাস" : "SPEED IMPROVEMENT"}
            </span>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              -59.8%
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {isBangla ? "জানুয়ারি মাস থেকে তুলনা" : "Reduced from 11.2 Days in Jan"}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {isBangla ? "সবচেয়ে দীর্ঘতম ধাপ" : "P2P BOTTLENECK"}
            </span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="mt-2">
            <span className="text-md font-bold text-slate-800 dark:text-white tracking-tight">
              {isBangla ? "ধাপ ৪: ট্রানজিট রিসিভিং" : "Transit GRN Receiving"}
            </span>
            <p className="text-[10px] text-rose-500 mt-1 font-mono font-bold">
              Avg {phase4} Days
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {isBangla ? "ওসিআর ম্যাচ রেট" : "AUTOMATED MATCH RATE"}
            </span>
            <Calendar className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 tracking-tight">
              98.4%
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {isBangla ? "স্মার্ট ওসিআর ইনভয়েস ভেরিফাইড" : "Verified & Linked invoices"}
            </p>
          </div>
        </div>

      </div>

      {/* D3 Chart Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Funnel chart card */}
        <div className="glass-card p-5">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "বাস্তব-সময় সরবরাহ চেইন ধাপ সময় (D3.js)" : "Real-time Supply Chain Phase Lead-times"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Horizontal bar chart mapping exact days required for each operational phase
              </p>
            </div>
          </div>
          
          {/* SVG Canvas Container */}
          <div ref={funnelContainerRef} className="w-full h-72 flex items-center justify-center relative overflow-hidden bg-white/20 dark:bg-white/[0.01] rounded-xl border border-slate-200/50 dark:border-white/5">
            {/* D3 injects SVG here */}
          </div>
        </div>

        {/* Trend line chart card */}
        <div className="glass-card p-5">
          <div className="border-b border-slate-200/50 dark:border-white/10 pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isBangla ? "৬ মাসের লিড-টাইম হ্রাস প্রবণতা (D3.js)" : "6-Month Lead-Time Reduction Trend"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Continuous line-chart mapping historical average P2P days
              </p>
            </div>
            
            {/* Category Filter Toggles */}
            <div className="bg-white/45 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-1 rounded-lg flex items-center gap-1 shrink-0">
              {(["all", "grain", "packaging"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                  }`}
                >
                  {cat === "all" ? (isBangla ? "সব" : "All") : cat === "grain" ? (isBangla ? "শস্য" : "Grain") : (isBangla ? "প্যাকেজ" : "Pack")}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div ref={trendContainerRef} className="w-full h-72 flex items-center justify-center relative overflow-hidden bg-white/20 dark:bg-white/[0.01] rounded-xl border border-slate-200/50 dark:border-white/5">
            {/* D3 injects SVG here */}
          </div>
        </div>

      </div>

      {/* Operational Bottleneck Auditing details */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white font-mono tracking-widest uppercase mb-3">
          {isBangla ? "ধাপ ভিত্তিক বিশ্লেষণ ও অপারেশনাল সমাধান" : "P2P BOTTLENECK AUDITING & SCM REMEDIATIONS"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnelData.map((d, i) => (
            <div key={i} className="p-3 bg-white/30 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded-xl flex gap-3 items-start">
              <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0 mt-0.5" style={{ backgroundColor: d.color }}>
                {i + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.phase}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isBangla ? d.descBn : d.descEn}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono font-bold text-slate-400">
                  <span>Cycle Target:</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {i === 0 ? "0.5 Days" : i === 1 ? "1.5 Days" : i === 2 ? "1.0 Days" : "2.0 Days"}
                  </span>
                  <span>|</span>
                  <span>Actual:</span>
                  <span className={d.days > (i === 0 ? 0.5 : i === 1 ? 1.5 : i === 2 ? 1.0 : 2.0) ? "text-rose-500" : "text-emerald-500"}>
                    {d.days} Days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
