"use client";
'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { Job, Connection, Company } from '@/types'
import { scoreColor } from '@/lib/utils'

interface Props {
  jobs: Job[]
  connections: Connection[]
  companies: Company[]
  selectedId: string | null
  onSelect: (id: string, type: 'job' | 'company' | 'connection') => void
  filterRegion: string | null
  filterStatus: string | null
  filterMinScore: number
}

// ── Layout constants ────────────────────────────────────────────────────────
const W = 900
const H = 960
const CX = W / 2
const CY = 480

// Radial distances
const R_YOU        = 14   // center YOU node
const R_COMPANY    = 120  // company nodes (inner ring)
const R_JOB        = 210  // job nodes (middle ring)
const R_CONNECTION = 295  // connection nodes (outer ring)
const R_ARC_INNER  = 320  // arc band inner edge
const R_ARC_OUTER  = 345  // arc band outer edge
const R_ARC_LABEL  = 360  // curved text label radius

// Arc segment definitions — these are the category arcs around the outside
// Each covers a slice of the full circle, like Cosmere's world arcs
const ARC_DEFS = [
  { id: 'remote_global',    label: 'REMOTE — GLOBAL',    color: '#3b82f6', span: 0.18 },
  { id: 'remote_emea',      label: 'REMOTE — EMEA',       color: '#8b5cf6', span: 0.12 },
  { id: 'remote_us_canada', label: 'REMOTE — US/CANADA',  color: '#06b6d4', span: 0.12 },
  { id: 'remote_apac',      label: 'REMOTE — APAC',       color: '#10b981', span: 0.10 },
  { id: 'high_match',       label: 'HIGH MATCH 80+',      color: '#22c55e', span: 0.14 },
  { id: 'outreach_drafted', label: 'OUTREACH DRAFTED',    color: '#f59e0b', span: 0.14 },
  { id: 'applied',          label: 'APPLIED',              color: '#8b5cf6', span: 0.10 },
  { id: 'watching',         label: 'WATCHING',             color: '#3b82f6', span: 0.10 },
]

// Compute arc start/end angles from spans (they sum to 1.0)
function buildArcs() {
  let cursor = -Math.PI / 2  // start at top
  return ARC_DEFS.map(def => {
    const sweep = def.span * Math.PI * 2
    const start = cursor
    const end   = cursor + sweep
    cursor = end + 0.04 // small gap between arcs
    return { ...def, startAngle: start, endAngle: end }
  })
}

type ArcDef = ReturnType<typeof buildArcs>[0]

// Which arc segment does a job belong to?
function jobArcId(job: Job): string {
  if (job.status === 'outreach_drafted') return 'outreach_drafted'
  if (job.status === 'applied')          return 'applied'
  if ((job.match_score || 0) >= 80)     return 'high_match'
  if (job.status === 'watching')         return 'watching'
  if (job.region === 'remote_emea')      return 'remote_emea'
  if (job.region === 'remote_us_canada') return 'remote_us_canada'
  if (job.region === 'remote_apac')      return 'remote_apac'
  return 'remote_global'
}

interface NodeDatum {
  id: string
  type: 'you' | 'company' | 'job' | 'connection'
  label: string
  angle: number   // radians from center
  radius: number
  x: number
  y: number
  score?: number | null
  status?: string
  relationship?: string
  data?: Job | Company | Connection
}

interface LinkDatum {
  sx: number; sy: number
  tx: number; ty: number
  color: string
  dashed: boolean
  curved: boolean  // cross-connections curve through center
}


  const handleGenerateOutreach = async (jobId: string, connectionId?: string) => {
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, connection_id: connectionId }),
      });
      const data = await res.json();
      console.log('n8n Webhook Triggered:', data);
    } catch (err) {
      console.error('Failed to trigger outreach webhook:', err);
    }
  };

export default function RadialNetwork({
  jobs = [], connections = [], companies = [], selectedId,
  onSelect, filterRegion, filterStatus, filterMinScore = 0,
}: Props) {
  const svgRef    = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width',  '100%')
      .attr('height', '100%')

    // ── Zoom / pan ──────────────────────────────────────────
    const root = svg.append('g')
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on('zoom', (event: any) => root.attr('transform', event.transform.toString()))
    )

    // ── Filter ──────────────────────────────────────────────
    const visibleJobs = jobs.filter(j => {
      if (j.status === 'archived') return false
      if (filterMinScore && (j.match_score || 0) < filterMinScore) return false
      if (filterStatus  && j.status !== filterStatus) return false
      if (filterRegion  && j.region !== filterRegion) return false
      return true
    })

    const visibleCompanyIds   = new Set(visibleJobs.map(j => j.company_id))
    const visibleCompanies    = companies.filter(c => visibleCompanyIds.has(c.id))
    const visibleConnections  = connections.filter(c => c.company_id && visibleCompanyIds.has(c.company_id))

    const arcs = buildArcs()
    const arcByIdMap = new Map(arcs.map(a => [a.id, a]))

    // ── Defs: arc paths for textPath labels ─────────────────
    const defs = root.append('defs')
    arcs.forEach(arc => {
      // Arc path for text-along-path
      const r = R_ARC_LABEL
      const x1 = CX + Math.cos(arc.startAngle) * r
      const y1 = CY + Math.sin(arc.startAngle) * r
      const x2 = CX + Math.cos(arc.endAngle) * r
      const y2 = CY + Math.sin(arc.endAngle) * r
      const large = arc.endAngle - arc.startAngle > Math.PI ? 1 : 0
      defs.append('path')
        .attr('id', `arcpath-${arc.id}`)
        .attr('d', `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`)
    })

    // ── Draw arc bands ──────────────────────────────────────
    const arcGen = d3.arc<ArcDef>()
      .innerRadius(R_ARC_INNER)
      .outerRadius(R_ARC_OUTER)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .padAngle(0.025)
      .cornerRadius(2)

    const arcG = root.append('g').attr('transform', `translate(${CX},${CY})`)

    arcG.selectAll('path.arc-band')
      .data(arcs)
      .join('path')
      .attr('class', 'arc-band')
      .attr('d', d => arcGen(d) || '')
      .attr('fill',         d => d.color + '22')
      .attr('stroke',       d => d.color)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)

    // ── Curved arc labels (textPath) ────────────────────────
    arcs.forEach(arc => {
      root.append('text')
        .attr('font-size',      '8.5px')
        .attr('font-family',    'Inter, sans-serif')
        .attr('font-weight',    '500')
        .attr('letter-spacing', '0.12em')
        .attr('fill',           arc.color)
        .append('textPath')
        .attr('href',       `#arcpath-${arc.id}`)
        .attr('startOffset', '10%')
        .text(arc.label)
    })

    // ── Orbit rings (subtle dashed circles) ─────────────────
    ;[R_COMPANY, R_JOB, R_CONNECTION].forEach((r, i) => {
      root.append('circle')
        .attr('cx', CX).attr('cy', CY).attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#222220')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', i === 0 ? '2 6' : i === 1 ? '1.5 5' : '1 4')
    })

    // ── Build node positions ─────────────────────────────────
    // Strategy: group jobs by their arc segment, place along that arc's angle range.
    // Companies are placed at the midpoint of their jobs' angles.
    // Connections are placed just outside the job they relate to.

    const jobNodes:        NodeDatum[] = []
    const companyNodes:    NodeDatum[] = []
    const connectionNodes: NodeDatum[] = []
    const links:           LinkDatum[] = []

    // 1. Assign each job to its arc and compute angle within arc
    const jobsByArc = new Map<string, Job[]>()
    for (const arc of arcs) jobsByArc.set(arc.id, [])
    for (const job of visibleJobs) {
      const arcId = jobArcId(job)
      jobsByArc.get(arcId)?.push(job)
    }

    const jobAngleMap   = new Map<string, number>()
    const jobPosMap     = new Map<string, { x: number; y: number }>()
    const companyAngles = new Map<string, number[]>()

    for (const arc of arcs) {
      const arcJobs = jobsByArc.get(arc.id) || []
      if (!arcJobs.length) continue

      const span = arc.endAngle - arc.startAngle - 0.05
      arcJobs.forEach((job, i) => {
        const t      = arcJobs.length === 1 ? 0.5 : i / (arcJobs.length - 1)
        const angle  = arc.startAngle + 0.025 + t * span
        const x      = CX + Math.cos(angle) * R_JOB
        const y      = CY + Math.sin(angle) * R_JOB

        jobAngleMap.set(job.id, angle)
        jobPosMap.set(job.id,   { x, y })

        // Track angles per company for company node placement
        const angles = companyAngles.get(job.company_id) || []
        angles.push(angle)
        companyAngles.set(job.company_id, angles)

        // Determine node color
        let stroke    = '#4b5563'
        let fillColor = '#111110'
        const score   = job.match_score

        if (job.status === 'outreach_drafted') {
          fillColor = '#1c0a05'; stroke = '#f97316'
        } else if (score && score >= 80) {
          fillColor = '#041A0A'; stroke = '#22c55e'
        } else if (score && score >= 65) {
          fillColor = '#1c1408'; stroke = '#f59e0b'
        }

        jobNodes.push({
          id: job.id, type: 'job', label: job.title,
          angle, radius: R_JOB, x, y,
          score: job.match_score,
          status: job.status,
          data: job,
        })
      })
    }

    // 2. Company nodes — average angle of their jobs
    const companyAngleMap = new Map<string, number>()
    for (const co of visibleCompanies) {
      const angles = companyAngles.get(co.id)
      if (!angles?.length) continue
      const avg = angles.reduce((s, a) => s + a, 0) / angles.length
      companyAngleMap.set(co.id, avg)
      const x = CX + Math.cos(avg) * R_COMPANY
      const y = CY + Math.sin(avg) * R_COMPANY
      companyNodes.push({
        id: co.id, type: 'company', label: co.name,
        angle: avg, radius: R_COMPANY, x, y,
        data: co,
      })
      // You → Company spoke
      links.push({ sx: CX, sy: CY, tx: x, ty: y, color: '#1e1e1c', dashed: false, curved: false })
    }

    // 3. Job → Company spokes
    for (const jn of jobNodes) {
      const job     = jn.data as Job
      const coAngle = companyAngleMap.get(job.company_id)
      if (coAngle === undefined) continue
      const cx2 = CX + Math.cos(coAngle) * R_COMPANY
      const cy2 = CY + Math.sin(coAngle) * R_COMPANY
      links.push({ sx: cx2, sy: cy2, tx: jn.x, ty: jn.y, color: '#1a1a18', dashed: false, curved: false })
    }

    // 4. Connections — placed just beyond their related jobs
    const usedConnectionAngles: number[] = []
    let ciGlobal = 0
    for (const cn of visibleConnections) {
      if (!cn.company_id) continue
      const coAngle = companyAngleMap.get(cn.company_id)
      if (coAngle === undefined) continue

      // Offset each connection slightly to avoid overlap
      const offset  = ((ciGlobal % 3) - 1) * 0.08
      const angle   = coAngle + offset
      const x       = CX + Math.cos(angle) * R_CONNECTION
      const y       = CY + Math.sin(angle) * R_CONNECTION
      ciGlobal++

      const relColor = {
        strong: '#2dd4bf',
        warm:   '#f59e0b',
        cold:   '#6b7280',
        unknown:'#374151',
      }[cn.relationship] || '#6b7280'

      // Job → Connection line (to nearest job of that company)
      const coJobAngles = companyAngles.get(cn.company_id) || []
      if (coJobAngles.length) {
        const nearestAngle = coJobAngles.reduce((a, b) => Math.abs(b - angle) < Math.abs(a - angle) ? b : a)
        const jp = Array.from(jobPosMap.entries()).find(([id]) => {
          const job = visibleJobs.find(j => j.id === id)
          return job?.company_id === cn.company_id && Math.abs((jobAngleMap.get(id) || 0) - nearestAngle) < 0.01
        })
        if (jp) {
          links.push({ sx: jp[1].x, sy: jp[1].y, tx: x, ty: y, color: '#1a2a1a', dashed: true, curved: false })
        }
      }

      connectionNodes.push({
        id: cn.id, type: 'connection', label: cn.name,
        angle, radius: R_CONNECTION, x, y,
        relationship: cn.relationship,
        data: cn,
      })
    }

    // 5. Cross-connections — jobs that share a company draw a curved arc through center
    // (This is the Cosmere "cross-lines" effect)
    const companyJobPairs = new Map<string, NodeDatum[]>()
    for (const jn of jobNodes) {
      const job  = jn.data as Job
      const arr  = companyJobPairs.get(job.company_id) || []
      arr.push(jn)
      companyJobPairs.set(job.company_id, arr)
    }
    companyJobPairs.forEach(jnodes => {
      if (jnodes.length < 2) return
      for (let i = 0; i < jnodes.length - 1; i++) {
        const a = jnodes[i]
        const b = jnodes[i + 1]
        links.push({ sx: a.x, sy: a.y, tx: b.x, ty: b.y, color: '#2a2a28', dashed: false, curved: true })
      }
    })

    // ── Draw spokes / links ──────────────────────────────────
    const linkG = root.append('g').attr('class', 'links')

    links.forEach(lk => {
      if (lk.curved) {
        // Bezier through center for cross-connections
        const mx = (lk.sx + lk.tx) / 2
        const my = (lk.sy + lk.ty) / 2
        // Pull control point toward center
        const cpx = mx + (CX - mx) * 0.6
        const cpy = my + (CY - my) * 0.6
        linkG.append('path')
          .attr('d', `M ${lk.sx} ${lk.sy} Q ${cpx} ${cpy} ${lk.tx} ${lk.ty}`)
          .attr('fill',         'none')
          .attr('stroke', '#64748b')
          .attr('stroke-width', 1.5)
          .attr('opacity',      0.5)
      } else {
        linkG.append('line')
          .attr('x1', lk.sx).attr('y1', lk.sy)
          .attr('x2', lk.tx).attr('y2', lk.ty)
          .attr('stroke', '#64748b')
          .attr('stroke-width', lk.dashed ? 1.2 : 1.5)
          .attr('stroke-dasharray', lk.dashed ? '2 4' : 'none')
          .attr('opacity',      lk.dashed ? 0.4 : 0.6)
      }
    })

    // ── Draw nodes ───────────────────────────────────────────
    const allNodes: NodeDatum[] = [...companyNodes, ...jobNodes, ...connectionNodes]
    const tooltip  = d3.select(tooltipRef.current)

    const nodeG = root.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, NodeDatum>('g')
      .data(allNodes)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')

    // Company nodes — larger blue dots with label
    const companyG = nodeG.filter(d => d.type === 'company')
    companyG.append('circle')
      .attr('r',            10)
      .attr('fill',         '#0a1628')
      .attr('stroke',       '#3b82f6')
      .attr('stroke-width', 1.2)
    companyG.append('text')
      .attr('text-anchor', d => Math.cos(d.angle) >= 0 ? 'start' : 'end')
      .attr('x', d => (Math.cos(d.angle) >= 0 ? 14 : -14))
      .attr('y', 4)
      .attr('fill',        '#93c5fd')
      .attr('font-size',   '9px')
      .attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.label)

    // Job nodes — colored dots with score inside
    const jobG = nodeG.filter(d => d.type === 'job')
    jobG.append('circle')
      .attr('r', d => selectedId === d.id ? 9 : 7)
      .attr('fill', d => {
        const job = d.data as Job
        if (job.status === 'outreach_drafted')          return '#1c0a05'
        if ((job.match_score || 0) >= 80)              return '#041A0A'
        if ((job.match_score || 0) >= 65)              return '#1c1408'
        return '#111110'
      })
      .attr('stroke', d => {
        const job = d.data as Job
        if (selectedId === d.id)                        return '#ffffff'
        if (job.status === 'outreach_drafted')          return '#f97316'
        if ((job.match_score || 0) >= 80)              return '#22c55e'
        if ((job.match_score || 0) >= 65)              return '#f59e0b'
        return '#4b5563'
      })
      .attr('stroke-width', d => selectedId === d.id ? 1.5 : 0.8)

    // Score halo ring
    jobG.filter(d => (d.score || 0) >= 65)
      .append('circle')
      .attr('r',            d => (selectedId === d.id ? 9 : 7) + 3)
      .attr('fill',         'none')
      .attr('stroke',       d => scoreColor(d.score))
      .attr('stroke-width', 1)
      .attr('opacity',      0.3)

    // Score text inside dot
    jobG.filter(d => d.score != null)
      .append('text')
      .attr('text-anchor',      'middle')
      .attr('dominant-baseline','central')
      .attr('fill', d => {
        const job = d.data as Job
        if (job.status === 'outreach_drafted') return '#fdba74'
        if ((job.match_score || 0) >= 80)     return '#86efac'
        if ((job.match_score || 0) >= 65)     return '#fcd34d'
        return '#9ca3af'
      })
      .attr('font-size',   '5.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .text(d => String(d.score || ''))

    // Job label — small text along the radial spoke
    jobG.append('text')
      .attr('text-anchor', d => Math.cos(d.angle) > 0.1 ? 'start' : Math.cos(d.angle) < -0.1 ? 'end' : 'middle')
      .attr('x', d => {
        const cos = Math.cos(d.angle)
        if (cos > 0.1)  return 11
        if (cos < -0.1) return -11
        return 0
      })
      .attr('y', d => {
        const cos = Math.cos(d.angle)
        if (Math.abs(cos) <= 0.1) return Math.sin(d.angle) > 0 ? 14 : -10
        return 4
      })
      .attr('fill',        '#5a5a56')
      .attr('font-size',   '7.5px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => {
        const job = d.data as Job
        const t = job.title
        return t.length > 22 ? t.slice(0, 20) + '…' : t
      })

    // Connection nodes — small teal/amber/gray dots
    const connG = nodeG.filter(d => d.type === 'connection')
    connG.append('circle')
      .attr('r',    5)
      .attr('fill', '#0a0a09')
      .attr('stroke', d => {
        const rel = d.relationship || 'unknown'
        return { strong: '#2dd4bf', warm: '#f59e0b', cold: '#6b7280', unknown: '#374151' }[rel] || '#6b7280'
      })
      .attr('stroke-width', 0.8)
    connG.append('text')
      .attr('text-anchor', d => Math.cos(d.angle) >= 0 ? 'start' : 'end')
      .attr('x', d => Math.cos(d.angle) >= 0 ? 8 : -8)
      .attr('y', 3)
      .attr('fill',        '#3a3a38')
      .attr('font-size',   '7px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.label)

    // ── YOU center node ──────────────────────────────────────
    root.append('circle')
      .attr('cx', CX).attr('cy', CY).attr('r', R_YOU + 4)
      .attr('fill',         '#0a0a09')
      .attr('stroke',       '#3a3a38')
      .attr('stroke-width', 0.5)
    root.append('circle')
      .attr('cx', CX).attr('cy', CY).attr('r', R_YOU)
      .attr('fill',         '#e8e8e4')
      .attr('stroke',       '#ffffff')
      .attr('stroke-width', 1.5)
    root.append('text')
      .attr('x',                CX)
      .attr('y',                CY)
      .attr('text-anchor',      'middle')
      .attr('dominant-baseline','central')
      .attr('fill',             '#0a0a09')
      .attr('font-size',        '9px')
      .attr('font-weight',      '600')
      .attr('font-family',      'Inter, sans-serif')
      .text('You')

    // ── Interactions ─────────────────────────────────────────
    nodeG
      .on('mouseenter', function (event, d) {
        d3.select(this).select('circle').attr('stroke-width', 2)
        let html = ''
        if (d.type === 'job') {
          const job = d.data as Job
          html = `
            <div style="font-weight:500;font-size:12px;margin-bottom:3px">${job.title}</div>
            <div style="color:var(--text-secondary);font-size:11px">${job.company_name || ''}</div>
            ${job.match_score != null
              ? `<div style="color:${scoreColor(job.match_score)};font-size:11px;margin-top:3px">Score ${job.match_score}</div>`
              : ''}
          `
        } else if (d.type === 'company') {
          const co = d.data as Company
          html = `<div style="font-weight:500;font-size:12px">${co.name}</div><div style="color:var(--text-secondary);font-size:11px">${co.industry || 'Company'}</div>`
        } else if (d.type === 'connection') {
          const cn = d.data as Connection
          html = `<div style="font-weight:500;font-size:12px">${cn.name}</div><div style="color:var(--text-secondary);font-size:11px">${cn.role || ''} · ${cn.relationship}</div>`
        }
        tooltip
          .style('display', 'block')
          .style('left',    `${event.clientX + 14}px`)
          .style('top',     `${event.clientY - 10}px`)
          .html(html)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.clientX + 14}px`)
          .style('top',  `${event.clientY - 10}px`)
      })
      .on('mouseleave', function () {
        d3.select(this).select('circle').attr('stroke-width', d => {
          const nd = d as NodeDatum
          return nd.type === 'company' ? 1.2 : nd.type === 'connection' ? 0.8 : 0.8
        })
        tooltip.style('display', 'none')
      })
      .on('click', (_, d) => {
        if (d.type === 'job' || d.type === 'company' || d.type === 'connection') {
          onSelect(d.id, d.type)
        }
      })

  }, [jobs, connections, companies, selectedId, onSelect, filterRegion, filterStatus, filterMinScore])

  useEffect(() => { draw() }, [draw])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef} id="network-canvas" style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      <div ref={tooltipRef} className="network-tooltip" style={{ display: 'none' }} />
    </div>
  )
}
