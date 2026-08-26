import { Download, GraduationCap, Sparkles, UserCheck } from "lucide-react"
import { useLogout } from "../../features/auth/hooks/useAuth"
import { useAuthStore } from "../../features/auth/store/auth.store"

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const { logout } = useLogout()

  return (
    <> 
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-100 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Resumen Diario Escolar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Hola de nuevo, {user?.name}! 👋
          </h1>
          <p className="mb-2">{user?.email}</p>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl leading-relaxed">
            Aquí tienes el estado en tiempo real de la asistencia de alumnos, inasistencias e indicadores clave del centro escolar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95"
          >
            <UserCheck className="w-4 h-4" /> Tomar Asistencia
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white backdrop-blur-md font-medium text-sm transition-all border border-white/20"
          >
            <Download className="w-4 h-4" /> Descargar Reporte
          </button>
        </div>
      </div>

      {/* Decorative Background Graphic */}
      <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
        <GraduationCap className="w-72 h-72 text-white" />
      </div>
    </div>

    <div>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
    </>
  )
}