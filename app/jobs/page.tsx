"use client";

export default function JobsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Jobs Intelligence</h1>
        <p className="text-slate-400 mt-1">Track active applications, interview pipelines, and match scores.</p>
      </div>
      <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/50">
        <p className="text-slate-400">No active job filters applied. Connect Supabase backend to stream real-time pipeline status.</p>
      </div>
    </div>
  );
}
