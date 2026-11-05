import { s } from '../schemas/index.js';
import { BANEOS_POR_EQUIPO, LADOS, ORDENES_DRAFT, PICKS_POR_EQUIPO } from '../constants/moba.js';
import { camposDePagina, idDeCuerpo, idDeRuta } from './comunes.schema.js';

const lado = s.enumerado(LADOS);

const baneo = s.objeto({
  tipo: s.literal('ban'),
  equipo: lado,
  heroe: idDeCuerpo,
});

const seleccion = s.objeto({
  tipo: s.literal('pick'),
  equipo: lado,
  heroe: idDeCuerpo,
  jugador: s.texto().recortar().min(3).max(16),
});

const accion = s.unionPor('tipo', { ban: baneo, pick: seleccion });

export const esquemaDraft = s.objeto({
  azul: idDeCuerpo,
  rojo: idDeCuerpo,
  programadaPara: s.fechaHora().opcional(),
  acciones: s.arreglo(accion).min(1).max(20),
})
  .refinar((draft) => draft.azul !== draft.rojo, {
    codigo: 'equipos_iguales',
    mensaje: 'los dos lados deben ser equipos distintos',
    ruta: 'rojo',
    descripcion: 'azul y rojo son equipos distintos',
  })
  .verificar((draft, informar) => {
    const vistos = new Map();
    draft.acciones.forEach((item, indice) => {
      if (vistos.has(item.heroe)) {
        informar({
          ruta: ['acciones', indice, 'heroe'],
          codigo: 'heroe_repetido',
          mensaje: `el heroe ya se uso en la accion ${vistos.get(item.heroe)}`,
        });
      } else {
        vistos.set(item.heroe, indice);
      }
    });
  }, 'un heroe se usa una sola vez entre baneos y picks')
  .verificar((draft, informar) => {
    for (const equipo of LADOS) {
      const propias = draft.acciones.filter((item) => item.equipo === equipo);
      const baneos = propias.filter((item) => item.tipo === 'ban').length;
      const picks = propias.filter((item) => item.tipo === 'pick').length;
      if (baneos > BANEOS_POR_EQUIPO) {
        informar({
          ruta: 'acciones',
          codigo: 'limite_excedido',
          mensaje: `el equipo ${equipo} tiene ${baneos} baneos y el maximo es ${BANEOS_POR_EQUIPO}`,
        });
      }
      if (picks > PICKS_POR_EQUIPO) {
        informar({
          ruta: 'acciones',
          codigo: 'limite_excedido',
          mensaje: `el equipo ${equipo} tiene ${picks} picks y el maximo es ${PICKS_POR_EQUIPO}`,
        });
      }
    }
  }, `maximo ${BANEOS_POR_EQUIPO} baneos y ${PICKS_POR_EQUIPO} picks por equipo`)
  .verificar((draft, informar) => {
    const vistos = new Map();
    draft.acciones.forEach((item, indice) => {
      if (item.tipo !== 'pick') return;
      const clave = `${item.equipo}:${item.jugador.toLowerCase()}`;
      if (vistos.has(clave)) {
        informar({
          ruta: ['acciones', indice, 'jugador'],
          codigo: 'jugador_repetido',
          mensaje: `${item.jugador} ya eligio heroe en la accion ${vistos.get(clave)}`,
        });
      } else {
        vistos.set(clave, indice);
      }
    });
  }, 'un jugador elige un solo heroe');

export const consultaDrafts = s.objeto({
  equipoId: idDeRuta.opcional(),
  orden: s.enumerado(ORDENES_DRAFT).defecto('id'),
  ...camposDePagina,
});
