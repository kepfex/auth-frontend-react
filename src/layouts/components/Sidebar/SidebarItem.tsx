import type { MenuItem } from "@/layouts/schemas/layout.schema";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarItemProps {
  item: MenuItem;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openSubmenu: string | null;
  setOpenSubmenu: (id: string | null) => void;
}

const isRouteActive = (
  path: string | undefined,
  pathname: string
) => {
  if (!path) return false;

  if (path === "/admin") {
    return pathname === path;
  }

  return (
    pathname === path ||
    pathname.startsWith(`${path}/`)
  );
};

export default function SidebarItem({
  item,
  sidebarOpen,
  setSidebarOpen,
  openSubmenu,
  setOpenSubmenu,
}: SidebarItemProps) {
  const { pathname } = useLocation();

  const IconComponent = item.icon;

  const hasSubmenu = Boolean(
    item.items && item.items.length > 0
  );

  const isSubmenuOpen =
    openSubmenu === item.id;

  const isActive = hasSubmenu
    ? item.items?.some((subItem) =>
      isRouteActive(subItem.path, pathname)
    ) ?? false
    : isRouteActive(item.path, pathname);

  if (!hasSubmenu) {
    if (!item.path) {
      return (
        <button
          type="button"
          disabled
          className="
                        w-full flex items-center gap-3
                        px-3 py-2.5 rounded-xl font-medium
                        text-slate-400 dark:text-slate-600
                        cursor-not-allowed
                    "
          title={!sidebarOpen ? item.label : undefined}
        >
          <IconComponent className="w-5 h-5 shrink-0" />

          {sidebarOpen && (
            <span className="text-sm whitespace-nowrap">
              {item.label}
            </span>
          )}
        </button>
      );
    }

    return (
      <NavLink
        to={item.path}
        end={item.path === "/admin"}
        className={() =>
          `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${isActive
            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`
        }
        title={!sidebarOpen ? item.label : undefined}
      >
        <IconComponent
          className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-400"
            }`}
        />

        {sidebarOpen && (
          <span className="text-sm whitespace-nowrap">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          if (!sidebarOpen) {
            setSidebarOpen(true);
          }

          setOpenSubmenu(
            isSubmenuOpen
              ? null
              : item.id
          );
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all group ${isActive
          ? "text-indigo-600 dark:text-indigo-400 font-semibold"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        title={!sidebarOpen ? item.label : undefined}
      >
        <div className="flex items-center gap-3">
          <IconComponent
            className={`w-5 h-5 shrink-0 transition-colors ${isActive
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-400 group-hover:text-indigo-500"
              }`}
          />

          {sidebarOpen && (
            <span className="text-sm whitespace-nowrap">
              {item.label}
            </span>
          )}
        </div>

        {sidebarOpen && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSubmenuOpen
              ? "rotate-180"
              : ""
              }`}
          />
        )}
      </button>

      {sidebarOpen && isSubmenuOpen && (
        <div className="pl-11 pr-2 py-1 space-y-1 text-sm animate-in fade-in duration-150">
          {item.items?.map((subItem) => {
            const subItemActive =
              isRouteActive(
                subItem.path,
                pathname
              );

            if (!subItem.path) {
              return (
                <button
                  key={subItem.id}
                  type="button"
                  disabled
                  className="
                                        w-full text-left block
                                        px-2 py-1.5 rounded-lg
                                        text-xs font-medium
                                        text-slate-400
                                        dark:text-slate-600
                                        cursor-not-allowed
                                    "
                >
                  {subItem.label}
                </button>
              );
            }

            return (
              <NavLink
                key={subItem.id}
                to={subItem.path}
                className={`
                                    w-full text-left block
                                    px-2 py-1.5 rounded-lg
                                    text-xs font-medium
                                    transition-colors
                                    ${subItemActive
                    ? "bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }
                                `}
              >
                {subItem.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}