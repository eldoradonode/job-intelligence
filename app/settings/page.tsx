'use client'

export default function SettingsPage() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Settings</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Environment and configuration</div>
        </div>
        <Block title="Required env vars — set in Vercel">
          {['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','NEXT_PUBLIC_N8N_WEBHOOK_OUTREACH','NEXT_PUBLIC_N8N_WEBHOOK_STATUS'].map(k => (
            <Row key={k} label={k} />
          ))}
        </Block>
        <Block title="n8n webhook URLs">
          <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2 }}>
            <div>Outreach: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>https://your-n8n/webhook/generate-outreach</code></div>
            <div>Status update: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>https://your-n8n/webhook/update-status</code></div>
          </div>
        </Block>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>{children}</div>
    </div>
  )
}

function Row({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}
