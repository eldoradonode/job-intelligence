"use client";

import RadialNetwork from "@/components/network/RadialNetwork";

export default function NetworkPage() {
  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-white p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Match Web</h1>
          <p className="text-xs text-slate-400">Roles scoring 80+, clustered by company</p>
        </div>
      </div>
      <div className="w-full overflow-visible">
        <RadialNetwork />
      </div>
    </div>
  );
}
