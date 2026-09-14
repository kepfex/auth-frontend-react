import { BookOpen } from "lucide-react"

export const AcademicStructurePage = () => {
  return (
    <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-phoenix-gold/10">
                    <BookOpen className="h-6 w-6 text-phoenix-gold" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Catálogo Base</h1>
                    <p className="text-sm text-muted-foreground">
                        Estructura académica del colegio — Niveles, Grados y Secciones
                    </p>
                </div>
            </div>
    </div>
  )
}
