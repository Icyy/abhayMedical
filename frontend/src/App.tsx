import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryPage from "./pages/InventoryPage";
import DashboardPage from "./pages/DashboardPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import CustomersPage from "./pages/CustomersPage";
import ReordersPage from "./pages/ReordersPage";
import SideBar from "./components/SideBar";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <SideBar />
        <div className="flex-1 pb-20 md:pb-0 min-w-0">
          <h1 className="font-bold text-white p-3 bg-green-700">Abhay Medical</h1>
          <Routes>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reorders" element={<ReordersPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;