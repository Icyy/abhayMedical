import { useInventoryStore } from "../store/inventoryStore";
import { usePrescriptionStore } from "../store/prescriptionStore";

const DashboardPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const critical = medicines.filter((med) => med.status === "CRITICAL");
  const lowStock = medicines.filter((med) => med.stock < 10);
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryNear = medicines.filter((med) => med.expiryDate < in30Days);

  const prescriptions = usePrescriptionStore((state) => state.prescriptions);

  const todaysPaidPrescriptions = prescriptions.filter((p) => {
    const isToday = new Date(p.date).toDateString() === today.toDateString();
    return isToday && p.status === "PAID";
  });

  const todaysRevenue = todaysPaidPrescriptions.reduce(
    (sum, p) => sum + p.total,
    0,
  );

  const metrics = [
    {
      label: "Total Medicines",
      value: medicines.length,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Low Stock",
      value: lowStock.length,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-100",
    },
    {
      label: "Critical Items",
      value: critical.length,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      label: "Expiring Soon",
      value: expiryNear.length,
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Today's Revenue",
      value: `₹${todaysRevenue.toFixed(2)}`,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-100",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.bg} ${metric.border} border rounded-lg p-5`}
          >
            <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
            <p className={`text-3xl font-semibold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Critical & Low Stock Medicines
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-sm text-green-700">Medicine</th>
              <th className="text-left p-3 text-sm text-green-700">Stock</th>
              <th className="text-left p-3 text-sm text-green-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines
              .filter(
                (med) => med.status === "CRITICAL" || med.status === "LOW",
              )
              .map((med) => (
                <tr key={med.batchNumber} className="border-b border-gray-100">
                  <td className="p-3 text-sm">{med.name}</td>
                  <td className="p-3 text-sm">{med.stock}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        med.status === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
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
    </div>
  );
};

export default DashboardPage;
