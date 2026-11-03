function errorHandler(err, req, res, next) {
    const status = err.status ?? 500;
    const payload = { ok: false, message: status === 500 ? "Error interno del servidor" : err.message };

    if (err.type) payload.type = err.type;
    if (status === 500) console.error(err);

    res.status(status).json(payload);
}

export { errorHandler };
