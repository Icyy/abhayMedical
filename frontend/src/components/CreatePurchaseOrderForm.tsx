import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useSupplierStore } from "../store/supplierStore"
import { comparePricesForMedicine } from "../services/supplierService"
import { Search } from "lucide-react"

interface PurchaseItem {
  medicineName: string
  quantity: number
  pricePerUnit: number
  lineTotal: number
}

interface PriceComparison {
  pricePerUnit: number
  supplier: { id: string; name: string }
}

type OrderFormData = {
  supplierId: string
  expectedDelivery: string
  notes: string
}

const CreatePurchaseOrderForm = () => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const addPurchaseOrder = useSupplierStore((state) => state.addPurchaseOrder)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: { expectedDelivery: "", notes: "" },
  })

  const [items, setItems] = useState<PurchaseItem[]>([])
  const [pendingName, setPendingName] = useState("")
  const [pendingQty, setPendingQty] = useState<number | string>("")
  const [pendingPrice, setPendingPrice] = useState<number | string>("")
  const [comparison, setComparison] = useState<PriceComparison[]>([])
  const [itemError, setItemError] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  
  const medInputRef = useRef<HTMLInputElement>(null)

  // Global Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        medInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCheckPrices = async () => {
    if (!pendingName) { setItemError("Enter medicine name to compare"); return }
    setIsChecking(true)
    try {
      const results = await comparePricesForMedicine(pendingName)
      setComparison(results)
      setItemError(results.length === 0 ? "No pricing found" : "")
    } catch (err) {
      setItemError("Failed to check prices")
    } finally {
      setIsChecking(false)
    }
  }

  const handleAddItem = () => {
    const qty = Number(pendingQty)
    const price = Number(pendingPrice)
    
    if (!pendingName || qty < 1 || price <= 0) {
      setItemError("Enter valid name, qty, and price")
      return
    }
    
    setItems([...items, { 
      medicineName: pendingName, 
      quantity: qty, 
      pricePerUnit: price,
      lineTotal: qty * price
    }])
    
    setPendingName("")
    setPendingQty("")
    setPendingPrice("")
    setComparison([])
    setItemError("")
    
    // Auto-focus back to name for continuous entry
    setTimeout(() => medInputRef.current?.focus(), 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)

  const onFormSubmit = async (data: OrderFormData) => {
    if (items.length === 0) { setItemError("Cart is empty"); return }
    try {
      await addPurchaseOrder({
        supplierId: data.supplierId,
        expectedDelivery: data.expectedDelivery || undefined,
        notes: data.notes,
        items,
      })
      reset({ supplierId: "", expectedDelivery: "", notes: "" })
      setItems([])
    } catch (err: any) {
      setItemError(err.message || "Failed to create order")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Supplier</label>
          <select
            {...register("supplierId", { required: "Required" })}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none bg-white"
          >
            <option value="">Select...</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.supplierId && <p className="text-red-500 text-[10px] mt-0.5">{errors.supplierId.message}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Expected Delivery</label>
          <input
            type="date"
            {...register("expectedDelivery")}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none bg-white"
          />
        </div>
      </div>

      {/* Item Entry Area */}
      <div className="bg-[#F7F5F0] border border-[#E8E4D9] rounded-lg p-3 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={medInputRef}
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                placeholder="Medicine name"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] outline-none bg-white"
              />
            </div>
            <button
              onClick={handleCheckPrices}
              disabled={isChecking || !pendingName}
              className="bg-white border border-gray-200 text-[#0F4C3A] px-3 py-2 rounded-md text-xs font-bold hover:bg-green-50 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Search size={14} />
              {isChecking ? "..." : "Prices"}
            </button>
          </div>

          {comparison.length > 0 && (
            <div className="bg-white border border-green-200 rounded-md p-2 shadow-sm">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1.5">Supplier Pricing</p>
              {comparison.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setPendingPrice(c.pricePerUnit)}
                  className="w-full flex justify-between text-xs py-1.5 text-left hover:bg-green-50 px-2 rounded group"
                >
                  <span className="text-gray-700 font-medium group-hover:text-green-800">{c.supplier.name}</span>
                  <span className="font-bold text-gray-900">₹{c.pricePerUnit}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={pendingQty}
              onChange={(e) => setPendingQty(e.target.value)}
              placeholder="Qty"
              className="w-1/3 border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#0F4C3A] outline-none bg-white"
            />
            <div className="relative w-1/3">
              <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                min={0}
                value={pendingPrice}
                onChange={(e) => setPendingPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Price"
                className="w-full border border-gray-200 rounded-md pl-6 pr-3 py-2 text-sm focus:border-[#0F4C3A] outline-none bg-white"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="w-1/3 bg-[#0F4C3A] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#0c3b2d] active:scale-95 transition-transform"
            >
              Add
            </button>
          </div>
        </div>
        {itemError && <p className="text-red-500 text-[11px] mt-2 font-medium">{itemError}</p>}
      </div>

      {/* Cart Dense Table */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden mb-4 flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1 text-center"></div>
        </div>
        
        <div className="overflow-y-auto max-h-[25vh] min-h-[120px] p-1 bg-white">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">Order is empty</div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 px-2 py-2 border-b border-gray-50 hover:bg-[#F7F5F0] items-center">
                <div className="col-span-5 text-sm font-medium text-gray-800 truncate" title={item.medicineName}>
                  {item.medicineName}
                </div>
                <div className="col-span-2 text-right text-sm text-gray-700">{item.quantity}</div>
                <div className="col-span-2 text-right text-sm text-gray-700">₹{item.pricePerUnit}</div>
                <div className="col-span-2 text-right text-sm font-semibold text-gray-900">
                  ₹{item.lineTotal.toFixed(2)}
                </div>
                <div className="col-span-1 text-center">
                  <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-gray-300 hover:text-red-500 transition-colors">✕</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-[#F7F5F0] border-t border-gray-200 p-3 flex justify-between items-center">
          <textarea
            {...register("notes")}
            placeholder="Order notes..."
            className="w-1/2 bg-white border border-gray-200 rounded px-2 py-1 text-xs resize-none h-9 outline-none focus:border-[#0F4C3A]"
          />
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Est. Total</div>
            <div className="text-lg font-bold text-[#0F4C3A]">₹{subtotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit(onFormSubmit)}
        className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-semibold py-3.5 rounded-lg shadow-sm active:scale-[0.98] transition-all"
      >
        Create Purchase Order
      </button>
    </div>
  )
}

export default CreatePurchaseOrderForm