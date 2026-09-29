'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Job, Company, Connection, Application } from '@/types'
import { getJobs, getCompanies, getConnections, getApplicationsByJob } from '@/lib/supabase'
import NetworkFilters from '@/components/network/NetworkFilters'
import JobDetailPanel from '@/components/network/JobDetailPanel'

const RadialNetwork = dynamic(
  () => import('@/components/network/RadialNetwork'),
  { ssr: false }
)

export default function NetworkPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([])
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterMinScore, setFilterMinScore] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getJobs(), getCompanies(), getConnections()])
      .then(([j, co, cn]) => {
        setJobs(j)
        setCompanies(co)
        setConnections(cn)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredJobs = useMemo(() => {
    if (!search) return jobs
    const q = search.toLowerCase()
    return jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      (j.company_name || '').toLowerCase().includes(q)
    )
  }, [jobs, search])

  const stats = useMemo(() => ({
    total: jobs.filter(j => j.status !== 'archived').length,
    highMatch: jobs.filter(j => (j.match_score || 0) >= 80).length,
    drafted: jobs.filter(j => j.status === 'outreach_drafted').length,
    applied: jobs.filter(j => j.status === 'applied').length,
  }), [jobs])

  async function handleSelect(id: string, type: 'job' | 'company' | 'connection') {
    setSelectedId(id)
    if (type === 'job') {
      const job = jobs.find(j => j.id === id) || null
      setSelectedJob(job)
      if (job) {
        const apps = await getApplicationsByJob(id)
        setSelectedApplications(apps)
      }
    } else {
      setSelectedJob(null)
    }
  }

  function handleClose() {
    setSelectedId(null)
    setSelectedJob(null)
    setSelectedApplications([])
  }

  function handleStatusChange(id: string, status: string) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: status as Job['status'] } : j))
    if (selectedJob?.id === id) {
      setSelectedJob(prev => prev ? { ...prev, status: status as Job['status'] } : null)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '14px 20px',
          background: 'linear-gradient(to bottom, var(--bg-base) 60%, transparent)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Match web</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {stats.highMatch > 0
              ? `${stats.highMatch} roles scoring 80+, clustered by company`
              : 'Your job intelligence network'}
          </div>
        </div>

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading network…
          </div>
        )}

        {!loading && (
          <RadialNetwork
            jobs={filteredJobs}
            connections={connections}
            companies={companies}
            selectedId={selectedId}
            onSelect={handleSelect}
            filterRegion={filterRegion}
            filterStatus={filterStatus}
            filterMinScore={filterMinScore}
          />
        )}
      </div>

      <NetworkFilters
        filterRegion={filterRegion}
        filterStatus={filterStatus}
        filterMinScore={filterMinScore}
        search={search}
        onRegion={setFilterRegion}
        onStatus={setFilterStatus}
        onMinScore={setFilterMinScore}
        onSearch={setSearch}
        stats={stats}
      />

      {selectedJob && (
        <div style={{ position: 'absolute', top: 0, right: 220, bottom: 0, zIndex: 20, display: 'flex' }}>
          <JobDetailPanel
            job={selectedJob}
            connections={connections}
            applications={selectedApplications}
            onClose={handleClose}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  )
}
