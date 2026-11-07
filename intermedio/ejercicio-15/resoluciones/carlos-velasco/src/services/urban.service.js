// El secreto no debe vivir en el codigo: se toma de la variable de entorno JWT_SECRET
// y solo se usa un valor de demostracion si no esta configurada.
const SECRETO = process.env.JWT_SECRET || 'secreto-de-demostracion-cambiar';

const MINUTOS_TTL = 60; // vigencia del token en minutos
const cocinasValidas = ['tacos', 'arepas', 'ramen', 'sanguches'];

const { firmar, verificar } = require('./jwt');
const { UnauthorizedError } = require('../errors/app.error');

const foodTrucks = [
  { id: 1, nombre: 'Calle Bravo', cocina: 'tacos', calificacion: 4.9 },
  { id: 2, nombre: 'Rincon Llanero', cocina: 'arepas', calificacion: 4.7 },
  { id: 3, nombre: 'Fideos Verticales', cocina: 'ramen', calificacion: 4.8 }
];

const ordenes = [];

function login(usuario, contrasena, cocina) {
  if (usuario !== 'conductor' || contrasena !== 'calle2026') {
    throw new UnauthorizedError('Credenciales invalidas');
  }
  if (cocina && !cocinasValidas.includes(cocina)) {
    throw new UnauthorizedError(`Cocina "${cocina}" no es valida. Valores: ${cocinasValidas.join(', ')}`);
  }

  return firmar(
    { sub: 'conductor', rol: 'operador', cocina: cocina || 'tacos' },
    SECRETO,
    { expiraEnSegundos: MINUTOS_TTL * 60 }
  );
}

/** Middleware: exige un Bearer token con firma y expiracion validas. */
function autenticarJwt(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Header Authorization requerido con esquema Bearer'));
  }

  const resultado = verificar(token, SECRETO);
  if (!resultado.valido) {
    return next(new UnauthorizedError(resultado.error));
  }

  req.usuario = resultado.payload;
  return next();
}

function listarFoodTrucks(req, res) {
  res.status(200).json({ ok: true, data: foodTrucks });
}

function listarOrdenes(req, res) {
  res.status(200).json({ ok: true, autenticado_como: req.usuario.sub, data: ordenes });
}

function crearOrden(req, res) {
  const { truckId, detalle, items } = req.body;

  const truck = foodTrucks.find((actual) => actual.id === truckId);
  if (!truck) return res.status(404).json({ ok: false, message: 'Food truck no encontrado' });
  if (!detalle || typeof detalle !== 'string' || detalle.trim().length < 5) {
    return res.status(400).json({ ok: false, message: 'El campo "detalle" es obligatorio (minimo 5 caracteres)' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, message: 'El campo "items" debe ser un array con al menos un item' });
  }

  const orden = {
    id: ordenes.length + 1,
    truckId,
    cliente: req.usuario.sub, // viene del token, nunca del cuerpo
    detalle: detalle.trim(),
    items,
    estado: 'aceptada'
  };
  ordenes.push(orden);
  return res.status(201).json({ ok: true, message: 'Orden creada', data: orden });
}

module.exports = { login, autenticarJwt, listarFoodTrucks, listarOrdenes, crearOrden, SECRETO };
