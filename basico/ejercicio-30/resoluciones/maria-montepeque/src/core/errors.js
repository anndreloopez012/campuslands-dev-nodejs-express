import { STATUS_CODES } from "node:http";

class HttpError extends Error {
    constructor(status, message, { details, headers } = {}) {
        super(message ?? STATUS_CODES[status]);
        this.status = status;
        this.details = details;
        this.headers = headers ?? {};
    }

    static badRequest(message, details) { return new HttpError(400, message, { details }); }
    static notFound(message) { return new HttpError(404, message); }
    static conflict(message) { return new HttpError(409, message); }
    static unprocessable(message, details) { return new HttpError(422, message, { details }); }
}

export { HttpError };
