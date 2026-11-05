import { limitadores, descripciones } from '../config/limites.js';

const segundos = (ms) => Math.max(Math.ceil(ms / 1000), 0);

export function describir(cliente) {
  const politicas = Object.entries(limitadores).map(([nombre, limitador]) => {
    const estado = limitador.estado(cliente.id);
    const base = {
      nombre,
      descripcion: descripciones[nombre],
      algoritmo: limitador.tipo,
      limite: limitador.limite,
      restantes: estado.restantes,
      reinicioEnSeg: segundos(estado.reinicioMs),
    };
    return limitador.tipo === 'ventana fija'
      ? { ...base, ventanaSeg: segundos(limitador.ventanaMs) }
      : { ...base, recargaCadaSeg: segundos(limitador.recargaMs) };
  });
  return { cliente, politicas };
}
