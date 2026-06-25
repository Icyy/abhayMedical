import { useState, useEffect } from "react"
import { X, TrendingDown } from "lucide-react"
import type { Medicine } from "../types/inventory"
import { comparePricesForMedicine } from "../services/supplierService"
import { useSupplierStore } from "../store/supplierStore"

interface ReorderModalProps {
  medicine: Medicine
  onClose: () => void
  onOrderCreated: () => void
}

interface PriceOption {
  pricePerUnit: number
  supplier: { id: string; name: string }
}

const ReorderModal = ({ medicine, onClose, onOrderCreated }: ReorderModalProps) => {
  const [prices, setPrices] = useState<PriceOption[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<PriceOption | null>(null)
  const [quantity, setQuantity] = useState(50)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder)
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders)

  useEffect(() => {
    const load = async () => {
      try {
        const results = await comparePricesForMedicine(medicine.name)
        setPrices(results)
        if (results.length > 0) setSelectedSupplier(results[0])
      } catch {
        setPrices([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [medicine.name])

  const handleOrder = async () => {
    if (!selectedSupplier) return
    setIsSubmitting(true)
    try {
      await addPurchaseOrder({
        supplierId: selectedSupplier.supplier.id,
        items: [{
          medicineName: medicine.name,
          quantity,
          pricePerUnit: selectedSupplier.pricePerUnit
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

  const margin = selectedSupplier
    ? (((medicine.price - selectedSupplier.pricePerUnit) / medicine.price) * 100).toFixed(1)
    : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">Reorder</h2>
            <p className="text-sm text-[#8A8678] mt-0.5">{medicine.name}</p>
            <p className="text-xs text-red-600 mt-1">Current stock: {medicine.stock} {medicine.unit}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Looking up supplier prices...</p>
        ) : prices.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 mb-1">No supplier pricing found for this medicine.</p>
            <p className="text-xs text-[#8A8678]">Add pricing under Suppliers → Add medicine price, then try again.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-[#8A8678] mb-2">Select supplier (sorted by lowest price)</p>
              <div className="flex flex-col gap-2">
                {prices.map((p, i) => (
                  <button
                    key={p.supplier.id}
                    onClick={() => setSelectedSupplier(p)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      selectedSupplier?.supplier.id === p.supplier.id
                        ? "border-[#0F4C3A] bg-green-50"
                        : "border-[#E8E4D9] hover:border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {i === 0 && <TrendingDown size={14} className="text-green-600" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.supplier.name}</p>
                        {i === 0 && <p className="text-[10px] text-green-600">Cheapest option</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{p.pricePerUnit}/unit</p>
                      <p className="text-[10px] text-[#8A8678]">
                        {(((medicine.price - p.pricePerUnit) / medicine.price) * 100).toFixed(1)}% margin
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#8A8678] block mb-1.5">Order quantity</label>
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
                  <span>Total cost</span>
                  <span className="text-gray-900 font-medium">
                    ₹{(quantity * selectedSupplier.pricePerUnit).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Selling price (MRP)</span>
                  <span className="text-gray-900">₹{medicine.price}/unit</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected margin</span>
                  <span className={parseFloat(margin!) > 20 ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                    {margin}%
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={!selectedSupplier || isSubmitting}
              className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
            >
              {isSubmitting ? "Creating order..." : `Order from ${selectedSupplier?.supplier.name || "..."}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReorderModal