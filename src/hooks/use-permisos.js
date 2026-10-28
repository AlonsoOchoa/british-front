export function usePermisos() {
  const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");

  const tienePermiso = (permiso) => permisos.includes(permiso);

  return { tienePermiso, permisos };
}