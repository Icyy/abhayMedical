import { useState } from "react";
import type { Medicine } from "../types/inventory";
import MedicineDetailModal from "./MedicineDetailModal";
import { Trash2 } from "lucide-react";

interface InventoryTableProps {
  medicines: Medicine[];
  removeMedicine: (id: string) => void;
}

export const InventoryTable = ({ medicines, removeMedicine }: InventoryTableProps) => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const getMargin = (med: Medicine) => {
    if (!med.batches || med.batches.length === 0) return null;
    const activeBatches = med.batches.filter((b) => b.stockUnits > 0);
    if (activeBatches.length === 0) return null;
    const oldestBatch = activeBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
    if (!oldestBatch.purchasePrice || oldestBatch.purchasePrice === 0) return null;
    return (((med.mrp - oldestBatch.purchasePrice) / med.mrp) * 100).toFixed(1);
  };

  const getNearestExpiry = (med: Medicine) => {
    if (!med.batches || med.batches.length === 0) return null;
    const active = med.batches.filter((b) => b.stockUnits > 0).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    return active.length > 0 ? active[0].expiryDate : null;
  };

  const getBatchNumbers = (med: Medicine) => {
    if (!med.batches) return "—";
    const active = med.batches.filter((b) => b.stockUnits > 0);
    if (active.length === 0) return "—";
    if (active.length === 1) return active[0].batchNumber;
    return `${active[0].batchNumber} +${active.length - 1}`;
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return new Date(expiryDate) < in30Days;
  };

  const formatDisplayQuantity = (qty: number, packType?: string, unitsPerPack: number = 1) => {
    const packSize = unitsPerPack || 1;
    if (!packType) return `${qty} units`;
    if (packType.toLowerCase() === 'bottle') {
      const bottles = Number((qty / packSize).toFixed(1));
      return `${bottles} bottle${bottles !== 1 ? 's' : ''}`;
    }
    if (packType.toLowerCase() === 'strip') {
      const strips = Math.floor(qty / packSize);
      const loose = qty % packSize;
      if (strips > 0 && loose > 0) return `${strips} strip${strips > 1 ? 's' : ''}, ${loose} tab${loose !== 1 ? 's' : ''}`;
      if (strips > 0) return `${strips} strip${strips > 1 ? 's' : ''}`;
      return `${loose} tab${loose !== 1 ? 's' : ''}`;
    }
    return `${qty} ${packType}${qty !== 1 ? 's' : ''}`;
  };

  return (
    <>
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Batch</th>
            <th className="text-right px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="text-right px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">MRP / Pack</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
            <th className="text-center px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-right px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Margin</th>
            <th className="text-center px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {medicines.map((med) => {
            const margin = getMargin(med);
            const nearestExpiry = getNearestExpiry(med);
            const expiringSoon = isExpiringSoon(nearestExpiry);

            return (
              <tr key={med.id} className="hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => setSelectedMedicine(med)}>
                <td className="px-5 py-4 text-sm font-bold text-gray-900">{med.name}</td>
                <td className="px-5 py-4 text-xs font-mono font-medium text-gray-500">{getBatchNumbers(med)}</td>
                <td className="px-5 py-4 text-sm font-bold text-gray-700 text-right">
                  {formatDisplayQuantity(med.stock ?? 0, med.packType, med.unitsPerPack)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="text-sm font-bold text-gray-900">₹{(med.mrp || 0).toFixed(2)}</div>
                  {med.unitsPerPack > 1 && (
                    <div className="text-[10px] font-medium text-gray-400 mt-0.5">₹{((med.mrp || 0) / med.unitsPerPack).toFixed(2)} / base</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  {nearestExpiry ? (
                    <span className={`text-xs font-bold ${expiringSoon ? "text-rose-600 bg-rose-50 px-2 py-1 rounded" : "text-gray-500"}`}>
                      {expiringSoon && "⚠️ "}{new Date(nearestExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    med.status === "CRITICAL" ? "bg-rose-100 text-rose-700" : med.status === "LOW" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}>
                    {med.status || "OK"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {margin ? (
                    <span className={`text-xs font-bold ${parseFloat(margin) > 20 ? "text-green-600" : "text-amber-600"}`}>{margin}%</span>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
                <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => confirm(`Remove ${med.name}?`) && removeMedicine(med.id)} className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedMedicine && <MedicineDetailModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} />}
    </>
  );
};