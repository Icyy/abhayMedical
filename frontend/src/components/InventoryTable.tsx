import type { Medicine } from "../types/inventory";
import { getStatusClass } from "../utils/statusHelpers";

interface InventoryTableProps {
  medicines: Medicine[];
  removeMedicine: (batchNumber: string) => void;
}

export const InventoryTable = ({
  medicines,
  removeMedicine,
}: InventoryTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 text-sm text-gray-500">Medicine</th>
            <th className="text-left p-3 text-sm text-gray-500">Stock</th>
            <th className="text-left p-3 text-sm text-gray-500">Unit</th>
            <th className="text-left p-3 text-sm text-gray-500">Status</th>
            <th className="text-left p-3 text-sm text-gray-500">Delete</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr className="border-b border-gray-200" key={med.id}>
              <td className="p-3 text-sm">{med.name}</td>
              <td className="p-3 text-sm">{med.stock}</td>
              <td className="p-3 text-sm">{med.unit}</td>
              <td className="p-3 text-sm">
                <span
                  className={`${getStatusClass(med.status)} px-2 py-1 rounded-full text-xs font-medium`}
                >
                  {med.status}
                </span>
              </td>
              <td className="p-3 text-sm">
                <button
                  onClick={() => {
                    if (confirm(`Remove ${med.name}?`)) {
                      removeMedicine(med.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-xs font-medium"
                >
                  🗑️ Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
