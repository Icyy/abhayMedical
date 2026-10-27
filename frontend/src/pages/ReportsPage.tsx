import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Package,
  IndianRupee
} from "lucide-react";
import {
  fetchSalesReport,
  fetchPurchaseReport,
} from "../services/reportsService";
import PurchaseOrderDetailModal from "../components/PurchaseOrderDetailModal";
import type { PurchaseOrder } from "../types/supplier";

type ReportType = "sales" | "purchase";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ReportsPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [salesData, setSalesData] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    if (activeReport === "sales") loadSales(month, year);
    if (activeReport === "purchase") loadPurchase(month, year);
  }, [month, year, activeReport]);

  const handleMonthChange = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const loadSales = async (m: number, y: number) => {
    setIsLoading(true);
    try {
      const data = await fetchSalesReport(m, y);
      setSalesData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchase = async (m: number, y: number) => {
    setIsLoading(true);
    try {
      const data = await fetchPurchaseReport(m, y);
      setPurchaseData(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixes the syrup/strip unit display issue by parsing packType
  const formatDisplayQuantity = (qty: number, packType?: string, unitsPerPack: number = 1) => {
    if (!packType) return `${qty} units`;
    if (packType.toLowerCase() === 'bottle') {
      return `${qty} bottle${qty !== 1 ? 's' : ''}`;
    }
    if (packType.toLowerCase() === 'strip') {
      const strips = Math.floor(qty / unitsPerPack);
      const loose = qty % unitsPerPack;
      if (strips > 0 && loose > 0) return `${strips} strip${strips > 1 ? 's' : ''}, ${loose} tab${loose !== 1 ? 's' : ''}`;
      if (strips > 0) return `${strips} strip${strips > 1 ? 's' : ''}`;
      return `${loose} tab${loose !== 1 ? 's' : ''}`;
    }
    return `${qty} ${packType}${qty !== 1 ? 's' : ''}`;
  };

  const maxSalesRevenue = salesData?.topMedicines?.length 
    ? Math.max(...salesData.topMedicines.map((m: any) => m.revenue)) 
    : 1;

  const maxSupplierSpend = purchaseData?.supplierBreakdown?.length 
    ? Math.max(...purchaseData.supplierBreakdown.map((s: any) => s.spend)) 
    : 1;

  return (
    <div className="p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
          <button onClick={() => handleMonthChange(-1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-3 min-w-[120px] justify-center">
            <FileText size={14} className="text-[#0F4C3A]" />
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[month - 1]} {year}
            </span>
          </div>
          <button 
            onClick={() => handleMonthChange(1)} 
            disabled={month === today.getMonth() + 1 && year === today.getFullYear()}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Sleek Navigation Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveReport("sales")}
          className={`pb-3 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 ${
            activeReport === "sales" ? "border-[#0F4C3A] text-[#0F4C3A]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <TrendingUp size={18} />
          Sales Performance
        </button>
        <button
          onClick={() => setActiveReport("purchase")}
          className={`pb-3 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 ${
            activeReport === "purchase" ? "border-[#0F4C3A] text-[#0F4C3A]" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShoppingCart size={18} />
          Purchase & Inventory
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Activity size={32} className="text-[#0F4C3A] opacity-50" />
            <p className="text-sm text-gray-500 font-medium">Compiling reports...</p>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {/* SALES DASHBOARD */}
          {activeReport === "sales" && salesData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <IndianRupee size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Net Revenue</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">₹{(salesData.totalRevenue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Package size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Orders Filled</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{salesData.prescriptionCount || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <TrendingUp size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Avg Order Value</p>
                  </div>
                  <p className="text-3xl font-bold text-[#0F4C3A]">
                    ₹{salesData.prescriptionCount ? (salesData.totalRevenue / salesData.prescriptionCount).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">Target: ₹400.00 for delivery</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FileText size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">GST Collected</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">₹{(salesData.totalGst || 0).toFixed(2)}</p>
                </div>
              </div>

              {salesData.topMedicines?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900">Top Performing Medicines</h2>
                  </div>
                  <div className="divide-y divide-gray-50 p-2">
                    {salesData.topMedicines.map((med: any, i: number) => (
                      <div key={med.name} className="relative flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 group z-10 overflow-hidden">
                        {/* Visual Bar Indicator */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-green-50/60 -z-10 transition-all" 
                          style={{ width: `${(med.revenue / maxSalesRevenue) * 100}%` }}
                        />
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-gray-400 w-4 text-right">{i + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{med.name}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                              {formatDisplayQuantity(med.quantity, med.packType, med.unitsPerPack)} sold
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#0F4C3A]">₹{(med.revenue || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PURCHASE DASHBOARD */}
          {activeReport === "purchase" && purchaseData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <IndianRupee size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Total Spend</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">₹{(purchaseData.totalSpend || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Package size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Purchase Orders</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{purchaseData.orderCount || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm col-span-2 xl:col-span-1">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <TrendingUp size={16} />
                    <p className="text-xs font-semibold uppercase tracking-wide">Avg PO Value</p>
                  </div>
                  <p className="text-3xl font-bold text-[#0F4C3A]">
                    ₹{purchaseData.orderCount ? (purchaseData.totalSpend / purchaseData.orderCount).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Spend by Supplier */}
                {purchaseData.supplierBreakdown?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-fit">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h2 className="text-sm font-bold text-gray-900">Spend by Supplier</h2>
                    </div>
                    <div className="p-2 divide-y divide-gray-50">
                      {purchaseData.supplierBreakdown.map((s: any) => (
                        <div key={s.name} className="relative flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 z-10 overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-blue-50/60 -z-10 transition-all" 
                            style={{ width: `${(s.spend / maxSupplierSpend) * 100}%` }}
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{s.name}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{s.orders} order{s.orders !== 1 ? "s" : ""}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">₹{(s.spend || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Purchase Orders Table */}
                {purchaseData.orders?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-fit">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h2 className="text-sm font-bold text-gray-900">Purchase Log</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {purchaseData.orders.map((order: any) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-900">{order.supplier?.name || "Unknown"}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                              {new Date(order.orderDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })} · {order.items?.length || 0} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#0F4C3A]">₹{order.totalCost.toFixed(2)}</p>
                            <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded mt-1 inline-block ${
                              order.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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