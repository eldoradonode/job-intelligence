import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { job_id, connection_id } = await req.json();

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_OUTREACH_WEBHOOK_URL || 'https://your-n8n-domain/webhook/generate-outreach';

    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id,
        connection_id: connection_id || null,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
