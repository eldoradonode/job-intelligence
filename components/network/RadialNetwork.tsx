"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function RadialNetwork() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous renders
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 800;
    const radius = width / 2;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "width: 100%; height: auto; overflow: visible;")
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    // Add Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
      });

    d3.select(svgRef.current as any).call(zoom);

    // Dummy mock nodes & links for visual graph
    const nodes = [
      { id: "You", group: "center", radius: 0 },
      ...Array.from({ length: 80 }, (_, i) => ({
        id: `node_${i}`,
        group: i % 3 === 0 ? "company" : i % 2 === 0 ? "job" : "contact",
        radius: 150 + (i % 3) * 80,
        angle: (i / 80) * 2 * Math.PI,
      })),
    ];

    const links = nodes.slice(1).map((node) => ({
      source: nodes[0],
      target: node,
    }));

    // Draw high-visibility curved connection wires
    svg
      .append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", (d: any) => {
        const targetX = d.target.radius * Math.cos(d.target.angle);
        const targetY = d.target.radius * Math.sin(d.target.angle);
        return `M 0,0 Q ${targetX * 0.5} ${targetY * 0.5} ${targetX} ${targetY}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#38bdf8") // Bright cyan wires
      .attr("stroke-width", "1.2")
      .attr("stroke-opacity", "0.45"); // High visibility against dark background

    // Outer rings
    [150, 230, 310].map((r) =>
      svg
        .append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#334155")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-opacity", "0.6")
    );

    // Render Nodes
    svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => (d.radius ? d.radius * Math.cos(d.angle) : 0))
      .attr("cy", (d: any) => (d.radius ? d.radius * Math.sin(d.angle) : 0))
      .attr("r", (d: any) => (d.id === "You" ? 18 : 5))
      .attr("fill", (d: any) =>
        d.id === "You"
          ? "#ffffff"
          : d.group === "company"
          ? "#a855f7"
          : d.group === "job"
          ? "#22c55e"
          : "#eab308"
      )
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2);

    // Center node label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#0f172a")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text("You");
  }, []);

  return (
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-[#0b0f19] p-4">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
