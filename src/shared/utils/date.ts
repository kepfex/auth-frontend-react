
export const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(date));
}

export const formatDateLong = (date: string): string => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));
}

export const formatDateTime = (date: string): string => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}

export const formatDateTimeLong = (date: string): string => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}
