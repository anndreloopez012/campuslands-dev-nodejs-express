export function registrarPeticion(req, res, next) {
  console.log(req.method + ' ' + req.url);
  next();
}
