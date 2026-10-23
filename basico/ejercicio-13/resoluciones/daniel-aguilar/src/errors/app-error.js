// Error "esperado": el cliente hizo algo mal y sabemos como explicarlo.
class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, { status: 404, code: 'NOT_FOUND' });
  }
}

class ValidationError extends AppError {
  constructor(details, message = 'Datos invalidos') {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') {
    super(message, { status: 409, code: 'CONFLICT' });
  }
}

module.exports = { AppError, NotFoundError, ValidationError, ConflictError };
