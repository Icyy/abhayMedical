import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import AddPrescriptionForm from "../components/AddPrescriptionForm"
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

  if (error) return <p className="p-4 md:p-6 text-red-500">{error}</p>

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 min-h-screen bg-gray-200">
      {/* Left Column: Persistent Entry Form */}
      <div className="w-full xl:w-5/12 shrink-0">
        <div className="bg-white border border-[#E8E4D9] rounded-xl shadow-sm p-4 md:p-5 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Sale</h2>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">Alt + N to search</span>
          </div>
          <AddPrescriptionForm />
        </div>
      </div>

      {/* Right Column: Queue & List */}
      <div className="w-full xl:w-7/12 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium text-gray-800">Recent Prescriptions</h1>
          <span className="text-xs text-[#8A8678] bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">{total} total</span>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#0F4C3A] text-white shadow-sm"
                  : "bg-white border border-[#E8E4D9] text-[#8A8678] hover:border-green-300 hover:text-gray-900"
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
            placeholder="Search by patient name or phone..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A]"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <p className="text-sm text-gray-400 animate-pulse">Loading queue...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">No prescriptions found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {prescriptions.map((presc) => (
              <div key={presc.id} className="bg-white border border-[#E8E4D9] rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{presc.customer.name}</p>
                    <p className="text-xs text-[#8A8678] mt-1">
                      {presc.customer.phoneNumber}
                      {presc.doctorName && ` · Dr. ${presc.doctorName}`}
                      {` · ${new Date(presc.date).toLocaleDateString()}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{presc.items.length} items</span>
                      <span className="truncate max-w-[200px] md:max-w-[300px]">
                        {presc.items.map(i => i.medicine.name).join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-base font-semibold text-gray-900">₹{(presc.total || 0).toFixed(2)}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${getPresStatusClass(presc.status)}`}>
                      {presc.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  {presc.status === "PENDING" && (
                    <button
                      onClick={() => updatePrescriptionStatus(presc.id, "PAID")}
                      className="bg-[#0F4C3A] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#0c3b2d] flex-1 sm:flex-none text-center"
                    >
                      Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPrescription(presc)}
                    className="border border-[#E8E4D9] text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 flex-1 sm:flex-none text-center"
                  >
                    View Invoice
                  </button>
                  <button
                    onClick={() => confirm(`Remove prescription for ${presc.customer.name}?`) && removePrescription(presc.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-medium ml-auto transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-[#8A8678]">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPrescription && (
        <InvoiceModal prescription={selectedPrescription} onClose={() => setSelectedPrescription(null)} />
      )}
    </div>
  )
}

export default PrescriptionsPage