import "./globals.css"
import Sidebar from "@/components/shared/Sidebar"

export const metadata = {
  title: "Job Intelligence",
  description: "Job Application & Intelligence Dashboard"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', WebkitFontSmoothing: 'antialiased' }}>
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'hidden', height: '100%', position: 'relative' }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
