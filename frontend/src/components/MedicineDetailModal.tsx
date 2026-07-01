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
  const margin = medicine.purchasePrice > 0
    ? (((medicine.price - medicine.purchasePrice) / medicine.price) * 100).toFixed(1)
    : null

  const packInfo = medicine.unitsPerPack > 1
    ? `${Math.floor(medicine.stock / medicine.unitsPerPack)} ${medicine.packType}s (${medicine.unitsPerPack} units/${medicine.packType})`
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Category</p>
            <p className="text-sm text-gray-900">{CATEGORY_LABELS[medicine.category] || medicine.category}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Batch Number</p>
            <p className="text-sm text-gray-900 font-mono">{medicine.batchNumber}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Stock</p>
            <p className="text-sm text-gray-900">
              {medicine.stock} units
              {packInfo && <span className="text-xs text-[#8A8678] ml-1">({packInfo})</span>}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Unit</p>
            <p className="text-sm text-gray-900">{medicine.unit}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">MRP (per pack)</p>
            <p className="text-sm text-gray-900">₹{medicine.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Purchase Price</p>
            <p className="text-sm text-gray-900">
              {medicine.purchasePrice > 0 ? `₹${medicine.purchasePrice.toFixed(2)}` : '—'}
            </p>
          </div>
          {margin && (
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#8A8678]">Margin</p>
              <p className={`text-sm font-medium ${parseFloat(margin) > 20 ? 'text-green-700' : 'text-amber-700'}`}>
                {margin}%
              </p>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">GST %</p>
            <p className="text-sm text-gray-900">{medicine.gstPercent}%</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Manufacturing Date</p>
            <p className="text-sm text-gray-900">
              {new Date(medicine.manufacturingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-[#8A8678]">Expiry Date</p>
            <p className="text-sm text-gray-900">
              {new Date(medicine.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {medicine.unitsPerPack > 1 && (
          <div className="mt-4 pt-4 border-t border-[#F1EFE8] bg-[#F7F5F0] rounded-lg p-3">
            <p className="text-xs text-[#8A8678] mb-1">Per unit pricing</p>
            <p className="text-sm text-gray-900">
              ₹{(medicine.price / medicine.unitsPerPack).toFixed(2)} per {medicine.packType === 'bottle' ? 'ml' : 'tablet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicineDetailModal