import { LoginForm } from "../features/auth/components/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const LoginPage = () => (
  <div className="min-h-screen grid place-items-center px-4 sm:px-6 md:px-8"> {/* border-b  border-zinc-200 dark:border-zinc-700 bg-background/30 dark:bg-graphite/30 */}
    <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20"> 
      <span className="font-bold text-lg">Mi App</span>

      <div className="flex items-center gap-3">
        {/* otros elementos del navbar */}
        <ThemeToggle />
      </div>
    </nav>
    
    {/* Elementos visuales de fondo (Orbes inspirados en Phoenix Orange & Gold de la paleta) */}
    <div className="absolute inset-0  pointer-events-none z-0">
        <div className="glow-orb absolute top-[5%] left-[5%] md:left-[30%] w-45 h-45 sm:w-45 sm:h-45 rounded-full bg-linear-to-br from-[#FFD95A] to-[#FF9800]"></div>
        <div className="glow-orb absolute bottom-[5%] right-[5%] md:right-[20%] w-55 h-55 sm:w-70  sm:h-70 rounded-full bg-linear-to-tr from-[#FF9800] to-[#FFC93C]"></div>
    </div>
    {/* Contenedor  principal del forlmulario */}
    <div className="w-full m-auto max-w-md bg-white/60 dark:bg-graphite/65 glowing-glass rounded-2xl p-6 sm:p-10 transition-all duration-500 z-10 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            {/* Logotipo Simulado DevFex */}
            <div className="flex items-center space-x-2 select-none group">
                <span className="text-2xl sm:text-3xl font-black tracking-tight flex items-center">
                    <span className="text-zinc-900 dark:text-white transition-colors duration-300">Dev</span>
                    <span className="bg-gradient-phoenix bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,176,0,0.3)] group-hover:scale-105 transition-transform duration-300">Fex</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-light animate-pulse"></span>
            </div>
            
        </div>
      <LoginForm />
      
    </div>
  </div>
  
);
