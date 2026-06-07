import { useState } from "react";
import type { Medicine } from "../types/inventory";

interface AddMedicineFormProps {
  onSubmit: (medicine: Medicine) => void;
}

const AddMedicineForm = ({ onSubmit }: AddMedicineFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    unit: "strips",
    price: 0,
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    status: "ok" as Medicine["status"],
  });

  const handleSubmit = () => {
    if (!formData.name || formData.stock === 0) {
      alert("Please fill in all fields");
      return;
    }

    const newMedicine: Medicine = {
      name: formData.name,
      stock: formData.stock,
      unit: formData.unit,
      price: formData.price,
      batchNumber: formData.batchNumber || `BX${Date.now()}`,
      manufacturingDate: new Date(formData.manufacturingDate),
      expiryDate: new Date(formData.expiryDate),
      status: formData.status,
    };

    onSubmit(newMedicine);

    setFormData({
      name: "",
      stock: 0,
      unit: "strips",
      price: 0,
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      status: "ok",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">Add Medicine</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Medicine name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Paracetamol 500mg"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Batch number</label>
          <input
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            placeholder="e.g. BX4821"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Stock quantity</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="strips">Strips</option>
            <option value="bottles">Bottles</option>
            <option value="capsules">Capsules</option>
            <option value="vials">Vials</option>
            <option value="sachets">Sachets</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Price (₹)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Medicine["status"] })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="ok">OK</option>
            <option value="low">Low</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Manufacturing date</label>
          <input
            type="date"
            value={formData.manufacturingDate}
            onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Expiry date</label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Add Medicine
      </button>
    </div>
  );
};

export default AddMedicineForm;