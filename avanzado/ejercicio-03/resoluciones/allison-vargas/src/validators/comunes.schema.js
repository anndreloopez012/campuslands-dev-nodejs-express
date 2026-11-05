import { s } from '../schemas/index.js';
import { ID_MAX } from '../constants/moba.js';

export const idDeCuerpo = s.entero().min(1).max(ID_MAX);

export const idDeRuta = s.entero().coaccionar().min(1).max(ID_MAX);

export const parametrosConId = s.objeto({ id: idDeRuta });

export const camposDePagina = {
  pagina: s.entero().coaccionar().min(1).max(100000).defecto(1),
  limite: s.entero().coaccionar().min(1).max(50).defecto(10),
};

export const textoDeBusqueda = (maximo) => s.texto().recortar().min(1).max(maximo);
