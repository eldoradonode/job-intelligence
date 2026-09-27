"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure database connections, API credentials, and sync parameters.</p>
      </div>
      <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/50 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Supabase Connection</h3>
            <p className="text-xs text-slate-400">Database synchronization layer for job nodes and network graphs.</p>
          </div>
          <span className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Connected</span>
        </div>
      </div>
    </div>
  );
}
