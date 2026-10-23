let mantenimientos = [
  { id: 1, motoId: 1, descripcion: 'Cambio de aceite', costo: 45, fecha: '2026-01-15' },
  { id: 2, motoId: 1, descripcion: 'Cambio de pastillas de freno', costo: 80, fecha: '2026-03-02' },
  { id: 3, motoId: 2, descripcion: 'Ajuste de cadena', costo: 20, fecha: '2026-02-10' }
];

export function getMantenimientosDeMoto(motoId) {
  return mantenimientos.filter((m) => m.motoId === motoId);
}

export function agregarMantenimiento(motoId, descripcion, costo) {
  let nuevoId = 1;

  if (mantenimientos.length > 0) {
    nuevoId = mantenimientos[mantenimientos.length - 1].id + 1;
  }

  const nuevo = {
    id: nuevoId,
    motoId: motoId,
    descripcion: descripcion,
    costo: costo,
    fecha: new Date().toISOString().slice(0, 10)
  };

  mantenimientos.push(nuevo);
  return nuevo;
}

export function borrarMantenimientosDeMoto(motoId) {
  mantenimientos = mantenimientos.filter((m) => m.motoId !== motoId);
}
