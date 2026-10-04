export const parsePositiveIntParam = (value: string | undefined,): number | null => {
    if (!value) {
        return null;
    }

    const parsed = Number(value);

    if (
        !Number.isInteger(parsed) ||
        parsed <= 0
    ) {
        return null;
    }

    return parsed;
};
// Ejemplo retorna:
// "37"    → 37
// "0"     → null
// "-4"    → null
// "abc"   → null
// "4.5"   → null
// undefined → null