import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryPage from "./pages/InventoryPage";
import DashboardPage from "./pages/DashboardPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import CustomersPage from "./pages/CustomersPage";
import ReordersPage from "./pages/ReordersPage";
import SideBar from "./components/SideBar";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <SideBar />
        <div className="flex-1 pb-20 md:pb-0 min-w-0">
          <Routes>
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/reorders" element={<ProtectedRoute><ReordersPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;