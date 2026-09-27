'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Job, DashboardStats } from '@/types'
import { getDashboardStats, getScoreDistribution, getJobs } from '@/lib/supabase'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentJobs from '@/components/dashboard/RecentJobs'

const ScoreChart = dynamic(
  () => import('@/components/dashboard/ScoreChart'),
  { ssr: false }
)

const EMPTY_STATS: DashboardStats = {
  total_jobs: 0,
  high_match_jobs: 0,
  applied: 0,
  outreach_drafted: 0,
  responses: 0,
  total_connections: 0,
  total_companies: 0,
  avg_match_score: 0,
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [distribution, setDistribution] = useState<
    { range: string; count: number; isHighMatch: boolean }[]
  >([])
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [s, dist, jobs] = await Promise.all([
          getDashboardStats(),
          getScoreDistribution(),
          getJobs(),
        ])
        setStats(s)
        setDistribution(dist)
        // Most recent 20 non-archived jobs
        setRecentJobs(
          jobs
            .filter(j => j.status !== 'archived')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20)
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      padding: '32px 40px',
      background: 'var(--bg-base)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header — jobgrab style */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            jobintel
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {stats.total_jobs > 0
              ? `AI automation roles across ${stats.total_companies} companies`
              : 'Your job intelligence overview'}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
        ) : (
          <>
            {/* Stats */}
            <StatsCards stats={stats} />

            {/* Score distribution chart */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '24px 24px 20px',
              marginBottom: 24,
            }}>
              <ScoreChart data={distribution} />
            </div>

            {/* Recent jobs table */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '20px 20px 16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Recent roles
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Sorted by newest first
                </div>
              </div>
              <RecentJobs jobs={recentJobs} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
