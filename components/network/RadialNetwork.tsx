'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface CategoryArc {
  id: string
  label: string
  color: string
  startAngle?: number
  endAngle?: number
}

const ARC_DEFS: CategoryArc[] = [
  { id: 'watching',           label: 'WATCHING',           color: '#3b82f6' },
  { id: 'remote_global',      label: 'REMOTE — GLOBAL',   color: '#06b6d4' },
  { id: 'remote_emea',        label: 'REMOTE — EMEA',     color: '#a78bfa' },
  { id: 'remote_apac',        label: 'REMOTE — APAC',     color: '#10b981' },
  { id: 'high_match',         label: 'HIGH MATCH 80+',    color: '#22c55e' },
  { id: 'outreach_drafted',   label: 'OUTREACH DRAFTED',  color: '#f59e0b' },
  { id: 'applied',            label: 'APPLIED',           color: '#8b5cf6' },
  { id: 'below_threshold',    label: 'BELOW THRESHOLD',   color: '#64748b' },
  { id: 'country_restricted', label: 'NOT ELIGIBLE',      color: '#ef4444' },
  { id: 'remote_us_canada',   label: 'US / CANADA',       color: '#0891b2' },
]

export default function RadialNetwork() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 900
    const height = 900
    const cx = width / 2
    const cy = height / 2

    const R_ARC_INNER = 380
    const R_ARC_OUTER = 398
    const R_ARC_LABEL = 412

    const root = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${cx}, ${cy})`)

    const count = ARC_DEFS.length
    const gap = 0.04
    const sweep = (Math.PI * 2 - gap * count) / count
    let cursor = 0

    const arcs = ARC_DEFS.map((def) => {
      const startAngle = cursor
      const endAngle = cursor + sweep
      cursor = endAngle + gap
      return { ...def, startAngle, endAngle }
    })

    const defs = root.append('defs')
    arcs.forEach((arc) => {
      const r = R_ARC_LABEL
      const mathStart = arc.startAngle - Math.PI / 2
      const mathEnd = arc.endAngle - Math.PI / 2
      const midAngle = (mathStart + mathEnd) / 2
      const isBottomHalf = Math.sin(midAngle) > 0

      const startA = isBottomHalf ? mathEnd : mathStart
      const endA = isBottomHalf ? mathStart : mathEnd

      const x1 = Math.cos(startA) * r
      const y1 = Math.sin(startA) * r
      const x2 = Math.cos(endA) * r
      const y2 = Math.sin(endA) * r

      const sweepFlag = isBottomHalf ? 0 : 1

      defs
        .append('path')
        .attr('id', `arcpath-${arc.id}`)
        .attr('d', `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweepFlag} ${x2} ${y2}`)
    })

    const arcGen = d3
      .arc<CategoryArc>()
      .innerRadius(R_ARC_INNER)
      .outerRadius(R_ARC_OUTER)
      .startAngle((d) => d.startAngle!)
      .endAngle((d) => d.endAngle!)
      .cornerRadius(3)

    root
      .selectAll('.category-arc')
      .data(arcs)
      .enter()
      .append('path')
      .attr('class', 'category-arc')
      .attr('d', (d) => arcGen(d)!)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.85)

    arcs.forEach((arc) => {
      root
        .append('text')
        .attr('font-size', '8.5px')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', '600')
        .attr('letter-spacing', '0.08em')
        .attr('fill', arc.color)
        .append('textPath')
        .attr('href', `#arcpath-${arc.id}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text(arc.label)
    })

  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <svg ref={svgRef} className="w-full max-w-[900px] h-auto" />
    </div>
  )
}
