import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SetLog {
  weight: number
  reps: number
  done: boolean
}

interface AppState {
  // Workout
  activeDay: 'push' | 'pull' | 'legs'
  setActiveDay: (day: 'push' | 'pull' | 'legs') => void
  completedExercises: Record<string, boolean>
  toggleExercise: (id: string) => void
  setLogs: Record<string, SetLog[]>
  updateSetLog: (exId: string, setIndex: number, data: Partial<SetLog>) => void

  // Diet
  dietDay: Record<string, 'ate' | 'skipped' | null>
  logMeal: (id: string) => void
  resetDiet: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeDay: 'push',
      setActiveDay: (day) => set({ activeDay: day }),
      completedExercises: {},
      toggleExercise: (id) =>
        set((s) => ({
          completedExercises: {
            ...s.completedExercises,
            [id]: !s.completedExercises[id],
          },
        })),
      setLogs: {},
      updateSetLog: (exId, setIndex, data) =>
        set((s) => {
          const logs = s.setLogs[exId] ? [...s.setLogs[exId]] : []
          logs[setIndex] = { ...logs[setIndex], ...data }
          return { setLogs: { ...s.setLogs, [exId]: logs } }
        }),

      dietDay: {},
      logMeal: (id) =>
        set((s) => ({
          dietDay: {
            ...s.dietDay,
            [id]: s.dietDay[id] === 'ate' ? null : 'ate',
          },
        })),
      resetDiet: () => set({ dietDay: {} }),
    }),
    { name: 'grnd-store' }
  )
)