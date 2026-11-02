export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de solicitud inválidos.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El artículo solicitado no se encuentra en la tienda.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "El artículo ya está registrado en el inventario.") {
    super(message, 409);
  }
}