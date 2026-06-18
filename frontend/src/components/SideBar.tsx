import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Users, RefreshCw, FileText } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/reorders", label: "Reorders", icon: RefreshCw },
  { to: "/prescriptions", label: "Prescriptions", icon: FileText },
];

const SideBar = () => {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-green-800 flex-col p-4">
        <h1 className="text-white text-lg font-medium px-3 mb-6">Abhay Medical</h1>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 p-3 rounded-lg bg-green-700 text-white"
                  : "flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white"
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 flex justify-around items-center py-2 z-50">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "flex flex-col items-center gap-1 px-2 py-1 text-white"
                  : "flex flex-col items-center gap-1 px-2 py-1 text-gray-400"
              }
            >
              <Icon size={20} />
              <span className="text-[10px]">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default SideBar;