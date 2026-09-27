import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { job_id, connection_id } = await req.json();

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_OUTREACH_WEBHOOK_URL || 'https://your-n8n-domain/webhook/generate-outreach';

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id,
        connection_id: connection_id || null,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `n8n execution error: ${errText}` }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, draft: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
