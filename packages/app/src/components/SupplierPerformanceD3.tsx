import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface SupplierPerformanceData {
  supplier: string;
  leadTimeVariance: number; // in days
  qualityScore: number; // 0-100
  month: string;
}

interface SupplierPerformanceD3Props {
  data: SupplierPerformanceData[];
  isBangla: boolean;
  darkMode?: boolean;
}

export const SupplierPerformanceD3: React.FC<SupplierPerformanceD3Props> = ({ data, isBangla, darkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis: Month
    const x = d3.scalePoint()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.5);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr("color", darkMode ? "#94a3b8" : "#475569");

    // Y axis: Lead Time Variance (Left)
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(data, (d: SupplierPerformanceData) => d.leadTimeVariance) as number || 10])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(yLeft))
      .attr("color", "#6366f1");

    // Y axis: Quality Score (Right)
    const yRight = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yRight))
      .attr("color", "#10b981");

    // Axis labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#6366f1")
      .style("font-size", "12px")
      .text(isBangla ? "লিড টাইম বৈচিত্র্য (দিন)" : "Lead Time Variance (Days)");

    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", width + 45) // Fixed: was -width - 45
      .attr("x", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#10b981")
      .style("font-size", "12px")
      .text(isBangla ? "গুণমান স্কোর (%)" : "Quality Score (%)");

    // Lines
    const lineLeadTime = d3.line<SupplierPerformanceData>()
      .x(d => x(d.month)!)
      .y(d => yLeft(d.leadTimeVariance));

    const lineQuality = d3.line<SupplierPerformanceData>()
      .x(d => x(d.month)!)
      .y(d => yRight(d.qualityScore));

    // Groups by supplier
    const suppliers = Array.from(new Set(data.map(d => d.supplier))) as string[];

    suppliers.forEach((s: string) => {
      const supplierData = data.filter(d => d.supplier === s);

      // Lead Time Line
      svg.append("path")
        .datum(supplierData)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("d", lineLeadTime)
        .style("opacity", 0.6);

      // Quality Score Line
      svg.append("path")
        .datum(supplierData)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("d", lineQuality)
        .style("opacity", 0.6);

      // Add dots
      svg.selectAll(`.dot-lead-${s.replace(/\s+/g, '-')}`)
        .data(supplierData)
        .enter()
        .append("circle")
        .attr("cx", (d: any) => x(d.month)!)
        .attr("cy", (d: any) => yLeft(d.leadTimeVariance))
        .attr("r", 4)
        .attr("fill", "#6366f1");

      svg.selectAll(`.dot-quality-${s.replace(/\s+/g, '-')}`)
        .data(supplierData)
        .enter()
        .append("circle")
        .attr("cx", (d: any) => x(d.month)!)
        .attr("cy", (d: any) => yRight(d.qualityScore))
        .attr("r", 4)
        .attr("fill", "#10b981");
    });

  }, [data, isBangla, darkMode]);

  return (
    <div className="w-full overflow-x-auto bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
      <svg ref={svgRef} className="mx-auto" />
    </div>
  );
};
