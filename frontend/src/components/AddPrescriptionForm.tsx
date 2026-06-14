import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePrescriptionStore } from "../store/prescriptionStore";
import type { Prescription } from "../types/prescription";

interface PrescribedMedicine {
  name: string;
  quantity: number;
}

type PrescriptionFormData = {
  name: string;
  phoneNumber: string;
  doctorName: string;
  notes: string;
  discount: number;
}

const AddPrescriptionForm = () => {
  const addPrescription = usePrescriptionStore((state) => state.addPrescription);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PrescriptionFormData>({
    defaultValues: {
      discount: 0,
      notes: "",
      doctorName: "",
    }
  });

  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);
  const [currentMedicine, setCurrentMedicine] = useState({ name: "", quantity: 0 });
  const [medicineError, setMedicineError] = useState("");

  const handleAddMedicine = () => {
    if (!currentMedicine.name || currentMedicine.quantity === 0) {
      setMedicineError("Please enter medicine name and quantity");
      return;
    }
    setMedicineError("");
    setPrescribedMedicines([...prescribedMedicines, currentMedicine]);
    setCurrentMedicine({ name: "", quantity: 0 });
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: PrescriptionFormData) => {
    if (prescribedMedicines.length === 0) {
      setMedicineError("Please add at least one medicine");
      return;
    }

    const newPrescription: Prescription = {
      prescriptionId: `RX${Date.now()}`,
      name: data.name,
      phoneNumber: data.phoneNumber,
      doctorName: data.doctorName,
      notes: data.notes,
      discount: data.discount,
      medicines: prescribedMedicines,
      subTotal: 0,
      total: 0,
      status: "pending",
      date: new Date(),
    };

    addPrescription(newPrescription);
    reset();
    setPrescribedMedicines([]);
    setMedicineError("");
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">New Prescription</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Patient name</label>
          <input
            {...register("name", { required: "Patient name is required" })}
            placeholder="e.g. Ramesh Shah"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <input
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10 digit number" }
            })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Doctor name</label>
          <input
            {...register("doctorName")}
            placeholder="e.g. Dr. Mehta"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Discount %</label>
          <input
            type="number"
            {...register("discount", {
              min: { value: 0, message: "Discount cannot be negative" },
              max: { value: 100, message: "Discount cannot exceed 100%" }
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount.message}</p>}
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            {...register("notes")}
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

        {medicineError && <p className="text-red-500 text-xs mb-2">{medicineError}</p>}

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
        onClick={handleSubmit(onFormSubmit)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors"
      >
        Save Prescription
      </button>
    </div>
  );
};

export default AddPrescriptionForm;