export class AppError extends Error {
  constructor(message, statusCode = 500, codigo = 'ERROR_INTERNO', detalles) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.detalles = detalles;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos invalidos', detalles, codigo = 'VALIDACION') {
    super(message, 400, codigo, detalles);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciales requeridas', codigo = 'NO_AUTENTICADO') {
    super(message, 401, codigo);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permiso para esta accion', codigo = 'SIN_PERMISO') {
    super(message, 403, codigo);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', codigo = 'NO_ENCONTRADO') {
    super(message, 404, codigo);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual', codigo = 'CONFLICTO') {
    super(message, 409, codigo);
  }
}
