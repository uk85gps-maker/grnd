'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      {/* Top */}
      <div className="pt-14 px-7 pb-6">
        <div className="font-condensed text-[13px] font-semibold tracking-[5px] text-[#E24B4A] uppercase mb-4">
          GRND
        </div>
        <div className="font-condensed text-[58px] font-black leading-none tracking-[-2px] uppercase">
          GURPREET<br />
          <span className="text-[#E24B4A]">SINGH</span>
        </div>
        <div className="text-[14px] text-[#666] mt-4 leading-relaxed max-w-[280px]">
          83kg → 70kg · PPL Program · 1435 cal target
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 px-5 pb-12 mt-auto">
        {/* Workout Card */}
        <button
          onClick={() => router.push('/workout')}
          className="rounded-sm p-7 bg-[#E24B4A] border border-[#E24B4A] text-left relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="font-condensed text-[11px] font-semibold tracking-[3px] uppercase text-white/65 mb-2">
            Today's Session
          </div>
          <div className="font-condensed text-[36px] font-black leading-none uppercase text-white">
            WORKOUT
          </div>
          <div className="text-[13px] text-white/70 mt-2">
            PPL · Injury-aware program
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[28px] text-white/50">
            →
          </div>
        </button>

        <div className="h-px bg-[#1e1e1e] mx-1" />

        {/* Diet Card */}
        <button
          onClick={() => router.push('/diet')}
          className="rounded-sm p-7 bg-[#0F6E56] border border-[#1D9E75] text-left relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="font-condensed text-[11px] font-semibold tracking-[3px] uppercase text-white/65 mb-2">
            Nutrition
          </div>
          <div className="font-condensed text-[36px] font-black leading-none uppercase text-white">
            DIET
          </div>
          <div className="text-[13px] text-white/70 mt-2">
            1435 cal · 9 meals · Tap to track
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[28px] text-white/50">
            →
          </div>
        </button>
      </div>
    </div>
  )
}