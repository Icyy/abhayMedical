import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryPage from "./pages/InventoryPage";
import DashboardPage from "./pages/DashboardPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import CustomersPage from "./pages/CustomersPage";
import ReordersPage from "./pages/ReordersPage";
import SideBar from "./components/SideBar";

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
      <BrowserRouter>
      <h1 className="font-bold text-amber-50 p-3 bg-green-700">Abhay Medical</h1>
        <div className="flex">
          <SideBar />
          <Routes>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reorders" element={<ReordersPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
