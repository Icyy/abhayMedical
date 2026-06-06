import { useState } from "react";
import type { Medicine } from "../types/inventory";

interface AddMedicineFormProps {
  onSubmit: (medicine: Medicine) => void;
}

const AddMedicineForm = ({ onSubmit }: AddMedicineFormProps) => {
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState("strips");
  const [price, setPrice] = useState(0);
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<Medicine["status"]>("ok");

  const handleSubmit = () => {
    if (!name || stock === 0) {
      alert("Please fill in all fields");
      return;
    }

    const newMedicine: Medicine = {
      name,
      stock,
      unit,
      price,
      batchNumber: batchNumber || `BX${Date.now()}`,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      status,
    };

    onSubmit(newMedicine);

    setName("");
    setStock(0);
    setUnit("strips");
    setPrice(0);
    setBatchNumber("");
    setManufacturingDate("");
    setExpiryDate("");
    setStatus("ok");
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">Add Medicine</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Medicine name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paracetamol 500mg"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Batch number</label>
          <input
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="e.g. BX4821"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Stock quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
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
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Medicine["status"])}
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
            value={manufacturingDate}
            onChange={(e) => setManufacturingDate(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Expiry date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
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