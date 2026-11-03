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
  constructor(message = "Parámetros de la partida o estadísticas del shooter inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Se requiere autenticación para acceder o registrar resultados en este torneo.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No cuentas con los permisos de moderador o analista necesarios.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La partida o registro de esports solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una partida registrada con ese código de lobby.") {
    super(message, 409);
  }
}