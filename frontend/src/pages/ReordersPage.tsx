import { useState } from "react"
import { useInventoryStore } from "../store/inventoryStore"
import { getStatusClass } from "../utils/statusHelpers"
import type { Medicine } from "../types/inventory"
import type { Supplier } from "../types/supplier"
import ReorderModal from "../components/ReorderModal"
import PurchaseOrderBillModal from "../components/PurchaseOrderBillModal"

const ReordersPage = () => {
  const medicines = useInventoryStore((state) => state.medicines)
  const loadMedicines = useInventoryStore((state) => state.loadMedicines)
  const reorders = medicines.filter((med) => med.status === "CRITICAL" || med.status === "LOW")

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [billData, setBillData] = useState<{
    medicine: Medicine
    supplier: Supplier
    quantity: number
  } | null>(null)

  const handleProceed = (medicine: Medicine, supplier: Supplier, quantity: number) => {
    setBillData({ medicine, supplier, quantity })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Reorders</h1>
        {reorders.length > 0 && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
            {reorders.length} need reordering
          </span>
        )}
      </div>

      {reorders.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E8E4D9] p-8 text-center">
          <p className="text-sm text-gray-400">All medicines are well stocked! 🎉</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reorders.map((med) => (
            <div
              key={med.id}
              className="bg-white border border-[#E8E4D9] rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                <p className="text-xs text-[#8A8678] mt-0.5">
                  {med.stock} units remaining · {med.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${getStatusClass(med.status)} px-2 py-0.5 rounded-full text-xs font-medium`}>
                  {med.status}
                </span>
                <button
                  onClick={() => setSelectedMedicine(med)}
                  className="bg-[#0F4C3A] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#0c3b2d]"
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMedicine && (
        <ReorderModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
          onProceed={handleProceed}
        />
      )}

      {billData && (
        <PurchaseOrderBillModal
          medicine={billData.medicine}
          supplier={billData.supplier}
          estimatedQuantity={billData.quantity}
          onClose={() => setBillData(null)}
          onOrderCreated={() => {
            setBillData(null)
            setSelectedMedicine(null)
            loadMedicines({ page: 1 })
          }}
        />
      )}
    </div>
  )
}

export default ReordersPage