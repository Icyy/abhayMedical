import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  PackageMinus, 
  AlertOctagon, 
  Plus,
  ShoppingBag,
  FileText,
  Users
} from "lucide-react"
import { useInventoryStore } from "../store/inventoryStore"
import { usePrescriptionStore } from "../store/prescriptionStore"
import { CheckCircle } from "lucide-react"

const DashboardPage = () => {
  const navigate = useNavigate()
  const medicines = useInventoryStore((state) => state.medicines)
  const loadMedicines = useInventoryStore((state) => (state as any).loadMedicines || (state as any).fetchMedicines)
  const prescriptions = usePrescriptionStore((state) => state.prescriptions)
  const loadPrescriptions = usePrescriptionStore((state) => state.loadPrescriptions)

  useEffect(() => {
    if (typeof loadMedicines === 'function') loadMedicines({ page: 1 })
    if (typeof loadPrescriptions === 'function') loadPrescriptions({ page: 1 })
  }, [loadMedicines, loadPrescriptions])

  const today = new Date()
  const critical = medicines.filter((med) => med.status === "CRITICAL")
  const lowStock = medicines.filter((med) => med.stock < 10 && med.status !== "CRITICAL")
  const expiryNear = medicines.filter((med) => med.expiringBatches > 0)
  
  const pendingPrescriptions = prescriptions.filter((p) => p.status === "PENDING")
  const todaysPaid = prescriptions.filter((p) => {
    const isToday = new Date(p.date).toDateString() === today.toDateString()
    return isToday && p.status === "PAID"
  })
  
  const todaysRevenue = todaysPaid.reduce((sum, p) => sum + (p.total || 0), 0)
  const attentionItems = [...critical, ...lowStock]

  // Helper to display actual bottles/strips instead of raw base units
  const formatStock = (stock: number, packType?: string, unitsPerPack: number = 1) => {
    if (!packType || unitsPerPack === 1) return `${stock} units`
    if (packType.toLowerCase() === 'bottle') return `${stock} bottle${stock !== 1 ? 's' : ''}`
    if (packType.toLowerCase() === 'strip') {
      const strips = Math.floor(stock / unitsPerPack)
      const loose = stock % unitsPerPack
      if (strips > 0 && loose > 0) return `${strips} strip${strips > 1 ? 's' : ''}, ${loose} tab${loose !== 1 ? 's' : ''}`
      if (strips > 0) return `${strips} strip${strips > 1 ? 's' : ''}`
      return `${loose} tab${loose !== 1 ? 's' : ''}`
    }
    return `${stock} ${packType}`
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50/50 min-h-screen">
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Abhay Medical Overview</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
          <button
            onClick={() => navigate('/prescriptions')}
            className="flex items-center gap-1.5 bg-[#0F4C3A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0c3b2d] shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} /> New Sale
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Top Row: Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Revenue Card (Brand Focus) */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-[#0F4C3A] rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 opacity-10">
            <TrendingUp size={120} />
          </div>
          <p className="text-green-100 text-sm font-semibold uppercase tracking-wide mb-1 relative z-10">Today's Revenue</p>
          <p className="text-white text-4xl font-bold mb-3 relative z-10">₹{todaysRevenue.toFixed(2)}</p>
          <div className="flex items-center justify-between mt-auto relative z-10">
            <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-md">
              {todaysPaid.length} Orders Dispensed
            </span>
            <ArrowRight size={16} className="text-green-200 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pending Orders Card */}
        <div 
          onClick={() => navigate('/prescriptions')}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={16} className="text-amber-500" />
              <p className="text-sm font-semibold uppercase tracking-wide">Pending Payments</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-1">{pendingPrescriptions.length}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${pendingPrescriptions.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
              {pendingPrescriptions.length > 0 ? 'Requires Action' : 'All Cleared'}
            </span>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
          </div>
        </div>

        {/* Quick Links / Secondary Stats */}
        <div className="grid grid-rows-2 gap-4">
          <button onClick={() => navigate('/reports')} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={18} /></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500 font-medium">Sales & Purchase Analytics</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button onClick={() => navigate('/customers')} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm group">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Users size={18} /></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Customer Directory</p>
                <p className="text-xs text-gray-500 font-medium">Manage patient profiles</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Grid: Inventory Alerts & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Inventory Alert Summary */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-500" /> Inventory Health
          </h2>
          
          <button onClick={() => navigate('/reorders')} className="bg-white border border-rose-200 rounded-xl p-4 hover:shadow-md transition-all text-left flex items-start gap-4 group">
            <div className="bg-rose-100 p-2.5 rounded-full text-rose-600 shrink-0 mt-0.5"><AlertOctagon size={20} /></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">{critical.length}</p>
              <p className="text-sm font-bold text-rose-600 uppercase tracking-wide mt-1">Critical Stock</p>
              <p className="text-xs text-gray-500 mt-1">Immediate reorder required</p>
            </div>
          </button>

          <button onClick={() => navigate('/reorders')} className="bg-white border border-amber-200 rounded-xl p-4 hover:shadow-md transition-all text-left flex items-start gap-4 group">
            <div className="bg-amber-100 p-2.5 rounded-full text-amber-600 shrink-0 mt-0.5"><PackageMinus size={20} /></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wide mt-1">Low Stock</p>
              <p className="text-xs text-gray-500 mt-1">Running below minimum threshold</p>
            </div>
          </button>

          <button onClick={() => navigate('/inventory')} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left flex items-start gap-4 group">
            <div className="bg-gray-100 p-2.5 rounded-full text-gray-600 shrink-0 mt-0.5"><AlertTriangle size={20} /></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">{expiryNear.length}</p>
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mt-1">Expiring Soon</p>
              <p className="text-xs text-gray-500 mt-1">Check batches nearing expiry</p>
            </div>
          </button>
        </div>

        {/* Right Col: Attention Detailed Table */}
        <div className="xl:col-span-2 flex flex-col h-full min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Action Required
            </h2>
            <button onClick={() => navigate('/reorders')} className="text-sm font-bold text-[#0F4C3A] hover:underline flex items-center gap-1">
              View Purchase Orders <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            {attentionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
                <div className="bg-green-50 p-4 rounded-full mb-3 text-green-500">
                  <CheckCircle size={32} />
                </div>
                <p className="text-lg font-bold text-gray-900">Inventory is healthy</p>
                <p className="text-sm text-gray-500 mt-1">No critical or low stock items at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine Name</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Current Stock</th>
                      <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attentionItems.slice(0, 8).map((med) => (
                      <tr key={med.id} onClick={() => navigate('/reorders')} className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{med.name}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-700 text-right">
                          {formatStock(med.stock, med.packType, med.unitsPerPack)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                            med.status === "CRITICAL" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}>
                            {med.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attentionItems.length > 8 && (
                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-500">+{attentionItems.length - 8} more items require attention</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default DashboardPage