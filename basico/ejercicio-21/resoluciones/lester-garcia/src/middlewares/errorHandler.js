export const errorHandler = (err, req, res, next) => {
    if(err instanceof SyntaxError && err.status === 400 && "body" in err)
        {
        return res.status(400).json({
            status: "fail",
            message : "El formato JSON enviado en la peticion es invalido."
        });
    }

    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    return res.status(statusCode).json({
       status,
       message: err.message || " Error interno del servidor en el motor de reenderizado 3D."
    });
};