class AppError extends Error {
  constructor(message, statusCode, headers = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = { AppError, ValidationError, NotFoundError };
