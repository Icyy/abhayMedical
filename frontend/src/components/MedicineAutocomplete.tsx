import { useState } from "react"
import { useInventoryStore } from "../store/inventoryStore"
import type { Medicine } from "../types/inventory"

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine) => void
}

const MedicineAutocomplete = ({ onSelect }: MedicineAutocompleteProps) => {
  const medicines = useInventoryStore((state) => state.medicines)
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = query
    ? medicines.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine)
    setQuery(medicine.name)
    setShowSuggestions(false)
  }

  const getUnitLabel = (med: Medicine) => {
    if (med.unitsPerPack > 1) {
      return `${med.stock} ${med.packType === 'bottle' ? 'ml' : 'tablets'} · ₹${(med.price / med.unitsPerPack).toFixed(2)}/unit`
    }
    return `Stock: ${med.stock} · ₹${med.price}`
  }

  return (
    <div className="relative flex-1">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Search medicine by name..."
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((med) => (
            <button
              key={med.id}
              onClick={() => handleSelect(med)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex justify-between items-center"
            >
              <span>{med.name}</span>
              <span className="text-xs text-gray-400">{getUnitLabel(med)}</span>
            </button>
          ))}
        </div>
      )}
      {showSuggestions && query && suggestions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg p-3 text-sm text-gray-400">
          No medicines found
        </div>
      )}
    </div>
  )
}

export default MedicineAutocomplete