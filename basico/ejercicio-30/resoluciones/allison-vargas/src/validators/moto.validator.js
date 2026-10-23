const PATRON_PLACA = /^[A-Za-z0-9]{3,10}$/;

export function validarMoto(datos = {}) {
  const errores = [];
  const { placa, marca, modelo, propietario } = datos;

  if (typeof placa !== 'string' || !PATRON_PLACA.test(placa)) {
    errores.push('placa es obligatoria y debe tener entre 3 y 10 caracteres alfanumericos');
  }

  if (typeof marca !== 'string' || marca.trim().length === 0) {
    errores.push('marca es obligatoria y debe ser un texto no vacio');
  }

  if (typeof modelo !== 'string' || modelo.trim().length === 0) {
    errores.push('modelo es obligatorio y debe ser un texto no vacio');
  }

  if (typeof propietario !== 'string' || propietario.trim().length === 0) {
    errores.push('propietario es obligatorio y debe ser un texto no vacio');
  }

  return { valido: errores.length === 0, errores };
}
