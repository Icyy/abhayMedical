import { useState } from "react"
import { AlertOctagon, PackageMinus, ShoppingCart } from "lucide-react"
import { useInventoryStore } from "../store/inventoryStore"
import type { Medicine } from "../types/inventory"
import type { Supplier } from "../types/supplier"
import ReorderModal from "../components/ReorderModal"
import PurchaseOrderBillModal from "../components/PurchaseOrderBillModal"

const ReordersPage = () => {
  const medicines = useInventoryStore((state) => state.medicines)
  const loadMedicines = useInventoryStore((state) => (state as any).loadMedicines || (state as any).fetchMedicines)
  
  const critical = medicines.filter((med) => med.status === "CRITICAL")
  const lowStock = medicines.filter((med) => med.status === "LOW")
  const reorders = [...critical, ...lowStock]

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [billData, setBillData] = useState<{ medicine: Medicine, supplier: Supplier, quantity: number } | null>(null)

  const handleProceed = (medicine: Medicine, supplier: Supplier, quantity: number) => {
    setBillData({ medicine, supplier, quantity })
  }

  const formatDisplayQuantity = (qty: number, packType?: string, unitsPerPack: number = 1) => {
    const packSize = unitsPerPack || 1;
    if (!packType) return `${qty} units`;
    if (packType.toLowerCase() === 'bottle') {
      const bottles = Number((qty / packSize).toFixed(1));
      return `${bottles} bottle${bottles !== 1 ? 's' : ''}`;
    }
    if (packType.toLowerCase() === 'strip') {
      const strips = Math.floor(qty / packSize);
      const loose = qty % packSize;
      if (strips > 0 && loose > 0) return `${strips} strip${strips > 1 ? 's' : ''}, ${loose} tab${loose !== 1 ? 's' : ''}`;
      if (strips > 0) return `${strips} strip${strips > 1 ? 's' : ''}`;
      return `${loose} tab${loose !== 1 ? 's' : ''}`;
    }
    return `${qty} ${packType}${qty !== 1 ? 's' : ''}`;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase & Reorders</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage low stock and draft purchase orders</p>
        </div>
        {reorders.length > 0 && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm inline-flex items-center gap-2">
            <PackageMinus size={16} /> {reorders.length} items require action
          </div>
        )}
      </div>

      {reorders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="bg-green-50 p-4 rounded-full mb-3 text-green-500">
            <ShoppingCart size={32} />
          </div>
          <p className="text-lg font-bold text-gray-900">Inventory is well stocked! 🎉</p>
          <p className="text-sm text-gray-500 mt-1">No items are currently below their minimum thresholds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Render Critical First, then Low */}
          {reorders.map((med) => (
            <div key={med.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${med.status === "CRITICAL" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                    {med.status === "CRITICAL" ? <AlertOctagon size={20} /> : <PackageMinus size={20} />}
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    med.status === "CRITICAL" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {med.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate" title={med.name}>{med.name}</h3>
                <p className="text-sm font-bold text-gray-500 mt-1 mb-4">
                  Current Stock: <span className="text-gray-900">{formatDisplayQuantity(med.stock, med.packType, med.unitsPerPack)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedMedicine(med)}
                className="w-full bg-white border-2 border-[#0F4C3A] text-[#0F4C3A] hover:bg-[#0F4C3A] hover:text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Draft Purchase Order
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedMedicine && <ReorderModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} onProceed={handleProceed} />}
      {billData && (
        <PurchaseOrderBillModal
          medicine={billData.medicine}
          supplier={billData.supplier}
          estimatedQuantity={billData.quantity}
          onClose={() => setBillData(null)}
          onOrderCreated={() => {
            setBillData(null); setSelectedMedicine(null); if(typeof loadMedicines === 'function') loadMedicines({ page: 1 });
          }}
        />
      )}
    </div>
  )
}

export default ReordersPage