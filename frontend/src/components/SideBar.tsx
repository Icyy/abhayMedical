import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  RefreshCw,
  FileText,
  LogOut,
  Truck,
  ClipboardList,
  Plus,
  X,
} from "lucide-react";
import { logout } from "../services/authService";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const sections: { label: string; links: NavItem[] }[] = [
  {
    label: "Today",
    links: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/prescriptions", label: "Prescriptions", icon: FileText },
      { to: "/reorders", label: "Reorders", icon: RefreshCw },
    ],
  },
  {
    label: "Records",
    links: [
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Procurement",
    links: [
      { to: "/suppliers", label: "Suppliers", icon: Truck },
      { to: "/purchase-orders", label: "Orders", icon: ClipboardList },
    ],
  },
];

const mobileCoreLinks: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/inventory", label: "Stock", icon: Package },
  { to: "/reorders", label: "Reorder", icon: RefreshCw },
  { to: "/prescriptions", label: "Rx", icon: FileText },
];

const mobileMoreLinks: NavItem[] = [
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/purchase-orders", label: "Orders", icon: ClipboardList },
];

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  const isMoreActive = mobileMoreLinks.some((link) => link.to === location.pathname);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 bg-[#0F4C3A] flex-col p-3.5">
        <div className="flex items-center gap-2 px-2 pb-5">
          <div className="w-7 h-7 rounded-md bg-[#F7F5F0] flex items-center justify-center text-[#0F4C3A] flex-shrink-0">
            <Plus size={16} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#F7F5F0] text-sm font-medium leading-tight">Abhay Medical</p>
            <p className="text-[#9DBBAE] text-[11px] leading-tight">Pharmacy & Gen. Stores</p>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[#6F9E89] text-[10.5px] tracking-wide uppercase px-2.5 pt-3.5 pb-1.5">
              {section.label}
            </p>
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-[#1A5F49] text-white text-sm"
                      : "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#C9DCD1] hover:text-white text-sm"
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2.5 mt-4 pt-3.5 border-t border-[#1A5F49] text-[#6F9E89] hover:text-white text-sm"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      {/* Mobile More drawer */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 flex items-end justify-end p-3"
          style={{ paddingBottom: "70px" }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-lg p-1.5 w-40 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {mobileMoreLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-2 px-2.5 py-2 rounded-md bg-green-50 text-green-800 text-sm"
                      : "flex items-center gap-2 px-2.5 py-2 rounded-md text-gray-700 text-sm"
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md text-red-500 text-sm w-full"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F4C3A] flex items-center px-1.5 py-2 z-50">
        {mobileCoreLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive
                  ? "flex-1 flex flex-col items-center gap-1 text-white"
                  : "flex-1 flex flex-col items-center gap-1 text-[#6F9E89]"
              }
            >
              <Icon size={20} />
              <span className="text-[9px]">{link.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setMoreOpen((prev) => !prev)}
          className={`flex-1 flex flex-col items-center gap-1 ${isMoreActive || moreOpen ? "text-white" : "text-[#6F9E89]"}`}
        >
          {moreOpen ? <X size={20} /> : <ClipboardList size={20} />}
          <span className="text-[9px]">More</span>
        </button>
      </div>
    </>
  );
};

export default SideBar;