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
  constructor(message = "Parámetro de consulta o búsqueda inválido.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El destino o paquete de viaje solicitado no fue encontrado.") {
    super(message, 404);
  }
}