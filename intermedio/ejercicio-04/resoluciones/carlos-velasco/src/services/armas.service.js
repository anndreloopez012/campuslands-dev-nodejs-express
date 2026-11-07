const { crearCrudReutilizable, ValidationError } = require('./base.crud');

const armas = [
  { id: 1, name: 'Vector Corto', tipo: 'smg', danio: 24, rareza: 'comun' },
  { id: 2, name: 'Halcon Solar', tipo: 'sniper', danio: 95, rareza: 'legendaria' },
  { id: 3, name: 'Tempestad', tipo: 'escopeta', danio: 68, rareza: 'epica' }
];

const tiposValidos = ['smg', 'sniper', 'escopeta', 'asalto'];
const rarezasValidas = ['comun', 'rara', 'epica', 'legendaria'];

function validarArma(datos) {
  const { name, tipo, danio, rareza } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!tiposValidos.includes(tipo)) {
    throw new ValidationError(`El tipo "${tipo}" no es valido. Tipos: ${tiposValidos.join(', ')}`);
  }
  if (!Number.isInteger(danio) || danio <= 0 || danio > 100) {
    throw new ValidationError('El campo "danio" debe ser un entero entre 1 y 100');
  }
  if (!rarezasValidas.includes(rareza)) {
    throw new ValidationError(`La rareza "${rareza}" no es valida. Rarezas: ${rarezasValidas.join(', ')}`);
  }
}

const armasCRUD = crearCrudReutilizable({ recurso: 'arma', items: armas, validar: validarArma });

function existeArma(id) {
  return armas.some((arma) => arma.id === id);
}

module.exports = { ...armasCRUD, existeArma, rarezasValidas, tiposValidos };
