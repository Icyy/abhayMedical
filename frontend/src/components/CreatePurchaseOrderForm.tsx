import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSupplierStore } from "../store/supplierStore";
import { comparePricesForMedicine } from "../services/supplierService";

interface PurchaseItem {
  medicineName: string;
  quantity: number;
  pricePerUnit: number;
}

interface PriceComparison {
  pricePerUnit: number;
  supplier: { id: string; name: string };
}

type OrderFormData = {
  supplierId: string;
  expectedDelivery: string;
  notes: string;
};

const CreatePurchaseOrderForm = () => {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: { expectedDelivery: "", notes: "" },
  });

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [pendingName, setPendingName] = useState("");
  const [pendingQty, setPendingQty] = useState(1);
  const [pendingPrice, setPendingPrice] = useState(0);
  const [comparison, setComparison] = useState<PriceComparison[]>([]);
  const [itemError, setItemError] = useState("");

  const handleCheckPrices = async () => {
    if (!pendingName) {
      setItemError("Enter a medicine name to compare prices");
      return;
    }
    try {
      const results = await comparePricesForMedicine(pendingName);
      setComparison(results);
      if (results.length === 0) {
        setItemError("No supplier pricing found for this medicine yet");
      } else {
        setItemError("");
      }
    } catch (err) {
      setItemError("Failed to fetch price comparison");
    }
  };

  const handleAddItem = () => {
    if (!pendingName || pendingQty < 1 || pendingPrice <= 0) {
      setItemError("Enter medicine name, quantity and price");
      return;
    }
    setItems([...items, { medicineName: pendingName, quantity: pendingQty, pricePerUnit: pendingPrice }]);
    setPendingName("");
    setPendingQty(1);
    setPendingPrice(0);
    setComparison([]);
    setItemError("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: OrderFormData) => {
    if (items.length === 0) {
      setItemError("Add at least one item to the order");
      return;
    }
    try {
      await addPurchaseOrder({
        supplierId: data.supplierId,
        expectedDelivery: data.expectedDelivery || undefined,
        notes: data.notes,
        items,
      });
      reset({ supplierId: "", expectedDelivery: "", notes: "" });
      setItems([]);
    } catch (err: any) {
      setItemError(err.message || "Failed to create purchase order");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">Create Purchase Order</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Supplier</label>
          <select
            {...register("supplierId", { required: "Select a supplier" })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="">Select supplier...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Expected delivery</label>
          <input
            type="date"
            {...register("expectedDelivery")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            {...register("notes")}
            placeholder="Any notes about this order..."
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            placeholder="Medicine name"
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={handleCheckPrices}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-100 whitespace-nowrap"
          >
            Compare Prices
          </button>
        </div>

        {comparison.length > 0 && (
          <div className="bg-blue-50 rounded-md p-3 mb-3">
            <p className="text-xs font-medium text-blue-800 mb-2">Price comparison (lowest first):</p>
            {comparison.map((c, i) => (
              <button
                key={i}
                onClick={() => setPendingPrice(c.pricePerUnit)}
                className="w-full flex justify-between text-xs py-1 text-left hover:bg-blue-100 px-2 rounded"
              >
                <span>{c.supplier.name} {i === 0 && "Cheapest"}</span>
                <span className="font-medium">₹{c.pricePerUnit}/unit</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="number"
            min={1}
            value={pendingQty}
            onChange={(e) => setPendingQty(Number(e.target.value))}
            placeholder="Quantity"
            className="w-full sm:w-28 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <input
            type="number"
            min={0}
            value={pendingPrice}
            onChange={(e) => setPendingPrice(Number(e.target.value))}
            placeholder="Price per unit"
            className="w-full sm:w-32 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={handleAddItem}
            className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 whitespace-nowrap"
          >
            Add Item
          </button>
        </div>

        {itemError && <p className="text-red-500 text-xs mb-2">{itemError}</p>}

        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No items added yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm">{item.medicineName}</span>
                <span className="text-sm text-gray-500">{item.quantity} × ₹{item.pricePerUnit} = ₹{(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 text-xs">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Create Purchase Order
      </button>
    </div>
  );
};

export default CreatePurchaseOrderForm;