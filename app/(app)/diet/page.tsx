'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { MEAL_PLAN, DIET_TARGETS } from '@/lib/data'

export default function DietPage() {
  const router = useRouter()
  const { dietDay, logMeal } = useAppStore()

  const totals = MEAL_PLAN.reduce(
    (acc, m) => {
      if (dietDay[m.id] === 'ate') {
        acc.cal += m.cal
        acc.protein += m.protein
        acc.carbs += m.carbs
        acc.fat += m.fat
      }
      return acc
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const mealsEaten = MEAL_PLAN.filter((m) => dietDay[m.id] === 'ate').length
  const score = Math.round((mealsEaten / MEAL_PLAN.length) * 100)
  const calPct = Math.min(100, Math.round((totals.cal / DIET_TARGETS.cal) * 100))
  const calColor = calPct > 105 ? '#E24B4A' : calPct >= 80 ? '#1D9E75' : '#BA7517'
  const scoreColor = score >= 80 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A'
  const scoreMsg = score === 100 ? 'Perfect day — nailed it.' : score >= 80 ? 'Strong day.' : score >= 50 ? 'Halfway there.' : 'Keep going.'

  return (
    <div className="min-h-screen max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <div className="bg-[#0a0a0a] px-[18px] pt-[18px] border-b-2 border-[#1D9E75] sticky top-0 z-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="font-condensed text-[13px] font-semibold tracking-[4px] text-[#1D9E75] uppercase">GRND</div>
            <div className="font-condensed text-[38px] font-black leading-none tracking-[-1px]">DIET</div>
          </div>
          <button onClick={() => router.push('/')} className="text-[#666] text-sm pb-2">← Home</button>
        </div>
        <div className="h-[3px] bg-[#1a1a1a] mx-[-18px]">
          <div className="h-[3px] bg-[#1D9E75] transition-all duration-500" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-4 gap-2 px-[14px] pt-4">
        {[
          { label: 'Protein', val: totals.protein, target: DIET_TARGETS.protein, unit: 'g', color: '#E24B4A' },
          { label: 'Carbs', val: totals.carbs, target: DIET_TARGETS.carbs, unit: 'g', color: '#BA7517' },
          { label: 'Fat', val: totals.fat, target: DIET_TARGETS.fat, unit: 'g', color: '#1D9E75' },
          { label: 'Meals', val: mealsEaten, target: MEAL_PLAN.length, unit: '', color: '#666' },
        ].map((m) => (
          <div key={m.label} className="bg-[#141414] border border-[#1e1e1e] rounded p-3 text-center">
            <div className="font-condensed text-[22px] font-black" style={{ color: m.color }}>
              {m.val}{m.unit}
            </div>
            <div className="text-[10px] text-[#666] uppercase tracking-[1px]">{m.label}</div>
            <div className="text-[10px] text-[#444]">/ {m.target}{m.unit}</div>
          </div>
        ))}
      </div>

      {/* Cal Bar */}
      <div className="mx-[14px] mt-3 bg-[#141414] border border-[#1e1e1e] rounded p-4">
        <div className="flex justify-between items-end mb-2">
          <div className="font-condensed text-[32px] font-black" style={{ color: calColor }}>
            {totals.cal} <span className="text-[16px] font-normal text-[#666]">cal</span>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-[#666]">Target: {DIET_TARGETS.cal} cal</div>
            <div className="font-condensed text-[13px] text-[#444]">
              {DIET_TARGETS.cal - totals.cal > 0 ? `${DIET_TARGETS.cal - totals.cal} remaining` : '✓ Target hit'}
            </div>
          </div>
        </div>
        <div className="h-[6px] bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-[6px] rounded-full transition-all duration-500" style={{ width: `${calPct}%`, background: calColor }} />
        </div>
      </div>

      {/* Score */}
      <div className="mx-[14px] mt-3 bg-[#141414] border border-[#1e1e1e] rounded p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-condensed text-[13px] font-bold tracking-[1px] uppercase text-[#666]">Today's Compliance</div>
          <div className="font-condensed text-[24px] font-black" style={{ color: scoreColor }}>{score}%</div>
        </div>
        <div className="h-[6px] bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
          <div className="h-[6px] rounded-full transition-all duration-500" style={{ width: `${score}%`, background: scoreColor }} />
        </div>
        <div className="text-[12px] text-[#444]">{scoreMsg}</div>
      </div>

      {/* Meals */}
      <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-4 pb-2">
        Tap to tick off
      </div>
      {MEAL_PLAN.map((m) => {
        const ate = dietDay[m.id] === 'ate'
        return (
          <div
            key={m.id}
            onClick={() => logMeal(m.id)}
            className={`mx-[14px] mb-2 bg-[#141414] border rounded p-[14px] cursor-pointer flex items-center gap-3 active:scale-[0.99] transition-transform ${
              ate ? 'border-l-[3px] border-l-[#1D9E75] border-[#1e1e1e]' : 'border-[#1e1e1e]'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
              ate ? 'bg-[#1D9E75] border-[#1D9E75] text-white' : 'border-[#2a2a2a]'
            }`}>
              {ate ? '✓' : ''}
            </div>
            <div className="text-[12px] text-[#666] w-[60px] flex-shrink-0">{m.time}</div>
            <div className="flex-1 min-w-0">
              <div className={`font-condensed text-[16px] font-bold uppercase ${ate ? 'text-[#1D9E75]' : 'text-white'}`}>
                {m.name}
              </div>
              <div className="text-[11px] text-[#666] mt-0.5">
                {m.purpose} · {m.protein}g P · {m.cal} cal
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}