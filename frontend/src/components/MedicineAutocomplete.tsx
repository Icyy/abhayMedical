import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { useInventoryStore } from "../store/inventoryStore"
import type { Medicine } from "../types/inventory"

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine) => void
}

const MedicineAutocomplete = ({ onSelect }: MedicineAutocompleteProps) => {
  const medicines = useInventoryStore((state) => state.medicines)
  // Assumes your fetch method is named loadMedicines or fetchMedicines. Adjust if named differently.
  const loadMedicines = useInventoryStore((state) => (state as any).loadMedicines || (state as any).fetchMedicines)
  
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Data Fix: Fetch inventory if it hasn't been loaded into the store yet
  useEffect(() => {
    if (medicines.length === 0 && typeof loadMedicines === 'function') {
      loadMedicines()
    }
  }, [medicines.length, loadMedicines])

  // Optional: Auto-focus this input when it mounts (helps the continuous scanning loop)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const suggestions = query
    ? medicines.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine)
    setQuery(medicine.name)
    setShowSuggestions(false)
    setSelectedIndex(0)
  }

  // 2. Flow Fix: Full keyboard navigation to eliminate mouse clicks
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const getUnitLabel = (med: Medicine) => {
    if (med.unitsPerPack > 1) {
      return `${med.stock} ${med.packType === 'bottle' ? 'ml' : 'tablets'} · ₹${(med.mrp / med.unitsPerPack).toFixed(2)}/unit`
    }
    return `Stock: ${med.stock} · ₹${med.mrp}`
  }

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { 
          setQuery(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(0) // Reset highlight when typing changes
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Search medicine by name..."
        className="w-full border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A]"
      />
      
      {/* 3. UI Fix: z-50 ensures the dropdown doesn't clip behind the dense table below */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-xl max-h-56 overflow-y-auto">
          {suggestions.map((med, index) => (
            <button
              key={med.id}
              onClick={() => handleSelect(med)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex justify-between items-center ${
                index === selectedIndex ? "bg-[#0F4C3A] text-white" : "hover:bg-green-50 text-gray-900"
              }`}
            >
              <span className="font-medium">{med.name}</span>
              <span className={index === selectedIndex ? "text-green-100 text-xs" : "text-gray-400 text-xs"}>
                {getUnitLabel(med)}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && query && suggestions.length === 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-xl p-3 text-sm text-gray-500 font-medium">
          No medicines found for "{query}"
        </div>
      )}
    </div>
  )
}

export default MedicineAutocomplete