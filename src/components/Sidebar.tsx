import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, FileText, BrainCircuit } from "lucide-react"; // íconos

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: "/", label: "Inicio", icon: <Home size={20} /> },
    { to: "/models", label: "Modelos", icon: <BrainCircuit size={20} /> },
    { to: "/documents", label: "Documentos", icon: <FileText size={20} /> },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white h-screen transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col`}
    >
      {/* Header: Toggle button */}
      <div className="px-4 py-4 border-b border-gray-700 h-16">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-xl font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              Mi App
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-white transition-transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => setCollapsed(false)}
              className="text-white transition-transform hover:scale-110"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-gray-700 text-yellow-300 font-semibold"
                  : "hover:bg-gray-700 text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {icon}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
