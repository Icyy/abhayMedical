import type { Medicine } from "../types/inventory"
import { getStatusClass } from "../utils/statusHelpers"

interface MedicineDetailModalProps {
  medicine: Medicine
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  ALLOPATHIC: 'Allopathic', AYURVEDIC: 'Ayurvedic', HOMEOPATHIC: 'Homeopathic',
  VETERINARY: 'Veterinary', SURGICAL: 'Surgical', COSMETIC: 'Cosmetic',
  PERSONAL_CARE: 'Personal Care', FOOD_SUPPLEMENT: 'Food Supplement',
  BABY_CARE: 'Baby Care', GENERAL_STORE: 'General Store', OTHER: 'Other'
}

const MedicineDetailModal = ({ medicine, onClose }: MedicineDetailModalProps) => {
  const packInfo = medicine.unitsPerPack > 1
    ? `${Math.floor(medicine.stock)} ${medicine.packType}s × ${medicine.unitsPerPack} units`
    : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">{medicine.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(medicine.status)}`}>
              {medicine.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Category</p>
            <p className="text-sm text-gray-900">{CATEGORY_LABELS[medicine.category] || medicine.category}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Pack type</p>
            <p className="text-sm text-gray-900">{medicine.unitsPerPack} units per {medicine.packType}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Total stock</p>
            <p className="text-sm text-gray-900">
              {medicine.stock} units
              {packInfo && <span className="text-xs text-[#8A8678] ml-1">({packInfo})</span>}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">MRP per unit</p>
            <p className="text-sm text-gray-900">₹{(medicine.mrp/medicine.unitsPerPack).toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">MRP per {medicine.packType}</p>
            <p className="text-sm text-gray-900">₹{(medicine.mrp).toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">GST %</p>
            <p className="text-sm text-gray-900">{medicine.gstPercent}%</p>
          </div>
          {medicine.expiringBatches > 0 && (
            <div className="flex flex-col gap-0.5 col-span-2">
              <p className="text-xs text-amber-600">⚠️ {medicine.expiringBatches} batch{medicine.expiringBatches > 1 ? 'es' : ''} expiring within 30 days</p>
            </div>
          )}
        </div>

        {medicine.batches && medicine.batches.length > 0 && (
          <div>
            <p className="text-xs text-[#8A8678] uppercase tracking-wide mb-2">Active Batches</p>
            <div className="flex flex-col gap-2">
              {medicine.batches
                .filter(b => b.stockUnits > 0)
                .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                .map((batch) => {
                  const margin = batch.purchasePrice > 0
                    ? (((medicine.mrp - batch.purchasePrice) / medicine.mrp) * 100).toFixed(1)
                    : null
                  return (
                    <div key={batch.id} className="bg-[#F7F5F0] rounded-lg p-3 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-gray-700">{batch.batchNumber}</span>
                        <span className="text-gray-900 font-medium">{batch.stockUnits} units</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[#8A8678]">
                        <div className="flex justify-between">
                          <span>Purchase price</span>
                          <span className="text-gray-700">₹{batch.purchasePrice.toFixed(2)}/unit</span>
                        </div>
                        {margin && (
                          <div className="flex justify-between">
                            <span>Margin</span>
                            <span className={parseFloat(margin) > 15 ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                              {margin}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Expiry</span>
                          <span className="text-gray-700">
                            {new Date(batch.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mfg</span>
                          <span className="text-gray-700">
                            {new Date(batch.manufacturingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicineDetailModal