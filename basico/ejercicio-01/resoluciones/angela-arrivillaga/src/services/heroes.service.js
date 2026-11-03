export function obtenerInfoRuntime() {
  return {
    nodeVersion: process.version,
    plataforma: process.platform,
    tiempoActivo: process.uptime()
  };
}

export function crearSaludo(nombre) {
  return 'Bienvenido a la aventura, ' + nombre;
}
