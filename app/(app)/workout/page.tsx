'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { EXERCISES, WORKOUT_DAYS } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import {
  format,
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  subDays,
} from 'date-fns'

interface SetData {
  weight: string
  reps: string
  done: boolean
}

interface LastSession {
  [exerciseKey: string]: { weight: string; reps: string }[]
}

type ReviewSetLog = {
  id: string
  exercise_id: string
  exercise_name?: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  completed: boolean
}

type WorkoutLog = {
  id: string
  day_type: string
  started_at: string
  completed_at: string | null
  set_logs: ReviewSetLog[]
}

function getDateRange(period: string): { from: Date; to: Date } {
  const now = new Date()
  switch (period) {
    case 'daily':     return { from: startOfDay(now), to: endOfDay(now) }
    case 'weekly':    return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'monthly':   return { from: startOfMonth(now), to: endOfMonth(now) }
    case 'quarterly': return { from: startOfQuarter(now), to: endOfQuarter(now) }
    case 'yearly':    return { from: startOfYear(now), to: endOfYear(now) }
    default:          return { from: new Date('2000-01-01'), to: now }
  }
}

function totalVolume(sets: ReviewSetLog[]) {
  return sets.reduce(
    (s, l) => s + (l.completed && l.weight_kg && l.reps ? l.weight_kg * l.reps : 0),
    0,
  )
}

function WorkoutCard({ log }: { log: WorkoutLog }) {
  const [open, setOpen] = useState(false)
  const completedSets = log.set_logs.filter(s => s.completed)
  const vol = totalVolume(log.set_logs)

  const byExercise: Record<string, ReviewSetLog[]> = {}
  log.set_logs.forEach(s => {
    const label = s.exercise_name || s.exercise_id
    if (!byExercise[label]) byExercise[label] = []
    byExercise[label].push(s)
  })

  const dayLabel = WORKOUT_DAYS.find(d => d.id === log.day_type)?.label || log.day_type

  return (
    <div className="mx-[14px] mb-3 bg-[#141414] border border-[#1e1e1e] rounded overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between p-4 text-left"
      >
        <div>
          <p className="font-condensed text-[18px] font-bold text-white uppercase tracking-wide">
            {dayLabel}
          </p>
          <p className="text-xs text-[#666] mt-0.5">
            {format(new Date(log.started_at), 'EEE d MMM, h:mm a')}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-[#666]">
              <span className="text-[#1D9E75] font-semibold">{completedSets.length}</span> sets done
            </span>
            {vol > 0 && (
              <span className="text-xs text-[#666]">
                <span className="text-[#E24B4A] font-semibold">{vol.toLocaleString()}</span> kg vol
              </span>
            )}
          </div>
        </div>
        <span className="text-[#444] text-lg mt-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-[#1e1e1e] px-4 pb-4 pt-3 space-y-3">
          {Object.entries(byExercise).map(([exName, sets]) => (
            <div key={exName}>
              <p className="font-condensed text-[11px] text-[#444] uppercase tracking-widest mb-1">
                {exName}
              </p>
              <div className="flex flex-wrap gap-2">
                {sets
                  .sort((a, b) => a.set_number - b.set_number)
                  .map(s => (
                    <div
                      key={s.id}
                      className={`text-xs px-2 py-1 rounded border ${
                        s.completed
                          ? 'bg-[#0d1f19] border-[#1D9E75]/40 text-[#1D9E75]'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#444]'
                      }`}
                    >
                      {s.completed
                        ? `${s.weight_kg ?? '—'}kg × ${s.reps ?? '—'}`
                        : `Set ${s.set_number} — skipped`}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const REVIEW_PERIODS = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all time'] as const
type Period = (typeof REVIEW_PERIODS)[number]

function ReviewPanel() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [exerciseNames, setExerciseNames] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadNames() {
      const { data } = await supabase.from('exercises').select('id, name')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(e => { map[e.id] = e.name })
        setExerciseNames(map)
      }
    }
    loadNames()
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { from, to } = getDateRange(period === 'all time' ? 'all' : period)

      const { data: wlogs, error } = await supabase
        .from('workout_logs')
        .select('id, day_type, started_at, completed_at')
        .gte('started_at', from.toISOString())
        .lte('started_at', to.toISOString())
        .order('started_at', { ascending: false })

      if (error || !wlogs?.length) {
        setLogs([])
        setLoading(false)
        return
      }

      const ids = wlogs.map(w => w.id)
      const { data: slogs } = await supabase
        .from('set_logs')
        .select('id, workout_log_id, exercise_id, set_number, weight_kg, reps, completed')
        .in('workout_log_id', ids)

      const combined: WorkoutLog[] = wlogs.map(w => ({
        ...w,
        set_logs: (slogs ?? [])
          .filter(s => s.workout_log_id === w.id)
          .map(s => ({ ...s, exercise_name: exerciseNames[s.exercise_id] })),
      }))

      setLogs(combined)
      setLoading(false)
    }
    load()
  }, [period, exerciseNames])

  const totalSets = logs.reduce((s, l) => s + l.set_logs.filter(x => x.completed).length, 0)
  const totalVol  = logs.reduce((s, l) => s + totalVolume(l.set_logs), 0)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto px-[14px] pb-2 mb-2 scrollbar-none">
        {REVIEW_PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 font-condensed text-[13px] font-bold tracking-[1px] uppercase px-3 py-1.5 border rounded-sm transition-all ${
              period === p
                ? 'bg-[#E24B4A] border-[#E24B4A] text-white'
                : 'border-[#2a2a2a] text-[#666]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {!loading && logs.length > 0 && (
        <div className="flex gap-4 mx-[14px] mb-4 p-3 bg-[#141414] border border-[#1e1e1e] rounded">
          <div className="text-center flex-1">
            <p className="font-condensed text-[28px] font-black text-white leading-none">{logs.length}</p>
            <p className="text-[11px] text-[#666] mt-1">sessions</p>
          </div>
          <div className="w-px bg-[#1e1e1e]" />
          <div className="text-center flex-1">
            <p className="font-condensed text-[28px] font-black text-[#1D9E75] leading-none">{totalSets}</p>
            <p className="text-[11px] text-[#666] mt-1">sets done</p>
          </div>
          <div className="w-px bg-[#1e1e1e]" />
          <div className="text-center flex-1">
            <p className="font-condensed text-[28px] font-black text-[#E24B4A] leading-none">
              {totalVol >= 1000 ? `${(totalVol / 1000).toFixed(1)}t` : `${totalVol}kg`}
            </p>
            <p className="text-[11px] text-[#666] mt-1">volume</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[#444] text-sm text-center py-8">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#222] text-4xl mb-3">💪</p>
          <p className="text-[#444] text-sm">
            No workouts logged {period === 'all time' ? 'yet' : `this ${period.replace('ly', '')}`}
          </p>
        </div>
      ) : (
        logs.map(log => <WorkoutCard key={log.id} log={log} />)
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
  const allDone = sets.length > 0 && sets.every(s => s.done)

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
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className={`font-condensed text-[18px] font-bold uppercase tracking-[0.3px] ${allDone ? 'text-[#1D9E75]' : 'text-white'}`}>
            {ex.name}
          </div>
          <div className="text-[12px] text-[#666] mt-1">
            {ex.sets} sets · {ex.reps} reps
            {sets.filter(s => s.done).length > 0 && (
              <span className="ml-2 text-[#1D9E75]">
                {sets.filter(s => s.done).length}/{ex.sets} done
              </span>
            )}
          </div>
        </div>
        <div className={`text-[16px] transition-transform ${open ? 'rotate-90' : ''} ${allDone ? 'text-[#1D9E75]' : 'text-[#2a2a2a]'}`}>
          ›
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex flex-col gap-2">
          {sets.map((s, i) => {
            const weightEmpty = s.weight.trim() === ''
            return (
              <div key={i} className={`flex items-center gap-2 rounded-lg p-2 ${s.done ? 'bg-[#0d1f19]' : 'bg-[#1a1a1a]'}`}>
                <div className="font-condensed text-[13px] text-[#666] w-8">S{i + 1}</div>

                <div className="flex flex-col flex-1">
                  <span className="text-[10px] text-[#444] uppercase tracking-wider mb-1">kg</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={e => onUpdateSet(i, 'weight', e.target.value)}
                    placeholder="kg"
                    className={`bg-[#222] text-white text-[15px] font-bold rounded px-2 py-1 w-full outline-none border ${
                      weightEmpty && !s.done ? 'border-[#444]' : 'border-[#2a2a2a]'
                    } focus:border-[#E24B4A]`}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <span className="text-[10px] text-[#444] uppercase tracking-wider mb-1">reps</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={e => onUpdateSet(i, 'reps', e.target.value)}
                    placeholder="reps"
                    className="bg-[#222] text-white text-[15px] font-bold rounded px-2 py-1 w-full outline-none border border-[#2a2a2a] focus:border-[#E24B4A]"
                  />
                </div>

                <button
                  onClick={() => !weightEmpty && onToggleSet(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-[18px] border transition-all ${
                    s.done
                      ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
                      : weightEmpty
                      ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#2a2a2a] cursor-not-allowed'
                      : 'bg-[#222] border-[#2a2a2a] text-[#444]'
                  }`}
                >
                  ✓
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WorkoutPage() {
  const router = useRouter()
  const { activeDay, setActiveDay } = useAppStore()
  const exercises = EXERCISES[activeDay] || []
  const warmups = exercises.filter(e => e.warmup)
  const main = exercises.filter(e => !e.warmup)

  const [mainTab, setMainTab] = useState<'log' | 'review'>('log')
  const [sets, setSets] = useState<Record<string, SetData[]>>({})
  const [lastSession, setLastSession] = useState<LastSession>({})
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exerciseDbIds, setExerciseDbIds] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadExercises = async () => {
      const { data } = await supabase.from('exercises').select('id, name')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach(ex => { map[ex.name] = ex.id })
        setExerciseDbIds(map)
      }
    }
    loadExercises()
  }, [])

  useEffect(() => {
    const loadLastSession = async () => {
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('day_type', activeDay)
        .order('started_at', { ascending: false })
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
      setData.forEach(s => {
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

  useEffect(() => {
    const initial: Record<string, SetData[]> = {}
    exercises.forEach(ex => {
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
    setSets(prev => {
      const updated = [...(prev[exId] || [])]
      updated[setIndex] = { ...updated[setIndex], [field]: value }
      return { ...prev, [exId]: updated }
    })
  }

  const toggleSet = (exId: string, setIndex: number) => {
    setSets(prev => {
      const updated = [...(prev[exId] || [])]
      updated[setIndex] = { ...updated[setIndex], done: !updated[setIndex].done }
      return { ...prev, [exId]: updated }
    })
  }

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0)
  const doneSets = Object.values(sets).flat().filter(s => s.done).length
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0

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

  const saveSet = async (exId: string, setIndex: number, newDone: boolean) => {
    const setData = sets[exId]?.[setIndex]
    if (!setData) return
    setSaving(true)
    const logId = await ensureWorkoutLog()
    if (!logId) { setSaving(false); return }
    const ex = exercises.find(e => e.id === exId)
    if (!ex) { setSaving(false); return }
    const dbExId = exerciseDbIds[ex.name]
    if (!dbExId) { setSaving(false); return }

    await supabase.from('set_logs').upsert({
      workout_log_id: logId,
      exercise_id: dbExId,
      set_number: setIndex + 1,
      weight_kg: parseFloat(setData.weight) || null,
      reps: parseInt(setData.reps) || null,
      completed: newDone,
    }, { onConflict: 'workout_log_id,exercise_id,set_number' })

    setSaving(false)
  }

  const handleToggleSet = async (exId: string, setIndex: number) => {
    const current = sets[exId]?.[setIndex]
    if (!current) return
    if (current.weight.trim() === '') return
    const newDone = !current.done
    toggleSet(exId, setIndex)
    await saveSet(exId, setIndex, newDone)
  }

  const handleFinish = () => {
    setMainTab('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (workoutLogId) {
      supabase
        .from('workout_logs')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', workoutLogId)
    }
  }

  return (
    <div className="min-h-screen max-w-[480px] mx-auto pb-24 bg-[#0a0a0a]">

      {/* Sticky header */}
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
        {mainTab === 'log' && (
          <div className="flex justify-between text-xs text-[#666] mb-1">
            <span>{doneSets} / {totalSets} sets done</span>
            <span>{pct}%</span>
          </div>
        )}
        <div className="h-[3px] bg-[#1a1a1a] mx-[-18px]">
          {mainTab === 'log' && (
            <div className="h-[3px] bg-[#E24B4A] transition-all duration-500" style={{ width: `${pct}%` }} />
          )}
        </div>
      </div>

      {/* LOG / REVIEW tabs */}
      <div className="flex gap-2 px-[14px] pt-4 pb-3">
        {(['log', 'review'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`flex-1 font-condensed text-[15px] font-bold tracking-[2px] uppercase py-2 border rounded-sm transition-all ${
              mainTab === tab
                ? 'bg-[#E24B4A] border-[#E24B4A] text-white'
                : 'border-[#2a2a2a] text-[#666]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* REVIEW TAB */}
      {mainTab === 'review' && <ReviewPanel />}

      {/* LOG TAB */}
      {mainTab === 'log' && (
        <>
          <div className="flex gap-2 px-4 pb-2">
            {WORKOUT_DAYS.map(d => (
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

          <div className="mx-[14px] mt-2 mb-3 bg-[rgba(186,117,23,0.1)] border border-[rgba(186,117,23,0.3)] rounded p-3 text-[12px] text-[#BA7517]">
            ⚠️ Right shoulder, right elbow, knees — modified exercises loaded
          </div>

          {warmups.length > 0 && (
            <>
              <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-2 pb-1">
                Warmup
              </div>
              {warmups.map(ex => (
                <ExCard
                  key={ex.id}
                  ex={ex}
                  sets={sets[ex.id] || []}
                  onUpdateSet={(i, f, v) => updateSet(ex.id, i, f, v)}
                  onToggleSet={i => handleToggleSet(ex.id, i)}
                />
              ))}
            </>
          )}

          <div className="font-condensed text-[11px] font-semibold tracking-[3px] text-[#444] uppercase px-[18px] pt-4 pb-1">
            Exercises
          </div>
          {main.map(ex => (
            <ExCard
              key={ex.id}
              ex={ex}
              sets={sets[ex.id] || []}
              onUpdateSet={(i, f, v) => updateSet(ex.id, i, f, v)}
              onToggleSet={i => handleToggleSet(ex.id, i)}
            />
          ))}

          {doneSets > 0 && (
            <div className="px-[14px] mt-4 mb-8">
              <button
                onClick={handleFinish}
                className="w-full font-condensed text-[20px] font-bold tracking-[3px] uppercase py-4 rounded-sm bg-[#1D9E75] text-white"
              >
                Finish Workout 💪
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}