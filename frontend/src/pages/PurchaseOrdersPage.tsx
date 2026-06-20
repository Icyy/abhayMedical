import { useEffect } from "react";
import CreatePurchaseOrderForm from "../components/CreatePurchaseOrderForm";
import { useSupplierStore } from "../store/supplierStore";

const PurchaseOrdersPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const purchaseOrders = useSupplierStore((state) => state.purchaseOrders);
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers);
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders);
  const receivePurchaseOrder = useSupplierStore((state) => state.receivePurchaseOrder);
  const cancelPurchaseOrder = useSupplierStore((state) => state.cancelPurchaseOrder);

  useEffect(() => {
    loadSuppliers();
    loadPurchaseOrders();
  }, []);

  const getOrderStatusClass = (status: string) => {
    if (status === "RECEIVED") return "bg-green-100 text-green-800";
    if (status === "CANCELLED") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Purchase Orders</h1>
      <CreatePurchaseOrderForm />

      {purchaseOrders.length === 0 ? (
        <p className="text-sm text-gray-400">No purchase orders yet</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-sm text-gray-500">Supplier</th>
                <th className="text-left p-3 text-sm text-gray-500">Items</th>
                <th className="text-left p-3 text-sm text-gray-500">Total Cost</th>
                <th className="text-left p-3 text-sm text-gray-500">Order Date</th>
                <th className="text-left p-3 text-sm text-gray-500">Status</th>
                <th className="text-left p-3 text-sm text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((order) => {
                const supplier = suppliers.find((s) => s.id === order.supplierId);
                return (
                  <tr className="border-b border-gray-200" key={order.id}>
                    <td className="p-3 text-sm">{supplier?.name || order.supplier?.name || "—"}</td>
                    <td className="p-3 text-sm">{order.items.length}</td>
                    <td className="p-3 text-sm">₹{order.totalCost.toFixed(2)}</td>
                    <td className="p-3 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {order.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm("Mark this order as received? This will update inventory stock.")) {
                                receivePurchaseOrder(order.id);
                              }
                            }}
                            className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-100"
                          >
                            Receive
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Cancel this order?")) {
                                cancelPurchaseOrder(order.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;