import { PRIORIDADES, SERVICIOS } from '../constants/taller.js';
import { leerBooleano, leerSintomas, validarCarga } from './carga.js';
import {
  esObjetoPlano,
  exigirCuerpo,
  leerEntero,
  leerOpcion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

export function validarOrdenNueva(cuerpo, { permitirSimulaciones }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['cliente', 'moto', 'sintomas', 'servicios', 'incluirLavado', 'prioridad'], errores);

  const cliente = leerTexto(cuerpo, 'cliente', errores, { min: 3, max: 60 });
  const moto = leerMoto(cuerpo.moto, errores);
  const sintomas = leerSintomas(cuerpo, errores);
  const servicios = leerServicios(cuerpo.servicios, errores, permitirSimulaciones);
  const incluirLavado = leerBooleano(cuerpo, 'incluirLavado', errores) ?? true;
  const prioridad = leerEntero(cuerpo, 'prioridad', errores, {
    min: 0,
    max: 3,
    requerido: false,
    defecto: PRIORIDADES.NORMAL,
  });
  return terminar(errores, { cliente, moto, sintomas, servicios, incluirLavado, prioridad });
}

function leerMoto(moto, errores) {
  if (moto === undefined) {
    errores.push({ campo: 'moto', mensaje: 'es obligatorio' });
    return undefined;
  }
  if (!esObjetoPlano(moto)) {
    errores.push({ campo: 'moto', mensaje: 'debe ser un objeto' });
    return undefined;
  }
  rechazarSobrantes(moto, ['marca', 'modelo', 'cilindrada', 'placa'], errores, 'moto');
  const marca = leerTexto(moto, 'marca', errores, { min: 2, max: 30, prefijo: 'moto' });
  const modelo = leerTexto(moto, 'modelo', errores, { min: 1, max: 30, prefijo: 'moto' });
  const cilindrada = leerEntero(moto, 'cilindrada', errores, { min: 50, max: 2000, prefijo: 'moto' });
  const placa = leerTexto(moto, 'placa', errores, {
    min: 4,
    max: 8,
    patron: /^[A-Za-z0-9-]+$/,
    mensajePatron: 'solo admite letras, numeros y guion',
    prefijo: 'moto',
  });
  return { marca, modelo, cilindrada, placa: placa?.toUpperCase() };
}

function leerServicios(valor, errores, permitirSimulaciones) {
  if (!Array.isArray(valor)) {
    errores.push({ campo: 'servicios', mensaje: valor === undefined ? 'es obligatorio' : 'debe ser una lista' });
    return undefined;
  }
  if (valor.length < 1 || valor.length > 5) {
    errores.push({ campo: 'servicios', mensaje: 'debe tener entre 1 y 5 servicios' });
    return undefined;
  }
  const servicios = [];
  valor.forEach((servicio, i) => {
    const prefijo = `servicios[${i}]`;
    if (!esObjetoPlano(servicio)) {
      errores.push({ campo: prefijo, mensaje: 'debe ser un objeto' });
      return;
    }
    const tipo = leerOpcion(servicio, 'tipo', SERVICIOS, errores, { prefijo });
    if (!tipo) return;
    const carga = { ...servicio };
    delete carga.tipo;
    const datos = validarCarga(tipo, carga, errores, { donde: prefijo, permitirSimulaciones });
    if (datos) servicios.push({ tipo, ...datos });
  });
  return servicios;
}
