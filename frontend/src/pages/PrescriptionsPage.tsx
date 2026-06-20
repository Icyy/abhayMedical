import { useEffect, useState } from "react";
import AddPrescriptionForm from "../components/AddPrescriptionForm";
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

  const filteredPrescription = prescriptions.filter((p) =>
    p.customer.name.toLowerCase().includes(name.toLowerCase()),
  );

  if (isLoading) return <p className="p-6 text-gray-500">Loading prescriptions...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Prescriptions</h1>
      <AddPrescriptionForm />
      <input
        type="search"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search prescriptions..."
        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-4 w-full"
      />
      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        {filteredPrescription.length === 0 ? (
          <p className="text-sm text-gray-400">No prescriptions added yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-3 text-sm text-green-700">Patient Name</th>
                <th className="text-left p-3 text-sm text-green-700">Medicine Count</th>
                <th className="text-left p-3 text-sm text-green-700">Doctor</th>
                <th className="text-left p-3 text-sm text-green-700">Date</th>
                <th className="text-left p-3 text-sm text-green-700">Total</th>
                <th className="text-left p-3 text-sm text-green-700">Status</th>
                <th className="text-left p-3 text-sm text-green-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescription.map((presc) => (
                <tr key={presc.id} className="border-b border-gray-100">
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
                        onClick={() => {
                          if(confirm(`Remove prescription for ${presc.customer}?`)){
                          removePrescription(presc.id)
                          }
                        }}
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