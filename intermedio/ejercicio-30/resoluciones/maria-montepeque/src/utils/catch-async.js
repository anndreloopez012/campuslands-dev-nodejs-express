// express 4 no atrapa los errores de funciones async, esto los manda a next
export default function catchAsync(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
