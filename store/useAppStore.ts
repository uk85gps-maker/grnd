import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SetLog {
  weight: number
  reps: number
  done: boolean
}

interface AppState {
  // Profile
  dob: string | null
  setDob: (dob: string) => void
  getAge: () => number | null

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
    (set, get) => ({
      // Profile
      dob: null,
      setDob: (dob) => set({ dob }),
      getAge: () => {
        const { dob } = get()
        if (!dob) return null
        const today = new Date()
        const birth = new Date(dob)
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return age
      },

      // Workout
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

      // Diet
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