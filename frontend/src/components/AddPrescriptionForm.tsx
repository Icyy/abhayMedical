import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { usePrescriptionStore } from "../store/prescriptionStore"
import { useInventoryStore } from "../store/inventoryStore"
import MedicineAutocomplete from "./MedicineAutocomplete"
import type { Medicine } from "../types/inventory"
import { apiRequest } from "../services/api"

interface SelectedMedicine {
  medicineId: string
  name: string
  quantity: number
  price: number
  availableStock: number
}

type PrescriptionFormData = {
  customerPhone: string
  customerName: string
  doctorName: string
  notes: string
  discount: number
}

const AddPrescriptionForm = () => {
  const addPrescription = usePrescriptionStore((state) => state.addPrescription)
  const medicines = useInventoryStore((state) => state.medicines)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PrescriptionFormData>({
    defaultValues: { discount: 0, notes: "", doctorName: "" },
  })

  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([])
  const [pendingQuantity, setPendingQuantity] = useState(1)
  const [pendingMedicine, setPendingMedicine] = useState<Medicine | null>(null)
  const [medicineError, setMedicineError] = useState("")
  const [autocompleteKey, setAutocompleteKey] = useState(0)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [customerFound, setCustomerFound] = useState(false)
  const qtyRef = useRef<HTMLInputElement>(null)

  const recentMedicines = medicines.slice(0, 5)

  const handlePhoneBlur = async (phone: string) => {
    if (phone.length !== 10) return
    setIsLookingUp(true)
    try {
      const customers = await apiRequest(`/customers?search=${phone}`)
      const match = customers.customers?.find((c: any) => c.phoneNumber === phone)
      if (match) {
        setValue("customerName", match.name)
        setCustomerFound(true)
      } else {
        setCustomerFound(false)
      }
    } catch {
      setCustomerFound(false)
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleMedicineSelect = (medicine: Medicine) => {
    setPendingMedicine(medicine)
    setTimeout(() => qtyRef.current?.focus(), 50)
  }

  const handleAddToList = () => {
    if (!pendingMedicine) { setMedicineError("Select a medicine first"); return }
    if (pendingQuantity < 1) { setMedicineError("Quantity must be at least 1"); return }
    if (pendingQuantity > pendingMedicine.stock) {
      setMedicineError(`Only ${pendingMedicine.stock} in stock`)
      return
    }
    setMedicineError("")
    setSelectedMedicines([...selectedMedicines, {
      medicineId: pendingMedicine.id,
      name: pendingMedicine.name,
      quantity: pendingQuantity,
      price: pendingMedicine.price,
      availableStock: pendingMedicine.stock,
    }])
    setAutocompleteKey((prev) => prev + 1)
    setPendingMedicine(null)
    setPendingQuantity(1)
  }

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddToList() }
  }

  const handleQuickAdd = (med: Medicine) => {
    setSelectedMedicines((prev) => {
      const existing = prev.find((m) => m.medicineId === med.id)
      if (existing) {
        return prev.map((m) => m.medicineId === med.id ? { ...m, quantity: m.quantity + 1 } : m)
      }
      return [...prev, { medicineId: med.id, name: med.name, quantity: 1, price: med.price, availableStock: med.stock }]
    })
  }

  const onFormSubmit = async (data: PrescriptionFormData) => {
    if (selectedMedicines.length === 0) { setMedicineError("Add at least one medicine"); return }
    try {
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
      })
      reset({ customerName: "", customerPhone: "", doctorName: "", notes: "", discount: 0 })
      setSelectedMedicines([])
      setMedicineError("")
      setCustomerFound(false)
    } catch (err: any) {
      setMedicineError(err.message || "Failed to save prescription")
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Phone number</label>
          <div className="relative">
            <input
              {...register("customerPhone", {
                required: "Phone number is required",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10 digit number" },
                onBlur: (e) => handlePhoneBlur(e.target.value)
              })}
              placeholder="9876543210"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
            {isLookingUp && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Looking up...</span>}
            {customerFound && <span className="absolute right-3 top-2.5 text-xs text-green-600">✓ Found</span>}
          </div>
          {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Patient name</label>
          <input
            {...register("customerName", { required: "Patient name is required" })}
            placeholder="e.g. Ramesh Shah"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Doctor name <span className="text-gray-400">(optional)</span></label>
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
            max="100"
            {...register("discount", {
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" },
              max: { value: 100, message: "Cannot exceed 100%" },
            })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Medicines</h3>

        {recentMedicines.length > 0 && (
          <div className="mb-3">
            <p className="text-[10.5px] text-[#8A8678] mb-1.5 uppercase tracking-wide">Quick add</p>
            <div className="flex flex-wrap gap-1.5">
              {recentMedicines.map((med) => (
                <button
                  key={med.id}
                  onClick={() => handleQuickAdd(med)}
                  className="text-xs px-2.5 py-1 bg-[#F7F5F0] border border-[#E8E4D9] rounded-md hover:bg-green-50 hover:border-green-200 text-gray-700"
                >
                  {med.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <MedicineAutocomplete key={autocompleteKey} onSelect={handleMedicineSelect} />
          <input
            ref={qtyRef}
            type="number"
            min={1}
            value={pendingQuantity}
            onChange={(e) => setPendingQuantity(Number(e.target.value))}
            onKeyDown={handleQtyKeyDown}
            placeholder="Qty"
            className="w-full sm:w-20 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={handleAddToList}
            className="bg-[#0F4C3A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c3b2d] whitespace-nowrap"
          >
            Add
          </button>
        </div>

        {pendingMedicine && (
          <p className="text-xs text-green-700 mb-2">
            {pendingMedicine.name} · ₹{pendingMedicine.price} · Stock: {pendingMedicine.stock} — press Enter to add
          </p>
        )}

        {medicineError && <p className="text-red-500 text-xs mb-2">{medicineError}</p>}

        {selectedMedicines.length === 0 ? (
          <p className="text-sm text-gray-400">No medicines added yet</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {selectedMedicines.map((med, index) => (
              <div key={index} className="flex items-center justify-between bg-[#F7F5F0] px-3 py-2 rounded-md">
                <span className="text-sm text-gray-900">{med.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8A8678]">×{med.quantity} · ₹{(med.price * med.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index))}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <div className="text-right text-xs text-[#8A8678] mt-1">
              Subtotal: ₹{selectedMedicines.reduce((sum, m) => sum + m.price * m.quantity, 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors w-full md:w-auto"
      >
        Save Prescription
      </button>
    </div>
  )
}

export default AddPrescriptionForm