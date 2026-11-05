import { s } from '../schemas/index.js';
import { ORDENES_EQUIPO, REGIONES, ROLES_LINEA } from '../constants/moba.js';
import { camposDePagina, textoDeBusqueda } from './comunes.schema.js';

const jugador = s.objeto({
  nick: s.texto().recortar().min(3).max(16).patron(/^[A-Za-z0-9_]+$/, 'solo admite letras, numeros y guion bajo'),
  rol: s.enumerado(ROLES_LINEA),
  capitan: s.booleano().defecto(false),
});

export const esquemaEquipo = s.objeto({
  nombre: s.texto().recortar().normalizarEspacios().min(3).max(30),
  tag: s.texto().recortar().mayusculas().patron(/^[A-Z0-9]{2,4}$/, 'debe tener de 2 a 4 letras o numeros'),
  region: s.enumerado(REGIONES),
  contacto: s.texto().recortar().minusculas().email().nulo().defecto(null),
  fundado: s.fecha().desde('2010-01-01').opcional(),
  jugadores: s.arreglo(jugador)
    .largo(5)
    .unico((item) => item.nick.toLowerCase(), 'nick')
    .unico((item) => item.rol, 'rol'),
}).verificar((equipo, informar) => {
  const capitanes = equipo.jugadores.filter((item) => item.capitan).length;
  if (capitanes !== 1) {
    informar({
      ruta: 'jugadores',
      codigo: 'capitan_requerido',
      mensaje: `debe haber exactamente un capitan y se recibieron ${capitanes}`,
    });
  }
}, 'exactamente un capitan');

export const consultaEquipos = s.objeto({
  region: s.enumerado(REGIONES).opcional(),
  buscar: textoDeBusqueda(30).opcional(),
  orden: s.enumerado(ORDENES_EQUIPO).defecto('id'),
  ...camposDePagina,
});
