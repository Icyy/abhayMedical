import { useState } from "react";
import { X, Receipt } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import SimpleDateInput from "./SimpleDateInput";
import { useSupplierStore } from "../store/supplierStore";
import type { Medicine } from "../types/inventory";
import type { Supplier } from "../types/supplier";
import { useToast } from "../components/toast";

interface PurchaseOrderBillModalProps {
  medicine: Medicine; supplier: Supplier; estimatedQuantity: number; onClose: () => void; onOrderCreated: () => void;
}

type BillFormData = {
  batchNumber: string; quantity: number; pricePerUnit: number; sellingPrice: number; gstPercent: number; manufacturingDate: string; expiryDate: string; notes: string;
};

const PurchaseOrderBillModal = ({ medicine, supplier, estimatedQuantity, onClose, onOrderCreated }: PurchaseOrderBillModalProps) => {
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder);
  const loadPurchaseOrders = useSupplierStore((state) => state.loadPurchaseOrders);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: toastError } = useToast();

  const purchasePrice = medicine.mrp * (1 - supplier.discountPercent / 100);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<BillFormData>({
    defaultValues: { batchNumber: "", quantity: estimatedQuantity, pricePerUnit: parseFloat(purchasePrice.toFixed(2)), sellingPrice: medicine.mrp, gstPercent: medicine.gstPercent, notes: "", manufacturingDate: "", expiryDate: "" },
  });

  const quantity = watch("quantity") || 0;
  const pricePerUnit = watch("pricePerUnit") || 0;
  const sellingPrice = watch("sellingPrice") || 0;
  const totalCost = quantity * pricePerUnit;
  const margin = sellingPrice > 0 && pricePerUnit > 0 ? (((sellingPrice - pricePerUnit) / sellingPrice) * 100).toFixed(1) : "—";

  const onFormSubmit = async (data: BillFormData) => {
    setIsSubmitting(true);
    try {
      await addPurchaseOrder({
        supplierId: supplier.id, notes: data.notes,
        items: [{ medicineName: medicine.name, batchNumber: data.batchNumber, quantity: data.quantity, pricePerUnit: data.pricePerUnit, sellingPrice: data.sellingPrice, gstPercent: data.gstPercent, manufacturingDate: data.manufacturingDate, expiryDate: data.expiryDate }],
      });
      await loadPurchaseOrders();
      onOrderCreated();
      onClose();
    } catch (err: any) { toastError(err.message || "Failed to create purchase order"); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl flex flex-col max-h-[95vh] shadow-2xl">
        <div className="flex justify-between items-start p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl sm:rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border border-gray-200 rounded-lg text-gray-500 shadow-sm"><Receipt size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Draft Purchase Bill</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">{medicine.name} · via {supplier.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white border border-gray-200 text-gray-400 hover:text-gray-800 rounded-full p-1.5 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2 bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Contract terms</p>
                <p className="text-sm font-bold text-blue-900">{supplier.discountPercent}% flat discount applied on MRP</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Batch Number <span className="text-rose-500">*</span></label>
              <input {...register("batchNumber", { required: "Required" })} placeholder="e.g. BX20240101" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm" />
              {errors.batchNumber && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.batchNumber.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Quantity Received <span className="text-rose-500">*</span></label>
              <input type="number" min={1} {...register("quantity", { valueAsNumber: true, required: true, min: 1 })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm" />
            </div>

            <div>
              <Controller name="manufacturingDate" control={control} rules={{ required: "Required" }} render={({ field }) => (
                <SimpleDateInput label="Manufacturing Date *" value={field.value} onChange={field.onChange} />
              )} />
            </div>
            <div>
              <Controller name="expiryDate" control={control} rules={{ required: "Required" }} render={({ field }) => (
                <SimpleDateInput label="Expiry Date *" value={field.value} onChange={field.onChange} />
              )} />
              {errors.expiryDate && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.expiryDate.message}</p>}
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Cost/Unit ₹</label>
                <input type="number" step="0.01" {...register("pricePerUnit", { valueAsNumber: true, required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:border-[#0F4C3A] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Selling MRP ₹</label>
                <input type="number" step="0.01" {...register("sellingPrice", { valueAsNumber: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:border-[#0F4C3A] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">GST %</label>
                <input type="number" step="0.5" {...register("gstPercent", { valueAsNumber: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:border-[#0F4C3A] outline-none" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Notes (Optional)</label>
              <textarea {...register("notes")} rows={2} placeholder="Any notes regarding this shipment..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm resize-none" />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white rounded-b-xl shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Invoice</span>
              <span className="text-xl font-bold text-gray-900">₹{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</span>
              <span className={`text-base font-bold ${parseFloat(margin) > 15 ? "text-green-600" : "text-amber-600"}`}>{margin}%</span>
            </div>
          </div>
          <button onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting} className="w-full sm:w-auto bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-50 text-white text-sm font-bold px-8 py-3.5 rounded-lg shadow-sm transition-colors">
            {isSubmitting ? "Drafting..." : "Finalize Draft"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderBillModal;