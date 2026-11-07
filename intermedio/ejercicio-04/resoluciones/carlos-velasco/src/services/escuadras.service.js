const { crearCrudReutilizable, ValidationError } = require('./base.crud');
const armasService = require('./armas.service');

const escuadras = [
  { id: 1, name: 'Tempestades', servidor: 'NA-EAST', primariaId: 2 },
  { id: 2, name: 'Lobos Grises', servidor: 'SA-WEST', primariaId: 1 }
];

const servidoresValidos = ['NA-EAST', 'NA-WEST', 'SA-EAST', 'SA-WEST', 'EU'];

function validarEscuadra(datos) {
  const { name, servidor, primariaId } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!servidoresValidos.includes(servidor)) {
    throw new ValidationError(`El servidor "${servidor}" no es valido. Servidores: ${servidoresValidos.join(', ')}`);
  }
  if (!Number.isInteger(primariaId) || !armasService.existeArma(primariaId)) {
    throw new ValidationError('El campo "primariaId" debe referenciar un arma existente');
  }
}

const escuadrasCRUD = crearCrudReutilizable({ recurso: 'escuadra', items: escuadras, validar: validarEscuadra });

module.exports = { ...escuadrasCRUD, servidoresValidos };
