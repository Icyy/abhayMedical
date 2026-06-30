import { useState, useEffect, useRef } from "react"

interface SimpleDateInputProps {
  value: string
  onChange: (isoDate: string) => void
  label: string
}

const SimpleDateInput = ({ value, onChange, label }: SimpleDateInputProps) => {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-")
      setYear(y || "")
      setMonth(m || "")
      setDay(d || "")
    }
  }, [value])

  const emitChange = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      onChange(`${y}-${m}-${d}`)
    }
  }

  const handleDay = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 2)
    setDay(clean)
    if (clean.length === 2) monthRef.current?.focus()
    emitChange(clean, month, year)
  }

  const handleMonth = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 2)
    setMonth(clean)
    if (clean.length === 2) yearRef.current?.focus()
    emitChange(day, clean, year)
  }

  const handleYear = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4)
    setYear(clean)
    emitChange(day, month, clean)
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          inputMode="numeric"
          value={day}
          onChange={(e) => handleDay(e.target.value)}
          placeholder="DD"
          maxLength={2}
          className="w-14 border border-gray-200 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:border-green-400"
        />
        <span className="text-gray-300">/</span>
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          placeholder="MM"
          maxLength={2}
          className="w-14 border border-gray-200 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:border-green-400"
        />
        <span className="text-gray-300">/</span>
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          placeholder="YYYY"
          maxLength={4}
          className="w-20 border border-gray-200 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:border-green-400"
        />
      </div>
    </div>
  )
}

export default SimpleDateInput