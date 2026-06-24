import { useEffect, useState } from "react"
import { Search, Phone, Mail, MapPin } from "lucide-react"
import AddSupplierForm from "../components/AddSupplierForm"
import CollapsibleSection from "../components/CollapsibleSection"
import { useSupplierStore } from "../store/supplierStore"

const SuppliersPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers)
  const isLoading = useSupplierStore((state) => state.isLoading)
  const error = useSupplierStore((state) => state.error)
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers)
  const removeSupplier = useSupplierStore((state) => state.removeSupplier)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadSuppliers()
  }, [])

  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  if (isLoading) return <p className="p-6 text-gray-500">Loading suppliers...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Suppliers</h1>
        <span className="text-xs text-[#8A8678]">{suppliers.length} suppliers</span>
      </div>

      <CollapsibleSection title="Add supplier">
        <AddSupplierForm />
      </CollapsibleSection>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No suppliers added yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  {s.contactPerson && (
                    <p className="text-xs text-[#8A8678] mt-0.5">{s.contactPerson}</p>
                  )}
                </div>
                {s.gstNumber && (
                  <span className="text-[10px] text-[#8A8678] bg-gray-50 border border-[#E8E4D9] px-2 py-0.5 rounded font-mono">
                    GST {s.gstNumber}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 mb-3">
                {s.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8A8678]">
                    <Phone size={12} />
                    {s.phone}
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8A8678]">
                    <Mail size={12} />
                    {s.email}
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8A8678]">
                    <MapPin size={12} />
                    {s.address}
                  </div>
                )}
              </div>
              <div className="border-t border-[#F1EFE8] pt-3">
                <button
                  onClick={() => confirm(`Remove ${s.name}?`) && removeSupplier(s.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Remove supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SuppliersPage