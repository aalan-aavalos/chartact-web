import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-950 text-white p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
