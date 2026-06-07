import { InventoryTable } from "../components/InventoryTable";
import AddMedicineForm from "../components/AddMedicineForm";
import type { Medicine } from "../types/inventory";
import { useInventoryStore } from "../store/inventoryStore";
import { useState } from "react";

const InventoryPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const addMedicine = useInventoryStore((state) => state.addMedicine);
  const [name, setName] = useState("");
  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(name.toLowerCase()),
  );

  const handleAddMedicine = (newMedicine: Medicine) => {
    addMedicine(newMedicine);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Inventory</h1>
      <AddMedicineForm onSubmit={handleAddMedicine} />
      <input
        type="search"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search medicines..."
        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-4 w-full"
      />
      <InventoryTable medicines={filteredMedicines} />
    </div>
  );
};

export default InventoryPage;
