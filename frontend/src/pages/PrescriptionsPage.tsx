import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import AddPrescriptionForm from "../components/AddPrescriptionForm"
import CollapsibleSection from "../components/CollapsibleSection"
import { usePrescriptionStore } from "../store/prescriptionStore"
import { getPresStatusClass } from "../utils/statusHelpers"
import type { Prescription } from "../types/prescription"
import InvoiceModal from "../components/InvoiceModal"

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Rejected", value: "REJECTED" },
]

const PrescriptionsPage = () => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const prescriptions = usePrescriptionStore((state) => state.prescriptions)
  const total = usePrescriptionStore((state) => state.total)
  const currentPage = usePrescriptionStore((state) => state.currentPage)
  const totalPages = usePrescriptionStore((state) => state.totalPages)
  const isLoading = usePrescriptionStore((state) => state.isLoading)
  const error = usePrescriptionStore((state) => state.error)
  const loadPrescriptions = usePrescriptionStore((state) => state.loadPrescriptions)
  const removePrescription = usePrescriptionStore((state) => state.removePrescription)
  const updatePrescriptionStatus = usePrescriptionStore((state) => state.updatePrescriptionStatus)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadPrescriptions({ page: 1 })
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      loadPrescriptions({ page: 1, search: value, status: statusFilter })
    }, 400)
    setSearchTimeout(timeout)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    loadPrescriptions({ page: 1, search, status })
  }

  const handlePageChange = (page: number) => {
    loadPrescriptions({ page, search, status: statusFilter })
  }

  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Prescriptions</h1>
        <span className="text-xs text-[#8A8678]">{total} total</span>
      </div>

      <CollapsibleSection title="New prescription">
        <AddPrescriptionForm />
      </CollapsibleSection>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-[#0F4C3A] text-white"
                : "bg-white border border-[#E8E4D9] text-[#8A8678] hover:border-green-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by patient name..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <p className="text-sm text-gray-400">No prescriptions found</p>
      ) : (
        <div className="flex flex-col gap-2">
          {prescriptions.map((presc) => (
            <div key={presc.id} className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-gray-900">{presc.customer.name}</p>
                  <p className="text-xs text-[#8A8678] mt-0.5">
                    {presc.customer.phoneNumber}
                    {presc.doctorName && ` · Dr. ${presc.doctorName}`}
                    {` · ${new Date(presc.date).toLocaleDateString()}`}
                  </p>
                  <p className="text-xs text-[#8A8678] mt-0.5">
                    {presc.items.length} medicine{presc.items.length !== 1 ? "s" : ""}
                    {presc.items.map(i => i.medicine.name).join(", ").length > 0 &&
                      ` — ${presc.items.map(i => i.medicine.name).join(", ")}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">₹{(presc.total || 0 ).toFixed(2)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPresStatusClass(presc.status)}`}>
                    {presc.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#F1EFE8]">
                {presc.status === "PENDING" && (
                  <button
                    onClick={() => updatePrescriptionStatus(presc.id, "PAID")}
                    className="bg-[#0F4C3A] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#0c3b2d]"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedPrescription(presc)}
                  className="border border-[#E8E4D9] text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50"
                >
                  View Invoice
                </button>
                <button
                  onClick={() => confirm(`Remove prescription for ${presc.customer.name}?`) && removePrescription(presc.id)}
                  className="text-red-400 hover:text-red-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-50 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#8A8678]">
            Page {currentPage} of {totalPages} · {total} total
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedPrescription && (
        <InvoiceModal prescription={selectedPrescription} onClose={() => setSelectedPrescription(null)} />
      )}
    </div>
  )
}

export default PrescriptionsPage