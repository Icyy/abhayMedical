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
  pricePerUnit: number
  unitLabel: string
  sellAsPackOf: number
  lineTotal: number
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
  const [sellAsPackOf, setSellAsPackOf] = useState(1)
  const [medicineError, setMedicineError] = useState("")
  const [autocompleteKey, setAutocompleteKey] = useState(0)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [customerFound, setCustomerFound] = useState(false)
  const [isWalkIn, setIsWalkIn] = useState(false)
  const qtyRef = useRef<HTMLInputElement>(null)

  const recentMedicines = medicines.slice(0, 5)

  const getUnitLabel = (med: Medicine, packOf: number = 1) => {
    if (packOf > 1) {
      return med.packType === 'bottle' ? 'bottle' : med.packType === 'strip' ? 'strip' : med.packType
    }
    return med.packType === 'bottle' ? 'ml' : med.packType === 'strip' ? 'tablet' : 'unit'
  }

  const getPricePerUnit = (med: Medicine, packOf: number = 1) => {
    return med.mrp * packOf
  }

  const handlePhoneBlur = async (phone: string) => {
    if (phone.length !== 10) return
    setIsLookingUp(true)
    try {
      const response = await apiRequest(`/customers?search=${phone}`)
      const match = response.customers?.find((c: any) => c.phoneNumber === phone)
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
    setSellAsPackOf(1) // default to per unit
    setTimeout(() => qtyRef.current?.focus(), 50)
  }

  const handleAddToList = () => {
    if (!pendingMedicine) { setMedicineError("Select a medicine first"); return }
    if (pendingQuantity < 1) { setMedicineError("Quantity must be at least 1"); return }

    const pricePerUnit = getPricePerUnit(pendingMedicine, sellAsPackOf)
    const unitLabel = getUnitLabel(pendingMedicine, sellAsPackOf)

    // stock check - quantity is in the sell unit
    const stockNeeded = pendingQuantity * sellAsPackOf
    if (stockNeeded > pendingMedicine.stock) {
      setMedicineError(`Only ${Math.floor(pendingMedicine.stock / sellAsPackOf)} ${unitLabel}(s) available`)
      return
    }

    setMedicineError("")
    setSelectedMedicines([...selectedMedicines, {
      medicineId: pendingMedicine.id,
      name: pendingMedicine.name,
      quantity: pendingQuantity * sellAsPackOf, // store in base units
      pricePerUnit: pendingMedicine.mrp, // always store MRP per base unit
      unitLabel,
      sellAsPackOf,
      lineTotal: pricePerUnit * pendingQuantity,
      availableStock: pendingMedicine.stock,
    }])
    setAutocompleteKey((prev) => prev + 1)
    setPendingMedicine(null)
    setPendingQuantity(1)
    setSellAsPackOf(1)
  }

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddToList() }
  }

  const handleQuickAdd = (med: Medicine) => {
    setSelectedMedicines((prev) => {
      const existing = prev.find((m) => m.medicineId === med.id)
      if (existing) {
        return prev.map((m) => m.medicineId === med.id ? {
          ...m,
          quantity: m.quantity + 1,
          lineTotal: m.pricePerUnit * (m.quantity + 1)
        } : m)
      }
      return [...prev, {
        medicineId: med.id,
        name: med.name,
        quantity: 1,
        pricePerUnit: med.mrp,
        unitLabel: getUnitLabel(med, 1),
        sellAsPackOf: 1,
        lineTotal: med.mrp,
        availableStock: med.stock
      }]
    })
  }

  const subtotal = selectedMedicines.reduce((sum, m) => sum + m.lineTotal, 0)

  const onFormSubmit = async (data: PrescriptionFormData) => {
    if (selectedMedicines.length === 0) { setMedicineError("Add at least one medicine"); return }
    try {
      await addPrescription({
        customerPhone: isWalkIn ? '' : data.customerPhone,
        customerName: isWalkIn ? 'Walk-in Customer' : data.customerName,
        doctorName: data.doctorName,
        notes: data.notes,
        discount: data.discount,
        items: selectedMedicines.map((med) => ({
          medicineId: med.medicineId,
          quantity: med.quantity,
          price: med.pricePerUnit,
          sellAsPackOf: med.sellAsPackOf,
        })),
      })
      reset({ customerName: "", customerPhone: "", doctorName: "", notes: "", discount: 0 })
      setSelectedMedicines([])
      setMedicineError("")
      setCustomerFound(false)
      setIsWalkIn(false)
    } catch (err: any) {
      setMedicineError(err.message || "Failed to save prescription")
    }
  }

  return (
    <div>
      {/* Walk-in toggle */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F5F0] rounded-lg">
        <button
          onClick={() => setIsWalkIn(false)}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${!isWalkIn ? 'bg-[#0F4C3A] text-white' : 'text-[#8A8678]'}`}
        >
          Registered Customer
        </button>
        <button
          onClick={() => setIsWalkIn(true)}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${isWalkIn ? 'bg-[#0F4C3A] text-white' : 'text-[#8A8678]'}`}
        >
          Walk-in / Cash Sale
        </button>
      </div>

      {!isWalkIn && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Phone number</label>
            <div className="relative">
              <input
                {...register("customerPhone", {
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
            <label className="text-sm text-gray-500">Patient name <span className="text-[#8A8678]">(optional)</span></label>
            <input
              {...register("customerName")}
              placeholder="e.g. Ramesh Shah"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>

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
          {pendingMedicine && pendingMedicine.unitsPerPack > 1 && (
            <select
              value={sellAsPackOf}
              onChange={(e) => setSellAsPackOf(Number(e.target.value))}
              className="w-full sm:w-36 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            >
              <option value={1}>Per {getUnitLabel(pendingMedicine, 1)}</option>
              <option value={pendingMedicine.unitsPerPack}>Per {pendingMedicine.packType}</option>
            </select>
          )}
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
            {pendingMedicine.name} ·
            {pendingMedicine.unitsPerPack > 1 ? (
              sellAsPackOf === 1
                ? ` ₹${(pendingMedicine.mrp || 0).toFixed(2)}/tablet · ${pendingMedicine.stock} tablets available`
                : ` ₹${(pendingMedicine.mrp * pendingMedicine.unitsPerPack || 0).toFixed(2)}/strip · ${Math.floor(pendingMedicine.stock / pendingMedicine.unitsPerPack)} strips available`
            ) : (
              ` ₹${(pendingMedicine.mrp || 0).toFixed(2)}/unit · ${pendingMedicine.stock} in stock`
            )}
            {' · '}press Enter to add
          </p>
        )}

        {medicineError && <p className="text-red-500 text-xs mb-2">{medicineError}</p>}

        {selectedMedicines.length === 0 ? (
          <p className="text-sm text-gray-400">No items added yet</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {selectedMedicines.map((med, index) => (
              <div key={index} className="flex items-center justify-between bg-[#F7F5F0] px-3 py-2 rounded-md">
                <span className="text-sm text-gray-900">{med.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8A8678]">
                    {med.sellAsPackOf > 1
                      ? `${med.quantity / med.sellAsPackOf} ${med.unitLabel}s × ₹${((med.pricePerUnit * med.sellAsPackOf || 0)).toFixed(2)}`
                      : `${med.quantity} ${med.unitLabel}s × ₹${(med.pricePerUnit || 0).toFixed(2)}`
                    } = ₹{(med.lineTotal || 0).toFixed(2)}
                  </span>
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
              Subtotal: ₹{(subtotal || 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors w-full md:w-auto"
      >
        {isWalkIn ? 'Save Cash Sale' : 'Save Prescription'}
      </button>
    </div>
  )
}

export default AddPrescriptionForm