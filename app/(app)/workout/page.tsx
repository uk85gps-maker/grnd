'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { EXERCISES, WORKOUT_DAYS } from '@/lib/data'
import { supabase } from '@/lib/supabase'

interface SetData {
  weight: string
  reps: string
  done: boolean
}

interface LastSession {
  [exerciseKey: string]: { weight: string; reps: string }[]
}

export default function WorkoutPage() {
  const router = useRouter()
  const { activeDay, setActiveDay } = useAppStore()
  const exercises = EXERCISES[activeDay] || []
  const warmups = exercises.filter((e) => e.warmup)
  const main = exercises.filter((e) => !e.warmup)

  // sets: { [exId]: SetData[] }
  const [sets, setSets] = useState<Record<string, SetData[]>>({})
  const [lastSession, setLastSession] = useState<LastSession>({})
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exerciseDbIds, setExerciseDbIds] = useState<Record<string, string>>({})

  // Load exercise IDs from Supabase
  useEffect(() => {
    const loadExercises = async () => {
      const { data } = await supabase
        .from('exercises')
        .select('id, name')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((ex) => { map[ex.name] = ex.id })
        setExerciseDbIds(map)
      }
    }
    loadExercises()
  }, [])

  // Load last session for this day
  useEffect(() => {
    const loadLastSession = async () => {
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('day_type', activeDay)
        .order('workout_date', { ascending: false })
        .limit(1)

      if (!logs || logs.length === 0) return

      const lastLogId = logs[0].id
      const { data: setData } = await supabase
        .from('set_logs')
        .select('exercise_id, set_number, weight_kg, reps')
        .eq('workout_log_id', lastLogId)
        .order('set_number', { ascending: true })

      if (!setData) return

      const sessionMap: LastSession = {}
      setData.forEach((s) => {
        const key = s.exercise_id
        if (!sessionMap[key]) sessionMap[key] = []
        sessionMap[key][s.set_number - 1] = {
          weight: s.weight_kg?.toString() || '',
          reps: s.reps?.toString() || '',
        }
      })
      setLastSession(sessionMap)
    }
    loadLastSession()
  }, [activeDay])

  // Init sets from exercises
  useEffect(() => {
    const initial: Record<string, SetData[]> = {}
    exercises.forEach((ex) => {
      const dbId = exerciseDbIds[ex.name]
      const last = dbId ? lastSession[dbId] : undefined
      initial[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        weight: last?.[i]?.weight || '',
        reps: last?.[i]?.reps || ex.reps.toString(),
        done: false,
      }))
    })
    setSets(initial)
  }, [activeDay, lastSession, exerciseDbIds])

  const updateSet = (exId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setSets((prev) => {
      const updated = [...(prev[exId] || [])]
      updated[setIndex] = { ...updated[setIndex], [field]: value }
      return { ...prev, [exId]: updated }
    })
  }

  const toggleSet = (exId: string, setIndex: number) => {
    setSets((prev) => {
      const updated = [...(prev[exId] || [])]
      updated[setIndex] = { ...updated[setIndex], done: !updated[setIndex].done }
      return { ...prev, [exId]: updated }
    })
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0)
  const doneSets = Object.values(sets).flat().filter((s) => s.done).length
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0

  // Start workout log in Supabase
  const ensureWorkoutLog = async () => {
    if (workoutLogId) return workoutLogId
    const { data } = await supabase
      .from('workout_logs')
      .insert({ day_type: activeDay, started_at: new Date().toISOString() })
      .select('id')
      .single()
    if (data) {
      setWorkoutLogId(data.id)
      return data.id
    }
    return null
  }

  // Save a single set to Supabase
  const saveSet = async (exId: string, setIndex: number) => {
    const setData = sets[exId]?.[setIndex]
    if (!setData) return
    setSaving(true)
    const logId = await ensureWorkoutLog()
    if (!logId) { setSaving(false); return }
    const ex = exercises.find((e) => e.id === exId)
    if (!ex) { setSaving(false); return }
    const dbExId = exerciseDbIds[ex.name]
    if (!dbExId) { setSaving(false); return }

    await supabase.from('set_logs').upsert({
      workout_log_id: logId,
      exercise_id: dbExId,
      set_number: setIndex + 1,
      weight_kg: parseFloat(setData.weight) || null,
      reps: parseInt(setData.reps) || null,
    }, { onConflict: 'workout_log_id,exercise_id,set_number' })

    setSaving(false)
  }

  const handleToggleSet = async (exId: string, setIndex: number) => {
    toggleSet(exId, setIndex)
    await saveSet(exId, setIndex)
  }

  const handleFinish = async () => {
    if (!workoutLogId) return
    await supabase
      .from('workout_logs')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workoutLogId)
    router.push('/')
  }

  return (
    <div className="min-h-screen max-w-[480px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-[#0a0a0a] px-[18px] pt-[18px] border-b-2 border-[#E24B4A] sticky top-0 z-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="font-condensed text-[13px] font-semibold tracking-[4px] text-[#E24B4A] uppercase">GRND</div>
            <div className="font-condensed text-[38px] font-black leading-none tracking-[-1px]">WORKOUT</div>
          </div>
          <div className="flex items-center gap-3 pb-2">
            {saving && <span className="text-xs text-[#666]">saving…</span>}
            <button onClick={() => router.push('/')} className="text-[#666] text-sm">← Home</button>
          </div>
        </div>
        {/* Progress */}
        <div className="flex justify-between text-xs text-[#666] mb-1">
          <span>{doneSets} / {totalSets} sets done</span>
          <span>{pct}%</span>
        </div>
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
        {WORKOUT_DAYS.find((d) => d.id === activeDay)?.day}
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
            <ExCard
              key={ex.id}
              ex={ex}
              sets={sets[ex.id] || []}
              onUpdateSet={(i, f, v) => updateSet(ex.id, i, f, v)}
              onToggleSet={(i) => handleToggleSet(ex.id, i)}
            />
          ))}
        </>
      )}

      {/* Main */}
      <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-4 pb-1">Exercises</div>
      {main.map((ex) => (
        <ExCard
          key={ex.id}
          ex={ex}
          sets={sets[ex.id] || []}
          onUpdateSet={(i, f, v) => updateSet(ex.id, i, f, v)}
          onToggleSet={(i) => handleToggleSet(ex.id, i)}
        />
      ))}

      {/* Finish Button */}
      {pct === 100 && (
        <div className="px-[14px] mt-4">
          <button
            onClick={handleFinish}
            className="w-full font-condensed text-[20px] font-bold tracking-[3px] uppercase py-4 rounded-sm bg-[#1D9E75] text-white"
          >
            Finish Workout 💪
          </button>
        </div>
      )}
    </div>
  )
}

function ExCard({
  ex,
  sets,
  onUpdateSet,
  onToggleSet,
}: {
  ex: any
  sets: SetData[]
  onUpdateSet: (i: number, field: 'weight' | 'reps', value: string) => void
  onToggleSet: (i: number) => void
}) {
  const [open, setOpen] = useState(false)
  const allDone = sets.length > 0 && sets.every((s) => s.done)

  return (
    <div
      className={`mx-[14px] mb-2 bg-[#141414] border rounded p-[14px] ${
        allDone
          ? 'border-l-[3px] border-l-[#1D9E75] border-[#1e1e1e] opacity-80'
          : ex.warmup
          ? 'border-l-[3px] border-l-[#BA7517] border-[#1e1e1e]'
          : 'border-[#1e1e1e]'
      }`}
    >
      {/* Exercise Header */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className={`font-condensed text-[18px] font-bold uppercase tracking-[0.3px] ${allDone ? 'text-[#1D9E75]' : 'text-white'}`}>
            {ex.name}
          </div>
          <div className="text-[12px] text-[#666] mt-1">
            {ex.sets} sets · {ex.reps} reps
            {sets.filter((s) => s.done).length > 0 && (
              <span className="ml-2 text-[#1D9E75]">
                {sets.filter((s) => s.done).length}/{ex.sets} done
              </span>
            )}
          </div>
        </div>
        <div className={`text-[16px] transition-transform ${open ? 'rotate-90' : ''} ${allDone ? 'text-[#1D9E75]' : 'text-[#2a2a2a]'}`}>›</div>
      </div>

      {/* Sets */}
      {open && (
        <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex flex-col gap-2">
          {sets.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg p-2 ${s.done ? 'bg-[#0d1f19]' : 'bg-[#1a1a1a]'}`}>
              <div className="font-condensed text-[13px] text-[#666] w-8">S{i + 1}</div>

              {/* Weight */}
              <div className="flex flex-col flex-1">
                <span className="text-[10px] text-[#444] uppercase tracking-wider mb-1">kg</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={s.weight}
                  onChange={(e) => onUpdateSet(i, 'weight', e.target.value)}
                  placeholder="0"
                  className="bg-[#222] text-white text-[15px] font-bold rounded px-2 py-1 w-full outline-none border border-[#2a2a2a] focus:border-[#E24B4A]"
                />
              </div>

              {/* Reps */}
              <div className="flex flex-col flex-1">
                <span className="text-[10px] text-[#444] uppercase tracking-wider mb-1">reps</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={s.reps}
                  onChange={(e) => onUpdateSet(i, 'reps', e.target.value)}
                  placeholder="0"
                  className="bg-[#222] text-white text-[15px] font-bold rounded px-2 py-1 w-full outline-none border border-[#2a2a2a] focus:border-[#E24B4A]"
                />
              </div>

              {/* Done tick */}
              <button
                onClick={() => onToggleSet(i)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border transition-all ${
                  s.done
                    ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
                    : 'bg-[#222] border-[#2a2a2a] text-[#444]'
                }`}
              >
                ✓
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}