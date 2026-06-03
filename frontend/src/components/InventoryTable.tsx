import type { Medicine } from "../types/inventory"

interface InventoryTableProps {
  medicines: Medicine[]
}

export const InventoryTable = ({ medicines }: InventoryTableProps) => {


  const getStatusClass = (status: Medicine['status']) => {
  if (status === 'critical') return 'bg-red-100 text-red-800'
  if (status === 'low') return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 text-sm text-gray-500">Medicine</th>
            <th className="text-left p-3 text-sm text-gray-500">Stock</th>
            <th className="text-left p-3 text-sm text-gray-500">Unit</th>
            <th className="text-left p-3 text-sm text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr className="border-b border-gray-200" key={med.batchNumber}>
              <td className="p-3 text-sm">{med.name}</td>
              <td className="p-3 text-sm">{med.stock}</td>
              <td className="p-3 text-sm">{med.unit}</td>
              <td className="p-3 text-sm"><span className={`${getStatusClass(med.status)} px-2 py-1 rounded-full text-xs font-medium`}>{med.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}