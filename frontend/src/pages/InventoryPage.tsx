import { useState, useEffect } from "react";
import { InventoryTable } from "../components/InventoryTable";
import AddMedicineForm from "../components/AddMedicineForm";
import type { Medicine } from "../types/inventory";
import { useInventoryStore } from "../store/inventoryStore";

type Status = "loading" | "success" | "error";

const mockMedicines: Medicine[] = [
  {
    name: "Paracetamol 500mg",
    unit: "strips",
    stock: 12,
    price: 25,
    batchNumber: "BX4821",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "critical",
  },
  {
    name: "Azithromycin 250mg",
    unit: "strips",
    stock: 5,
    price: 85,
    batchNumber: "AZ1092",
    manufacturingDate: new Date("2024-03-01"),
    expiryDate: new Date("2026-03-01"),
    status: "critical",
  },
  {
    name: "Paracetamol test 500mg",
    unit: "capsules",
    stock: 12,
    price: 25,
    batchNumber: "BX482221",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "ok",
  },
];

const InventoryPage = () => {
//   const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const medicines = useInventoryStore((state) => state.medicines);
  const addMedicine = useInventoryStore((state) => state.addMedicine);
  const setMedicine = useInventoryStore((state)=>state.setMedicines);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMedicine(mockMedicines)
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };

    fetchMedicines();
  }, []);

  const handleAddMedicine = (newMedicine: Medicine) => {
    addMedicine(newMedicine);
  };

  if (status === "loading")
    return <p className="p-6 text-gray-500">Loading medicines...</p>;
  if (status === "error")
    return (
      <p className="p-6 text-red-500">
        Something went wrong. Please try again.
      </p>
    );

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Inventory</h1>
      <AddMedicineForm onSubmit={handleAddMedicine} />
      <InventoryTable medicines={medicines} />
    </div>
  );
};

export default InventoryPage;
