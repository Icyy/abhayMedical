import { useState } from "react"
import { useForm } from "react-hook-form"
import { Phone, Mail, MapPin, FileText } from "lucide-react"
import type { Supplier } from "../types/supplier"
import { useSupplierStore } from "../store/supplierStore"
import { apiRequest } from "../services/api"

interface SupplierDetailModalProps {
  supplier: Supplier
  onClose: () => void
  canEdit: boolean
}

type SupplierFormData = {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  gstNumber: string
  discountPercent: number
}

const SupplierDetailModal = ({ supplier, onClose, canEdit }: SupplierDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormData>({
    defaultValues: {
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      gstNumber: supplier.gstNumber || "",
      discountPercent: supplier.discountPercent,
    }
  })

  const onSave = async (data: SupplierFormData) => {
    setIsSaving(true)
    try {
      await apiRequest(`/suppliers/${supplier.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      await loadSuppliers()
      setIsEditing(false)
      onClose()
    } catch (err: any) {
      alert(err.message || "Failed to update supplier")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-base font-medium text-gray-900">
            {isEditing ? "Edit Supplier" : supplier.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {!isEditing ? (
          <>
            <div className="flex flex-col gap-3 mb-4">
              {supplier.contactPerson && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-[#8A8678] text-xs w-24">Contact</span>
                  {supplier.contactPerson}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={14} className="text-[#8A8678]" />
                {supplier.phone}
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={14} className="text-[#8A8678]" />
                  {supplier.email}
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-[#8A8678]" />
                  {supplier.address}
                </div>
              )}
              {supplier.gstNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText size={14} className="text-[#8A8678]" />
                  GST: {supplier.gstNumber}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8A8678] text-xs w-24">Trade Discount</span>
                <span className="font-medium text-green-700">{supplier.discountPercent}%</span>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#0F4C3A] hover:bg-[#0c3b2d] text-white text-sm font-medium py-2 rounded-md"
              >
                Edit Details
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Supplier name</label>
              <input {...register("name", { required: true })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Contact person</label>
              <input {...register("contactPerson")}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Phone</label>
              <input {...register("phone", { required: true })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Email</label>
              <input {...register("email")}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Address</label>
              <textarea {...register("address")}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">GST number</label>
              <input {...register("gstNumber")}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8A8678]">Trade discount %</label>
              <input type="number" min="0" max="100"
                {...register("discountPercent", { valueAsNumber: true })}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSave)}
                disabled={isSaving}
                className="flex-1 bg-[#0F4C3A] hover:bg-[#0c3b2d] disabled:opacity-40 text-white text-sm py-2 rounded-md font-medium"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDetailModal