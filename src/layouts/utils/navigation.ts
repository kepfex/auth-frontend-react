export const isRouteActive = (
    path: string | undefined,
    pathname: string
): boolean => {
    if (!path) return false;

    if (path === "/admin") {
        return pathname === path;
    }

    return (
        pathname === path ||
        pathname.startsWith(`${path}/`)
    );
};