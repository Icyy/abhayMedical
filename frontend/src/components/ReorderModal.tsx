import { useState, useEffect } from "react"
import { X, TrendingDown } from "lucide-react"
import type { Medicine } from "../types/inventory"
import { useSupplierStore } from "../store/supplierStore"
import type { Supplier } from "../types/supplier"

interface ReorderModalProps {
  medicine: Medicine
  onClose: () => void
  onProceed: (medicine: Medicine, supplier: Supplier, quantity: number) => void
}

const ReorderModal = ({ medicine, onClose, onProceed }: ReorderModalProps) => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(50)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSuppliers().finally(() => setIsLoading(false))
  }, [])

  const sortedSuppliers = [...suppliers].sort((a, b) => b.discountPercent - a.discountPercent)

  useEffect(() => {
    if (sortedSuppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(sortedSuppliers[0].id)
    }
  }, [suppliers])

  const selectedSupplier = sortedSuppliers.find((s) => s.id === selectedSupplierId)
  const getPurchasePrice = (s: Supplier) => medicine.mrp * (1 - s.discountPercent / 100)

  const handleProceed = () => {
    if (!selectedSupplier) return
    onProceed(medicine, selectedSupplier, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md flex flex-col max-h-[90vh]">

        {/* Fixed header */}
        <div className="flex justify-between items-start p-5 border-b border-[#F1EFE8] flex-shrink-0">
          <div>
            <h2 className="text-base font-medium text-gray-900">Select Supplier</h2>
            <p className="text-sm text-[#8A8678] mt-0.5">{medicine.name}</p>
            <p className="text-xs text-red-600 mt-1">
              Current stock: {medicine.stock} units · MRP ₹{medicine.mrp}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Loading suppliers...</p>
          ) : sortedSuppliers.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 mb-1">No suppliers added yet.</p>
              <p className="text-xs text-[#8A8678]">Add suppliers with their discount % first.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#8A8678] mb-2 uppercase tracking-wide">
                Sorted by highest margin
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {sortedSuppliers.map((s, i) => {
                  const purchasePrice = getPurchasePrice(s)
                  const isSelected = selectedSupplierId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        isSelected ? "border-[#0F4C3A] bg-green-50" : "border-[#E8E4D9] hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {i === 0 && <TrendingDown size={14} className="text-green-600 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-[10px] text-[#8A8678]">
                            {s.discountPercent}% trade discount
                            {i === 0 && <span className="text-green-600 ml-1">· Best margin</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-medium text-gray-900">₹{purchasePrice.toFixed(2)}</p>
                        <p className="text-[10px] text-[#8A8678]">{s.discountPercent.toFixed(1)}% margin</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mb-4">
                <label className="text-xs text-[#8A8678] block mb-1.5">Estimated quantity to order</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                />
                <p className="text-xs text-[#8A8678] mt-1">You'll confirm exact details in the next step</p>
              </div>

              {selectedSupplier && (
                <div className="bg-[#F7F5F0] rounded-lg p-3 text-xs text-[#8A8678]">
                  <div className="flex justify-between mb-1">
                    <span>Estimated purchase cost</span>
                    <span className="text-gray-900 font-medium">
                      ₹{(quantity * getPurchasePrice(selectedSupplier)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected margin</span>
                    <span className={selectedSupplier.discountPercent > 15 ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                      {selectedSupplier.discountPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed footer - button always visible */}
        {sortedSuppliers.length > 0 && (
          <div className="p-5 border-t border-[#F1EFE8] flex-shrink-0">
            <button
              onClick={handleProceed}
              disabled={!selectedSupplier}
              className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm font-medium py-3 rounded-lg transition-colors"
            >
              Continue with {selectedSupplier?.name || "..."}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReorderModal