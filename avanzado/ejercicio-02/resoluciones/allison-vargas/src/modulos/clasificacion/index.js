import { EVENTOS } from '../../constants/dominio.js';
import { crearTablaDePuntajes } from './clasificacion.store.js';
import { crearClasificacionService } from './clasificacion.service.js';
import { crearClasificacionRouter } from './clasificacion.routes.js';

export default {
  nombre: 'clasificacion',
  ruta: '/clasificacion',
  dependencias: ['jugadores'],
  emite: [],
  escucha: [EVENTOS.JUGADOR_CREADO, EVENTOS.PARTIDA_FINALIZADA],

  registrar(contenedor) {
    contenedor.registrar('clasificacion.tabla', () => crearTablaDePuntajes());
    contenedor.registrar('clasificacion', (c) => crearClasificacionService({
      tabla: c.resolver('clasificacion.tabla'),
      jugadores: c.resolver('jugadores'),
      cache: c.resolver('cache'),
    }));
  },

  alIniciar(contenedor) {
    const clasificacion = contenedor.resolver('clasificacion');
    const eventos = contenedor.resolver('eventos');
    clasificacion.sincronizar();
    eventos.suscribir(EVENTOS.JUGADOR_CREADO, ({ jugador }) => clasificacion.alta(jugador.id));
    eventos.suscribir(EVENTOS.PARTIDA_FINALIZADA, (carga) => clasificacion.aplicarResultado(carga));
  },

  crearRouter(contenedor) {
    return crearClasificacionRouter({ clasificacion: contenedor.resolver('clasificacion') });
  },

  estado(contenedor) {
    return { ok: true, detalle: { jugadoresEnTabla: contenedor.resolver('clasificacion').contar() } };
  },
};
