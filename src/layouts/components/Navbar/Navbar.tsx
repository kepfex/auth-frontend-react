import {
  ChevronDown,
  GraduationCap,
  Menu,
  Sun,
} from "lucide-react";
import UserDropdown from "./UserDropdown";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
}

export default function Navbar({sidebarOpen, setSidebarOpen, userMenuOpen, setUserMenuOpen}: NavbarProps) {
  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left Section: Logo & Sidebar Toggle */}
      <div className="flex items-center space-x-3">
        <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          title="Expandir/Contraer Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              Dev
              <span className="text-indigo-600 dark:text-indigo-400">Fex</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">
              Sistema de Gestión Escolar
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Theme Selector & User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Dropdown Toggle */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all flex items-center gap-1.5"
            title="Cambiar Tema"
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Notifications Button */}

        {/* User Profile Circular Avatar Button & Dropdown */}
        <UserDropdown
          isOpen={userMenuOpen}
          setIsOpen={(open) => {
            setUserMenuOpen(open);
          }}
        />
      </div>
    </header>
  );
}
