class AppError extends Error {
    constructor(message, code, details = {}, options = {}) {
        super(message, options);
        this.name = "AppError";
        this.code = code;
        this.details = details;
    }
}

export { AppError };