const { ValidationError, NotFoundError } = require('../errors/app.error');
const { parsearFormula, masaMolar, porcentajeElemento } = require('./chemistry.service');

const mediciones = [];

function analizar(req, res, next) {
  try {
    const { formula, elemento } = req.body;
    if (!formula || typeof formula !== 'string') {
      throw new ValidationError('El campo "formula" es obligatorio (ej: H2O)');
    }

    const mapa = parsearFormula(formula); // TypeError -> 400 por el handler de cantidad

    const resultado = {
      formula,
      elementos: mapa,
      masa_molar_g_mol: masaMolar(mapa)
    };

    if (elemento) {
      try {
        resultado.porcentaje_de = { elemento, valor_pct: porcentajeElemento(formula, elemento) };
      } catch {
        // el subanalisis opcional no invalida la respuesta principal
        resultado.porcentaje_de = null;
      }
    }

    mediciones.push({ id: mediciones.length + 1, formula, masa: resultado.masa_molar_g_mol });
    return res.status(200).json({ ok: true, data: resultado });
  } catch (error) {
    return next(error);
  }
}

function listarMediciones(req, res) {
  res.status(200).json({ ok: true, data: mediciones });
}

function consultarMedicion(req, res, next) {
  try {
    const registro = mediciones.find((actual) => actual.id === Number(req.params.id));
    if (!registro) throw new NotFoundError(`La medicion ${req.params.id} no existe`);
    return res.status(200).json({ ok: true, data: registro });
  } catch (error) {
    return next(error);
  }
}

module.exports = { analizar, listarMediciones, consultarMedicion };
