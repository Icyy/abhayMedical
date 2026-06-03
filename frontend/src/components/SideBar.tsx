import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers" },
  { to: "/reorders", label: "Reorders" },
  { to: "/prescriptions", label: "Prescriptions" },
];

const SideBar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 flex flex-col p-4">
      {navLinks.map((link) => (
        <NavLink
          key={link.label}
          to={link.to}
          className={({ isActive }) =>
            isActive
              ? "block p-3 rounded-lg bg-gray-700 text-white"
              : "block p-3 rounded-lg text-gray-300 hover:text-white"
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default SideBar;
