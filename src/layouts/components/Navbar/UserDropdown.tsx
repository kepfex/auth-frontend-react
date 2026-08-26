import { LogOut, Settings, User } from "lucide-react";

interface UserDropdownProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function UserDropdown({ isOpen, setIsOpen }: UserDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        <div className="relative">
          <img
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-600 dark:ring-indigo-400"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
            alt="Dra. María Fernández Avatar"
          />
        </div>
      </button>

      {/* User Dropdown */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              Dra. María Fernández
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              m.fernandez@educontrol.edu
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/70 rounded-full">
              Directora Académica
            </span>
          </div>

          <div className="py-1">
            <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              <User className="w-4 h-4 text-slate-400" /> Mi Perfil
            </button>
            <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              <Settings className="w-4 h-4 text-slate-400" /> Configuración de
              Cuenta
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1 mt-1">
            <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
