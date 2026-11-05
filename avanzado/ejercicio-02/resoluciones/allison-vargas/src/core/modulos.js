const RUTA_VALIDA = /^\/[a-z0-9-]+$/;

export function ordenarModulos(modulos) {
  const porNombre = new Map();
  const rutas = new Set();

  for (const modulo of modulos) {
    if (!modulo || typeof modulo.nombre !== 'string' || !modulo.nombre) {
      throw new Error('Todo modulo necesita un nombre');
    }
    if (porNombre.has(modulo.nombre)) throw new Error(`Modulo duplicado: ${modulo.nombre}`);
    if (typeof modulo.ruta !== 'string' || !RUTA_VALIDA.test(modulo.ruta)) {
      throw new Error(`El modulo ${modulo.nombre} necesita una ruta con forma /nombre`);
    }
    if (rutas.has(modulo.ruta)) throw new Error(`La ruta ${modulo.ruta} ya la usa otro modulo`);
    if (typeof modulo.registrar !== 'function' || typeof modulo.crearRouter !== 'function') {
      throw new Error(`El modulo ${modulo.nombre} debe definir registrar y crearRouter`);
    }
    porNombre.set(modulo.nombre, modulo);
    rutas.add(modulo.ruta);
  }

  const ordenados = [];
  const marcas = new Map();

  const visitar = (modulo, camino) => {
    if (marcas.get(modulo.nombre) === 'listo') return;
    if (marcas.get(modulo.nombre) === 'visitando') {
      throw new Error(`Dependencia circular entre modulos: ${[...camino, modulo.nombre].join(' -> ')}`);
    }
    marcas.set(modulo.nombre, 'visitando');
    for (const dependencia of modulo.dependencias ?? []) {
      const requerido = porNombre.get(dependencia);
      if (!requerido) {
        throw new Error(`El modulo ${modulo.nombre} depende de ${dependencia}, que no esta registrado`);
      }
      visitar(requerido, [...camino, modulo.nombre]);
    }
    marcas.set(modulo.nombre, 'listo');
    ordenados.push(modulo);
  };

  modulos.forEach((modulo) => visitar(modulo, []));
  return ordenados;
}
