import { useState } from "react";
import AddPrescriptionForm from "../components/AddPrescriptionForm";
import { usePrescriptionStore } from "../store/prescriptionStore";
import { getPresStatusClass } from "../utils/statusHelpers";

const PrescriptionsPage = () => {
  const prescriptions = usePrescriptionStore((state) => state.prescriptions);
    const [name, setName] = useState("")
    const filteredPrescription = prescriptions.filter((cust)=> cust.name.toLowerCase().includes(name.toLowerCase()),)

  return (
    <div className="p-6">
      <AddPrescriptionForm />
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search customers..."
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-4 w-full"
        />
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-sm text-green-700">
                Patient Name
              </th>
              <th className="text-left p-3 text-sm text-green-700">
                Medicine Count
              </th>
              <th className="text-left p-3 text-sm text-green-700">Doctor</th>
              <th className="text-left p-3 text-sm text-green-700">Date</th>
              <th className="text-left p-3 text-sm text-green-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescription.map((med) => (
              <tr key={med.prescriptionId} className="border-b border-gray-100">
                <td className="p-3 text-sm">{med.name}</td>
                <td className="p-3 text-sm">{med.medicines.length}</td>
                <td className="p-3 text-sm">{med.doctorName}</td>
                <td className="p-3 text-sm">{med.date.toLocaleDateString()}</td>
                <td className="p-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPresStatusClass(
                      med.status,
                    )}`}
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

export default PrescriptionsPage;
