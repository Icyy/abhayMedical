import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { InventoryTable } from "../components/InventoryTable";
import AddMedicineForm from "../components/AddMedicineForm";
import CollapsibleSection from "../components/CollapsibleSection";
import type { Medicine } from "../types/inventory";
import { useInventoryStore } from "../store/inventoryStore";

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'ALLOPATHIC', label: 'Allopathic' },
  { value: 'AYURVEDIC', label: 'Ayurvedic' },
  { value: 'HOMEOPATHIC', label: 'Homeopathic' },
  { value: 'VETERINARY', label: 'Veterinary' },
  { value: 'SURGICAL', label: 'Surgical' },
  { value: 'COSMETIC', label: 'Cosmetic' },
  { value: 'PERSONAL_CARE', label: 'Personal Care' },
  { value: 'FOOD_SUPPLEMENT', label: 'Food Supplement' },
  { value: 'BABY_CARE', label: 'Baby Care' },
  { value: 'GENERAL_STORE', label: 'General Store' },
  { value: 'OTHER', label: 'Other' },
]

const InventoryPage = () => {
  const medicines = useInventoryStore((state) => state.medicines)
  const total = useInventoryStore((state) => state.total)
  const currentPage = useInventoryStore((state) => state.currentPage)
  const totalPages = useInventoryStore((state) => state.totalPages)
  const isLoading = useInventoryStore((state) => state.isLoading)
  const error = useInventoryStore((state) => state.error)
  const loadMedicines = useInventoryStore((state) => state.loadMedicines)
  const addMedicine = useInventoryStore((state) => state.addMedicine)
  const removeMedicine = useInventoryStore((state) => state.removeMedicine)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadMedicines({ page: 1, search, category })
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      loadMedicines({ page: 1, search: value, category })
    }, 400)
    setSearchTimeout(timeout)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    loadMedicines({ page: 1, search, category: value })
  }

  const handlePageChange = (page: number) => {
    loadMedicines({ page, search, category })
  }

  const handleAddMedicine = async (newMedicine: Omit<Medicine, 'id'>) => {
    await addMedicine(newMedicine)
  }

  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Inventory</h1>
        <span className="text-xs text-[#8A8678]">{total} products</span>
      </div>

      <CollapsibleSection title="Add product">
        <AddMedicineForm onSubmit={handleAddMedicine} />
      </CollapsibleSection>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <InventoryTable medicines={medicines} removeMedicine={removeMedicine} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#8A8678]">
                Showing {((currentPage - 1) * 50) + 1}–{Math.min(currentPage * 50, total)} of {total}
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
        </>
      )}
    </div>
  )
}

export default InventoryPage