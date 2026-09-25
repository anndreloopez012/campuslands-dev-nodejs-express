// Reservas de salto en memoria: se reinician al reiniciar el servidor.
// El foco de este ejercicio es la ruta POST en si, no la persistencia.

let saltos = [];
let siguienteId = 1;

export function listarSaltos() {
  return saltos;
}

export function registrarSalto({ nombre, peso_kg, nivel }) {
  const nuevoSalto = {
    id: siguienteId,
    nombre,
    peso_kg,
    nivel,
    estado: 'reservado',
  };

  siguienteId += 1;
  saltos.push(nuevoSalto);

  return nuevoSalto;
}
