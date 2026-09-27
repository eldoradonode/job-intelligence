'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Bucket {
  range: string
  count: number
  isHighMatch: boolean
}

interface Props {
  data: Bucket[]
}

export default function ScoreChart({ data }: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !data.length) return

    const W = ref.current.clientWidth || 600
    const H = 200
    const margin = { top: 10, right: 16, bottom: 36, left: 48 }
    const width = W - margin.left - margin.right
    const height = H - margin.top - margin.bottom

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', H)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.range))
      .range([0, width])
      .padding(0.25)

    const maxCount = d3.max(data, d => d.count) || 1
    const y = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height, 0])

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(y.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#2a2a28')
      .attr('stroke-width', 0.5)

    // Bars
    const tooltip = d3.select('body').append('div')
      .style('position', 'fixed')
      .style('background', 'var(--bg-elevated)')
      .style('border', '1px solid var(--border-default)')
      .style('border-radius', '6px')
      .style('padding', '6px 10px')
      .style('font-size', '12px')
      .style('color', 'var(--text-primary)')
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('z-index', '9999')

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.range) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', d => d.isHighMatch ? '#22c55e' : '#3b82f6')
      .attr('opacity', d => d.isHighMatch ? 0.85 : 0.45)
      .attr('rx', 2)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1)
        tooltip
          .style('display', 'block')
          .style('left', `${event.clientX + 10}px`)
          .style('top', `${event.clientY - 30}px`)
          .text(`Score ${d.range}: ${d.count} job${d.count !== 1 ? 's' : ''}`)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.clientX + 10}px`)
          .style('top', `${event.clientY - 30}px`)
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).attr('opacity', d.isHighMatch ? 0.85 : 0.45)
        tooltip.style('display', 'none')
      })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(ax => {
        ax.select('.domain').attr('stroke', '#2a2a28')
        ax.selectAll('text')
          .attr('fill', '#5a5a56')
          .attr('font-size', '10px')
          .attr('font-family', 'Inter, sans-serif')
          .attr('dy', '1.2em')
      })

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(0))
      .call(ax => {
        ax.select('.domain').remove()
        ax.selectAll('text')
          .attr('fill', '#5a5a56')
          .attr('font-size', '10px')
          .attr('font-family', 'Inter, sans-serif')
          .attr('dx', '-6px')
      })

    return () => { tooltip.remove() }
  }, [data])

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          Match score distribution
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
          Most roles score low — the tail above 80 is where to spend effort.
        </div>
      </div>
      <svg ref={ref} style={{ width: '100%', overflow: 'visible' }} />
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        {[
          { color: '#3b82f6', label: 'Below 80' },
          { color: '#22c55e', label: 'Strong match (80+)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: l.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        Hover a bar for counts
      </div>
    </div>
  )
}
