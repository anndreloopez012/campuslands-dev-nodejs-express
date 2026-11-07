class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

module.exports = { AppError, ValidationError, UnauthorizedError };
