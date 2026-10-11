export const errorHandler = (err, req, res, next)=> {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err){
        return res.status(400).json({
            status:"fail",
            message: "Formato JSON invalido en el cuerpo de la peticion."
        });
    }

    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    const responsePayload = {
        status,
        message: err.mesage || "Error interno del servidor en el reino RPG."
    };

    if(process.env.NODE_ENV=== "development"){
        responsePayload.stack = err.stack;

    }
    return res.status(statusCode).json(responsePayload);
};