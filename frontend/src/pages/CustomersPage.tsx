import AddCustomersForm from "../components/AddCustomersForm";
import { useCustomerStore } from "../store/customerStore";

const CustomersPage = () => {
  const customer = useCustomerStore((state) => state.customers);
  return (
    <div>
      <AddCustomersForm />
      <div>
        {customer.length === 0 ? (
          <p className="text-sm text-gray-400">No customers added yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm text-gray-500">
                      Name
                    </th>
                    <th className="text-left p-3 text-sm text-gray-500">
                      Email
                    </th>
                    <th className="text-left p-3 text-sm text-gray-500">
                      Phone Number
                    </th>
                    <th className="text-left p-3 text-sm text-gray-500">
                      Loyalty Points
                    </th>
                    <th className="text-left p-3 text-sm text-gray-500">
                      Notes
                    </th>
                    <th className="text-left p-3 text-sm text-gray-500">
                      Total Spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.map((cust) => (
                    <tr
                      className="border-b border-gray-200"
                      key={cust.customerId}
                    >
                      <td className="p-3 text-sm">{cust.name}</td>
                      <td className="p-3 text-sm">{cust.email}</td>
                      <td className="p-3 text-sm">{cust.phoneNumber}</td>
                      <td className="p-3 text-sm">{cust.loyaltyPoints}</td>
                      <td className="p-3 text-sm">{cust.notes}</td>
                      <td className="p-3 text-sm">{cust.totalSpend}</td>
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
