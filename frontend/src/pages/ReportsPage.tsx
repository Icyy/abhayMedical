import { useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchSalesReport,
  fetchPurchaseReport,
} from "../services/reportsService";
import PurchaseOrderDetailModal from "../components/PurchaseOrderDetailModal";
import type { PurchaseOrder } from "../types/supplier";

type ReportType = "sales" | "purchase" | null;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ReportsPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );

  const handleMonthChange = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
    if (activeReport === "sales") loadSales(newMonth, newYear);
    if (activeReport === "purchase") loadPurchase(newMonth, newYear);
  };

  const loadSales = async (m = month, y = year) => {
    setIsLoading(true);
    setActiveReport("sales");
    try {
      const data = await fetchSalesReport(m, y);
      setSalesData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchase = async (m = month, y = year) => {
    setIsLoading(true);
    setActiveReport("purchase");
    try {
      const data = await fetchPurchaseReport(m, y);
      setPurchaseData(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-6">Reports</h1>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => handleMonthChange(-1)}
          className="p-1.5 border border-[#E8E4D9] rounded-md hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-gray-800 min-w-[100px] text-center">
          {MONTHS[month - 1]} {year}
        </span>
        <button
          onClick={() => handleMonthChange(1)}
          disabled={
            month === today.getMonth() + 1 && year === today.getFullYear()
          }
          className="p-1.5 border border-[#E8E4D9] rounded-md hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => loadSales()}
          className={`p-5 rounded-lg border text-left transition-colors ${
            activeReport === "sales"
              ? "bg-[#0F4C3A] border-[#0F4C3A] text-white"
              : "bg-white border-[#E8E4D9] hover:border-green-300"
          }`}
        >
          <TrendingUp
            size={20}
            className={
              activeReport === "sales"
                ? "text-white mb-2"
                : "text-[#0F4C3A] mb-2"
            }
          />
          <p
            className={`text-sm font-medium ${activeReport === "sales" ? "text-white" : "text-gray-900"}`}
          >
            Sales Report
          </p>
          <p
            className={`text-xs mt-1 ${activeReport === "sales" ? "text-green-200" : "text-[#8A8678]"}`}
          >
            Revenue, prescriptions, top medicines
          </p>
        </button>

        <button
          onClick={() => loadPurchase()}
          className={`p-5 rounded-lg border text-left transition-colors ${
            activeReport === "purchase"
              ? "bg-[#0F4C3A] border-[#0F4C3A] text-white"
              : "bg-white border-[#E8E4D9] hover:border-green-300"
          }`}
        >
          <ShoppingCart
            size={20}
            className={
              activeReport === "purchase"
                ? "text-white mb-2"
                : "text-[#0F4C3A] mb-2"
            }
          />
          <p
            className={`text-sm font-medium ${activeReport === "purchase" ? "text-white" : "text-gray-900"}`}
          >
            Purchase Report
          </p>
          <p
            className={`text-xs mt-1 ${activeReport === "purchase" ? "text-green-200" : "text-[#8A8678]"}`}
          >
            Orders received, supplier spend
          </p>
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400">Generating report...</p>
      )}

      {!isLoading && activeReport === "sales" && salesData && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <p className="text-xs text-[#8A8678] mb-1">Total Revenue</p>
              <p className="text-2xl font-medium text-[#0F4C3A]">
                ₹{salesData.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <p className="text-xs text-[#8A8678] mb-1">Prescriptions</p>
              <p className="text-2xl font-medium text-gray-900">
                {salesData.prescriptionCount}
              </p>
            </div>
            <div className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <p className="text-xs text-[#8A8678] mb-1">GST Collected</p>
              <p className="text-2xl font-medium text-gray-900">
                ₹{salesData.totalGst.toFixed(2)}
              </p>
            </div>
          </div>

          {salesData.topMedicines.length > 0 && (
            <div className="bg-white border border-[#E8E4D9] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E4D9]">
                <h2 className="text-sm font-medium text-gray-900">
                  Top medicines by revenue
                </h2>
              </div>
              <div className="divide-y divide-[#F1EFE8]">
                {salesData.topMedicines.map((med: any, i: number) => (
                  <div
                    key={med.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8A8678] w-5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm text-gray-900">{med.name}</p>
                        <p className="text-xs text-[#8A8678]">
                          {med.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{med.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && activeReport === "purchase" && purchaseData && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <p className="text-xs text-[#8A8678] mb-1">Total Spend</p>
              <p className="text-2xl font-medium text-gray-900">
                ₹{purchaseData.totalSpend.toFixed(2)}
              </p>
            </div>
            <div className="bg-white border border-[#E8E4D9] rounded-lg p-4">
              <p className="text-xs text-[#8A8678] mb-1">Orders Received</p>
              <p className="text-2xl font-medium text-gray-900">
                {purchaseData.orderCount}
              </p>
            </div>
          </div>

          {purchaseData.supplierBreakdown.length > 0 && (
            <div className="bg-white border border-[#E8E4D9] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E4D9]">
                <h2 className="text-sm font-medium text-gray-900">
                  Spend by supplier
                </h2>
              </div>
              <div className="divide-y divide-[#F1EFE8]">
                {purchaseData.supplierBreakdown.map((s: any) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-gray-900">{s.name}</p>
                      <p className="text-xs text-[#8A8678]">
                        {s.orders} order{s.orders !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{s.spend.toFixed(2)}
                    </p>
                  </div>
                ))}
                {purchaseData.orders?.map((order: any) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F7F5F0]"
                  >
                    <div>
                      <p className="text-sm text-gray-900">
                        {order.supplier?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[#8A8678]">
                        {new Date(order.orderDate).toLocaleDateString("en-IN")}{" "}
                        · {order.items?.length || 0} items
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{order.totalCost.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {selectedOrder && (
        <PurchaseOrderDetailModal
          order={selectedOrder}
          supplierName={selectedOrder.supplier?.name || "Unknown"}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default ReportsPage;
