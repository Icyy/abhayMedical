import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { InventoryTable } from "../components/InventoryTable";
import AddMedicineForm from "../components/AddMedicineForm";
import CollapsibleSection from "../components/CollapsibleSection";
import type { Medicine } from "../types/inventory";
import { useInventoryStore } from "../store/inventoryStore";

const InventoryPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const error = useInventoryStore((state) => state.error);
  const loadMedicines = useInventoryStore((state) => state.loadMedicines);
  const addMedicine = useInventoryStore((state) => state.addMedicine);
  const removeMedicine = useInventoryStore((state) => state.removeMedicine);
  const [name, setName] = useState("");

  useEffect(() => {
    loadMedicines();
  }, []);

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(name.toLowerCase()),
  );

  const handleAddMedicine = async (newMedicine: Omit<Medicine, "id">) => {
    await addMedicine(newMedicine);
  };

  if (isLoading) return <p className="p-6 text-gray-500">Loading medicines...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Inventory</h1>
        <span className="text-xs text-[#8A8678]">{medicines.length} medicines</span>
      </div>

      <CollapsibleSection title="Add medicine">
        <AddMedicineForm onSubmit={handleAddMedicine} />
      </CollapsibleSection>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search medicines..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <InventoryTable medicines={filteredMedicines} removeMedicine={removeMedicine} />
    </div>
  );
};

export default InventoryPage;