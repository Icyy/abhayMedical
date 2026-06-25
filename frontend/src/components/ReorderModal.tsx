import { useState, useEffect } from "react"
import { X, TrendingDown } from "lucide-react"
import type { Medicine } from "../types/inventory"
import { useSupplierStore } from "../store/supplierStore"

interface ReorderModalProps {
  medicine: Medicine
  onClose: () => void
  onOrderCreated: () => void
}

const ReorderModal = ({ medicine, onClose, onOrderCreated }: ReorderModalProps) => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder)
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders)

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSuppliers().finally(() => setIsLoading(false))
  }, [])

  // sort suppliers by highest discount = highest margin
  const sortedSuppliers = [...suppliers].sort((a, b) => b.discountPercent - a.discountPercent)
  const selectedSupplier = sortedSuppliers.find((s) => s.id === selectedSupplierId) || sortedSuppliers[0] || null

  useEffect(() => {
    if (sortedSuppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(sortedSuppliers[0].id)
    }
  }, [suppliers])

  const getPurchasePrice = (supplier: typeof suppliers[0]) =>
    medicine.price * (1 - supplier.discountPercent / 100)

  const getMargin = (supplier: typeof suppliers[0]) =>
    supplier.discountPercent

  const handleOrder = async () => {
    if (!selectedSupplier) return
    setIsSubmitting(true)
    try {
      const purchasePrice = getPurchasePrice(selectedSupplier)
      await addPurchaseOrder({
        supplierId: selectedSupplier.id,
        items: [{
          medicineName: medicine.name,
          quantity,
          pricePerUnit: purchasePrice
        }]
      })
      await loadPurchaseOrders()
      onOrderCreated()
      onClose()
    } catch (err: any) {
      alert(err.message || "Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">Reorder</h2>
            <p className="text-sm text-[#8A8678] mt-0.5">{medicine.name}</p>
            <p className="text-xs text-red-600 mt-1">
              Current stock: {medicine.stock} {medicine.unit} · MRP ₹{medicine.price}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading suppliers...</p>
        ) : sortedSuppliers.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 mb-1">No suppliers added yet.</p>
            <p className="text-xs text-[#8A8678]">Add suppliers with their discount % under the Suppliers page first.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-[#8A8678] mb-2 uppercase tracking-wide">
                Select supplier — sorted by highest margin
              </p>
              <div className="flex flex-col gap-2">
                {sortedSuppliers.map((s, i) => {
                  const purchasePrice = getPurchasePrice(s)
                  const margin = getMargin(s)
                  const isSelected = selectedSupplierId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-[#0F4C3A] bg-green-50"
                          : "border-[#E8E4D9] hover:border-green-200"
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
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{purchasePrice.toFixed(2)}</p>
                        <p className="text-[10px] text-[#8A8678]">{margin.toFixed(1)}% margin</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#8A8678] block mb-1.5">Order quantity ({medicine.unit})</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            {selectedSupplier && (
              <div className="bg-[#F7F5F0] rounded-lg p-3 mb-4 text-xs text-[#8A8678]">
                <div className="flex justify-between mb-1">
                  <span>Purchase price (after {selectedSupplier.discountPercent}% discount)</span>
                  <span className="text-gray-900 font-medium">
                    ₹{getPurchasePrice(selectedSupplier).toFixed(2)}/unit
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Total order cost</span>
                  <span className="text-gray-900 font-medium">
                    ₹{(quantity * getPurchasePrice(selectedSupplier)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expected margin on sale</span>
                  <span className={selectedSupplier.discountPercent > 15 ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                    {getMargin(selectedSupplier).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={!selectedSupplier || isSubmitting || quantity < 1}
              className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
            >
              {isSubmitting
                ? "Creating order..."
                : `Order ${quantity} ${medicine.unit} from ${selectedSupplier?.name || "..."}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReorderModal