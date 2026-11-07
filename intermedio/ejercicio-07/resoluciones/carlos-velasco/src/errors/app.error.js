class AppError extends Error {
  constructor(message, statusCode, detalles = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Datos de entrada invalidos', detalles = []) {
    // Firma del padre unificada con detalles opcionales
    super(message, 400, detalles);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError };
