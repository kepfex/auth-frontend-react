import type { MenuItem } from "@/layouts/schemas/layout.schema";
import { ChevronDown } from "lucide-react";

interface SidebarItemProps {
  item: MenuItem;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSubmenu: string | null;
  setOpenSubmenu: (id: string | null) => void;
}

export default function SidebarItem({
  item,
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  openSubmenu,
  setOpenSubmenu
}: SidebarItemProps) {
  const IconComponent = item.icon;
  const hasSubmenu = Boolean(item.items && item.items.length > 0);
  const isSubmenuOpen = openSubmenu === item.id;
  const isActive = activeTab === item.id || (hasSubmenu && item.items?.some((sub) => activeTab === sub.id));

  if (!hasSubmenu) {
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title={!sidebarOpen ? item.label : undefined}
      >
        <IconComponent
          className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        />
        {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => {
          if (!sidebarOpen) setSidebarOpen(true);
          setOpenSubmenu(isSubmenuOpen ? null : item.id);
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all group ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title={!sidebarOpen ? item.label : undefined}
      >
        <div className="flex items-center gap-3">
          <IconComponent
            className={`w-5 h-5 shrink-0 transition-colors ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'
            }`}
          />
          {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
        </div>
        {sidebarOpen && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isSubmenuOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Submenu Accordion Items */}
      {sidebarOpen && isSubmenuOpen && (
        <div className="pl-11 pr-2 py-1 space-y-1 text-sm animate-in fade-in duration-150">
          {item.items?.map((subItem) => (
            <button
              key={subItem.id}
              onClick={() => {
                setActiveTab(subItem.id);
              }}
              className={`w-full text-left block px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === subItem.id
                  ? 'bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {subItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
