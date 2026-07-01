import { X, CheckCircle, XCircle, Clock } from "lucide-react"
import type { PurchaseOrder } from "../types/supplier"
import { useSupplierStore } from "../store/supplierStore"

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrder
  supplierName: string
  onClose: () => void
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  RECEIVED: { icon: CheckCircle, color: "text-green-600", label: "Received" },
  CANCELLED: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
  PENDING: { icon: Clock, color: "text-amber-600", label: "Pending" },
}

const PurchaseOrderDetailModal = ({ order, supplierName, onClose }: PurchaseOrderDetailModalProps) => {
  const receivePurchaseOrder = useSupplierStore((state) => state.receivePurchaseOrder)
  const cancelPurchaseOrder = useSupplierStore((state) => state.cancelPurchaseOrder)
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-start p-5 border-b border-[#F1EFE8] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-900">Purchase Order</h2>
              <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                <Icon size={13} />
                {config.label}
              </span>
            </div>
            <p className="text-xs text-[#8A8678] mt-0.5">
              {supplierName} · {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {order.expectedDelivery && (
            <p className="text-xs text-[#8A8678] mb-4">
              Expected delivery: {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}

          <p className="text-xs font-medium text-[#8A8678] uppercase tracking-wide mb-2">Items</p>
          <div className="flex flex-col gap-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="bg-[#F7F5F0] rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                  <p className="text-sm font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8A8678]">
                  {item.batchNumber && (
                    <div className="flex justify-between">
                      <span>Batch</span>
                      <span className="text-gray-700 font-mono">{item.batchNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Qty</span>
                    <span className="text-gray-700">{item.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase price</span>
                    <span className="text-gray-700">₹{item.pricePerUnit.toFixed(2)}/unit</span>
                  </div>
                  {item.sellingPrice && (
                    <div className="flex justify-between">
                      <span>Selling price (MRP)</span>
                      <span className="text-gray-700">₹{item.sellingPrice.toFixed(2)}/unit</span>
                    </div>
                  )}
                  {item.gstPercent !== null && item.gstPercent !== undefined && (
                    <div className="flex justify-between">
                      <span>GST</span>
                      <span className="text-gray-700">{item.gstPercent}%</span>
                    </div>
                  )}
                  {item.manufacturingDate && (
                    <div className="flex justify-between">
                      <span>Mfg date</span>
                      <span className="text-gray-700">
                        {new Date(item.manufacturingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {item.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expiry</span>
                      <span className="text-gray-700">
                        {new Date(item.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {item.sellingPrice && item.pricePerUnit && (
                    <div className="flex justify-between">
                      <span>Margin</span>
                      <span className={((item.sellingPrice - item.pricePerUnit) / item.sellingPrice * 100) > 15 ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                        {(((item.sellingPrice - item.pricePerUnit) / item.sellingPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F1EFE8] pt-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Order Cost</span>
              <span>₹{order.totalCost.toFixed(2)}</span>
            </div>
            {order.notes && (
              <p className="text-xs text-[#8A8678] mt-2 italic">{order.notes}</p>
            )}
          </div>
        </div>

        {order.status === "PENDING" && (
          <div className="p-5 border-t border-[#F1EFE8] flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (confirm("Mark as received? This will update inventory stock.")) {
                  receivePurchaseOrder(order.id)
                  onClose()
                }
              }}
              className="flex-1 bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium py-2.5 rounded-lg"
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
              className="flex-1 border border-red-200 text-red-500 text-sm font-medium py-2.5 rounded-lg hover:bg-red-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseOrderDetailModal