'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { EXERCISES, WORKOUT_DAYS } from '@/lib/data'

export default function WorkoutPage() {
  const router = useRouter()
  const { activeDay, setActiveDay, completedExercises, toggleExercise } = useAppStore()
  const exercises = EXERCISES[activeDay] || []
  const warmups = exercises.filter((e) => e.warmup)
  const main = exercises.filter((e) => !e.warmup)
  const done = exercises.filter((e) => completedExercises[e.id]).length
  const total = exercises.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <div className="bg-[#0a0a0a] px-[18px] pt-[18px] border-b-2 border-[#E24B4A] sticky top-0 z-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="font-condensed text-[13px] font-semibold tracking-[4px] text-[#E24B4A] uppercase">GRND</div>
            <div className="font-condensed text-[38px] font-black leading-none tracking-[-1px]">WORKOUT</div>
          </div>
          <button onClick={() => router.push('/')} className="text-[#666] text-sm pb-2">← Home</button>
        </div>
        {/* Progress */}
        <div className="h-[3px] bg-[#1a1a1a] mx-[-18px]">
          <div className="h-[3px] bg-[#E24B4A] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 px-4 pt-3">
        {WORKOUT_DAYS.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id as any)}
            className={`font-condensed text-[15px] font-bold tracking-[1px] uppercase px-[18px] py-[7px] border rounded-sm transition-all ${
              activeDay === d.id
                ? 'bg-[#E24B4A] border-[#E24B4A] text-white'
                : 'border-[#2a2a2a] text-[#666]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="text-[#666] text-xs px-4 pt-1 pb-2">
        {WORKOUT_DAYS.find(d => d.id === activeDay)?.day}
      </div>

      {/* Injury Banner */}
      <div className="mx-[14px] mt-2 bg-[rgba(186,117,23,0.1)] border border-[rgba(186,117,23,0.3)] rounded p-3 text-[12px] text-[#BA7517]">
        ⚠️ Right shoulder, right elbow, knees — modified exercises loaded
      </div>

      {/* Warmups */}
      {warmups.length > 0 && (
        <>
          <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-4 pb-1">Warmup</div>
          {warmups.map((ex) => (
            <ExCard key={ex.id} ex={ex} done={!!completedExercises[ex.id]} onToggle={() => toggleExercise(ex.id)} />
          ))}
        </>
      )}

      {/* Main */}
      <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-4 pb-1">Exercises</div>
      {main.map((ex) => (
        <ExCard key={ex.id} ex={ex} done={!!completedExercises[ex.id]} onToggle={() => toggleExercise(ex.id)} />
      ))}
    </div>
  )
}

function ExCard({ ex, done, onToggle }: { ex: any; done: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`mx-[14px] mb-2 bg-[#141414] border rounded p-[14px] cursor-pointer ${
        done ? 'border-l-[3px] border-l-[#1D9E75] opacity-70' : ex.warmup ? 'border-l-[3px] border-l-[#BA7517] border-[#1e1e1e]' : 'border-[#1e1e1e]'
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className={`font-condensed text-[18px] font-bold uppercase tracking-[0.3px] ${done ? 'text-[#1D9E75]' : 'text-white'}`}>
            {ex.name}
          </div>
          <div className="text-[12px] text-[#666] mt-1">
            {ex.sets} sets · {ex.reps} reps
            {ex.injury?.length > 0 && <span className="ml-2 text-[#BA7517]">⚠️ modified</span>}
          </div>
        </div>
        <div className={`text-[16px] ${done ? 'text-[#1D9E75]' : 'text-[#2a2a2a]'}`}>›</div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-[#1e1e1e]">
          <div className="text-[13px] text-[#666] mb-3">{ex.note}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className={`w-full font-condensed text-[18px] font-bold tracking-[2px] uppercase py-4 rounded-sm border-none ${
              done ? 'bg-[#1a1a1a] text-[#1D9E75]' : 'bg-[#1D9E75] text-white'
            }`}
          >
            {done ? '✓ Done' : 'Mark Done'}
          </button>
        </div>
      )}
    </div>
  )
}
