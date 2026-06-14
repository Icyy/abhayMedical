import { useState } from "react";
import AddCustomersForm from "../components/AddCustomersForm";
import { useCustomerStore } from "../store/customerStore";

const CustomersPage = () => {
  const customer = useCustomerStore((state) => state.customers);
  const removeCustomer = useCustomerStore((state) => state.removeCustomer);
  const [name, setName] = useState("");
  const filteredCustomer = customer.filter((cust) =>
    cust.name.toLowerCase().includes(name.toLowerCase()),
  );
  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-4">Customers</h1>
      <AddCustomersForm />
      <div>
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search customers..."
          className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-4 w-full"
        />
        {filteredCustomer.length === 0 ? (
          <p className="text-sm text-gray-400">No customers added yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm text-gray-500">Name</th>
                    <th className="text-left p-3 text-sm text-gray-500">Email</th>
                    <th className="text-left p-3 text-sm text-gray-500">Phone Number</th>
                    <th className="text-left p-3 text-sm text-gray-500">Loyalty Points</th>
                    <th className="text-left p-3 text-sm text-gray-500">Notes</th>
                    <th className="text-left p-3 text-sm text-gray-500">Total Spend</th>
                    <th className="text-left p-3 text-sm text-gray-500">Remove Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomer.map((cust) => (
                    <tr className="border-b border-gray-200" key={cust.customerId}>
                      <td className="p-3 text-sm">{cust.name}</td>
                      <td className="p-3 text-sm">{cust.email}</td>
                      <td className="p-3 text-sm">{cust.phoneNumber}</td>
                      <td className="p-3 text-sm">{cust.loyaltyPoints}</td>
                      <td className="p-3 text-sm">{cust.notes}</td>
                      <td className="p-3 text-sm">{cust.totalSpend}</td>
                      <td className="p-3 text-sm">
                        <button
                          onClick={() => removeCustomer(cust.customerId)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;