import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePrescriptionStore } from "../store/prescriptionStore";
import MedicineAutocomplete from "./MedicineAutocomplete";
import type { Medicine } from "../types/inventory";

interface SelectedMedicine {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  availableStock: number;
}

type PrescriptionFormData = {
  customerName: string;
  customerPhone: string;
  doctorName: string;
  notes: string;
  discount: number;
};

const AddPrescriptionForm = () => {
  const addPrescription = usePrescriptionStore(
    (state) => state.addPrescription,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    defaultValues: { discount: 0, notes: "", doctorName: "" },
  });

  const [selectedMedicines, setSelectedMedicines] = useState<
    SelectedMedicine[]
  >([]);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [pendingMedicine, setPendingMedicine] = useState<Medicine | null>(null);
  const [medicineError, setMedicineError] = useState("");
  const [autoCompleteKey, setAutocompleteKey] = useState(0);

  const handleMedicineSelect = (medicine: Medicine) => {
    setPendingMedicine(medicine);
  };

  const handleAddToList = () => {
    if (!pendingMedicine) {
      setMedicineError("Please select a medicine first");
      return;
    }
    if (pendingQuantity < 1) {
      setMedicineError("Quantity must be at least 1");
      return;
    }
    if (pendingQuantity > pendingMedicine.stock) {
      setMedicineError(`Only ${pendingMedicine.stock} in stock`);
      return;
    }

    setMedicineError("");
    setSelectedMedicines([
      ...selectedMedicines,
      {
        medicineId: pendingMedicine.id,
        name: pendingMedicine.name,
        quantity: pendingQuantity,
        price: pendingMedicine.price,
        availableStock: pendingMedicine.stock,
      },
    ]);
    setAutocompleteKey((prev) => prev + 1);
    setPendingMedicine(null);
    setPendingQuantity(1);
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: PrescriptionFormData) => {
    if (selectedMedicines.length === 0) {
      setMedicineError("Please add at least one medicine");
      return;
    }

    await addPrescription({
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      doctorName: data.doctorName,
      notes: data.notes,
      discount: data.discount,
      items: selectedMedicines.map((med) => ({
        medicineId: med.medicineId,
        quantity: med.quantity,
        price: med.price,
      })),
    });

    reset({
      customerPhone: "",
      customerName: "",
      doctorName: "",
      notes: "",
      discount: 0,
    });
    setSelectedMedicines([]);
    setMedicineError("");
  };

  return (
    <div className="bg-white rounded-lg border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-medium text-green-800 mb-4">
        New Prescription
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Patient name</label>
          <input
            {...register("customerName", {
              required: "Patient name is required",
            })}
            placeholder="e.g. Ramesh Shah"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <input
            {...register("customerPhone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10 digit number",
              },
            })}
            placeholder="e.g. 9876543210"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.customerPhone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.customerPhone.message}
            </p>
          )}
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
            min="0"
            {...register("discount", {
              valueAsNumber: true,
              min: { value: 0, message: "Discount cannot be negative" },
              max: { value: 100, message: "Discount cannot exceed 100%" },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.discount && (
            <p className="text-red-500 text-xs mt-1">
              {errors.discount.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
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

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <MedicineAutocomplete
            onSelect={handleMedicineSelect}
            key={autoCompleteKey}
          />
          <input
            type="number"
            min={1}
            value={pendingQuantity}
            onChange={(e) => setPendingQuantity(Number(e.target.value))}
            placeholder="Qty"
            className="w-full sm:w-24 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={handleAddToList}
            className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 whitespace-nowrap"
          >
            Add
          </button>
        </div>

        {pendingMedicine && (
          <p className="text-xs text-green-700 mb-2">
            Selected: {pendingMedicine.name} (Stock: {pendingMedicine.stock})
          </p>
        )}

        {medicineError && (
          <p className="text-red-500 text-xs mb-2">{medicineError}</p>
        )}

        {selectedMedicines.length === 0 ? (
          <p className="text-sm text-gray-400">No medicines added yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedMedicines.map((med, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm">{med.name}</span>
                <span className="text-sm text-gray-500">
                  Qty: {med.quantity} × ₹{med.price}
                </span>
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
