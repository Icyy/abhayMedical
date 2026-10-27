import { useState, useRef, useEffect } from "react"
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

  // Default to 10% discount for all customers 
const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PrescriptionFormData>({
  defaultValues: { discount: 10, notes: "", doctorName: "" },
})

  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([])
  const [pendingQuantity, setPendingQuantity] = useState(1)
  const [pendingMedicine, setPendingMedicine] = useState<Medicine | null>(null)
  const [sellAsPackOf, setSellAsPackOf] = useState(1)
  const [medicineError, setMedicineError] = useState("")
  const [autocompleteKey, setAutocompleteKey] = useState(0)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [customerFound, setCustomerFound] = useState(false)
  
  // Default to Walk-in for faster counter checkout
  const [isWalkIn, setIsWalkIn] = useState(true) 
  
  const qtyRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // const recentMedicines = medicines.slice(0, 5)

  // Global Keyboard Shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        focusSearchInput()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const focusSearchInput = () => {
    if (wrapperRef.current) {
      const input = wrapperRef.current.querySelector('input')
      if (input) input.focus()
    }
  }

  const getUnitLabel = (med: Medicine, packOf: number = 1) => {
    if (packOf > 1) {
      return med.packType === 'bottle' ? 'bottle' : med.packType === 'strip' ? 'strip' : med.packType
    }
    return med.packType === 'bottle' ? 'ml' : med.packType === 'strip' ? 'tablet' : 'unit'
  }

  const getPricePerUnit = (med: Medicine, packOf: number = 1) => {
    return (med.mrp / med.unitsPerPack) * packOf
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
    setSellAsPackOf(medicine.unitsPerPack > 1 ? medicine.unitsPerPack : 1) // Default to full strip/bottle if applicable
    setTimeout(() => qtyRef.current?.focus(), 10)
  }

  const handleAddToList = () => {
    if (!pendingMedicine) { setMedicineError("Select a medicine"); return }
    if (pendingQuantity < 1) { setMedicineError("Qty must be >= 1"); return }

    const pricePerUnit = getPricePerUnit(pendingMedicine, sellAsPackOf)
    const unitLabel = getUnitLabel(pendingMedicine, sellAsPackOf)
    const stockNeeded = pendingQuantity * sellAsPackOf
    
    if (stockNeeded > pendingMedicine.stock) {
      setMedicineError(`Only ${Math.floor(pendingMedicine.stock / sellAsPackOf)} ${unitLabel}(s) left`)
      return
    }

    setMedicineError("")
    const baseUnitPrice = pendingMedicine.mrp / pendingMedicine.unitsPerPack

    setSelectedMedicines([...selectedMedicines, {
      medicineId: pendingMedicine.id,
      name: pendingMedicine.name,
      quantity: pendingQuantity * sellAsPackOf,
      pricePerUnit: baseUnitPrice, 
      unitLabel,
      sellAsPackOf,
      lineTotal: pricePerUnit * pendingQuantity,
      availableStock: pendingMedicine.stock,
    }])
    
    setAutocompleteKey((prev) => prev + 1)
    setPendingMedicine(null)
    setPendingQuantity(1)
    
    // Auto-focus back to search for seamless continuous entry
    setTimeout(() => focusSearchInput(), 10)
  }

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { 
      e.preventDefault()
      handleAddToList() 
    }
  }

  // const handleQuickAdd = (med: Medicine) => {
  //   const baseUnitPrice = med.mrp / med.unitsPerPack
  //   setSelectedMedicines((prev) => {
  //     const existing = prev.find((m) => m.medicineId === med.id)
  //     if (existing) {
  //       return prev.map((m) => m.medicineId === med.id ? {
  //         ...m,
  //         quantity: m.quantity + 1,
  //         lineTotal: m.pricePerUnit * (m.quantity + 1)
  //       } : m)
  //     }
  //     return [...prev, {
  //       medicineId: med.id,
  //       name: med.name,
  //       quantity: 1,
  //       pricePerUnit: baseUnitPrice,
  //       unitLabel: getUnitLabel(med, 1),
  //       sellAsPackOf: 1,
  //       lineTotal: baseUnitPrice,
  //       availableStock: med.stock
  //     }]
  //   })
  // }

  const subtotal = selectedMedicines.reduce((sum, m) => sum + m.lineTotal, 0)

  const onFormSubmit = async (data: PrescriptionFormData) => {
    if (selectedMedicines.length === 0) { setMedicineError("Cart is empty"); return }
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
      reset({ customerName: "", customerPhone: "", doctorName: "", notes: "", discount: 10 })
      setSelectedMedicines([])
      setMedicineError("")
      setCustomerFound(false)
      setIsWalkIn(true)
    } catch (err: any) {
      setMedicineError(err.message || "Failed to save")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Customer Mode Toggle */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
        <button
          onClick={() => setIsWalkIn(true)}
          className={`flex-1 text-xs py-2 rounded-md font-semibold transition-all ${isWalkIn ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Walk-in / Cash
        </button>
        <button
          onClick={() => setIsWalkIn(false)}
          className={`flex-1 text-xs py-2 rounded-md font-semibold transition-all ${!isWalkIn ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Delivery / Registered
        </button>
      </div>

      {!isWalkIn && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="relative">
              <input
                {...register("customerPhone", {
                  pattern: { value: /^[0-9]{10}$/, message: "Invalid" },
                  onBlur: (e) => handlePhoneBlur(e.target.value)
                })}
                placeholder="Phone No."
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none"
              />
              {isLookingUp && <span className="absolute right-2 top-2.5 text-[10px] text-gray-400">...</span>}
              {customerFound && <span className="absolute right-2 top-2.5 text-[10px] text-green-600 font-bold">✓</span>}
            </div>
            {errors.customerPhone && <p className="text-red-500 text-[10px] mt-0.5">{errors.customerPhone.message}</p>}
          </div>
          <input
            {...register("customerName")}
            placeholder="Patient Name"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none"
          />
        </div>
      )}

      {/* Barcode/Item Entry Area */}
      <div className="bg-[#F7F5F0] border border-[#E8E4D9] rounded-lg p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2" ref={wrapperRef}>
          <div className="flex-1">
            <MedicineAutocomplete key={autocompleteKey} onSelect={handleMedicineSelect} />
          </div>
          
          <div className="flex gap-2">
            {pendingMedicine && pendingMedicine.unitsPerPack > 1 && (
              <select
                value={sellAsPackOf}
                onChange={(e) => setSellAsPackOf(Number(e.target.value))}
                className="w-24 border border-gray-200 rounded-md px-2 py-2 text-sm bg-white outline-none focus:border-[#0F4C3A]"
              >
                <option value={pendingMedicine.unitsPerPack}>{pendingMedicine.packType}</option>
                <option value={1}>Unit</option>
              </select>
            )}
            
            <div className="relative w-20">
              <input
                ref={qtyRef}
                type="number"
                min={1}
                value={pendingQuantity}
                onChange={(e) => setPendingQuantity(Number(e.target.value))}
                onKeyDown={handleQtyKeyDown}
                placeholder="Qty"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white outline-none focus:border-[#0F4C3A] pr-6"
              />
              <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-medium tracking-tighter pointer-events-none">↵</span>
            </div>
            
            <button
              onClick={handleAddToList}
              className="bg-[#0F4C3A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0c3b2d] active:scale-95 transition-transform"
            >
              Add
            </button>
          </div>
        </div>

        {pendingMedicine && (
          <p className="text-[11px] text-[#0F4C3A] mt-2 font-medium">
            {pendingMedicine.name} · 
            {pendingMedicine.unitsPerPack > 1 ? (
              sellAsPackOf === 1
                ? ` ₹${(pendingMedicine.mrp / pendingMedicine.unitsPerPack || 0).toFixed(2)}/unit · ${pendingMedicine.stock} left`
                : ` ₹${(pendingMedicine.mrp || 0).toFixed(2)}/${pendingMedicine.packType} · ${Math.floor(pendingMedicine.stock / pendingMedicine.unitsPerPack)} left`
            ) : (
              ` ₹${(pendingMedicine.mrp || 0).toFixed(2)}/unit · ${pendingMedicine.stock} left`
            )}
          </p>
        )}
        {medicineError && <p className="text-red-500 text-[11px] mt-1 font-medium">{medicineError}</p>}
      </div>

      {/* Cart Dense Table */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden mb-4 flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5">Item</div>
          <div className="col-span-3 text-right">Qty</div>
          <div className="col-span-3 text-right">Total</div>
          <div className="col-span-1 text-center"></div>
        </div>
        
        <div className="overflow-y-auto max-h-[30vh] min-h-[150px] p-1 bg-white">
          {selectedMedicines.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">Cart is empty</div>
          ) : (
            selectedMedicines.map((med, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 px-2 py-2 border-b border-gray-50 hover:bg-[#F7F5F0] items-center group">
                <div className="col-span-5 text-sm font-medium text-gray-800 truncate" title={med.name}>
                  {med.name}
                  <div className="text-[10px] text-gray-400 font-normal">
                    ₹{((med.pricePerUnit * med.sellAsPackOf) || 0).toFixed(2)} / {med.unitLabel}
                  </div>
                </div>
                <div className="col-span-3 text-right text-sm text-gray-700">
                  {med.quantity / med.sellAsPackOf}
                </div>
                <div className="col-span-3 text-right text-sm font-semibold text-gray-900">
                  ₹{(med.lineTotal || 0).toFixed(2)}
                </div>
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index))}
                    className="text-gray-300 hover:text-red-500 focus:outline-none transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-[#F7F5F0] border-t border-gray-200 p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Discount %</label>
            <input
              type="number"
              {...register("discount", { valueAsNumber: true, min: 0, max: 100 })}
              className="w-14 border border-gray-300 rounded px-1.5 py-1 text-sm font-medium text-center focus:outline-none focus:border-[#0F4C3A]"
            />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 line-through">₹{(subtotal || 0).toFixed(2)}</div>
            <div className="text-lg font-bold text-[#0F4C3A]">
              ₹{(subtotal * (1 - (watch("discount") || 10) / 100)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-semibold py-3.5 rounded-lg shadow-sm active:scale-[0.98] transition-all"
      >
        {isWalkIn ? 'Complete Cash Sale (Enter)' : 'Save Delivery Order'}
      </button>
    </div>
  )
}

export default AddPrescriptionForm