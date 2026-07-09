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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MedicineFormData>({
    defaultValues: {
      packType: "strip",
      unitsPerPack: 10,
      category: "ALLOPATHIC",
      gstPercent: 12,
      mrp: 0,
      purchasePrice: 0,
      stockUnits: 0,
      unit: "units",
    },
  });

  const packType = watch("packType");
  const unitsPerPack = watch("unitsPerPack") || 1;
  const mrp = watch("mrp") || 0;
  const stockUnits = watch("stockUnits") || 0;
  const purchasePrice = watch("purchasePrice") || 0;

  const getUnitName = () => {
    if (packType === "bottle") return "ml";
    if (packType === "vial") return "ml";
    if (packType === "strip") return "tablet";
    return "unit";
  };

  const getPackLabel = () => {
    const type = PACK_TYPES.find((p) => p.value === packType);
    return type?.label.split(" ")[0].toLowerCase() || "pack";
  };

  const packCount = stockUnits || 0;
  const totalUnitsPreview = packCount * unitsPerPack;
  const margin =
    purchasePrice > 0 ? (((mrp - purchasePrice) / mrp) * 100).toFixed(1) : null;

  const onFormSubmit = async (data: MedicineFormData) => {
    const actualUnitsPerPack = data.unitsPerPack || 1;
    const totalUnits = (data.stockUnits || 0) * actualUnitsPerPack;

    const payload: MedicinePayload = {
      name: data.name,
      unit: data.unit || getUnitName(),
      packType: data.packType,
      unitsPerPack: actualUnitsPerPack,
      category: data.category,
      gstPercent: data.gstPercent,
      mrp: data.mrp, // price per pack/strip
      batchNumber: data.batchNumber || generateBatchNumber(),
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      purchasePrice: data.purchasePrice,
      stockUnits: totalUnits, // actual tablets/ml stored
    };

    await onSubmit(payload);
    reset();
    setMfgDate("");
    setExpDate("");
  };

  return (
    <div>
      <p className="text-xs text-[#8A8678] uppercase tracking-wide mb-3">
        Product Details
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm text-gray-500">
            Medicine / Product name
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="e.g. Paracetamol 500mg (Crocin)"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Pack type</label>
          <select
            {...register("packType")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            {PACK_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            {packType === "bottle"
              ? "ML per bottle"
              : packType === "strip"
                ? "Tablets per strip"
                : packType === "piece"
                  ? "Units per pack (1 if single)"
                  : "Units per pack"}
          </label>
          <input
            type="number"
            min={1}
            {...register("unitsPerPack", { valueAsNumber: true, min: 1 })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Category</label>
          <select
            {...register("category")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="ALLOPATHIC">Allopathic</option>
            <option value="AYURVEDIC">Ayurvedic</option>
            <option value="HOMEOPATHIC">Homeopathic</option>
            <option value="VETERINARY">Veterinary</option>
            <option value="SURGICAL">Surgical</option>
            <option value="COSMETIC">Cosmetic</option>
            <option value="PERSONAL_CARE">Personal Care</option>
            <option value="FOOD_SUPPLEMENT">Food Supplement</option>
            <option value="BABY_CARE">Baby Care</option>
            <option value="GENERAL_STORE">General Store</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">GST %</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            {...register("gstPercent", { valueAsNumber: true })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        {/* --- CHANGED: MRP is now per Pack, showing per-unit as a hint --- */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            MRP per {getPackLabel()} ₹
            {unitsPerPack > 1 && mrp > 0 && (
              <span className="text-[#8A8678] ml-1">
                (₹{(mrp / unitsPerPack).toFixed(2)} per {getUnitName()})
              </span>
            )}
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            {...register("mrp", {
              valueAsNumber: true,
              required: "MRP is required",
              min: { value: 0.01, message: "Must be greater than 0" },
            })}
            placeholder="e.g. 50.00 per strip"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.mrp && (
            <p className="text-red-500 text-xs mt-1">{errors.mrp.message}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-[#8A8678] uppercase tracking-wide mb-3 mt-2">
        First Batch / Current Stock
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm text-gray-500">Batch number</label>
          <input
            {...register("batchNumber")}
            placeholder="e.g. BX20240101 (auto-generated if empty)"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <SimpleDateInput
          label="Manufacturing date"
          value={mfgDate}
          onChange={setMfgDate}
        />
        <SimpleDateInput
          label="Expiry date"
          value={expDate}
          onChange={setExpDate}
        />

        {/* --- CHANGED: Purchase price is now per Pack --- */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Purchase price per {getPackLabel()} ₹
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            {...register("purchasePrice", { valueAsNumber: true })}
            placeholder="e.g. 40.00 per strip"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Number of {getPackLabel()}s received
          </label>
          <input
            type="number"
            min={0}
            {...register("stockUnits", {
              valueAsNumber: true,
            })}
            placeholder={`e.g. 15 ${getPackLabel()}s`}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        {packCount > 0 && (
          <div className="md:col-span-2 bg-[#F7F5F0] rounded-lg p-3 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-[#8A8678]">Total stock</span>
              <span className="text-gray-900 font-medium">
                {totalUnitsPreview} {getUnitName()}s ({packCount}{" "}
                {getPackLabel()}s)
              </span>
            </div>
            {margin && (
              <div className="flex justify-between">
                <span className="text-[#8A8678]">Margin</span>
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
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors"
      >
        Add Product
      </button>
    </div>
  );
};

export default AddMedicineForm;
