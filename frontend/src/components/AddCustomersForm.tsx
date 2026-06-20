import { useForm } from "react-hook-form";
import { useCustomerStore } from "../store/customerStore";

type CustomerFormData = {
  name: string;
  phoneNumber: string;
  email: string;
  notes: string;
};

const AddCustomersForm = () => {
  const addCustomer = useCustomerStore((state) => state.addCustomer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      email: "",
      notes: "",
    },
  });

  const onFormSubmit = async (data: CustomerFormData) => {
    await addCustomer({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      notes: data.notes,
    });
    reset();
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">New Customer</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Patient name</label>
          <input
            {...register("name", { required: "Customer name is required" })}
            placeholder="e.g. Ramesh Shah"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <input
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10 digit number",
              },
            })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Email</label>
          <input
            {...register("email", {
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
            placeholder="e.g. customerName@gmail.com"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            {...register("notes")}
            placeholder="Any special instructions..."
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <button
          onClick={handleSubmit(onFormSubmit)}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
        >
          Save Customer
        </button>
      </div>
    </div>
  );
};

export default AddCustomersForm;
