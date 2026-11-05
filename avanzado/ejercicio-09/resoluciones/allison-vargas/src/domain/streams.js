import { Transform, Writable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { COLUMNAS } from '../constants/combates.js';
import { crear } from '../errores/index.js';

export class LimitadorDeBytes extends Transform {
  #maximo;
  #vistos = 0;

  constructor(maximo) {
    super();
    this.#maximo = maximo;
  }

  get bytes() {
    return this.#vistos;
  }

  _transform(trozo, codificacion, hecho) {
    this.#vistos += trozo.length;
    if (this.#vistos > this.#maximo) return hecho(crear('PAYLOAD_GRANDE'));
    return hecho(null, trozo);
  }
}

export class DeLineas extends Transform {
  #decodificador = new StringDecoder('utf8');
  #pendiente = '';
  #numero = 0;
  #maxima;

  constructor({ maxima }) {
    super({ readableObjectMode: true });
    this.#maxima = maxima;
  }

  #emitir(texto) {
    this.#numero += 1;
    if (texto.length > this.#maxima) throw crear('LINEA_DEMASIADO_LARGA', { linea: this.#numero, maximo: this.#maxima });
    const limpio = texto.endsWith('\r') ? texto.slice(0, -1) : texto;
    if (limpio.trim() !== '') this.push({ numero: this.#numero, texto: limpio });
  }

  _transform(trozo, codificacion, hecho) {
    try {
      const partes = (this.#pendiente + this.#decodificador.write(trozo)).split('\n');
      this.#pendiente = partes.pop();
      for (const parte of partes) this.#emitir(parte);
      if (this.#pendiente.length > this.#maxima) {
        throw crear('LINEA_DEMASIADO_LARGA', { linea: this.#numero + 1, maximo: this.#maxima });
      }
      hecho();
    } catch (error) {
      hecho(error);
    }
  }

  _flush(hecho) {
    try {
      const resto = this.#pendiente + this.#decodificador.end();
      if (resto !== '') this.#emitir(resto);
      hecho();
    } catch (error) {
      hecho(error);
    }
  }
}

export class ValidadorDeLineas extends Transform {
  #validar;

  constructor(validar) {
    super({ objectMode: true });
    this.#validar = validar;
  }

  _transform({ numero, texto }, codificacion, hecho) {
    let dato;
    try {
      dato = JSON.parse(texto);
    } catch {
      return hecho(null, { numero, errores: [{ campo: 'linea', mensaje: 'no es un JSON valido' }] });
    }
    const resultado = this.#validar(dato);
    return hecho(null, resultado.errores ? { numero, errores: resultado.errores } : { numero, combate: resultado.valor });
  }
}

export class AcumuladorDeImportacion extends Writable {
  recibidas = 0;
  validas = [];
  rechazadas = 0;
  errores = [];
  #maxErrores;

  constructor({ maxErrores }) {
    super({ objectMode: true });
    this.#maxErrores = maxErrores;
  }

  _write(item, codificacion, hecho) {
    this.recibidas += 1;
    if (item.combate) {
      this.validas.push(item.combate);
    } else {
      this.rechazadas += 1;
      if (this.errores.length < this.#maxErrores) this.errores.push({ linea: item.numero, errores: item.errores });
    }
    hecho();
  }
}

export class ANdjson extends Transform {
  constructor() {
    super({ writableObjectMode: true });
  }

  _transform(objeto, codificacion, hecho) {
    hecho(null, `${JSON.stringify(objeto)}\n`);
  }
}

export function escaparCsv(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

export class ACsv extends Transform {
  #columnas;
  #encabezadoEnviado = false;

  constructor(columnas = COLUMNAS) {
    super({ writableObjectMode: true });
    this.#columnas = columnas;
  }

  #encabezado() {
    if (this.#encabezadoEnviado) return '';
    this.#encabezadoEnviado = true;
    return `${this.#columnas.join(',')}\n`;
  }

  _transform(objeto, codificacion, hecho) {
    hecho(null, `${this.#encabezado()}${this.#columnas.map((c) => escaparCsv(objeto[c])).join(',')}\n`);
  }

  _flush(hecho) {
    hecho(null, this.#encabezado());
  }
}

export class AgregadorDeEstadisticas extends Writable {
  total = 0;
  porMetodo = {};
  porCategoria = {};
  sumaRounds = 0;
  sumaGolpes = 0;
  victorias = new Map();
  primeraFecha = null;
  ultimaFecha = null;

  constructor() {
    super({ objectMode: true });
  }

  _write(c, codificacion, hecho) {
    this.total += 1;
    this.porMetodo[c.metodo] = (this.porMetodo[c.metodo] ?? 0) + 1;
    this.porCategoria[c.categoria] = (this.porCategoria[c.categoria] ?? 0) + 1;
    this.sumaRounds += c.rounds;
    this.sumaGolpes += c.golpesRojo + c.golpesAzul;
    if (c.ganadorId !== null) this.victorias.set(c.ganadorId, (this.victorias.get(c.ganadorId) ?? 0) + 1);
    if (this.primeraFecha === null || c.fecha < this.primeraFecha) this.primeraFecha = c.fecha;
    if (this.ultimaFecha === null || c.fecha > this.ultimaFecha) this.ultimaFecha = c.fecha;
    hecho();
  }

  resumen(nombres, cuantos = 5) {
    const finalizados = (this.porMetodo.ko ?? 0) + (this.porMetodo.tko ?? 0);
    const redondear = (n) => Math.round(n * 100) / 100;
    return {
      total: this.total,
      porMetodo: this.porMetodo,
      porCategoria: this.porCategoria,
      promedioRounds: this.total ? redondear(this.sumaRounds / this.total) : 0,
      promedioGolpesPorCombate: this.total ? redondear(this.sumaGolpes / this.total) : 0,
      porcentajeFinalizados: this.total ? redondear((finalizados / this.total) * 100) : 0,
      primeraFecha: this.primeraFecha,
      ultimaFecha: this.ultimaFecha,
      masVictorias: [...this.victorias.entries()]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .slice(0, cuantos)
        .map(([peleadorId, victorias]) => ({ peleadorId, nombre: nombres.get(peleadorId) ?? null, victorias })),
    };
  }
}
