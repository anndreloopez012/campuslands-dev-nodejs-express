import { CANDIDATOS, LIMITES } from '../constants/csv.js';
import { crear } from '../errores/index.js';

const malFormado = (linea, motivo) => crear('CSV_MAL_FORMADO', { linea, motivo });

export class LectorCsv {
  #delimitador;
  #maxCampo;
  #maxRegistros;
  #estado = 'inicio';
  #campo = '';
  #campos = [];
  #vacio = true;
  #linea = 1;
  #lineaRegistro = 1;
  #saltarLf = false;
  #total = 0;
  #listos = [];

  constructor({ delimitador = ',', maxCampo = LIMITES.campoCaracteres, maxRegistros = Infinity } = {}) {
    this.#delimitador = delimitador;
    this.#maxCampo = maxCampo;
    this.#maxRegistros = maxRegistros;
  }

  escribir(texto) {
    for (const c of texto) this.#procesar(c);
    return this.#vaciar();
  }

  terminar() {
    if (this.#estado === 'comillas') throw malFormado(this.#lineaRegistro, 'comillas sin cerrar');
    if (!this.#vacio) this.#cerrarRegistro();
    return this.#vaciar();
  }

  #vaciar() {
    const filas = this.#listos;
    this.#listos = [];
    return filas;
  }

  #agregar(c) {
    this.#campo += c;
    if (this.#campo.length > this.#maxCampo) throw malFormado(this.#lineaRegistro, 'un campo supera el largo permitido');
  }

  #cerrarCampo() {
    this.#campos.push(this.#campo);
    this.#campo = '';
    this.#estado = 'inicio';
  }

  #cerrarRegistro() {
    this.#cerrarCampo();
    if (!this.#vacio) {
      this.#total += 1;
      if (this.#total > this.#maxRegistros) throw crear('LIMITE_DE_FILAS', { maximo: this.#maxRegistros - 1 });
      this.#listos.push({ linea: this.#lineaRegistro, campos: this.#campos });
    }
    this.#campos = [];
    this.#vacio = true;
    this.#lineaRegistro = this.#linea;
  }

  #salto(c) {
    this.#linea += 1;
    if (c === '\r') this.#saltarLf = true;
    this.#cerrarRegistro();
  }

  #procesar(c) {
    if (this.#saltarLf) {
      this.#saltarLf = false;
      if (c === '\n') return;
    }
    const esSalto = c === '\n' || c === '\r';
    switch (this.#estado) {
      case 'inicio':
        if (esSalto) return this.#salto(c);
        this.#vacio = false;
        if (c === '"') this.#estado = 'comillas';
        else if (c === this.#delimitador) this.#cerrarCampo();
        else {
          this.#estado = 'libre';
          this.#agregar(c);
        }
        return undefined;
      case 'libre':
        if (esSalto) return this.#salto(c);
        if (c === this.#delimitador) this.#cerrarCampo();
        else if (c === '"') throw malFormado(this.#linea, 'hay comillas dentro de un campo que no empezo con comillas');
        else this.#agregar(c);
        return undefined;
      case 'comillas':
        if (c === '"') this.#estado = 'cierre';
        else {
          if (c === '\n') this.#linea += 1;
          this.#agregar(c);
        }
        return undefined;
      default:
        if (c === '"') {
          this.#estado = 'comillas';
          this.#agregar('"');
        } else if (esSalto) this.#salto(c);
        else if (c === this.#delimitador) this.#cerrarCampo();
        else throw malFormado(this.#linea, 'despues de cerrar las comillas solo puede venir el delimitador o el fin de la fila');
        return undefined;
    }
  }
}

export function parsearCsv(texto, opciones = {}) {
  const lector = new LectorCsv(opciones);
  return [...lector.escribir(texto), ...lector.terminar()];
}

export function detectarDelimitador(texto) {
  const muestra = texto.slice(0, 8192);
  let mejor = { delimitador: ',', columnas: 1, proporcion: 0 };
  for (const candidato of CANDIDATOS) {
    let filas;
    try {
      filas = new LectorCsv({ delimitador: candidato }).escribir(muestra).slice(0, LIMITES.muestraDelimitador);
    } catch {
      continue;
    }
    if (filas.length === 0) continue;
    const columnas = filas[0].campos.length;
    const proporcion = filas.filter((f) => f.campos.length === columnas).length / filas.length;
    const gana = columnas > 1 && proporcion > 0.5
      && (proporcion > mejor.proporcion || (proporcion === mejor.proporcion && columnas > mejor.columnas));
    if (gana) mejor = { delimitador: candidato, columnas, proporcion };
  }
  return mejor.delimitador;
}

export function neutralizar(valor) {
  if (typeof valor !== 'string') return valor;
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

export function escaparCelda(valor, delimitador = ',') {
  if (valor === null || valor === undefined) return '';
  const texto = String(neutralizar(valor));
  const necesita = texto.includes(delimitador) || /["\r\n]/.test(texto) || texto !== texto.trim();
  return necesita ? `"${texto.replaceAll('"', '""')}"` : texto;
}

export function escribirCsv(columnas, filas, { delimitador = ',', bom = false } = {}) {
  const lineas = [columnas.join(delimitador)];
  for (const fila of filas) lineas.push(columnas.map((c) => escaparCelda(fila[c], delimitador)).join(delimitador));
  return `${bom ? '\uFEFF' : ''}${lineas.join('\r\n')}\r\n`;
}
