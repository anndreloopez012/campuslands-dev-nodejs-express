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
  constructor(message = 'No tienes permisos para esta accion', codigo = 'PERMISOS_INSUFICIENTES', detalles) {
    super(message, 403, codigo, detalles);
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

export class UnprocessableError extends AppError {
  constructor(message = 'No se pudo procesar la solicitud', codigo = 'NO_PROCESABLE', detalles) {
    super(message, 422, codigo, detalles);
  }
}

export class UnsupportedMediaError extends AppError {
  constructor(message = 'El Content-Type debe ser application/json', codigo = 'TIPO_NO_SOPORTADO') {
    super(message, 415, codigo);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'El body supera el tamano permitido', codigo = 'PAYLOAD_GRANDE') {
    super(message, 413, codigo);
  }
}
