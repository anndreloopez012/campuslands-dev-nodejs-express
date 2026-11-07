const { ValidationError, NotFoundError, ConflictError } = require('../errors/app.error');
const { TallerRepository } = require('../repositories/taller.repository');

const repositorio = new TallerRepository();

const ESTADOS = ['abierta', 'en_proceso', 'cerrada'];

/* ---------------- motos ---------------- */

function listarMotos() {
  return repositorio.all('motos');
}

function obtenerMoto(id) {
  const moto = repositorio.find('motos', id);
  if (!moto) throw new NotFoundError(`La moto ${id} no esta registrada`);
  return moto;
}

function registrarMoto(datos) {
  const { placa, marca, modelo, cilindrada, dueño } = datos;

  reglasFicha({ placa, marca, modelo, cilindrada });
  if (repositorio.findPor('motos', (moto) => moto.placa === placa.toUpperCase())) {
    throw new ConflictError(`La placa ${placa.toUpperCase()} ya esta registrada`);
  }

  return repositorio.save('motos', {
    placa: placa.toUpperCase(),
    marca: marca.trim(),
    modelo: modelo.trim(),
    cilindrada,
    dueño: dueño.trim()
  });
}

function reglasFicha({ placa, marca, modelo, cilindrada }) {
  if (!placa || typeof placa !== 'string' || !/^[A-Za-z]{3}-\d{3}$/.test(placa.trim())) {
    throw new ValidationError('El campo "placa" debe tener el formato AAA-999');
  }
  if (!marca || typeof marca !== 'string' || marca.trim().length < 2) {
    throw new ValidationError('El campo "marca" es obligatorio (min 2 caracteres)');
  }
  if (!modelo || typeof modelo !== 'string' || modelo.trim().length < 3) {
    throw new ValidationError('El campo "modelo" es obligatorio (min 3 caracteres)');
  }
  if (!Number.isInteger(cilindrada) || cilindrada < 50 || cilindrada > 3000) {
    throw new ValidationError('El campo "cilindrada" debe ser un entero entre 50 y 3000');
  }
}

/* ------------- ordenes de trabajo -------------- */

/**
 * Crea una orden de trabajo sobre una moto: valida integridad,
 * consume un repuesto opcional con control de stock y calcula el total.
 */
function abrirOrden(datos) {
  const { motoId, descripcion, repuestoId, horas } = datos;

  const moto = obtenerMoto(Number(motoId));
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
    throw new ValidationError('El campo "descripcion" es obligatorio (min 10 caracteres)');
  }
  if (typeof horas !== 'number' || horas <= 0 || horas > 20) {
    throw new ValidationError('El campo "horas" debe ser un numero entre 0 y 20');
  }

  const tarifaHora = 18;
  let repuesto = null;
  let totalRepuesto = 0;

  if (repuestoId !== undefined && repuestoId !== null) {
    repuesto = repositorio.find('repuestos', Number(repuestoId));
    if (!repuesto) throw new NotFoundError(`El repuesto ${repuestoId} no existe en inventario`);
    if (repuesto.stock <= 0) throw new ConflictError(`Sin stock del repuesto ${repuesto.codigo}`);

    repuesto.stock -= 1;
    totalRepuesto = repuesto.precio_usd;
  }

  const orden = repositorio.save('ordenes', {
    motoId: moto.id,
    placa: moto.placa,
    descripcion: descripcion.trim(),
    repuestoId: repuesto ? repuesto.id : null,
    horas,
    costoManoObra: Number((horas * tarifaHora).toFixed(2)),
    costoRepuesto: totalRepuesto,
    total: Number((horas * tarifaHora + totalRepuesto).toFixed(2)),
    estado: 'abierta'
  });

  return orden;
}

function listarOrdenes() {
  return repositorio.all('ordenes');
}

/**
 * Cambia el estado con reglas de transicion:
 * abierta -> en_proceso -> cerrada (sin saltos)
 */
function cambiarEstado(ordenId, nuevoEstado) {
  if (!ESTADOS.includes(nuevoEstado)) {
    throw new ValidationError(`Estado invalido. Usar: ${ESTADOS.join(', ')}`);
  }

  const orden = repositorio.find('ordenes', ordenId);
  if (!orden) throw new NotFoundError(`La orden ${ordenId} no existe`);

  const indiceActual = ESTADOS.indexOf(orden.estado);
  const indiceNuevo = ESTADOS.indexOf(nuevoEstado);

  if (indiceNuevo !== indiceActual + 1) {
    throw new ConflictError(`Transicion invalida: "${orden.estado}" solo avanza a "${ESTADOS[indiceActual + 1]}"`);
  }

  return repositorio.update('ordenes', ordenId, { estado: nuevoEstado });
}

/* ---------------- inventario ---------------- */

function listarRepuestos() {
  return repositorio.all('repuestos');
}

/** Entrada/salida de stock con corte en cero y motivo auditable. */
function moverStock(repuestoId, datos) {
  const repuesto = repositorio.find('repuestos', repuestoId);
  if (!repuesto) throw new NotFoundError(`El repuesto ${repuestoId} no existe`);

  const { operacion, cantidad, motivo } = datos;
  if (!['entrada', 'salida'].includes(operacion)) {
    throw new ValidationError('Operacion invalida: entrada o salida');
  }
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new ValidationError('El campo "cantidad" debe ser un entero positivo');
  }
  if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
    throw new ValidationError('El campo "motivo" es obligatorio para el registro de inventario (min 5)');
  }

  if (operacion === 'entrada') {
    repuesto.stock += cantidad;
  } else {
    if (repuesto.stock < cantidad) {
      throw new ConflictError(`Stock insuficiente (${repuesto.stock}) para la salida de ${cantidad}`);
    }
    repuesto.stock -= cantidad;
  }

  return { repuesto: repuesto.codigo, stock: repuesto.stock, operacion, motivo: motivo.trim() };
}

module.exports = {
  listarMotos, obtenerMoto, registrarMoto,
  abrirOrden, listarOrdenes, cambiarEstado,
  listarRepuestos, moverStock
};
