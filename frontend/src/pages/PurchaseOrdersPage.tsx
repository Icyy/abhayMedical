import { useEffect } from "react"
import { Package, CheckCircle, XCircle, Clock } from "lucide-react"
import CreatePurchaseOrderForm from "../components/CreatePurchaseOrderForm"
import CollapsibleSection from "../components/CollapsibleSection"
import { useSupplierStore } from "../store/supplierStore"

const PurchaseOrdersPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const purchaseOrders = useSupplierStore((state) => state.purchaseOrders)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders)
  const receivePurchaseOrder = useSupplierStore((state) => state.receivePurchaseOrder)
  const cancelPurchaseOrder = useSupplierStore((state) => state.cancelPurchaseOrder)

  useEffect(() => {
    loadSuppliers()
    loadPurchaseOrders()
  }, [])

  const getStatusConfig = (status: string) => {
    if (status === "RECEIVED") return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-500", label: "Received" }
    if (status === "CANCELLED") return { icon: XCircle, color: "text-red-500", bg: "bg-red-400", label: "Cancelled" }
    return { icon: Clock, color: "text-amber-600", bg: "bg-amber-400", label: "Pending" }
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

                <div className={`bg-white border border-[#E8E4D9] rounded-lg p-4 flex-1 ${!isLast ? "mb-2" : ""}`}>
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {supplier?.name || order.supplier?.name || "Unknown supplier"}
                      </p>
                      <p className="text-xs text-[#8A8678] mt-0.5">
                        {new Date(order.orderDate).toLocaleDateString()}
                        {order.expectedDelivery && ` · Expected ${new Date(order.expectedDelivery).toLocaleDateString()}`}
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
                        </span>
                      ))}
                    </div>
                  )}

                  {order.status === "PENDING" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#F1EFE8]">
                      <button
                        onClick={() => confirm("Mark as received? This will update inventory stock.") && receivePurchaseOrder(order.id)}
                        className="bg-[#0F4C3A] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#0c3b2d]"
                      >
                        Mark Received
                      </button>
                      <button
                        onClick={() => confirm("Cancel this order?") && cancelPurchaseOrder(order.id)}
                        className="border border-red-200 text-red-500 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.notes && (
                    <p className="text-xs text-[#8A8678] mt-2 italic">{order.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PurchaseOrdersPage