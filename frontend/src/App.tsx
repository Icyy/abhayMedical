import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryPage from "./pages/InventoryPage";
import DashboardPage from "./pages/DashboardPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import CustomersPage from "./pages/CustomersPage";
import ReordersPage from "./pages/ReordersPage";
import SideBar from "./components/SideBar";


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
