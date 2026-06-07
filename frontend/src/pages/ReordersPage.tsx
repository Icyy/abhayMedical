import { useInventoryStore } from "../store/inventoryStore";
import { getStatusClass } from "../utils/statusHelpers";

const ReordersPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const reorders = medicines.filter((med) => med.status === "critical" || med.status==="low");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              <td>
                <span
                  className={`${getStatusClass(med.status)} p-3 px-2 py-1 rounded-full font-normal text-xs`}
                >
                  {med.status}
                </span>
              </td>
              <td className="p-3 text-sm">
                <button className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-medium hover:bg-green-100">
                  Mark as Reordered
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReordersPage;
