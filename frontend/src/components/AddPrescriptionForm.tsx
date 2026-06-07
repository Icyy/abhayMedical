import { useState } from "react";
import { usePrescriptionStore } from "../store/prescriptionStore";
import type { Prescription } from "../types/prescription";

interface PrescribedMedicine {
  name: string;
  quantity: number;
}

const AddPrescriptionForm = () => {
  const addPrescription = usePrescriptionStore((state) => state.addPrescription);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    doctorName: "",
    notes: "",
    discount: 0,
  });

  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);

  const [currentMedicine, setCurrentMedicine] = useState({
    name: "",
    quantity: 0,
  });

  const handleAddMedicine = () => {
    if (!currentMedicine.name || currentMedicine.quantity === 0) {
      alert("Please enter medicine name and quantity");
      return;
    }
    setPrescribedMedicines([...prescribedMedicines, currentMedicine]);
    setCurrentMedicine({ name: "", quantity: 0 });
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phoneNumber) {
      alert("Please fill in patient name and phone number");
      return;
    }
    if (prescribedMedicines.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    const newPrescription: Prescription = {
      prescriptionId: `RX${Date.now()}`,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      doctorName: formData.doctorName,
      notes: formData.notes,
      discount: formData.discount,
      medicines: prescribedMedicines,
      subTotal: 0,
      total: 0,
      status: "pending",
      date: new Date(),
    };

    addPrescription(newPrescription);

    setFormData({ name: "", phoneNumber: "", doctorName: "", notes: "", discount: 0 });
    setPrescribedMedicines([]);
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">New Prescription</h2>

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
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Doctor name</label>
          <input
            value={formData.doctorName}
            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            placeholder="e.g. Dr. Mehta"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Discount %</label>
          <input
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions..."
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Medicines</h3>
        <div className="flex gap-2 mb-3">
          <input
            value={currentMedicine.name}
            onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
            placeholder="Medicine name"
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <input
            type="number"
            value={currentMedicine.quantity}
            onChange={(e) => setCurrentMedicine({ ...currentMedicine, quantity: Number(e.target.value) })}
            placeholder="Qty"
            className="w-24 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={handleAddMedicine}
            className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100"
          >
            Add
          </button>
        </div>

        {prescribedMedicines.length === 0 ? (
          <p className="text-sm text-gray-400">No medicines added yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {prescribedMedicines.map((med, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm">{med.name}</span>
                <span className="text-sm text-gray-500">Qty: {med.quantity}</span>
                <button
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Save Prescription
      </button>
    </div>
  );
};

export default AddPrescriptionForm;