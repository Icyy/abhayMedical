import { useState } from "react"
import type { Medicine } from "../types/inventory"
import { getStatusClass } from "../utils/statusHelpers"
import MedicineDetailModal from "./MedicineDetailModal"

interface InventoryTableProps {
  medicines: Medicine[]
  removeMedicine: (id: string) => void
}

export const InventoryTable = ({ medicines, removeMedicine }: InventoryTableProps) => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E8E4D9] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E4D9]">
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Medicine</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Stock</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Category</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Status</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Margin</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Remove</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr
                key={med.id}
                className="border-b border-[#F1EFE8] hover:bg-[#F7F5F0] cursor-pointer"
                onClick={() => setSelectedMedicine(med)}
              >
                <td className="p-3 text-sm text-gray-900">{med.name}</td>
                <td className="p-3 text-sm text-gray-900">
                  {med.stock}
                  {med.unitsPerPack > 1 && (
                    <span className="text-xs text-[#8A8678] ml-1">
                      ({Math.floor(med.stock / med.unitsPerPack)} {med.packType}s)
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs text-[#8A8678]">{med.category}</td>
                <td className="p-3">
                  <span className={`${getStatusClass(med.status)} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {med.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {med.purchasePrice > 0 ? (
                    <span className={`text-xs font-medium ${((med.price - med.purchasePrice) / med.price * 100) > 20 ? 'text-green-700' : 'text-amber-700'}`}>
                      {(((med.price - med.purchasePrice) / med.price) * 100).toFixed(1)}%
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => confirm(`Remove ${med.name}?`) && removeMedicine(med.id)}
                    className="text-red-400 hover:text-red-600 text-xs hover:bg-red-50 px-2 py-1 rounded-md"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}
    </>
  )
}