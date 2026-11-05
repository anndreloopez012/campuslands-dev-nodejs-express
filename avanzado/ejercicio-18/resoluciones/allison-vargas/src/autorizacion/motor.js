import { crear } from '../errores/index.js';

export function validarRoles(roles) {
  for (const [nombre, definicion] of Object.entries(roles)) {
    for (const padre of definicion.hereda ?? []) {
      if (!roles[padre]) throw new TypeError(`El rol ${nombre} hereda de un rol desconocido: ${padre}`);
    }
    for (const permiso of definicion.permisos ?? []) {
      if (!/^[a-z_]+:[a-z_]+$/.test(permiso)) throw new TypeError(`Permiso mal escrito en ${nombre}: ${permiso}`);
    }
  }
  const visitando = new Set();
  const listos = new Set();
  const visitar = (nombre, camino) => {
    if (listos.has(nombre)) return;
    if (visitando.has(nombre)) throw new TypeError(`Herencia circular: ${[...camino, nombre].join(' -> ')}`);
    visitando.add(nombre);
    for (const padre of roles[nombre].hereda ?? []) visitar(padre, [...camino, nombre]);
    visitando.delete(nombre);
    listos.add(nombre);
  };
  for (const nombre of Object.keys(roles)) visitar(nombre, []);
  return roles;
}

export function crearMotor({ roles, condiciones = {}, prohibiciones = [] }) {
  validarRoles(roles);
  const cache = new Map();

  function expandir(nombre) {
    if (!cache.has(nombre)) {
      const resultado = new Set([nombre]);
      for (const padre of roles[nombre].hereda ?? []) for (const r of expandir(padre)) resultado.add(r);
      cache.set(nombre, resultado);
    }
    return cache.get(nombre);
  }

  function rolesEfectivos(usuario) {
    const todos = new Set();
    for (const rol of usuario.roles) {
      if (!roles[rol]) continue;
      for (const r of expandir(rol)) todos.add(r);
    }
    return [...todos].sort();
  }

  function otorgantes(usuario, accion) {
    return usuario.roles.filter((rol) => roles[rol] && [...expandir(rol)].some((r) => roles[r].permisos.includes(accion)));
  }

  function permisos(usuario) {
    return [...new Set(rolesEfectivos(usuario).flatMap((r) => roles[r].permisos))].sort();
  }

  function decidir(usuario, accion, recurso, contexto = {}) {
    const tiene = (permiso) => otorgantes(usuario, permiso).length > 0;
    const base = { accion, usuarioId: usuario.id };
    // 1. las prohibiciones explicitas ganan siempre, aunque algun rol de permiso
    for (const regla of prohibiciones) {
      if (regla.acciones.includes(accion) && regla.aplica(usuario, recurso, contexto)) {
        return { ...base, permitido: false, motivo: regla.motivo, etapa: 'prohibicion' };
      }
    }
    // 2. algun rol (propio o heredado) tiene que otorgar el permiso
    const roles2 = otorgantes(usuario, accion);
    if (!roles2.length) return { ...base, permitido: false, motivo: 'ninguno de tus roles otorga este permiso', etapa: 'rol' };
    // 3. condiciones sobre atributos del usuario, del recurso y del contexto
    const condicion = condiciones[accion];
    const falla = condicion ? condicion({
      usuario, recurso, contexto, tiene,
    }) : null;
    if (falla) return { ...base, permitido: false, motivo: falla, etapa: 'condicion', otorgadoPor: roles2 };
    return { ...base, permitido: true, motivo: null, otorgadoPor: roles2 };
  }

  return {
    rolesEfectivos,
    permisos,
    decidir,
    puede: (usuario, accion, recurso, contexto) => decidir(usuario, accion, recurso, contexto).permitido,
    exigir(usuario, accion, recurso, contexto) {
      const decision = decidir(usuario, accion, recurso, contexto);
      if (!decision.permitido) throw crear('PROHIBIDO', { accion, motivo: decision.motivo });
      return decision;
    },
    roles: () => structuredClone(roles),
  };
}
