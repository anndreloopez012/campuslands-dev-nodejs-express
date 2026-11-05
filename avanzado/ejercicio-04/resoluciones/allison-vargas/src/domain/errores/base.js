export class ErrorDeDominio extends Error {
  static categoria = 'dominio';

  constructor(codigo, mensaje, { contexto = {}, causa } = {}) {
    super(mensaje, causa === undefined ? undefined : { cause: causa });
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.contexto = Object.freeze({ ...contexto });
  }

  get categoria() {
    return this.constructor.categoria;
  }
}

export class ErrorNoEncontrado extends ErrorDeDominio {
  static categoria = 'no_encontrado';
}

export class ErrorDeConflicto extends ErrorDeDominio {
  static categoria = 'conflicto';
}

export class ErrorDeEstado extends ErrorDeDominio {
  static categoria = 'estado_invalido';
}

export class ErrorDeRegla extends ErrorDeDominio {
  static categoria = 'regla_de_negocio';
}

export class ErrorDePermiso extends ErrorDeDominio {
  static categoria = 'permiso';
}

export const CATEGORIAS = Object.freeze([
  ErrorNoEncontrado,
  ErrorDeConflicto,
  ErrorDeEstado,
  ErrorDeRegla,
  ErrorDePermiso,
].map((clase) => clase.categoria));

export const esErrorDeDominio = (valor) => valor instanceof ErrorDeDominio;
