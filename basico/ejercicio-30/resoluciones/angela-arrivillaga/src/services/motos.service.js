import { borrarMantenimientosDeMoto } from './mantenimientos.service.js';

const motos = [
  { id: 1, marca: 'Yamaha', modelo: 'MT-07', cilindrada: 689, anio: 2022 },
  { id: 2, marca: 'Honda', modelo: 'CB500F', cilindrada: 471, anio: 2021 },
  { id: 3, marca: 'Ducati', modelo: 'Monster', cilindrada: 937, anio: 2023 }
];

export function listarMotos(marca) {
  if (!marca) {
    return motos;
  }

  return motos.filter((m) => m.marca.toLowerCase() === marca.toLowerCase());
}

export function buscarMoto(id) {
  return motos.find((m) => m.id === id);
}

export function validarMoto(datos) {
  const errores = [];
  const anioActual = new Date().getFullYear();

  if (typeof datos.marca !== 'string' || datos.marca.trim() === '') {
    errores.push('La marca es obligatoria');
  }

  if (typeof datos.modelo !== 'string' || datos.modelo.trim() === '') {
    errores.push('El modelo es obligatorio');
  }

  if (!Number.isInteger(datos.cilindrada) || datos.cilindrada <= 0) {
    errores.push('La cilindrada debe ser un entero mayor a 0');
  }

  if (!Number.isInteger(datos.anio) || datos.anio < 1950 || datos.anio > anioActual + 1) {
    errores.push('El anio no es valido');
  }

  return errores;
}

export function crearMoto(datos) {
  let nuevoId = 1;

  if (motos.length > 0) {
    nuevoId = motos[motos.length - 1].id + 1;
  }

  const nueva = {
    id: nuevoId,
    marca: datos.marca.trim(),
    modelo: datos.modelo.trim(),
    cilindrada: datos.cilindrada,
    anio: datos.anio
  };

  motos.push(nueva);
  return nueva;
}

export function actualizarMoto(id, datos) {
  const moto = buscarMoto(id);

  moto.marca = datos.marca.trim();
  moto.modelo = datos.modelo.trim();
  moto.cilindrada = datos.cilindrada;
  moto.anio = datos.anio;

  return moto;
}

export function eliminarMoto(id) {
  const posicion = motos.findIndex((m) => m.id === id);

  if (posicion === -1) {
    return null;
  }

  borrarMantenimientosDeMoto(id);
  return motos.splice(posicion, 1)[0];
}
