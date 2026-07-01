import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import CreatePurchaseOrderForm from "../components/CreatePurchaseOrderForm"
import CollapsibleSection from "../components/CollapsibleSection"
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
    if (status === "RECEIVED") return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-500" }
    if (status === "CANCELLED") return { icon: XCircle, color: "text-red-500", bg: "bg-red-400" }
    return { icon: Clock, color: "text-amber-600", bg: "bg-amber-400" }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Purchase Orders</h1>
        <span className="text-xs text-[#8A8678]">{purchaseOrders.length} orders</span>
      </div>

      <CollapsibleSection title="Create purchase order">
        <CreatePurchaseOrderForm />
      </CollapsibleSection>

      {purchaseOrders.length === 0 ? (
        <p className="text-sm text-gray-400">No purchase orders yet</p>
      ) : (
        <div className="flex flex-col gap-0">
          {purchaseOrders.map((order, index) => {
            const supplier = suppliers.find((s) => s.id === order.supplierId)
            const config = getStatusConfig(order.status)
            const Icon = config.icon
            const isLast = index === purchaseOrders.length - 1

            return (
              <div key={order.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  {!isLast && <div className="w-0.5 bg-[#E8E4D9] flex-1 mt-1 mb-1" />}
                </div>

                <div
                  className={`bg-white border border-[#E8E4D9] rounded-lg p-4 flex-1 cursor-pointer hover:border-green-300 transition-colors ${!isLast ? "mb-2" : ""}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {supplier?.name || order.supplier?.name || "Unknown supplier"}
                      </p>
                      <p className="text-xs text-[#8A8678] mt-0.5">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {order.expectedDelivery && ` · Expected ${new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-[#8A8678]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-[11px] bg-[#F7F5F0] text-[#8A8678] px-2 py-0.5 rounded">
                          {item.medicineName} × {item.quantity}
                          {item.batchNumber && <span className="text-[10px] ml-1 font-mono">({item.batchNumber})</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-[#8A8678] mt-2">Tap to view details</p>
                </div>
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
  )
}

export default PurchaseOrdersPage