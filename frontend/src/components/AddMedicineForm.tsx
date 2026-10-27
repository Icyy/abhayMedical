import { useForm } from "react-hook-form";
import { useState } from "react";
import type { Medicine, MedicinePayload } from "../types/inventory";
import SimpleDateInput from "./SimpleDateInput";

interface AddMedicineFormProps {
  onSubmit: (medicine: MedicinePayload) => Promise<void>;
}

type MedicineFormData = {
  name: string;
  unit: string;
  packType: string;
  unitsPerPack: number;
  category: Medicine["category"];
  gstPercent: number;
  mrp: number;
  batchNumber: string;
  purchasePrice: number;
  stockUnits: number;
};

const PACK_TYPES = [
  { value: "strip", label: "Strip (tablets/capsules)" },
  { value: "bottle", label: "Bottle (syrup/liquid)" },
  { value: "tube", label: "Tube" },
  { value: "vial", label: "Vial/Injection" },
  { value: "piece", label: "Individual piece" },
  { value: "packet", label: "Packet" },
  { value: "box", label: "Box" },
];

const generateBatchNumber = () => `BX${Date.now()}`;

const AddMedicineForm = ({ onSubmit }: AddMedicineFormProps) => {
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MedicineFormData>({
    defaultValues: { packType: "strip", unitsPerPack: 10, category: "ALLOPATHIC", gstPercent: 12, mrp: 0, purchasePrice: 0, stockUnits: 0, unit: "units" },
  });

  const packType = watch("packType");
  const unitsPerPack = watch("unitsPerPack") || 1;
  const mrp = watch("mrp") || 0;
  const stockUnits = watch("stockUnits") || 0;
  const purchasePrice = watch("purchasePrice") || 0;

  const getUnitName = () => {
    if (packType === "bottle" || packType === "vial") return "ml";
    if (packType === "strip") return "tablet";
    return "unit";
  };

  const getPackLabel = () => PACK_TYPES.find((p) => p.value === packType)?.label.split(" ")[0].toLowerCase() || "pack";

  const packCount = stockUnits || 0;
  const totalUnitsPreview = packCount * unitsPerPack;
  const margin = purchasePrice > 0 ? (((mrp - purchasePrice) / mrp) * 100).toFixed(1) : null;

  const onFormSubmit = async (data: MedicineFormData) => {
    const payload: MedicinePayload = {
      name: data.name,
      unit: data.unit || getUnitName(),
      packType: data.packType,
      unitsPerPack: data.unitsPerPack || 1,
      category: data.category,
      gstPercent: data.gstPercent,
      mrp: data.mrp,
      batchNumber: data.batchNumber || generateBatchNumber(),
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      purchasePrice: data.purchasePrice,
      stockUnits: (data.stockUnits || 0) * (data.unitsPerPack || 1),
    };
    await onSubmit(payload);
    reset();
    setMfgDate("");
    setExpDate("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Col: Basic Details */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Basic Details</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Product Name</label>
              <input {...register("name", { required: "Name is required" })} placeholder="e.g. Paracetamol 500mg" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                <select {...register("category")} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm">
                  {["ALLOPATHIC", "AYURVEDIC", "HOMEOPATHIC", "VETERINARY", "SURGICAL", "COSMETIC", "PERSONAL_CARE", "FOOD_SUPPLEMENT", "BABY_CARE", "GENERAL_STORE", "OTHER"].map(cat => (
                    <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">GST %</label>
                <input type="number" step={0.5} {...register("gstPercent", { valueAsNumber: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Pack Type</label>
                <select {...register("packType")} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm">
                  {PACK_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {packType === "bottle" ? "ML/bottle" : packType === "strip" ? "Tabs/strip" : "Units/pack"}
                </label>
                <input type="number" min={1} {...register("unitsPerPack", { valueAsNumber: true, min: 1 })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Initial Stock & Pricing */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stock & Pricing (First Batch)</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">MRP per {getPackLabel()}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">₹</span>
                  <input type="number" step={0.01} {...register("mrp", { valueAsNumber: true, required: true, min: 0.01 })} className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cost per {getPackLabel()}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">₹</span>
                  <input type="number" step={0.01} {...register("purchasePrice", { valueAsNumber: true })} className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <SimpleDateInput label="Mfg Date" value={mfgDate} onChange={setMfgDate} />
              <SimpleDateInput label="Expiry Date" value={expDate} onChange={setExpDate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Batch No. (Optional)</label>
                <input {...register("batchNumber")} placeholder="Auto-generated" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Packs Received</label>
                <input type="number" min={0} {...register("stockUnits", { valueAsNumber: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0F4C3A] outline-none shadow-sm bg-green-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Stock</span>
            <span className="text-sm font-bold text-gray-900">{totalUnitsPreview} {getUnitName()}s <span className="text-gray-400 font-medium text-xs">({packCount} {getPackLabel()}s)</span></span>
          </div>
          {margin && (
            <div className="flex flex-col border-l border-gray-200 pl-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Margin</span>
              <span className={`text-sm font-bold ${parseFloat(margin) > 15 ? "text-green-600" : "text-amber-600"}`}>{margin}%</span>
            </div>
          )}
        </div>
        <button onClick={handleSubmit(onFormSubmit)} className="w-full sm:w-auto bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-bold px-8 py-3 rounded-lg shadow-sm transition-colors">
          Save Product
        </button>
      </div>
    </div>
  );
};

export default AddMedicineForm;