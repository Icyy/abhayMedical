import { useState, useEffect } from "react"
import { X, TrendingDown, Truck } from "lucide-react"
import type { Medicine } from "../types/inventory"
import { useSupplierStore } from "../store/supplierStore"
import type { Supplier } from "../types/supplier"

interface ReorderModalProps {
  medicine: Medicine; onClose: () => void; onProceed: (medicine: Medicine, supplier: Supplier, quantity: number) => void
}

const ReorderModal = ({ medicine, onClose, onProceed }: ReorderModalProps) => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(50)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadSuppliers().finally(() => setIsLoading(false)) }, [])

  const sortedSuppliers = [...suppliers].sort((a, b) => b.discountPercent - a.discountPercent)
  useEffect(() => { if (sortedSuppliers.length > 0 && !selectedSupplierId) setSelectedSupplierId(sortedSuppliers[0].id) }, [suppliers])

  const selectedSupplier = sortedSuppliers.find((s) => s.id === selectedSupplierId)
  const getPurchasePrice = (s: Supplier) => medicine.mrp * (1 - s.discountPercent / 100)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex justify-between items-start p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl sm:rounded-t-xl shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Supplier</h2>
            <p className="text-sm font-bold text-gray-500 mt-0.5">{medicine.name}</p>
          </div>
          <button onClick={onClose} className="bg-white border border-gray-200 text-gray-400 hover:text-gray-800 rounded-full p-1.5 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <p className="text-sm font-bold text-gray-400 py-10 text-center animate-pulse">Loading supplier directory...</p>
          ) : sortedSuppliers.length === 0 ? (
            <div className="py-10 text-center">
              <Truck size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-900 mb-1">No suppliers configured.</p>
              <p className="text-xs font-medium text-gray-500">Please add suppliers in the settings first.</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Available Suppliers (By Margin)</p>
              <div className="flex flex-col gap-3 mb-6">
                {sortedSuppliers.map((s, i) => {
                  const isSelected = selectedSupplierId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all overflow-hidden ${
                        isSelected ? "border-[#0F4C3A] bg-green-50/30 shadow-sm" : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0F4C3A]" />}
                      <div className="flex items-center gap-3 pl-2">
                        {i === 0 && <div className="bg-green-100 p-1.5 rounded-full"><TrendingDown size={14} className="text-green-700" /></div>}
                        <div>
                          <p className="text-sm font-bold text-gray-900">{s.name}</p>
                          <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                            {s.discountPercent}% flat discount {i === 0 && <span className="text-green-600 ml-1">· Best Margin</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{getPurchasePrice(s).toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">cost / pack</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <label className="text-xs font-bold text-gray-700 block mb-2">Estimated Quantity (Packs)</label>
                <input
                  type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm mb-2"
                />
                {selectedSupplier && (
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-500">Est. Total Cost</span>
                    <span className="font-bold text-[#0F4C3A] text-base">₹{(quantity * getPurchasePrice(selectedSupplier)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {sortedSuppliers.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl shrink-0">
            <button
              onClick={() => { if (selectedSupplier) { onProceed(medicine, selectedSupplier, quantity); onClose(); } }}
              disabled={!selectedSupplier}
              className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm font-bold py-3.5 rounded-lg shadow-sm transition-colors"
            >
              Continue to Draft Bill
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReorderModal