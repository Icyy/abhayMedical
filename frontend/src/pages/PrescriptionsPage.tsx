import AddPrescriptionForm from "../components/AddPrescriptionForm";
import { usePrescriptionStore } from "../store/prescriptionStore";
import type { Prescription } from "../types/prescription";

const PrescriptionsPage = () => {
const prescriptions = usePrescriptionStore((state)=>state.prescriptions)


const getStatusClass = (status: Prescription["status"]) => {
  if (status === "paid") return "bg-green-100 text-green-800"
  if (status === "rejected") return "bg-red-100 text-red-800"
  return "bg-yellow-100 text-yellow-800"
}


  return (
    <div>
      <AddPrescriptionForm />
      <div className="bg-white rounded-lg border border-gray-200 p-5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left p-3 text-sm text-green-700">Patient Name</th>
            <th className="text-left p-3 text-sm text-green-700">Medicine Count</th>
            <th className="text-left p-3 text-sm text-green-700">Doctor</th>
            <th className="text-left p-3 text-sm text-green-700">Date</th>
            <th className="text-left p-3 text-sm text-green-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions
            .map((med) => (
              <tr key={med.prescriptionId} className="border-b border-gray-100">
                <td className="p-3 text-sm">{med.name}</td>
                <td className="p-3 text-sm">{med.medicines.length}</td>
                <td className="p-3 text-sm">{med.doctorName}</td>
                <td className="p-3 text-sm">{med.date.toLocaleDateString()}</td>
                <td className="p-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusClass(med.status)
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

export default PrescriptionsPage;
