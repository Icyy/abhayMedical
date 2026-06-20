import { useInventoryStore } from "../store/inventoryStore";
import { getStatusClass } from "../utils/statusHelpers";

const ReordersPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const updateMeds = useInventoryStore((state) => state.updateMedicineStatus);
  const reorders = medicines.filter((med) => med.status === "CRITICAL" || med.status === "LOW");

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Reorders</h1>
      {reorders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">All medicines are well stocked! 🎉</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-sm text-gray-500">Name</th>
                <th className="text-left p-3 text-sm text-gray-500">Stock</th>
                <th className="text-left p-3 text-sm text-gray-500">Unit</th>
                <th className="text-left p-3 text-sm text-gray-500">Status</th>
                <th className="text-left p-3 text-sm text-gray-500">Reordered</th>
              </tr>
            </thead>
            <tbody>
              {reorders.map((med) => (
                <tr className="border-b border-gray-200" key={med.batchNumber}>
                  <td className="p-3 text-sm">{med.name}</td>
                  <td className="p-3 text-sm">{med.stock}</td>
                  <td className="p-3 text-sm">{med.unit}</td>
                  <td className="p-3 text-sm">
                    <span className={`${getStatusClass(med.status)} px-2 py-1 rounded-full font-normal text-xs`}>
                      {med.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => updateMeds(med.id, 'OK')}
                      className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-medium hover:bg-green-100"
                    >
                      Mark as Reordered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReordersPage;