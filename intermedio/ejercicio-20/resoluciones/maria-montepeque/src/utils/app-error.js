// error con status para el middleware final
class AppError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export default AppError;
