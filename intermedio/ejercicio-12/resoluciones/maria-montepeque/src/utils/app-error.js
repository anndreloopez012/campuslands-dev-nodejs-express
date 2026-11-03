// error con status, y una lista de errores si hace falta
class AppError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export default AppError;
