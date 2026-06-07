import { useState } from "react";
import type { Customer } from "../types/customer";
import { useCustomerStore } from "../store/customerStore";

const AddCustomersForm = () => {
  const addCustomer = useCustomerStore((state) => state.addCustomer);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phoneNumber) {
      alert("Please fill in patient name and phone number");
      return;
    }

    const newCustomer: Customer = {
      customerId: `CX${Date.now()}`,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      notes: formData.notes,
      totalSpend: 0,
      loyaltyPoints: 0,
    };

    addCustomer(newCustomer);

    setFormData({ name: "", phoneNumber: "", email: "", notes: "" });
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">New Customer</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Patient name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh Shah"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <input
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Email</label>
          <input
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="e.g. customerName@gmail.com"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any special instructions..."
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
        >
          Save Customer
        </button>
      </div>
    </div>
  );
};

export default AddCustomersForm;
