export interface EducationalLevel {
    id: number
    code: string
    name: string
    order: number
    grades?: Grade[]
    created_at?: string
}

export interface Grade {
    id: number
    educational_level_id: number
    code: string
    name: string
    order: number
    grade_sections_count: number
    educational_level?: EducationalLevel
}

export interface Section {
    id: number
    name: string
}

// ── Requests ──────────────────────────────────────────
export interface CreateLevelRequest {
    code: string
    name: string
    order: number
}
export type UpdateLevelRequest = Partial<CreateLevelRequest>

export interface CreateGradeRequest {
    educational_level_id: number
    code: string
    name: string
    order: number
}
export type UpdateGradeRequest = Partial<CreateGradeRequest>

export interface CreateSectionRequest { name: string }
export interface UpdateSectionRequest { name: string }