import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import CreatePurchaseOrderForm from "../components/CreatePurchaseOrderForm"
import PurchaseOrderDetailModal from "../components/PurchaseOrderDetailModal"
import { useSupplierStore } from "../store/supplierStore"
import type { PurchaseOrder } from "../types/supplier"

const PurchaseOrdersPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const purchaseOrders = useSupplierStore((state) => state.purchaseOrders)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    loadSuppliers()
    loadPurchaseOrders()
  }, [])

  const getStatusConfig = (status: string) => {
    if (status === "RECEIVED") return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", border: "border-green-200" }
    if (status === "CANCELLED") return { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
    return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50">
      {/* Left Column: Persistent PO Form */}
      <div className="w-full xl:w-5/12 shrink-0">
        <div className="bg-white border border-[#E8E4D9] rounded-xl shadow-sm p-4 md:p-5 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Purchase Order</h2>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">Alt + O to add items</span>
          </div>
          <CreatePurchaseOrderForm />
        </div>
      </div>

      {/* Right Column: Queue & List */}
      <div className="w-full xl:w-7/12 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium text-gray-800">Order History</h1>
          <span className="text-xs text-[#8A8678] bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
            {purchaseOrders.length} orders
          </span>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">No purchase orders yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {purchaseOrders.map((order) => {
              const supplier = suppliers.find((s) => s.id === order.supplierId)
              const config = getStatusConfig(order.status)
              const Icon = config.icon

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white border border-[#E8E4D9] rounded-xl p-4 cursor-pointer hover:shadow-sm hover:border-[#0F4C3A]/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {supplier?.name || order.supplier?.name || "Unknown supplier"}
                        </p>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${config.bg} ${config.color} ${config.border}`}>
                          <Icon size={10} strokeWidth={3} />
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8A8678]">
                        Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {order.expectedDelivery && ` · Expected: ${new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-base font-bold text-gray-900">₹{order.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded mt-1">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-1.5">
                      {order.items.slice(0, 4).map((item, i) => (
                        <span key={i} className="text-[11px] bg-[#F7F5F0] text-gray-700 px-2 py-1 rounded-md font-medium border border-gray-100">
                          {item.medicineName} <span className="text-gray-400 mx-0.5">×</span> {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-medium border border-gray-100">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {selectedOrder && (
          <PurchaseOrderDetailModal
            order={selectedOrder}
            supplierName={suppliers.find(s => s.id === selectedOrder.supplierId)?.name || "Unknown"}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  )
}

export default PurchaseOrdersPage