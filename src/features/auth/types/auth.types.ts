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

// Lo que el servidor nos devuelve
export interface AuthResponse {
    token: string
    user: User
}

export interface User {
    id: string
    name: string
    email: string
}