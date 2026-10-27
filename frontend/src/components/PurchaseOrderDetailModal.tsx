import { X, CheckCircle, XCircle, Clock } from "lucide-react"
import type { PurchaseOrder } from "../types/supplier"
import { useSupplierStore } from "../store/supplierStore"

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrder
  supplierName: string
  onClose: () => void
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string; bg: string }> = {
  RECEIVED: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-100", label: "Received" },
  CANCELLED: { icon: XCircle, color: "text-red-700", bg: "bg-red-100", label: "Cancelled" },
  PENDING: { icon: Clock, color: "text-amber-700", bg: "bg-amber-100", label: "Pending" },
}

const PurchaseOrderDetailModal = ({ order, supplierName, onClose }: PurchaseOrderDetailModalProps) => {
  const receivePurchaseOrder = useSupplierStore((state) => state.receivePurchaseOrder)
  const cancelPurchaseOrder = useSupplierStore((state) => state.cancelPurchaseOrder)
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-t-2xl sm:rounded-t-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Purchase Order</h2>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${config.bg} ${config.color}`}>
                <Icon size={12} strokeWidth={2.5} />
                {config.label}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">{supplierName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 bg-white border border-gray-200 rounded-full p-1.5 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          {order.expectedDelivery && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-5 flex items-center gap-2 text-sm text-blue-800 font-medium">
              <Clock size={16} className="text-blue-500" />
              Expected Delivery: {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          )}

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
          <div className="flex flex-col gap-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                  <p className="text-sm font-bold text-gray-900">{item.medicineName}</p>
                  <p className="text-sm font-bold text-[#0F4C3A]">₹{item.totalPrice.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span className="text-gray-900 font-medium">{item.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost / unit</span>
                    <span className="text-gray-900 font-medium">₹{item.pricePerUnit.toFixed(2)}</span>
                  </div>
                  {item.batchNumber && (
                    <div className="flex justify-between">
                      <span>Batch</span>
                      <span className="text-gray-900 font-mono font-medium">{item.batchNumber}</span>
                    </div>
                  )}
                  {item.sellingPrice && (
                    <div className="flex justify-between">
                      <span>Selling MRP</span>
                      <span className="text-gray-900 font-medium">₹{item.sellingPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F7F5F0] rounded-xl p-4 border border-[#E8E4D9]">
            <div className="flex justify-between text-sm font-bold text-gray-900 items-end">
              <span className="text-gray-600">Total Order Cost</span>
              <span className="text-xl text-[#0F4C3A]">₹{order.totalCost.toFixed(2)}</span>
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-xs text-gray-700 italic">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {order.status === "PENDING" && (
          <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white rounded-b-xl">
            <button
              onClick={() => {
                if (confirm("Mark as received? This will update inventory stock.")) {
                  receivePurchaseOrder(order.id)
                  onClose()
                }
              }}
              className="flex-1 bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-semibold py-3 rounded-lg shadow-sm transition-all"
            >
              Mark Received
            </button>
            <button
              onClick={() => {
                if (confirm("Cancel this order?")) {
                  cancelPurchaseOrder(order.id)
                  onClose()
                }
              }}
              className="flex-1 bg-white border border-red-200 text-red-600 text-sm font-semibold py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseOrderDetailModal