import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";

export default function AdminLayout() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("asistencia");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="h-screen w-screen overflow-hidden text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-200">
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        userMenuOpen={userMenuOpen} 
        setUserMenuOpen={setUserMenuOpen} 
      />
      <div
        className="flex flex-1 min-h-0 overflow-hidden"
        onClick={() => {
          setUserMenuOpen(false);
        }}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSubmenu={openSubmenu}
          setOpenSubmenu={setOpenSubmenu}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
