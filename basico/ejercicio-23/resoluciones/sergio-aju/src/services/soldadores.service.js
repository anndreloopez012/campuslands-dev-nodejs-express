const soldadores = [
  {
    id: 1,
    nombre: 'Carlos',
    especialidad: 'Soldadura MIG'
  },
  {
    id: 2,
    nombre: 'Luis',
    especialidad: 'Soldadura TIG'
  }
];

let siguienteId = 3;

export function listarSoldadores() {
  return soldadores;
}

export function guardarSoldador(nombre, especialidad) {
  const soldador = {
    id: siguienteId++,
    nombre,
    especialidad
  };

  soldadores.push(soldador);

  return soldador;
}