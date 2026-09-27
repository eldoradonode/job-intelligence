"use client";

import RadialNetwork from "@/components/network/RadialNetwork";

export default function NetworkPage() {
  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-white px-8 pt-16 pb-8 flex items-start justify-center">
      <div className="w-full max-w-[1600px] flex items-start gap-6">
        <RadialNetwork />
      </div>
    </div>
  );
}
