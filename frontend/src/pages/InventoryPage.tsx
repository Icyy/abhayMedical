import { useEffect, useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { InventoryTable } from "../components/InventoryTable";
import AddMedicineForm from "../components/AddMedicineForm";
import type { MedicinePayload } from "../types/inventory";
import { useInventoryStore } from "../store/inventoryStore";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "ALLOPATHIC", label: "Allopathic" },
  { value: "AYURVEDIC", label: "Ayurvedic" },
  { value: "HOMEOPATHIC", label: "Homeopathic" },
  { value: "VETERINARY", label: "Veterinary" },
  { value: "SURGICAL", label: "Surgical" },
  { value: "COSMETIC", label: "Cosmetic" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "FOOD_SUPPLEMENT", label: "Food Supplement" },
  { value: "BABY_CARE", label: "Baby Care" },
  { value: "GENERAL_STORE", label: "General Store" },
  { value: "OTHER", label: "Other" },
];

const InventoryPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const total = useInventoryStore((state) => state.total);
  const currentPage = useInventoryStore((state) => state.currentPage);
  const totalPages = useInventoryStore((state) => state.totalPages);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const error = useInventoryStore((state) => state.error);
  const loadMedicines = useInventoryStore((state) => (state as any).loadMedicines || (state as any).fetchMedicines);
  const addMedicine = useInventoryStore((state) => state.addMedicine);
  const removeMedicine = useInventoryStore((state) => state.removeMedicine);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof loadMedicines === 'function') loadMedicines({ page: 1, search, category });
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      loadMedicines({ page: 1, search: value, category });
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    loadMedicines({ page: 1, search, category: value });
  };

  const handlePageChange = (page: number) => {
    loadMedicines({ page, search, category });
  };

  const handleAddMedicine = async (newMedicine: MedicinePayload) => {
    await addMedicine(newMedicine);
    setShowAddForm(false);
  };

  if (error) return <p className="p-6 text-red-500 font-medium">{error}</p>;

  return (
    <div className="p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{total} products in stock</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-[#0F4C3A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0c3b2d] shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} /> {showAddForm ? "Cancel Adding" : "Add New Product"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 animate-in slide-in-from-top-4 fade-in duration-200">
          <AddMedicineForm onSubmit={handleAddMedicine} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col mb-6">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50 rounded-t-xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by medicine or batch..."
              className="w-full border border-gray-200 bg-white rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] shadow-sm appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 font-medium animate-pulse">Loading inventory...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <InventoryTable medicines={medicines} removeMedicine={removeMedicine} />
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
            <p className="text-xs font-semibold text-gray-500">
              Showing {(currentPage - 1) * 50 + 1}–{Math.min(currentPage * 50, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-bold border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;