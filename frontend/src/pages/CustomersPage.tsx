import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AddCustomersForm from "../components/AddCustomersForm";
import CollapsibleSection from "../components/CollapsibleSection";
import { useCustomerStore } from "../store/customerStore";

const CustomersPage = () => {
  const customer = useCustomerStore((state) => state.customers);
  const isLoading = useCustomerStore((state) => state.isLoading);
  const error = useCustomerStore((state) => state.error);
  const loadCustomers = useCustomerStore((state) => state.loadCustomers);
  const removeCustomer = useCustomerStore((state) => state.removeCustomer);
  const [name, setName] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomer = customer.filter((cust) => cust.name.toLowerCase().includes(name.toLowerCase()));

  if (isLoading) return <p className="p-6 text-gray-500">Loading customers...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-800">Customers</h1>
        <span className="text-xs text-[#8A8678]">{customer.length} customers</span>
      </div>

      <CollapsibleSection title="Add customer">
        <AddCustomersForm />
      </CollapsibleSection>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search customers..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      {filteredCustomer.length === 0 ? (
        <p className="text-sm text-gray-400">No customers added yet</p>
      ) : (
        <div className="bg-white rounded-lg border border-[#E8E4D9] p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4D9]">
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Name</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Email</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Phone Number</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Loyalty Points</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Notes</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Total Spend</th>
                <th className="text-left p-3 text-sm text-[#8A8678] font-normal">Remove</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomer.map((cust) => (
                <tr className="border-b border-[#F1EFE8]" key={cust.id}>
                  <td className="p-3 text-sm">{cust.name}</td>
                  <td className="p-3 text-sm">{cust.email}</td>
                  <td className="p-3 text-sm">{cust.phoneNumber}</td>
                  <td className="p-3 text-sm">{cust.loyaltyPoints}</td>
                  <td className="p-3 text-sm">{cust.notes}</td>
                  <td className="p-3 text-sm">₹{cust.totalSpend}</td>
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => confirm(`Remove ${cust.name}?`) && removeCustomer(cust.id)}
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

export default CustomersPage;