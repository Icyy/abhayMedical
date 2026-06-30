import { useForm } from "react-hook-form";
import type { Medicine } from "../types/inventory";
import SimpleDateInput from "./SimpleDateInput";

interface AddMedicineFormProps {
  onSubmit: (medicine: Omit<Medicine, "id">) => Promise<void>;
}

type MedicineFormData = {
  name: string;
  batchNumber: string;
  packType: string;
  unitsPerPack: number;
  packCount: number;
  unit: string;
  price: number;
  purchasePrice: number;
  status: "OK" | "LOW" | "CRITICAL";
  category: Medicine["category"];
  gstPercent: number;
  manufacturingDate: string;
  expiryDate: string;
};
const generateBatchNumber = () => `BX${Date.now()}`;

const AddMedicineForm = ({ onSubmit }: AddMedicineFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MedicineFormData>({
    defaultValues: {
      unit: "strips",
      status: "OK",
      category: "ALLOPATHIC",
      gstPercent: 0,
      packType: "strip",
      unitsPerPack: 10,
      packCount: 0,
      manufacturingDate: "",
      expiryDate: "",
    },
  });

  const manufacturingDate = watch("manufacturingDate");
  const expiryDate = watch("expiryDate");

  const onFormSubmit = async (data: MedicineFormData) => {
    console.log(data);
    const newMedicine: Omit<Medicine, "id"> = {
      name: data.name,
      stock: data.unitsPerPack * data.packCount,
      unitsPerPack: data.unitsPerPack,
      packType: data.packType,
      unit: data.unit,
      price: data.price,
      purchasePrice: data.purchasePrice,
      batchNumber: data.batchNumber || generateBatchNumber(),
      manufacturingDate: new Date(data.manufacturingDate),
      expiryDate: new Date(data.expiryDate),
      status: data.status,
      category: data.category,
      gstPercent: data.gstPercent,
    };
    await onSubmit(newMedicine);
    reset({
      name: "",
      unit: "",
      price: 0,
      purchasePrice: 0,
      gstPercent: 0,
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      status: "OK",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">Add Medicine</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Medicine name</label>
          <input
            {...register("name", { required: "Medicine name is required" })}
            placeholder="e.g. Paracetamol 500mg"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Batch number</label>
          <input
            {...register("batchNumber")}
            placeholder="e.g. BX4821"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <SimpleDateInput
          label="Manufacturing date"
          value={manufacturingDate}
          onChange={(date) => setValue("manufacturingDate", date)}
        />

        <SimpleDateInput
          label="Expiry date"
          value={expiryDate}
          onChange={(date) => setValue("expiryDate", date)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Pack type</label>
          <select
            {...register("packType")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="strip">Strip (tablets)</option>
            <option value="bottle">Bottle (syrup/liquid)</option>
            <option value="tube">Tube</option>
            <option value="box">Box</option>
            <option value="piece">Individual piece</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            {watch("packType") === "bottle"
              ? "ML per bottle"
              : watch("packType") === "strip"
                ? "Tablets per strip"
                : "Units per pack"}
          </label>
          <input
            type="number"
            min="1"
            {...register("unitsPerPack", {
              valueAsNumber: true,
              min: { value: 1, message: "Must be at least 1" },
            })}
            placeholder="e.g. 10"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Number of{" "}
            {watch("packType") === "bottle"
              ? "bottles"
              : watch("packType") === "strip"
                ? "strips"
                : "packs"}
          </label>
          <input
            type="number"
            min="0"
            {...register("packCount", {
              valueAsNumber: true,
              required: "Required",
              min: { value: 0, message: "Cannot be negative" },
            })}
            placeholder="e.g. 15"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.packCount && (
            <p className="text-red-500 text-xs mt-1">
              {errors.packCount.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 justify-end">
          <p className="text-xs text-[#8A8678]">Total stock</p>
          <p className="text-sm font-medium text-gray-900 py-2">
            {(watch("unitsPerPack") || 0) * (watch("packCount") || 0)}{" "}
            {watch("packType") === "bottle" ? "ml" : "units"}
          </p>
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
            <option value="COSMETIC">Cosmetic</option>
            <option value="SURGICAL">Surgical</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">GST %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            {...register("gstPercent", {
              valueAsNumber: true,
              min: { value: 0, message: "GST cannot be negative" },
              max: { value: 100, message: "GST cannot exceed 100%" },
            })}
            placeholder="e.g. 12"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.gstPercent && (
            <p className="text-red-500 text-xs mt-1">
              {errors.gstPercent.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Purchase price (₹){" "}
            <span className="text-gray-400">vendor rate</span>
          </label>
          <input
            type="number"
            min="0"
            {...register("purchasePrice", {
              valueAsNumber: true,
              min: { value: 0, message: "Purchase price cannot be negative" },
            })}
            placeholder="e.g. 18"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.purchasePrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.purchasePrice.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Price (₹)</label>
          <input
            type="number"
            min="0"
            {...register("price", {
              required: "Price is required",
              valueAsNumber: true,
              min: { value: 1, message: "Price must be at least 1" },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Status</label>
          <select
            {...register("status")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="OK">OK</option>
            <option value="LOW">LOW</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        {/* 
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Manufacturing date</label>
          <input
            type="date"
            {...register("manufacturingDate", {
              required: "Manufacturing date is required",
              validate: (value) => {
                const today = new Date().toISOString().split("T")[0];
                return (
                  value <= today || "Manufacturing date cannot be in the future"
                );
              },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.manufacturingDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.manufacturingDate.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Expiry date</label>
          <input
            type="date"
            {...register("expiryDate", {
              required: "Expiry date is required",
              validate: (value) => {
                const mfgDate = getValues("manufacturingDate");
                // Only validate if manufacturing date is already filled
                if (!mfgDate) return true;
                return (
                  value > mfgDate ||
                  "Expiry date must be after manufacturing date"
                );
              },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.expiryDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.expiryDate.message}
            </p>
          )}
        </div> */}
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Add Medicine
      </button>
    </div>
  );
};

export default AddMedicineForm;
