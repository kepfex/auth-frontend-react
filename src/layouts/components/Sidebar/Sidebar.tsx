import type { MenuGroup } from "@/layouts/schemas/layout.schema";
import { BarChart3, BookOpen, CalendarCheck2, FileSpreadsheet, LayoutDashboard, Sliders, Users } from "lucide-react";
import SidebarItem from "./SidebarItem";

const MENU_GROUPS: MenuGroup[] = [
  {
    groupTitle: 'Menú Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Inicio / Panel',
        icon: LayoutDashboard
      },
      {
        id: 'asistencia',
        label: 'Gestión Asistencia',
        icon: CalendarCheck2,
        items: [
          { id: 'asistencia-toma', label: 'Toma de Asistencia' },
          { id: 'asistencia-justificaciones', label: 'Inasistencias & Justificaciones' },
          { id: 'asistencia-reportes', label: 'Reportes Mensuales' }
        ]
      },
      {
        id: 'estudiantes',
        label: 'Estudiantes',
        icon: Users,
        items: [
          { id: 'estudiantes-directorio', label: 'Directorio de Alumnos' },
          { id: 'estudiantes-registro', label: 'Matrícula & Registro' },
          { id: 'estudiantes-expediente', label: 'Expediente Académico' }
        ]
      },
      {
        id: 'academico',
        label: 'Académico & Aulas',
        icon: BookOpen,
        items: [
          { id: 'academico-cursos', label: 'Cursos & Materias' },
          { id: 'academico-horarios', label: 'Horarios de Clases' },
          { id: 'academico-docentes', label: 'Asignación Docente' }
        ]
      }
    ]
  },
  {
    groupTitle: 'Administración',
    items: [
      { id: 'kpis', label: 'Estadísticas & KPIs', icon: BarChart3 },
      { id: 'export', label: 'Exportación de Datos', icon: FileSpreadsheet },
      { id: 'config', label: 'Configuración', icon: Sliders }
    ]
  }
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSubmenu: string | null;
  setOpenSubmenu: (id: string | null) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  openSubmenu,
  setOpenSubmenu,
}: SidebarProps) {
  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none z-20 h-full overflow-hidden ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-3 overflow-y-auto overflow-x-hidden space-y-6 flex-1 min-h-0">
        {MENU_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx}>
            {sidebarOpen && (
              <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </div>
            )}

            <nav className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  openSubmenu={openSubmenu}
                  setOpenSubmenu={setOpenSubmenu}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info Card */}
      {sidebarOpen && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40 text-center">
            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              Período Lectivo 2026
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Semestre Académico II
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
