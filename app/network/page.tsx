"use client";

import RadialNetwork from "@/components/network/RadialNetwork";

export default function NetworkPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0f19', color: 'white' }}>
      <div style={{ padding: '16px 24px 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Match web</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>6 roles scoring 80+, clustered by company</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <RadialNetwork />
      </div>
    </div>
  );
}
