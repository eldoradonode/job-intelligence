"use client";

import RadialNetwork from "@/components/network/RadialNetwork";

export default function NetworkPage() {
  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-white p-6 pt-16 space-y-4">
      <div className="w-full overflow-visible">
        <RadialNetwork />
      </div>
    </div>
  );
}
