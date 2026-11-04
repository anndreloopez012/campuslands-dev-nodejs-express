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

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', codigo = 'NO_ENCONTRADO') {
    super(message, 404, codigo);
  }
}
