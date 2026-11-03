// express 4 no atrapa errores de funciones async, esto los manda a next
function catchAsync(handler) {
    return function (req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

export default catchAsync;
