# Frontend Setup Guide

## Local development

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in .env.local with your Supabase URL, anon key, and n8n webhook URLs
npm run dev
```

Open http://localhost:3000 — it redirects to /network

---

## Deploy to Vercel (free)

1. Push this frontend folder to a GitHub repo
2. Go to vercel.com → New Project → import that repo
3. Set root directory to `frontend/` if needed
4. Add environment variables in Vercel dashboard (same as .env.local):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_N8N_WEBHOOK_OUTREACH
   - NEXT_PUBLIC_N8N_WEBHOOK_STATUS
5. Deploy

---

## Page structure

| Route | Description |
|---|---|
| `/` | Redirects to `/network` |
| `/network` | Main Cosmere-style radial visualization |
| `/dashboard` | jobgrab-style overview with stats + chart + table |

---

## File structure

```
frontend/
├── app/
│   ├── layout.tsx          Root layout + sidebar
│   ├── globals.css         Design tokens + base styles
│   ├── page.tsx            Redirect to /network
│   ├── network/
│   │   └── page.tsx        Network visualization page
│   └── dashboard/
│       └── page.tsx        Stats dashboard page
├── components/
│   ├── network/
│   │   ├── RadialNetwork.tsx   D3 radial viz
│   │   ├── NetworkFilters.tsx  Filters + legend panel
│   │   └── JobDetailPanel.tsx  Slide-in job detail
│   ├── dashboard/
│   │   ├── StatsCards.tsx      Stat number cards
│   │   ├── ScoreChart.tsx      D3 bar chart
│   │   └── RecentJobs.tsx      Jobs table
│   └── shared/
│       └── Sidebar.tsx         Left navigation
├── lib/
│   ├── supabase.ts         Supabase client + all data functions
│   └── utils.ts            Colors, labels, formatters
├── types/
│   └── index.ts            All TypeScript types
└── .env.local.example      Environment variables template
```

---

## Adding env values — no terminal needed

In Vercel dashboard or your hosting provider's UI, set these 4 variables.
For local dev, paste them directly into `.env.local` using any text editor.
