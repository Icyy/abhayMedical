import { useForm } from "react-hook-form";
import { useSupplierStore } from "../store/supplierStore";

type SupplierFormData = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
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
    defaultValues: { contactPerson: "", email: "", address: "", gstNumber: "" },
  });

  const onFormSubmit = async (data: SupplierFormData) => {
    try {
      await addSupplier(data);
      reset({ name: "", contactPerson: "", phone: "", email: "", address: "", gstNumber: "" });
    } catch (err: any) {
      alert(err.message || "Failed to add supplier");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">Add Supplier</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Supplier name</label>
          <input
            {...register("name", { required: "Supplier name is required" })}
            placeholder="e.g. MedPlus Distributors"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
              pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10 digit number" },
            })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Add Supplier
      </button>
    </div>
  );
};

export default AddSupplierForm;