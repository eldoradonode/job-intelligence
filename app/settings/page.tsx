'use client'

export default function SettingsPage() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>Settings</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Configuration and environment</div>
        </div>

        <Section title="Webhooks">
          <Row label="Outreach webhook" value={process.env.NEXT_PUBLIC_N8N_WEBHOOK_OUTREACH || 'Not set'} />
          <Row label="Status webhook" value={process.env.NEXT_PUBLIC_N8N_WEBHOOK_STATUS || 'Not set'} />
        </Section>

        <Section title="Supabase">
          <Row label="URL" value={process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Connected' : 'Not set'} />
          <Row label="Anon key" value={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : 'Not set'} />
        </Section>

        <Section title="Required env vars (set in Vercel)">
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 2 }}>
            <div>NEXT_PUBLIC_SUPABASE_URL</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
            <div>NEXT_PUBLIC_N8N_WEBHOOK_OUTREACH</div>
            <div>NEXT_PUBLIC_N8N_WEBHOOK_STATUS</div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}
