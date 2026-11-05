import { crear } from '../errores/index.js';
import { terminar } from '../validators/comunes.js';
import {
  validarClima, validarConsulta, validarResolucion, validarSalto, validarVuelo,
} from '../validators/zona.js';

export function crearServicioZona({
  motor, usuarios, vuelos: baseVuelos, reloj,
}) {
  const vuelos = structuredClone(baseVuelos);
  const saltos = new Map();
  const clima = { suspendido: false, motivo: null, actualizadoEn: null };
  let siguienteSalto = 1;
  let siguienteVuelo = Math.max(0, ...vuelos.map((v) => v.id)) + 1;

  const usuario = (id) => usuarios.find((u) => u.id === id);
  const contexto = (extra = {}) => ({ clima, ...extra });

  function vuelo(id) {
    const encontrado = vuelos.find((v) => v.id === id);
    if (!encontrado) throw crear('VUELO_NO_ENCONTRADO', { vueloId: id });
    return encontrado;
  }

  function salto(id) {
    const encontrado = saltos.get(id);
    if (!encontrado) throw crear('SALTO_NO_ENCONTRADO', { saltoId: id });
    return encontrado;
  }

  const saltosDe = (vueloId) => [...saltos.values()].filter((s) => s.vueloId === vueloId && s.estado !== 'rechazado');

  return {
    autenticar(cabecera) {
      const [esquema, token] = (cabecera ?? '').split(' ');
      const encontrado = esquema === 'Bearer' ? usuarios.find((u) => u.token === token) : undefined;
      if (!encontrado) throw crear('NO_AUTENTICADO');
      return encontrado;
    },

    perfil: (u) => ({
      id: u.id,
      nombre: u.nombre,
      roles: [...u.roles],
      rolesEfectivos: motor.rolesEfectivos(u),
      permisos: motor.permisos(u),
      licencia: u.licencia,
      certificaciones: u.certificaciones ?? [],
      alumnos: u.alumnos ?? [],
    }),

    listarSaltos: (u) => [...saltos.values()].filter((s) => motor.puede(u, 'saltos:ver', s, contexto())),

    obtenerSalto(u, id) {
      const encontrado = salto(id);
      // si no lo puede ver se responde 404 y no 403, para no revelar que el salto existe
      if (!motor.puede(u, 'saltos:ver', encontrado, contexto())) throw crear('SALTO_NO_ENCONTRADO', { saltoId: id });
      return encontrado;
    },

    crearSalto(u, cuerpo) {
      const { vueloId, tipo } = validarSalto(cuerpo);
      const elegido = vuelo(vueloId);
      motor.exigir(u, 'saltos:crear', { tipo, saltadorId: u.id, vueloId }, contexto());
      if (elegido.estado !== 'programado') throw crear('VUELO_NO_DISPONIBLE', { vueloId, estado: elegido.estado });
      const anotados = saltosDe(vueloId);
      if (anotados.some((s) => s.saltadorId === u.id)) throw crear('SALTO_DUPLICADO', { vueloId });
      if (anotados.length >= elegido.capacidad) throw crear('VUELO_LLENO', { vueloId, capacidad: elegido.capacidad });
      const nuevo = {
        id: siguienteSalto,
        saltadorId: u.id,
        vueloId,
        tipo,
        estado: 'pendiente',
        creadoEn: reloj().toISOString(),
        resueltoPor: null,
        nota: null,
      };
      siguienteSalto += 1;
      saltos.set(nuevo.id, nuevo);
      return nuevo;
    },

    resolverSalto(u, id, cuerpo) {
      const { decision, nota } = validarResolucion(cuerpo);
      const actual = salto(id);
      motor.exigir(u, 'saltos:aprobar', actual, contexto({ saltador: usuario(actual.saltadorId) }));
      if (actual.estado !== 'pendiente') throw crear('SALTO_YA_RESUELTO', { saltoId: id, estado: actual.estado });
      actual.estado = decision === 'aprobar' ? 'aprobado' : 'rechazado';
      actual.resueltoPor = u.id;
      actual.nota = nota ?? null;
      return actual;
    },

    listarVuelos: () => vuelos.map((v) => ({ ...v, ocupados: saltosDe(v.id).length })),

    crearVuelo(u, cuerpo) {
      motor.exigir(u, 'vuelos:crear', null, contexto());
      const datos = validarVuelo(cuerpo);
      const piloto = usuario(datos.pilotoId);
      if (!piloto || !motor.rolesEfectivos(piloto).includes('piloto')) {
        terminar([{ campo: 'pilotoId', mensaje: 'debe ser un usuario con rol piloto' }]);
      }
      const nuevo = {
        id: siguienteVuelo, ...datos, hora: new Date(datos.hora).toISOString(), estado: 'programado',
      };
      siguienteVuelo += 1;
      vuelos.push(nuevo);
      return nuevo;
    },

    manifiesto(u, id) {
      const elegido = vuelo(id);
      motor.exigir(u, 'manifiesto:ver', elegido, contexto());
      return {
        vuelo: elegido,
        saltadores: saltosDe(id).map((s) => ({
          saltoId: s.id, nombre: usuario(s.saltadorId).nombre, tipo: s.tipo, estado: s.estado,
        })),
      };
    },

    despegar(u, id) {
      const elegido = vuelo(id);
      motor.exigir(u, 'vuelos:despegar', elegido, contexto());
      if (elegido.estado !== 'programado') throw crear('VUELO_NO_DISPONIBLE', { vueloId: id, estado: elegido.estado });
      const pendientes = saltosDe(id).filter((s) => s.estado === 'pendiente').length;
      if (pendientes) throw crear('VUELO_CON_PENDIENTES', { vueloId: id, pendientes });
      elegido.estado = 'en_vuelo';
      for (const s of saltosDe(id)) s.estado = 'realizado';
      return elegido;
    },

    clima: () => ({ ...clima }),

    cambiarClima(u, cuerpo) {
      motor.exigir(u, 'clima:gestionar', null, contexto());
      Object.assign(clima, validarClima(cuerpo), { actualizadoEn: reloj().toISOString() });
      return { ...clima };
    },

    explicar(u, cuerpo) {
      const consulta = validarConsulta(cuerpo);
      let recurso = null;
      const extra = {};
      if (consulta.saltoId !== undefined) {
        recurso = salto(consulta.saltoId);
        extra.saltador = usuario(recurso.saltadorId);
      } else if (consulta.vueloId !== undefined) recurso = vuelo(consulta.vueloId);
      if (consulta.tipo) recurso = { ...(recurso ?? {}), tipo: consulta.tipo, saltadorId: u.id };
      return motor.decidir(u, consulta.accion, recurso, contexto(extra));
    },

    roles(u) {
      motor.exigir(u, 'roles:ver', null, contexto());
      return motor.roles();
    },
  };
}
