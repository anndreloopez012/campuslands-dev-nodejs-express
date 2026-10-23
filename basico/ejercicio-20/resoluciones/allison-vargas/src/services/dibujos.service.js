let dibujos = [];
let siguienteId = 1;

export function listarDibujos() {
  return dibujos;
}

export function crearDibujo({ nombre, capas, resolucion }) {
  const nuevoDibujo = {
    id: siguienteId,
    nombre,
    capas,
    resolucion,
  };

  siguienteId += 1;
  dibujos.push(nuevoDibujo);

  return nuevoDibujo;
}
