import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GradesTab } from "@/features/academic-structure/components/GradesTab"
import { LevelsTab } from "@/features/academic-structure/components/LevelsTab"
import { SectionsTab } from "@/features/academic-structure/components/SectionsTab"
import { BookOpen, Grid, Grid2X2, Layers, LayoutGrid, ListOrdered } from "lucide-react"

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

            {/* Tabs */}
            <Tabs defaultValue="levels">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="levels">
                        <Layers/>
                        Niveles
                    </TabsTrigger>
                    <TabsTrigger value="grades">
                        <ListOrdered/>
                        Grados
                    </TabsTrigger>
                    <TabsTrigger value="sections">
                        <LayoutGrid/>
                        Secciones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="levels" className="mt-6">
                    <LevelsTab />
                </TabsContent>
                <TabsContent value="grades" className="mt-6">
                    <GradesTab />
                </TabsContent>
                <TabsContent value="sections" className="mt-6">
                    <SectionsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
