export class AppError extends Error {
  constructor(message, statusCode = 500, codigo = 'ERROR_INTERNO', detalles, cabeceras) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.detalles = detalles;
    this.cabeceras = cabeceras;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos invalidos', detalles, codigo = 'VALIDACION') {
    super(message, 400, codigo, detalles);
  }
}

export class NoAutenticadoError extends AppError {
  constructor(message = 'Debes iniciar sesion para acceder a este recurso', codigo = 'NO_AUTENTICADO') {
    super(message, 401, codigo, undefined, { 'WWW-Authenticate': 'Bearer' });
  }
}

export class PermisoError extends AppError {
  constructor(message = 'No tienes permisos para esta accion', codigo = 'PERMISOS_INSUFICIENTES') {
    super(message, 403, codigo);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', codigo = 'NO_ENCONTRADO') {
    super(message, 404, codigo);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso', codigo = 'CONFLICTO') {
    super(message, 409, codigo);
  }
}

export class ReferenciaError extends AppError {
  constructor(campo, mensaje) {
    super('La referencia indicada no existe', 422, 'REFERENCIA_INVALIDA', [{ campo, mensaje }]);
  }
}

export class DemasiadosIntentosError extends AppError {
  constructor(segundos) {
    super('Demasiados intentos fallidos, intenta de nuevo mas tarde', 429, 'DEMASIADOS_INTENTOS', undefined, {
      'Retry-After': String(segundos),
    });
  }
}
