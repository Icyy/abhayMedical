import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import AddCustomersForm from "../components/AddCustomersForm"
import CollapsibleSection from "../components/CollapsibleSection"
import { useCustomerStore } from "../store/customerStore"

const getTier = (totalSpend: number) => {
  if (totalSpend >= 5000) return { label: "Gold", color: "text-amber-600 bg-amber-50 border-amber-200" }
  if (totalSpend >= 1000) return { label: "Silver", color: "text-gray-500 bg-gray-50 border-gray-200" }
  return { label: "Bronze", color: "text-orange-600 bg-orange-50 border-orange-200" }
}

const CustomersPage = () => {
  const customer = useCustomerStore((state) => state.customers)
  const isLoading = useCustomerStore((state) => state.isLoading)
  const error = useCustomerStore((state) => state.error)
  const loadCustomers = useCustomerStore((state) => state.loadCustomers)
  const removeCustomer = useCustomerStore((state) => state.removeCustomer)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadCustomers()
  }, [])

  const filtered = customer.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search))

  if (isLoading) return <p className="p-6 text-gray-500">Loading customers...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Customers</h1>
        <span className="text-xs text-[#8A8678]">{customer.length} customers</span>
      </div>

      <CollapsibleSection title="Add customer">
        <AddCustomersForm />
      </CollapsibleSection>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No customers found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((cust) => {
            const tier = getTier(cust.totalSpend)
            return (
              <div key={cust.id} className="bg-white border border-[#E8E4D9] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cust.name}</p>
                    <p className="text-xs text-[#8A8678] mt-0.5">{cust.phoneNumber}</p>
                    {cust.email && <p className="text-xs text-[#8A8678]">{cust.email}</p>}
                  </div>
                  <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${tier.color}`}>
                    {tier.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8A8678] border-t border-[#F1EFE8] pt-3">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide">Points</p>
                      <p className="text-gray-900 font-medium mt-0.5">{cust.loyaltyPoints}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide">Total Spend</p>
                      <p className="text-gray-900 font-medium mt-0.5">₹{cust.totalSpend.toFixed(2)}</p>
                    </div>
                    {cust.notes && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide">Notes</p>
                        <p className="text-gray-900 mt-0.5">{cust.notes}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => confirm(`Remove ${cust.name}?`) && removeCustomer(cust.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomersPage