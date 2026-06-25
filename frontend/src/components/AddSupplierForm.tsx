import { useForm } from "react-hook-form";
import { useSupplierStore } from "../store/supplierStore";

type SupplierFormData = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  discountPercent: number,
  gstNumber: string;
};

const AddSupplierForm = () => {
  const addSupplier = useSupplierStore((state) => state.addSupplier);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    defaultValues: { contactPerson: "", email: "", address: "", gstNumber: "",discountPercent:0 },
  });

  const onFormSubmit = async (data: SupplierFormData) => {
    try {
      await addSupplier(data);
      reset({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        discountPercent:0,
        gstNumber: "",
      });
    } catch (err: any) {
      alert(err.message || "Failed to add supplier");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Supplier name</label>
          <input
            {...register("name", { required: "Supplier name is required" })}
            placeholder="e.g. MedPlus Distributors"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Contact person</label>
          <input
            {...register("contactPerson")}
            placeholder="e.g. Rajesh Kumar"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <input
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10 digit number",
              },
            })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Email</label>
          <input
            {...register("email")}
            placeholder="e.g. orders@medplus.com"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">GST number</label>
          <input
            {...register("gstNumber")}
            placeholder="e.g. 27AAAAA0000A1Z5"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">
            Trade discount %
            <span className="text-gray-400 ml-1">
              (e.g. 10 means 10% off MRP on all items)
            </span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            {...register("discountPercent", {
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" },
              max: { value: 100, message: "Cannot exceed 100%" },
            })}
            placeholder="e.g. 10"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
          <label className="text-sm text-gray-500">Address</label>
          <textarea
            {...register("address")}
            placeholder="Supplier address..."
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit(onFormSubmit)}
        className="mt-4 bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Add Supplier
      </button>
    </div>
  );
};

export default AddSupplierForm;
