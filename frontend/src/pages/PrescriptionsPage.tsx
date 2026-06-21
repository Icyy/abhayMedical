import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AddPrescriptionForm from "../components/AddPrescriptionForm";
import CollapsibleSection from "../components/CollapsibleSection";
import { usePrescriptionStore } from "../store/prescriptionStore";
import { getPresStatusClass } from "../utils/statusHelpers";
import type { Prescription } from "../types/prescription";
import InvoiceModal from "../components/InvoiceModal";

const PrescriptionsPage = () => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const prescriptions = usePrescriptionStore((state) => state.prescriptions);
  const isLoading = usePrescriptionStore((state) => state.isLoading);
  const error = usePrescriptionStore((state) => state.error);
  const loadPrescriptions = usePrescriptionStore((state) => state.loadPrescriptions);
  const removePrescription = usePrescriptionStore((state) => state.removePrescription);
  const updatePrescriptionStatus = usePrescriptionStore((state) => state.updatePrescriptionStatus);
  const [name, setName] = useState("");

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filteredPrescription = prescriptions.filter((p) => p.customer.name.toLowerCase().includes(name.toLowerCase()));

  if (isLoading) return <p className="p-6 text-gray-500">Loading prescriptions...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Prescriptions</h1>
        <span className="text-xs text-[#8A8678]">{prescriptions.length} total</span>
      </div>

      <CollapsibleSection title="New prescription">
        <AddPrescriptionForm />
      </CollapsibleSection>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search prescriptions..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <div className="bg-white rounded-lg border border-[#E8E4D9] p-4 overflow-x-auto">
        {filteredPrescription.length === 0 ? (
          <p className="text-sm text-gray-400">No prescriptions added yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4D9]">
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Patient Name</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Medicine Count</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Doctor</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Date</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Total</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Status</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescription.map((presc) => (
                <tr key={presc.id} className="border-b border-[#F1EFE8]">
                  <td className="p-3 text-sm">{presc.customer.name}</td>
                  <td className="p-3 text-sm">{presc.items.length}</td>
                  <td className="p-3 text-sm">{presc.doctorName}</td>
                  <td className="p-3 text-sm">{new Date(presc.date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">₹{presc.total.toFixed(2)}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPresStatusClass(presc.status)}`}>
                      {presc.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      {presc.status === "PENDING" && (
                        <button
                          onClick={() => updatePrescriptionStatus(presc.id, "PAID")}
                          className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-100"
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button
                        onClick={() => confirm(`Remove prescription for ${presc.customer.name}?`) && removePrescription(presc.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-xs font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedPrescription(presc)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        View Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedPrescription && (
        <InvoiceModal prescription={selectedPrescription} onClose={() => setSelectedPrescription(null)} />
      )}
    </div>
  );
};

export default PrescriptionsPage;