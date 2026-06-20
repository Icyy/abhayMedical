import { useEffect } from "react";
import { useInventoryStore } from "../store/inventoryStore";
import { usePrescriptionStore } from "../store/prescriptionStore";
import { AlertTriangle } from "lucide-react";

const DashboardPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const loadMedicines = useInventoryStore((state) => state.loadMedicines);
  const prescriptions = usePrescriptionStore((state) => state.prescriptions);
  const loadPrescriptions = usePrescriptionStore((state) => state.loadPrescriptions);

  useEffect(() => {
    loadMedicines();
    loadPrescriptions();
  }, []);

  const critical = medicines.filter((med) => med.status === "CRITICAL");
  const lowStock = medicines.filter((med) => med.stock < 10 && med.status !== "CRITICAL");
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryNear = medicines.filter((med) => new Date(med.expiryDate) < in30Days);

  const todaysPaidPrescriptions = prescriptions.filter((p) => {
    const isToday = new Date(p.date).toDateString() === today.toDateString();
    return isToday && p.status === "PAID";
  });
  const todaysRevenue = todaysPaidPrescriptions.reduce((sum, p) => sum + p.total, 0);

  const needsAttention = critical.length + lowStock.length;
  const attentionItems = medicines.filter((med) => med.status === "CRITICAL" || med.status === "LOW");

  const stats = [
    { label: "Total medicines", value: medicines.length, tone: "" },
    { label: "Low stock", value: lowStock.length, tone: "warn" },
    { label: "Critical", value: critical.length, tone: "danger" },
    { label: "Expiring soon", value: expiryNear.length, tone: "warn" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Dashboard</h1>

      <div className="bg-[#0F4C3A] rounded-xl p-5 mb-4 flex justify-between items-start flex-wrap gap-3">
        <div>
          <p className="text-[#9DBBAE] text-xs mb-1">Today's revenue</p>
          <p className="text-white text-3xl font-medium">₹{todaysRevenue.toFixed(2)}</p>
          <p className="text-[#C9DCD1] text-xs mt-1">
            {todaysPaidPrescriptions.length} prescription{todaysPaidPrescriptions.length === 1 ? "" : "s"} dispensed
          </p>
        </div>
        {needsAttention > 0 ? (
          <span className="bg-[#F0997B] text-[#4A1B0C] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <AlertTriangle size={13} />
            {needsAttention} need{needsAttention === 1 ? "s" : ""} attention
          </span>
        ) : (
          <span className="bg-white/10 text-[#F7F5F0] text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
            All stock healthy
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E8E4D9] rounded-lg p-3.5">
            <p className="text-[11.5px] text-[#8A8678] mb-1">{stat.label}</p>
            <p
              className={`text-[19px] font-medium ${
                stat.tone === "danger" ? "text-red-700" : stat.tone === "warn" ? "text-amber-700" : "text-gray-900"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E4D9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E8E4D9] flex justify-between items-center">
          <h2 className="text-[13.5px] font-medium text-gray-900">Needs attention</h2>
          <span className="text-[11px] text-[#8A8678]">{attentionItems.length} items</span>
        </div>
        {attentionItems.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">Nothing needs attention right now</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2 text-[11px] text-[#8A8678] font-normal">Medicine</th>
                  <th className="text-left px-4 py-2 text-[11px] text-[#8A8678] font-normal">Stock</th>
                  <th className="text-left px-4 py-2 text-[11px] text-[#8A8678] font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {attentionItems.map((med) => (
                  <tr key={med.id} className="border-t border-[#F1EFE8]">
                    <td className="px-4 py-2.5 text-[13px] text-gray-900">{med.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-900">{med.stock}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${
                          med.status === "CRITICAL" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {med.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;