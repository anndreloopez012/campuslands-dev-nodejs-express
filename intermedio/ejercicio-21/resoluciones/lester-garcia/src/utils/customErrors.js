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
    super("Inconsistencias en los parámetros de la escena de animación 3D.", 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El trabajo de renderizado 3D no fue encontrado.") {
    super(message, 404);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(retryAfterSeconds, maxRequests) {
    super(
      `Cuota de peticiones a la granja de renderizado excedida (${maxRequests} máx por ventana). Reintente en ${retryAfterSeconds}s.`,
      429
    );
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
