import { ChevronRight, Command, Cpu, Layers, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const FEATURES_DATA = [
  {
    id: 'performance',
    title: 'Rendimiento Ultrarrápido',
    tagline: 'Carga instantánea en cualquier dispositivo',
    description: 'Optimizamos cada línea de código y recurso para garantizar tiempos de respuesta inferiores a los 100 milisegundos.',
    metrics: '< 100ms respuesta',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'group-hover:border-amber-500/50',
    previewText: 'Arquitectura Edge & Caching Inteligente'
  },
  {
    id: 'design',
    title: 'Diseño Sensorial & Minimalista',
    tagline: 'Interfaces que cautivan a primera vista',
    description: 'Combinamos estética minimalista, tipografía fluida y animaciones cuidadas para crear experiencias memorables.',
    metrics: '+98% satisfacción',
    icon: Layers,
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'group-hover:border-violet-500/50',
    previewText: 'Sistemas de Diseño Basados en Tokens'
  },
  {
    id: 'scalability',
    title: 'Escalabilidad Sin Límites',
    tagline: 'Crece desde 1,000 hasta 10,000,000 usuarios',
    description: 'Infraestructura modular preparada para soportar picos masivos de tráfico sin degradación del servicio.',
    metrics: '99.99% Uptime',
    icon: Cpu,
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'group-hover:border-cyan-500/50',
    previewText: 'Infraestructura Cloud Serverless'
  },
  {
    id: 'security',
    title: 'Seguridad de Nivel Bancario',
    tagline: 'Protección integral de datos e identidad',
    description: 'Encriptación end-to-end, auditorías automatizadas y cumplimiento estricto con las regulaciones internacionales.',
    metrics: 'ISO 27001 Ready',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'group-hover:border-emerald-500/50',
    previewText: 'Zero-Trust Architecture & Threat Shield'
  }
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Command className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            DEV<span className="text-violet-500">.</span>FEX
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#caracteristicas" className="hover:text-white transition-colors duration-200">
            Características
          </a>
          <Link to="/login" className="hover:text-white transition-colors duration-200">
            Iniciar Sesión
          </Link>
        </nav>  
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800 px-6 py-6 space-y-4">
          <a
            href="#caracteristicas"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white font-medium py-2"
          >
            Características
          </a>
          <a
            href="#portafolio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white font-medium py-2"
          >
            Proyectos
          </a>
          <a
            href="#precios"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white font-medium py-2"
          >
            Planes
          </a>
          <a
            href="#testimonios"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white font-medium py-2"
          >
            Testimonios
          </a>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const [metricCount, setMetricCount] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetricCount((prev) => (prev < 148 ? prev + 1 : 148));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/20 via-indigo-500/10 to-cyan-500/0 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md mb-8 text-xs font-medium text-zinc-300 shadow-xl shadow-black/40 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-400">Edición 2026:</span>
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
            Experiencias Digitales de Próxima Generación
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.08] mb-8">
          Creamos el futuro <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            digital sin límites.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed mb-10">
          Diseño web ultra-minimalista, ingeniería frontend de alto rendimiento e interfaces obsesionadas con la conversión. Diseñado para marcas extraordinarias.
        </p>

        

        {/* Live Counters & Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-zinc-800/60">
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm">
            <p className="text-3xl font-black text-white tracking-tight">${metricCount}M+</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-wider">Valor Generado</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm">
            <p className="text-3xl font-black text-white tracking-tight">99.9%</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-wider">Uptime Garantizado</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm">
            <p className="text-3xl font-black text-white tracking-tight">45+</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-wider">Premios Internacionales</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm">
            <p className="text-3xl font-black text-white tracking-tight">&lt;0.1s</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-wider">Latencia Promedio</p>
          </div>
        </div>

      </div>
    </section>
  );
}

function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(FEATURES_DATA[0].id);

  const selectedFeature = FEATURES_DATA.find((f) => f.id === activeTab);

  return (
    <section id="caracteristicas" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20">
            Poder y Elegancia
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-4 mb-6">
            Ingeniería de vanguardia detrás de cada píxel.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            No solo creamos sitios web bonitos; construimos motores digitales de alto desempeño preparados para dominar su industria.
          </p>
        </div>

        {/* Feature Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Navigation List */}
          <div className="lg:col-span-5 space-y-4">
            {FEATURES_DATA.map((feat) => {
              const IconComp = feat.icon;
              const isActive = feat.id === activeTab;
              return (
                <div
                  key={feat.id}
                  onClick={() => setActiveTab(feat.id)}
                  className={`group p-6 rounded-2xl cursor-pointer border transition-all duration-300 ${
                    isActive
                      ? 'bg-zinc-900 border-violet-500/60 shadow-xl shadow-violet-500/5'
                      : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 group-hover:text-white'
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {feat.title}
                        </h3>
                        <span className="text-xs font-semibold text-violet-400 bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-800/40">
                          {feat.metrics}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                        {feat.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Preview Display */}
          <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl min-h-[420px]">
            {/* Background Glow */}
            <div className={`absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br ${selectedFeature?.color} rounded-full blur-[90px] pointer-events-none`}></div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-zinc-300 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>{selectedFeature?.previewText}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                {selectedFeature?.title}
              </h3>

              <p className="text-zinc-300 text-base leading-relaxed mb-8 max-w-xl">
                {selectedFeature?.description}
              </p>
            </div>

            {/* Mock Code / Graphic Element */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 font-mono text-xs text-zinc-400 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span>nexus-config.ts</span>
              </div>
              <p className="text-violet-400">export const <span className="text-white">moduleConfig</span> = &#123;</p>
              <p className="pl-4">mode: <span className="text-emerald-400">'ultra-fast'</span>,</p>
              <p className="pl-4">securityLevel: <span className="text-emerald-400">'zero-trust'</span>,</p>
              <p className="pl-4">optimization: &#123; SSR: <span className="text-amber-400">true</span>, EdgeCache: <span className="text-amber-400">true</span> &#125;</p>
              <p className="text-violet-400">&#125;;</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default function HomePage() {
  
  return (
    <div className='className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-violet-500 selection:text-white"'>
      {/* Navigation */}
      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  )
}

