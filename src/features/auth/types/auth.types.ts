// Lo que enviamos al servidor
export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface User {
    id: string
    name: string
    email: string
}

export interface AcademicYear {
    id: number
    name: string
    start_date: string
    end_date: string
    is_active: boolean
}

// Lo que el servidor nos devuelve
export interface AuthResponse {
    token: string
    token_type: string
    expires_in: number
    user: User
    academic_year: AcademicYear | null
}
