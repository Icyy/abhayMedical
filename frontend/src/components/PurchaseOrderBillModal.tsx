import { useState } from "react";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import SimpleDateInput from "./SimpleDateInput";
import { useSupplierStore } from "../store/supplierStore";
import type { Medicine } from "../types/inventory";
import type { Supplier } from "../types/supplier";

interface PurchaseOrderBillModalProps {
  medicine: Medicine;
  supplier: Supplier;
  estimatedQuantity: number;
  onClose: () => void;
  onOrderCreated: () => void;
}

type BillFormData = {
  batchNumber: string;
  quantity: number;
  pricePerUnit: number;
  sellingPrice: number;
  gstPercent: number;
  manufacturingDate: string;
  expiryDate: string;
  notes: string;
};

const PurchaseOrderBillModal = ({
  medicine,
  supplier,
  estimatedQuantity,
  onClose,
  onOrderCreated,
}: PurchaseOrderBillModalProps) => {
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder);
  const loadPurchaseOrders = useSupplierStore(
    (state) => state.loadPurchaseOrders,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purchasePrice = medicine.mrp * (1 - supplier.discountPercent / 100);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<BillFormData>({
    defaultValues: {
      batchNumber: "",
      quantity: estimatedQuantity,
      pricePerUnit: parseFloat(purchasePrice.toFixed(2)),
      sellingPrice: medicine.mrp,
      gstPercent: medicine.gstPercent,
      notes: "",
      manufacturingDate: "",
      expiryDate: "",
    },
  });

  const quantity = watch("quantity") || 0;
  const pricePerUnit = watch("pricePerUnit") || 0;
  const sellingPrice = watch("sellingPrice") || 0;
  const totalCost = quantity * pricePerUnit;
  const margin =
    sellingPrice > 0 && pricePerUnit > 0
      ? (((sellingPrice - pricePerUnit) / sellingPrice) * 100).toFixed(1)
      : "—";

  const onFormSubmit = async (data: BillFormData) => {
    setIsSubmitting(true);
    try {
      await addPurchaseOrder({
        supplierId: supplier.id,
        notes: data.notes,
        items: [
          {
            medicineName: medicine.name,
            batchNumber: data.batchNumber,
            quantity: data.quantity,
            pricePerUnit: data.pricePerUnit,
            sellingPrice: data.sellingPrice,
            gstPercent: data.gstPercent,
            manufacturingDate: data.manufacturingDate,
            expiryDate: data.expiryDate, 
          },
        ],
      });
      await loadPurchaseOrders();
      onOrderCreated();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg flex flex-col max-h-[95vh]">
        {/* Fixed header */}
        <div className="flex justify-between items-start p-5 border-b border-[#F1EFE8] flex-shrink-0">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              New Purchase Bill
            </h2>
            <p className="text-xs text-[#8A8678] mt-0.5">
              {medicine.name} · from {supplier.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-[#8A8678]">
                Batch number <span className="text-red-400">*</span>
              </label>
              <input
                {...register("batchNumber", {
                  required: "Batch number is required",
                })}
                placeholder="e.g. BX20240101"
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
              {errors.batchNumber && (
                <p className="text-red-500 text-xs">
                  {errors.batchNumber.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="manufacturingDate"
                control={control}
                rules={{ required: "Manufacturing date is required" }}
                render={({ field }) => (
                  <SimpleDateInput
                    label="Manufacturing date *"
                    value={field.value}
                    onChange={field.onChange} // React Hook Form fully takes over this component now!
                  />
                )}
              />
              {errors.manufacturingDate && (
                <p className="text-red-500 text-xs">
                  {errors.manufacturingDate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="expiryDate"
                control={control}
                rules={{ required: "Expiry date is required" }}
                render={({ field }) => (
                  <SimpleDateInput
                    label="Expiry date *"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs">
                  {errors.expiryDate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">
                Quantity ordered <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                {...register("quantity", {
                  valueAsNumber: true,
                  required: true,
                  min: 1,
                })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">
                Purchase price/unit ₹
                <span className="text-[#8A8678] ml-1">
                  ({supplier.discountPercent}% off MRP)
                </span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                {...register("pricePerUnit", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">
                Selling price/unit (MRP) ₹
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                {...register("sellingPrice", { valueAsNumber: true })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">GST %</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                {...register("gstPercent", { valueAsNumber: true })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-[#8A8678]">Notes (optional)</label>
              <textarea
                {...register("notes")}
                placeholder="Any notes about this delivery..."
                rows={2}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          {/* Live bill summary */}
          <div className="mt-4 bg-[#F7F5F0] rounded-lg p-3 text-xs">
            <p className="font-medium text-gray-700 mb-2">Bill Summary</p>
            <div className="flex justify-between mb-1 text-[#8A8678]">
              <span>Quantity × Purchase price</span>
              <span className="text-gray-900">
                {quantity} × ₹{pricePerUnit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-1 text-[#8A8678]">
              <span>Total cost</span>
              <span className="text-gray-900 font-medium">
                ₹{totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[#8A8678]">
              <span>Expected margin on sale</span>
              <span
                className={
                  parseFloat(margin) > 15
                    ? "text-green-700 font-medium"
                    : "text-amber-700 font-medium"
                }
              >
                {margin}%
              </span>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="p-5 border-t border-[#F1EFE8] flex-shrink-0">
          <button
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
            className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm font-medium py-3 rounded-lg transition-colors"
          >
            {isSubmitting
              ? "Creating order..."
              : `Create Purchase Order · ₹${totalCost.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderBillModal;
