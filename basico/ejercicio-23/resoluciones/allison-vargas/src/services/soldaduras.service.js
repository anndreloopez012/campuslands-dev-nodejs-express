let soldaduras = [
  { id: 1, tipo_soldadura: 'MIG', material: 'acero', estado: 'completada' },
  { id: 2, tipo_soldadura: 'TIG', material: 'aluminio', estado: 'en_proceso' },
];
let siguienteId = 3;

export function listarSoldaduras() {
  return soldaduras;
}

export function buscarSoldaduraPorId(id) {
  return soldaduras.find((soldadura) => soldadura.id === Number(id)) || null;
}

export function crearSoldadura({ tipo_soldadura, material, estado }) {
  const nuevaSoldadura = { id: siguienteId, tipo_soldadura, material, estado };
  siguienteId += 1;
  soldaduras.push(nuevaSoldadura);

  return nuevaSoldadura;
}

export function actualizarSoldadura(id, { tipo_soldadura, material, estado }) {
  const indice = soldaduras.findIndex((soldadura) => soldadura.id === Number(id));

  if (indice === -1) {
    return null;
  }

  soldaduras[indice] = { id: Number(id), tipo_soldadura, material, estado };
  return soldaduras[indice];
}

export function eliminarSoldadura(id) {
  const indice = soldaduras.findIndex((soldadura) => soldadura.id === Number(id));

  if (indice === -1) {
    return false;
  }

  soldaduras.splice(indice, 1);
  return true;
}
