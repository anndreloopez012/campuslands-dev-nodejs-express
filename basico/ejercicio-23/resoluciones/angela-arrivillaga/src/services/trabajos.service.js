import { trabajos } from '../data/trabajos.data.js';

export function listarTrabajos(estado) {
  if (!estado) {
    return trabajos;
  }

  return trabajos.filter((t) => t.estado === estado);
}

export function buscarTrabajo(id) {
  return trabajos.find((t) => t.id === id);
}

export function agregarTrabajo(cliente, tipo, horas) {
  let nuevoId = 1;

  if (trabajos.length > 0) {
    nuevoId = trabajos[trabajos.length - 1].id + 1;
  }

  const nuevo = {
    id: nuevoId,
    cliente: cliente,
    tipo: tipo,
    horas: horas,
    estado: 'pendiente'
  };

  trabajos.push(nuevo);
  return nuevo;
}

export function contarPorEstado() {
  const conteo = {};

  for (let i = 0; i < trabajos.length; i++) {
    const estado = trabajos[i].estado;

    if (conteo[estado]) {
      conteo[estado] = conteo[estado] + 1;
    } else {
      conteo[estado] = 1;
    }
  }

  return conteo;
}
