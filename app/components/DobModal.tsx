'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export default function DobModal() {
  const { dob, setDob } = useAppStore()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  // If DOB already set, don't show anything
  if (dob) return null

  const handleSave = () => {
    if (!value) {
      setError('Please enter your date of birth')
      return
    }
    const birth = new Date(value)
    const today = new Date()
    if (birth >= today) {
      setError('Date of birth must be in the past')
      return
    }
    setDob(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-[#141414] p-6 flex flex-col gap-5">

        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="font-condensed text-4xl font-black tracking-wider text-white uppercase">
            GRND
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome, Gurpreet. Let's set up your profile.
          </p>
        </div>

        {/* DOB Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Date of Birth
          </label>
          <input
            type="date"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            className="w-full rounded-xl bg-[#1e1e1e] px-4 py-3 text-white text-base outline-none border border-white/10 focus:border-[#E24B4A]"
          />
          {error && (
            <p className="text-xs text-[#E24B4A]">{error}</p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-[#E24B4A] py-3 text-sm font-bold uppercase tracking-widest text-white active:opacity-80"
        >
          Let's Go
        </button>

      </div>
    </div>
  )
}