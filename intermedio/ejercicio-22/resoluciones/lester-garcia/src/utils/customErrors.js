export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors = []) {
    super("Inconsistencias en los metadatos del plano o modelo arquitectónico 3D.", 400);
    this.errors = errors;
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "El archivo arquitectónico 3D excede el tamaño máximo permitido.") {
    super(message, 413);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Formato o MIME type de modelo 3D no soportado.") {
    super(message, 415);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El modelo arquitectónico 3D no fue encontrado.") {
    super(message, 404);
  }
}
