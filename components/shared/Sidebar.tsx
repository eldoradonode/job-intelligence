'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Network, LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react'

const NAV = [
  { href: '/network',   label: 'Network',    icon: Network },
  { href: '/dashboard', label: 'Overview',   icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',       icon: Briefcase },
  { href: '/people',    label: 'People',     icon: Users },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 200,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: 4,
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 4px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          Job Intelligence
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Eldorado Daniel
        </div>
      </div>

      {/* Nav */}
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`nav-item ${path.startsWith(href) ? 'active' : ''}`}
        >
          <Icon size={15} strokeWidth={1.5} />
          {label}
        </Link>
      ))}

      {/* Bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <Link href="/settings" className="nav-item">
          <Settings size={15} strokeWidth={1.5} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
