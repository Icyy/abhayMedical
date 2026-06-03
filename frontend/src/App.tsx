import { InventoryTable } from "./components/InventoryTable";

const medicines = [
  {
    name: "Paracetamol 500mg",
    unit: "strips",
    stock: 12,
    price: 25,
    batchNumber: "BX4821",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "critical" as const,
  },
  {
    name: "Azithromycin 250mg",
    unit: "strips",
    stock: 5,
    price: 85,
    batchNumber: "AZ1092",
    manufacturingDate: new Date("2024-03-01"),
    expiryDate: new Date("2026-03-01"),
    status: "critical" as const,
  },
  {
    name: "Paracetamol test 500mg",
    unit: "capsules",
    stock: 12,
    price: 25,
    batchNumber: "BX482221",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "ok" as const,
  },
];

const App = () => {
  return (
    <>
      <h1>Abhay Medical</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <InventoryTable medicines={medicines} />
      </div>
    </>
  );
};

export default App;
