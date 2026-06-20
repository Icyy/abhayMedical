import { useEffect, useState } from "react";
import AddSupplierForm from "../components/AddSupplierForm";
import { useSupplierStore } from "../store/supplierStore";

const SuppliersPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const isLoading = useSupplierStore((state) => state.isLoading);
  const error = useSupplierStore((state) => state.error);
  const loadSuppliers = useSupplierStore((state) => state.loadSuppliers);
  const removeSupplier = useSupplierStore((state) => state.removeSupplier);
  const [name, setName] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(name.toLowerCase()),
  );

  if (isLoading) return <p className="p-6 text-gray-500">Loading suppliers...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Suppliers</h1>
      <AddSupplierForm />
      <input
        type="search"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search suppliers..."
        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-4 w-full"
      />
      {filteredSuppliers.length === 0 ? (
        <p className="text-sm text-gray-400">No suppliers added yet</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-sm text-gray-500">Name</th>
                <th className="text-left p-3 text-sm text-gray-500">Contact</th>
                <th className="text-left p-3 text-sm text-gray-500">Phone</th>
                <th className="text-left p-3 text-sm text-gray-500">Email</th>
                <th className="text-left p-3 text-sm text-gray-500">GST</th>
                <th className="text-left p-3 text-sm text-gray-500">Remove</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr className="border-b border-gray-200" key={s.id}>
                  <td className="p-3 text-sm">{s.name}</td>
                  <td className="p-3 text-sm">{s.contactPerson || "—"}</td>
                  <td className="p-3 text-sm">{s.phone}</td>
                  <td className="p-3 text-sm">{s.email || "—"}</td>
                  <td className="p-3 text-sm">{s.gstNumber || "—"}</td>
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${s.name}?`)) {
                          removeSupplier(s.id);
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
      )}
    </div>
  );
};

export default SuppliersPage;