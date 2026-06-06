import { useInventoryStore } from "../store/inventoryStore";

const DashboardPage = () => {
  const medicines = useInventoryStore((state) => state.medicines);
  const critical = medicines.filter((med) => med.status === "critical");
  return <div>{critical.length}</div>;
};

export default DashboardPage;
