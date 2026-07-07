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

  const getMargin = (med: Medicine) => {
    if (!med.batches || med.batches.length === 0) return null
    const activeBatches = med.batches.filter(b => b.stockUnits > 0)
    if (activeBatches.length === 0) return null
    // use oldest batch (FIFO - what's being sold now)
    const oldestBatch = activeBatches.sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    )[0]
    if (!oldestBatch.purchasePrice || oldestBatch.purchasePrice === 0) return null
    return (((med.mrp - oldestBatch.purchasePrice) / med.mrp) * 100).toFixed(1)
  }

  const getNearestExpiry = (med: Medicine) => {
    if (!med.batches || med.batches.length === 0) return null
    const active = med.batches
      .filter(b => b.stockUnits > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    if (active.length === 0) return null
    return active[0].expiryDate
  }

  const getBatchNumbers = (med: Medicine) => {
    if (!med.batches) return '—'
    const active = med.batches.filter(b => b.stockUnits > 0)
    if (active.length === 0) return '—'
    if (active.length === 1) return active[0].batchNumber
    return `${active[0].batchNumber} +${active.length - 1}`
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return new Date(expiryDate) < in30Days
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E8E4D9] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E4D9]">
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Medicine</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Batch</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Stock</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">MRP/unit</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Expiry</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Status</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Margin</th>
              <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Remove</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => {
              const margin = getMargin(med)
              const nearestExpiry = getNearestExpiry(med)
              const expiringSoon = isExpiringSoon(nearestExpiry)
              return (
                <tr
                  key={med.id}
                  className="border-b border-[#F1EFE8] hover:bg-[#F7F5F0] cursor-pointer"
                  onClick={() => setSelectedMedicine(med)}
                >
                  <td className="p-3 text-sm text-gray-900">{med.name}</td>
                  <td className="p-3 text-xs text-[#8A8678] font-mono">{getBatchNumbers(med)}</td>
                  <td className="p-3 text-sm text-gray-900">
                    {med.stock ?? 0}
                    {med.unitsPerPack > 1 && (
                      <span className="text-xs text-[#8A8678] ml-1">
                        ({Math.floor((med.stock ?? 0) / med.unitsPerPack)} {med.packType}s)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    ₹{(med.mrp || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-sm">
                    {nearestExpiry ? (
                      <span className={expiringSoon ? "text-red-600 text-xs font-medium" : "text-xs text-[#8A8678]"}>
                        {expiringSoon && "⚠️ "}
                        {new Date(nearestExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="p-3">
                    <span className={`${getStatusClass(med.status || 'OK')} px-2 py-0.5 rounded-full text-xs font-medium`}>
                      {med.status || 'OK'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {margin ? (
                      <span className={`text-xs font-medium ${parseFloat(margin) > 20 ? 'text-green-700' : 'text-amber-700'}`}>
                        {margin}%
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
              )
            })}
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