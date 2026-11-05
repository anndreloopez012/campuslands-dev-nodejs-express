import { s } from '../schemas/index.js';
import {
  ARMADURA_MINIMA_TANQUE,
  ORDENES_HEROE,
  ROLES_HEROE,
  TECLAS,
} from '../constants/moba.js';
import { camposDePagina, textoDeBusqueda } from './comunes.schema.js';

const habilidad = s.objeto({
  tecla: s.enumerado(TECLAS),
  nombre: s.texto().recortar().normalizarEspacios().min(2).max(30),
  enfriamiento: s.numero().min(0).max(300),
  costoMana: s.entero().min(0).max(1000),
});

const estadisticas = s.objeto({
  vida: s.entero().min(300).max(5000),
  mana: s.entero().min(0).max(3000).defecto(0),
  ataque: s.numero().min(10).max(500),
  armadura: s.numero().min(0).max(200),
});

export const esquemaHeroe = s.objeto({
  nombre: s.texto()
    .recortar()
    .normalizarEspacios()
    .min(2)
    .max(24)
    .patron(/^[A-Za-z][A-Za-z' -]*$/, 'solo admite letras, espacios, apostrofes y guiones'),
  rol: s.enumerado(ROLES_HEROE),
  dificultad: s.entero().min(1).max(5),
  estadisticas,
  habilidades: s.arreglo(habilidad).largo(4).unico((item) => item.tecla, 'tecla'),
  etiquetas: s.arreglo(s.texto().recortar().minusculas().min(2).max(16)).max(5).unico().defecto([]),
  lanzamiento: s.fecha().desde('2020-01-01').opcional(),
})
  .refinar((heroe) => heroe.rol !== 'tanque' || heroe.estadisticas.armadura >= ARMADURA_MINIMA_TANQUE, {
    codigo: 'tanque_sin_armadura',
    mensaje: `los tanques necesitan al menos ${ARMADURA_MINIMA_TANQUE} de armadura`,
    ruta: 'estadisticas.armadura',
    descripcion: `un tanque tiene armadura de ${ARMADURA_MINIMA_TANQUE} o mas`,
  })
  .refinar((heroe) => heroe.estadisticas.mana > 0 || heroe.habilidades.every((item) => item.costoMana === 0), {
    codigo: 'mana_inconsistente',
    mensaje: 'un heroe sin mana no puede tener habilidades que cuesten mana',
    ruta: 'habilidades',
    descripcion: 'sin mana, ninguna habilidad cuesta mana',
  });

export const esquemaHeroeEdicion = esquemaHeroe.parcial({ profundo: true }).minimoUnCampo();

export const consultaHeroes = s.objeto({
  rol: s.enumerado(ROLES_HEROE).opcional(),
  dificultad: s.entero().coaccionar().min(1).max(5).opcional(),
  buscar: textoDeBusqueda(24).opcional(),
  orden: s.enumerado(ORDENES_HEROE).defecto('id'),
  ...camposDePagina,
});
