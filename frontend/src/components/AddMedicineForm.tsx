import { useForm } from "react-hook-form";
import type { Medicine } from "../types/inventory";

interface AddMedicineFormProps {
  onSubmit: (medicine: Omit<Medicine, "id">) => Promise<void>;
}

type MedicineFormData = {
  name: string;
  batchNumber: string;
  stock: number;
  unit: string;
  price: number;
  status: "OK" | "LOW" | "CRITICAL";
  category:
    | "ALLOPATHIC"
    | "AYURVEDIC"
    | "HOMEOPATHIC"
    | "VETERINARY"
    | "COSMETIC"
    | "SURGICAL"
    | "OTHER";
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
    formState: { errors },
  } = useForm<MedicineFormData>({
    defaultValues: {
      unit: "strips",
      status: "OK",
      category: "ALLOPATHIC",
      gstPercent: 0,
      stock: 0,
      price: 0,
    },
  });

  const onFormSubmit = async (data: MedicineFormData) => {
    console.log(data)
    const newMedicine: Omit<Medicine, "id"> = {
      name: data.name,
      stock: data.stock,
      category: data.category,
      gstPercent: data.gstPercent,
      unit: data.unit,
      price: data.price,
      batchNumber: data.batchNumber || generateBatchNumber(),
      manufacturingDate: new Date(data.manufacturingDate),
      expiryDate: new Date(data.expiryDate),
      status: data.status,
    };
    await onSubmit(newMedicine);
    reset({
      name: "",
      stock: 0,
      unit: "",
      price: 0,
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

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Stock quantity</label>
          <input
            type="number"
            min="0"
            {...register("stock", {
              required: "Stock is required",
              valueAsNumber: true,
              min: { value: 1, message: "Stock must be at least 1" },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
          )}
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

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Manufacturing date</label>
          <input
            type="date"
            {...register("manufacturingDate", {
              required: "Manufacturing date is required",
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
            {...register("expiryDate", { required: "Expiry date is required" })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.expiryDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.expiryDate.message}
            </p>
          )}
        </div>
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
