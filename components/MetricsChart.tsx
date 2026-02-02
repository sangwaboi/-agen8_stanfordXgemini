import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ExecutionLog } from '../types';

interface MetricsChartProps {
  logs: Record<string, ExecutionLog>;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ logs }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Convert logs to array only for completed items
  const data = (Object.values(logs) as ExecutionLog[])
    .filter(l => l.status === 'success' && l.endTime && l.startTime)
    .map(l => ({
      id: l.nodeId,
      duration: (l.endTime! - l.startTime!) / 1000 // seconds
    }));

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 300;
    const height = 150;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const x = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.2)
      .domain(data.map(d => d.id));

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, d3.max(data, d => d.duration) || 1]);

    // Bars
    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.id) || 0)
      .attr("y", d => y(d.duration))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.duration))
      .attr("fill", "#3b82f6")
      .attr("rx", 4);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-15)")
      .style("text-anchor", "end")
      .style("fill", "#94a3b8")
      .style("font-size", "10px");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4))
      .selectAll("text")
      .style("fill", "#64748b")
      .style("font-size", "10px");
      
    // Y Axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + 10)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#64748b")
      .style("font-size", "10px")
      .text("Duration (s)");

  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="mt-8 p-4 bg-slate-900/30 rounded-lg border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Performance Metrics</h4>
        <div className="flex justify-center">
            <svg ref={svgRef} width={300} height={150} />
        </div>
    </div>
  );
};

export default MetricsChart;