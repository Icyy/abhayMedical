import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useInventoryStore } from "../store/inventoryStore"
import { usePrescriptionStore } from "../store/prescriptionStore"

const DashboardPage = () => {
  const navigate = useNavigate()
  const medicines = useInventoryStore((state) => state.medicines)
  const loadMedicines = useInventoryStore((state) => state.loadMedicines)
  const prescriptions = usePrescriptionStore((state) => state.prescriptions)
  const loadPrescriptions = usePrescriptionStore((state) => state.loadPrescriptions)

  useEffect(() => {
    loadMedicines({ page: 1 })
    loadPrescriptions({ page: 1 })
  }, [])

  const critical = medicines.filter((med) => med.status === "CRITICAL")
  const lowStock = medicines.filter((med) => med.stock < 10 && med.status !== "CRITICAL")
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiryNear = medicines.filter((med) => new Date(med.expiryDate) < in30Days)
  const pendingPrescriptions = prescriptions.filter((p) => p.status === "PENDING")

  const todaysPaid = prescriptions.filter((p) => {
    const isToday = new Date(p.date).toDateString() === today.toDateString()
    return isToday && p.status === "PAID"
  })
  const todaysRevenue = todaysPaid.reduce((sum, p) => sum + p.total, 0)
  const needsAttention = critical.length + lowStock.length
  const attentionItems = medicines.filter((med) => med.status === "CRITICAL" || med.status === "LOW")

  const stats = [
    {
      label: "Total medicines",
      value: medicines.length,
      tone: "",
      action: () => navigate('/inventory'),
      hint: "View inventory"
    },
    {
      label: "Low stock",
      value: lowStock.length,
      tone: "warn",
      action: () => navigate('/reorders'),
      hint: "View reorders"
    },
    {
      label: "Critical",
      value: critical.length,
      tone: "danger",
      action: () => navigate('/reorders'),
      hint: "Reorder now"
    },
    {
      label: "Expiring soon",
      value: expiryNear.length,
      tone: "warn",
      action: () => navigate('/inventory'),
      hint: "View inventory"
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Dashboard</h1>
        <p className="text-xs text-[#8A8678]">
          {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Hero revenue card - clickable to reports */}
      <button
        onClick={() => navigate('/reports')}
        className="w-full bg-[#0F4C3A] rounded-xl p-5 mb-4 flex justify-between items-start flex-wrap gap-3 text-left hover:bg-[#0c3b2d] transition-colors group"
      >
        <div>
          <p className="text-[#9DBBAE] text-xs mb-1">Today's revenue</p>
          <p className="text-white text-3xl font-medium">₹{todaysRevenue.toFixed(2)}</p>
          <p className="text-[#C9DCD1] text-xs mt-1">
            {todaysPaid.length} prescription{todaysPaid.length !== 1 ? "s" : ""} dispensed
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {needsAttention > 0 ? (
            <span className="bg-[#F0997B] text-[#4A1B0C] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={13} />
              {needsAttention} need{needsAttention === 1 ? "s" : ""} attention
            </span>
          ) : (
            <span className="bg-white/10 text-[#F7F5F0] text-xs px-3 py-1.5 rounded-full">
              All stock healthy
            </span>
          )}
          <span className="text-[#9DBBAE] text-xs flex items-center gap-1 group-hover:text-white transition-colors">
            View reports <ArrowRight size={12} />
          </span>
        </div>
      </button>

      {/* Pending prescriptions alert */}
      {pendingPrescriptions.length > 0 && (
        <button
          onClick={() => navigate('/prescriptions')}
          className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center justify-between text-left hover:bg-amber-100 transition-colors"
        >
          <p className="text-sm text-amber-800 font-medium">
            {pendingPrescriptions.length} prescription{pendingPrescriptions.length !== 1 ? "s" : ""} pending payment
          </p>
          <ArrowRight size={14} className="text-amber-600" />
        </button>
      )}

      {/* Stat cards - each clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className="bg-white border border-[#E8E4D9] rounded-lg p-3.5 text-left hover:border-green-300 transition-colors group"
          >
            <p className="text-[11.5px] text-[#8A8678] mb-1">{stat.label}</p>
            <p className={`text-[19px] font-medium ${
              stat.tone === "danger" ? "text-red-700" : stat.tone === "warn" ? "text-amber-700" : "text-gray-900"
            }`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-[#8A8678] mt-1 group-hover:text-green-700 transition-colors flex items-center gap-0.5">
              {stat.hint} <ArrowRight size={10} />
            </p>
          </button>
        ))}
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        <button
          onClick={() => navigate('/prescriptions')}
          className="bg-[#0F4C3A] text-white text-xs font-medium py-2.5 rounded-lg hover:bg-[#0c3b2d] transition-colors"
        >
          + New Prescription
        </button>
        <button
          onClick={() => navigate('/inventory')}
          className="bg-white border border-[#E8E4D9] text-gray-700 text-xs font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          + Add Medicine
        </button>
        <button
          onClick={() => navigate('/customers')}
          className="bg-white border border-[#E8E4D9] text-gray-700 text-xs font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          + Add Customer
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="bg-white border border-[#E8E4D9] text-gray-700 text-xs font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Reports
        </button>
      </div>

      {/* Attention table */}
      <div className="bg-white border border-[#E8E4D9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E8E4D9] flex justify-between items-center">
          <h2 className="text-[13.5px] font-medium text-gray-900">Needs attention</h2>
          <button
            onClick={() => navigate('/reorders')}
            className="text-xs text-green-700 hover:underline flex items-center gap-0.5"
          >
            Go to reorders <ArrowRight size={11} />
          </button>
        </div>
        {attentionItems.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">Nothing needs attention right now 🎉</p>
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
                  <tr key={med.id} className="border-t border-[#F1EFE8] hover:bg-[#F7F5F0] cursor-pointer" onClick={() => navigate('/reorders')}>
                    <td className="px-4 py-2.5 text-[13px] text-gray-900">{med.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-900">{med.stock} units</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${
                        med.status === "CRITICAL" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}>
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
  )
}

export default DashboardPage