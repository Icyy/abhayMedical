import { useInventoryStore } from "../store/inventoryStore";
import { getStatusClass } from "../utils/statusHelpers";

const ReordersPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const updateMeds = useInventoryStore((state) => state.updateMedicineStatus);
  const reorders = medicines.filter((med) => med.status === "CRITICAL" || med.status === "LOW");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Reorders</h1>
        {reorders.length > 0 && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
            {reorders.length} need reordering
          </span>
        )}
      </div>
      {reorders.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E8E4D9] p-8 text-center">
          <p className="text-sm text-gray-400">All medicines are well stocked! 🎉</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E8E4D9] p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4D9]">
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Name</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Stock</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Unit</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Status</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {reorders.map((med) => (
                <tr className="border-b border-[#F1EFE8]" key={med.id}>
                  <td className="p-3 text-sm">{med.name}</td>
                  <td className="p-3 text-sm">{med.stock}</td>
                  <td className="p-3 text-sm">{med.unit}</td>
                  <td className="p-3 text-sm">
                    <span className={`${getStatusClass(med.status)} px-2 py-1 rounded-full font-medium text-xs`}>
                      {med.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => updateMeds(med.id, "OK")}
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